
// tests/helpers/api-gmail.ts
import { google } from 'googleapis';

export class GmailAPI {
  gmail: any;

  constructor() {
    const auth = new google.auth.OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET,
      process.env.GMAIL_REDIRECT_URI
    );

    auth.setCredentials({
      refresh_token: process.env.GMAIL_REFRESH_TOKEN
    });

    this.gmail = google.gmail({ version: 'v1', auth });
  }

  /**
   * Search the email inbox by subject/body filters.
   */
  async searchBody({
    to,
    subjectIncludes,
    bodyIncludes = [],
  }: {
    to?: string;
    subjectIncludes?: string;
    bodyIncludes?: string[];
  }) {
    const queryParts = [];
    if (to) queryParts.push(`to:${to}`);
    if (subjectIncludes) queryParts.push(`subject:${subjectIncludes}`);

    const q = queryParts.join(' ');

    const { data } = await this.gmail.users.messages.list({
      userId: 'me',
      q,
      maxResults: 5,
    });

    if (!data.messages?.length) return { found: false };

    // Get the first email’s body
    const msg = await this.gmail.users.messages.get({
      userId: 'me',
      id: data.messages[0].id,
      format: 'full',
    });

    const snippet = msg.data.snippet?.toLowerCase() || '';

    const allFound = bodyIncludes.every(b =>
      snippet.includes(b.toLowerCase())
    );

    return {
      found: allFound,
      snippet: msg.data.snippet,
      id: data.messages[0].id,
    };
  }
}
