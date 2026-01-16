
// tests/registration/registration-email.spec.ts
import { test, expect } from '@playwright/test';
import { findEmail } from '../helpers/gmail-reader';
import userData from '../test-data/registration-users.json';

test('registration confirmation email received', async () => {
  const email = await findEmail({
    subjectIncludes: 'Welcome',
    bodyIncludes: ['verify', 'account'],  
    from: undefined,   // optional
    waitSeconds: 10    // allow time for email to arrive
  });

  expect(email, 'Registration confirmation email was not found').not.toBeNull();
});
