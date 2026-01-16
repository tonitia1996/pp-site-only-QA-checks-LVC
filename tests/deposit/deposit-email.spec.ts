
// tests/deposit/deposit-email.spec.ts
import { test, expect } from '@playwright/test';
import { findEmail } from '../helpers/gmail-reader';
import account from '../test-data/test-account.json';

test.describe('Deposit Email Confirmation', () => {

  test('failed deposit email arrives and contains deposit method details', async () => {

    const email = await findEmail({
      to: account.email,
      subjectIncludes: 'deposit',
      bodyIncludes: ['failed', 'credit', 'card', 'payment'],
      waitSeconds: 10   // give email time to arrive
    });

    expect(email, 'Expected failed deposit email').not.toBeNull();

    if (email) {
      test.info().annotations.push({
        type: 'email-analysis',
        description: `Email body snippet: ${email.body?.slice(0, 200)}`
      });
    }
  });

});
