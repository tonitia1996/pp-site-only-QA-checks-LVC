
// tests/deposit/deposit-email.spec.ts
import { test, expect } from '@playwright/test';
import { GmailAPI } from '../helpers/api-gmail';
import account from '../test-data/test-account.json';

test.describe('Deposit Email Confirmation', () => {
  test('failed deposit email arrives and contains deposit method details', async () => {
    const gmail = new GmailAPI();

    const result = await gmail.searchBody({
      to: account.email,
      subjectIncludes: 'deposit',
      bodyIncludes: ['failed', 'credit', 'card', 'payment']
    });

    expect(result.found, 'Expected failed deposit email').toBeTruthy();

    if (result.found) {
      test.info().annotations.push({
        type: 'email-analysis',
        description: `Email body snippet: ${result.snippet}`
      });
    }
  });
});
