// Usage: node scripts/hash-password.js "your-password"
const bcrypt = require('bcryptjs');

const pwd = process.argv[2];
if (!pwd) {
  console.error('Usage: node scripts/hash-password.js "your-password"');
  process.exit(1);
}

const saltRounds = 12;
const hash = bcrypt.hashSync(pwd, saltRounds);
console.log(hash);

