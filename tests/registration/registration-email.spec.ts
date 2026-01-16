
// tests/registration/registration-email.spec.ts
import { test, expect } from '@playwright/test';
import { GmailAPI } from '../helpers/api-gmail';
import userData from '../test-data/registration-users.json';

test('registration confirmation email received', async () => {
  const gmail = new GmailAPI();

  const found = await gmail.checkEmail({
    subjectIncludes: 'Welcome',
    to: userData.email
  });

  expect(found, 'Registration confirmation email was not found').toBeTruthy();
});
