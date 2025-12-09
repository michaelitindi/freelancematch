const Database = require('better-sqlite3');
const crypto = require('crypto');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'freelancematch.db');
const db = new Database(dbPath);

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

const adminEmail = process.argv[2] || 'admin@freelancematch.com';
const adminPassword = process.argv[3] || 'admin123';
const adminName = process.argv[4] || 'Admin User';

const id = crypto.randomUUID();
const passwordHash = hashPassword(adminPassword);

try {
  db.prepare(`
    INSERT INTO users (id, email, password_hash, name, role, kyc_status)
    VALUES (?, ?, ?, ?, 'admin', 'approved')
  `).run(id, adminEmail, passwordHash, adminName);
  
  console.log('✅ Admin user created successfully!');
  console.log('Email:', adminEmail);
  console.log('Password:', adminPassword);
  console.log('ID:', id);
} catch (error) {
  if (error.message.includes('UNIQUE constraint failed')) {
    console.log('⚠️  User with this email already exists');
  } else {
    console.error('❌ Error:', error.message);
  }
}

db.close();
