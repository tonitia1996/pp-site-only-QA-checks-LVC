
import Imap, { ImapMessage, ImapMessageBodyInfo } from 'imap';
import { simpleParser } from 'mailparser';

interface FindEmailOptions {
  subjectIncludes?: string;
  bodyIncludes?: string[];
  from?: string;
  waitSeconds?: number;
}

interface EmailResult {
  subject: string | undefined;
  body: string | undefined;
  matches: boolean;
}

export async function findEmail({
  subjectIncludes,
  bodyIncludes = [],
  from,
  waitSeconds = 10
}: FindEmailOptions): Promise<EmailResult | null> {

  return new Promise((resolve, reject) => {

    // Ensure env vars are defined
    const user = process.env.GMAIL_USERNAME ?? '';
    const password = process.env.GMAIL_APP_PASSWORD ?? '';

    if (!user || !password) {
      return reject(
        new Error('GMAIL_USERNAME or GMAIL_APP_PASSWORD environment variable missing')
      );
    }

    const imap = new Imap({
      user,
      password,
      host: 'imap.gmail.com',
      port: 993,
      tls: true,
    });

    const openInbox = (
      cb: (err: Error | null, box: Imap.Box | undefined) => void
    ) => {
      imap.openBox('INBOX', true, cb);
    };

    imap.once('ready', () => {
      setTimeout(() => {
        openInbox((err, box) => {
          if (err) return reject(err);

          const searchCriteria: any[] = [];

          if (subjectIncludes) searchCriteria.push(['HEADER', 'SUBJECT', subjectIncludes]);
          if (from) searchCriteria.push(['HEADER', 'FROM', from]);

          if (searchCriteria.length === 0) searchCriteria.push('ALL');

          imap.search(searchCriteria, (err: Error | null, results: number[]) => {
            if (err || !results || results.length === 0) {
              imap.end();
              return resolve(null);
            }

            const f = imap.fetch(results, { bodies: '' });

            f.on('message', (msg: ImapMessage) => {
              msg.on('body', (stream: NodeJS.ReadableStream, info: ImapMessageBodyInfo) => {
                simpleParser(stream, (err: Error | null, parsed: any) => {
                  if (err) return reject(err);

                  const body = parsed.text?.toLowerCase() ?? '';

                  const matches = bodyIncludes.every((b) =>
                    body.includes(b.toLowerCase())
                  );

                  const result: EmailResult = {
                    subject: parsed.subject,
                    body: parsed.text,
                    matches,
                  };

                  resolve(result);
                  imap.end();
                });
              });
            });
          });
        });
      }, waitSeconds * 1000);
    });

    imap.once('error', (err: Error) => reject(err));

    imap.connect();
  });
}
