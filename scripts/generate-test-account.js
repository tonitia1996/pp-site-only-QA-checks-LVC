
// scripts/generate-test-account.js
const fs = require('fs');
const path = require('path');

function generateEmail() {
  const timestamp = Date.now();
  return `automation.user+${timestamp}@gmail.com`;
}

const account = {
  email: generateEmail(),
  password: "TestPwd1234!",
  firstName: "Auto",
  lastName: "User",
  createdAt: new Date().toISOString()
};

const dest = path.resolve(__dirname, '../tests/test-data/test-account.json');

fs.writeFileSync(dest, JSON.stringify(account, null, 2));
console.log("Generated new test account:");
console.log(account);
