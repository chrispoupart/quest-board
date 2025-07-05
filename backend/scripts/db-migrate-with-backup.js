const { backupDatabase } = require('../dist/src/utils/backupDb');
const { execSync } = require('child_process');

console.log('Backing up database before migration...');
backupDatabase();

console.log('Running prisma migrate dev...');
execSync('npx prisma migrate dev', { stdio: 'inherit' }); 
