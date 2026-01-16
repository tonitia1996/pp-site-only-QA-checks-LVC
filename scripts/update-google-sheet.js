
// scripts/update-google-sheet.js
const { google } = require('googleapis');

async function main() {
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);

  const client = new google.auth.JWT(
    credentials.client_email,
    null,
    credentials.private_key,
    ['https://www.googleapis.com/auth/spreadsheets']
  );

  const sheets = google.sheets({ version: 'v4', auth: client });

  const timestamp = new Date().toISOString();
  const status = process.env.PW_STATUS || 'UNKNOWN';
  const notes = process.env.PW_NOTES || '';
  const artifactUrl = process.env.ARTIFACT_URL || '';
  const device = process.env.DEVICE || 'unknown';
  const suite = process.env.TEST_SUITE || 'unknown';
  const trafficSource = process.env.TRAFFIC_SOURCE || 'N/A';
  const eventsTriggered = process.env.EVENTS_TRIGGERED || '';

  const tabName = device.toLowerCase().includes('mobile')
    ? 'Mobile'
    : 'Desktop';

  console.log(`Logging results to Google Sheet tab: ${tabName}`);

  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: `${tabName}!A1:H1`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[
        timestamp,
        status,
        notes,
        artifactUrl,
        device,
        suite,
        trafficSource,
        eventsTriggered
      ]]
    }
  });

  console.log('Google Sheet updated successfully.');
}

main().catch(err => {
  console.error('Error logging results to Google Sheets:', err);
  process.exit(1);
});
