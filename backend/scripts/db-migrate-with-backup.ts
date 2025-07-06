import { backupDatabase } from '../src/utils/backupDb';
import { execSync } from 'child_process';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

function main() {
  console.log('Backing up database before migration...');
  backupDatabase();

  console.log('Running prisma migrate dev...');
  execSync('npx prisma migrate dev', { stdio: 'inherit' });
}

main();
