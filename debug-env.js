const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

const envPath = path.join(process.cwd(), 'apps/auth/.env');
console.log('Env Path:', envPath);
console.log('File exists:', fs.existsSync(envPath));
if (fs.existsSync(envPath)) {
    console.log('File content:', fs.readFileSync(envPath, 'utf8'));
}

const result = dotenv.config({ path: envPath, debug: true });
console.log('Dotenv parsed:', result.parsed);
console.log('Dotenv error:', result.error);
console.log('DATABASE_URL:', process.env.DATABASE_URL);
