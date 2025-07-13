import { execSync } from 'child_process';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Dynamic import based on environment
async function getBackupFunction() {
  // Check if we're in production (compiled JS exists)
  // When running from dist/scripts/, we need to go up one level to find dist/src/
  const compiledPath = path.resolve(__dirname, '../src/utils/backupDb.js');
  const sourcePath = path.resolve(__dirname, '../src/utils/backupDb.ts');

  if (fs.existsSync(compiledPath)) {
    // Production: use compiled JavaScript
    const backupModule = await import(compiledPath);
    return backupModule.backupDatabase;
  } else if (fs.existsSync(sourcePath)) {
    // Development: use TypeScript source
    const backupModule = await import(sourcePath);
    return backupModule.backupDatabase;
  } else {
    throw new Error('Backup module not found in either compiled or source locations');
  }
}

async function main() {
  console.log('Backing up database before migration...');

  try {
    const backupDatabase = await getBackupFunction();
    backupDatabase();
  } catch (error) {
    console.error('Backup failed:', error);
    process.exit(1);
  }

  console.log('Running prisma migrate deploy...');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
}

main().catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});
