/**
 * Board Meeting Poll — Google Apps Script Backend
 *
 * This script runs as a web app and uses the attached Google Sheet
 * as a database. It handles creating polls, submitting votes, and
 * reading results.
 *
 * SECURITY: Every request must include a `secret` field that matches
 * the APP_SECRET below. Change this to your own random string.
 *
 * SHEET STRUCTURE (auto-created on first run):
 *   "Polls" sheet: pollId | title | description | dates (comma-separated) | adminKey | createdAt
 *   "Votes" sheet: pollId | voterName | selectedDates (comma-separated) | submittedAt
 */

// ─── CHANGE THIS to your own random string ───
var APP_SECRET = 'CHANGE_ME_TO_A_RANDOM_STRING';

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);

    // Verify secret on every request
    if (body.secret !== APP_SECRET) {
      return jsonResponse({ error: 'Unauthorized' });
    }

    var action = body.action;

    if (action === 'createPoll') return jsonResponse(createPoll(body));
    if (action === 'getPoll')    return jsonResponse(getPoll(body));
    if (action === 'getVotes')   return jsonResponse(getVotes(body));
    if (action === 'submitVote') return jsonResponse(submitVote(body));

    return jsonResponse({ error: 'Unknown action' });
  } catch (err) {
    return jsonResponse({ error: err.message });
  }
}

function doGet(e) {
  return jsonResponse({ status: 'ok', message: 'Board Meeting Poll API is running.' });
}

// ─── Actions ───

function createPoll(data) {
  var sheet = getOrCreateSheet('Polls');
  sheet.appendRow([
    data.pollId,
    data.title,
    data.description || '',
    (data.dates || []).join(','),
    data.adminKey,
    new Date().toISOString()
  ]);
  return { success: true, pollId: data.pollId };
}

function getPoll(data) {
  var sheet = getOrCreateSheet('Polls');
  var rows = sheet.getDataRange().getValues();

  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.pollId) {
      return {
        poll: {
          pollId:      rows[i][0],
          title:       rows[i][1],
          description: rows[i][2],
          dates:       rows[i][3] ? rows[i][3].split(',') : [],
          adminKey:    rows[i][4],
          createdAt:   rows[i][5]
        }
      };
    }
  }

  return { poll: null };
}

function getVotes(data) {
  var sheet = getOrCreateSheet('Votes');
  var rows = sheet.getDataRange().getValues();
  var votes = [];

  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.pollId) {
      // Google Sheets may auto-convert a single ISO date string (e.g. "2024-01-15")
      // to a Date object. Normalise back to a string before splitting.
      var rawDates = rows[i][2];
      var datesStr = (rawDates instanceof Date)
        ? Utilities.formatDate(rawDates, Session.getScriptTimeZone(), 'yyyy-MM-dd')
        : String(rawDates || '');
      votes.push({
        voterName:     rows[i][1],
        selectedDates: datesStr ? datesStr.split(',') : [],
        submittedAt:   rows[i][3]
      });
    }
  }

  return { votes: votes };
}

function submitVote(data) {
  var sheet = getOrCreateSheet('Votes');
  var rows = sheet.getDataRange().getValues();
  var voterLower = (data.voterName || '').toLowerCase();

  // Remove existing vote from same person on same poll
  for (var i = rows.length - 1; i >= 1; i--) {
    if (rows[i][0] === data.pollId && rows[i][1].toString().toLowerCase() === voterLower) {
      sheet.deleteRow(i + 1);
    }
  }

  // Add new vote
  sheet.appendRow([
    data.pollId,
    data.voterName,
    (data.selectedDates || []).join(','),
    new Date().toISOString()
  ]);

  return { success: true };
}

// ─── Helpers ───

function getOrCreateSheet(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);

  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (name === 'Polls') {
      sheet.appendRow(['pollId', 'title', 'description', 'dates', 'adminKey', 'createdAt']);
      sheet.setFrozenRows(1);
      sheet.getRange('1:1').setFontWeight('bold');
    } else if (name === 'Votes') {
      sheet.appendRow(['pollId', 'voterName', 'selectedDates', 'submittedAt']);
      sheet.setFrozenRows(1);
      sheet.getRange('1:1').setFontWeight('bold');
    }
  }

  return sheet;
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
