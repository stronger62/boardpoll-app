# Board Meeting Poll — Setup Guide

One-time setup (~15 minutes). After this, your dad just opens the app, creates polls, and shares links. Zero maintenance.

## Step 1: Create the Google Sheet + Apps Script

1. Go to [Google Sheets](https://sheets.google.com) and create a new blank spreadsheet
2. Name it something like "Board Meeting Polls" (the name doesn't matter to the app)
3. Click **Extensions > Apps Script** in the menu bar
4. This opens the Apps Script editor in a new tab
5. Delete any code already in the editor (the default `myFunction` stub)
6. Copy the **entire** contents of `apps-script/Code.gs` from this repo and paste it in
7. Click the **Save** icon (or Ctrl+S) — name the project "Board Poll API" when prompted

## Step 2: Deploy the Apps Script as a Web App

1. In the Apps Script editor, click **Deploy > New deployment**
2. Click the gear icon next to "Select type" and choose **Web app**
3. Set these options:
   - **Description**: "Board Poll API" (or anything)
   - **Execute as**: **Me** (your Google account)
   - **Who has access**: **Anyone**
4. Click **Deploy**
5. If prompted, click **Authorize access**, pick your Google account, and click through the "unverified app" warning:
   - Click "Advanced" → "Go to Board Poll API (unsafe)" → "Allow"
   - This is safe — you wrote this script yourself, Google just warns about all unreviewed scripts
6. **Copy the Web App URL** — it looks like: `https://script.google.com/macros/s/ABCDE.../exec`

## Step 3: Paste the URL into index.html

1. Open `index.html` in any text editor
2. Find this line near the top of the `<script>` section:
   ```
   const API_URL = 'YOUR_APPS_SCRIPT_URL_HERE';
   ```
3. Replace `YOUR_APPS_SCRIPT_URL_HERE` with the URL you copied in Step 2
4. Save the file

## Step 4: Host the HTML file

**Option A: GitHub Pages (recommended)**
1. Push this repo to GitHub
2. Go to repo Settings > Pages > Source: select "main" branch > Save
3. Your app will be live at `https://<username>.github.io/dad-boardpoll-app/`

**Option B: Open locally**
- Just double-click `index.html` to open it in a browser. It works!
- The only downside: the URL you share with board members will be a `file://` path, which only works on your computer
- For sharing, use Option A or any static hosting (Netlify drop, Vercel, etc.)

## That's it!

### How Dad uses it:
1. Open the app URL
2. Enter a poll title and pick candidate dates
3. Click "Create Poll"
4. Copy the **voter link** and send it to board members (email, WhatsApp, text, whatever)
5. Bookmark the **admin link** to check results later
6. Results show a matrix of who voted for what, with the best date highlighted

### How board members use it:
1. Click the link Dad sent them
2. Check the dates that work for them
3. Type their name
4. Click "Submit Vote"
5. Done — takes 10 seconds

### Bonus: Dad can see raw data in the spreadsheet
Open the Google Sheet at any time to see two tabs:
- **Polls**: all created polls with their titles, dates, and admin keys
- **Votes**: every vote with voter name, selected dates, and timestamp

## Troubleshooting

**"Failed to create poll" error**
- Make sure the Apps Script URL is correct in `index.html`
- Make sure you deployed as a Web App with "Anyone" access

**Updating the Apps Script code**
If you ever need to update `Code.gs`:
1. Edit the code in the Apps Script editor
2. Click Deploy > Manage deployments
3. Click the pencil icon on your deployment
4. Change "Version" to "New version"
5. Click Deploy

**Votes not showing up**
- Click the "Refresh Results" button — unlike the Firebase version, this doesn't auto-update
- Check the Google Sheet directly to see if the vote row exists
