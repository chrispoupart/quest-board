import { backupDatabase } from './src/utils/backupDb';
import { execSync } from 'child_process';

console.log('Backing up database before migration...');
backupDatabase();

console.log('Running prisma migrate dev...');
execSync('npx prisma migrate dev', { stdio: 'inherit' });
