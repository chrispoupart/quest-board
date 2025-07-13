#!/usr/bin/env node

/**
 * Production Database Migration Script
 *
 * This script is designed for production environments and:
 * 1. Creates a backup before migration
 * 2. Uses prisma migrate deploy (not dev)
 * 3. Handles errors gracefully
 * 4. Ensures backups are stored in the correct location
 */

import { execSync } from 'child_process';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Dynamic import based on environment
async function getBackupFunction() {
  // Check if we're in production (compiled JS exists)
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

// Error handling function
function handleError(message: string, error?: any) {
  console.error(`❌ ${message}`);
  if (error) {
    console.error('Error details:', error.message);
  }
  process.exit(1);
}

// Success message function
function logSuccess(message: string) {
  console.log(`✅ ${message}`);
}

async function main() {
  console.log('🚀 Production Database Migration');
  console.log('================================\n');

  try {
    // Step 1: Create backup
    console.log('📦 Creating database backup...');
    const backupDatabase = await getBackupFunction();
    backupDatabase();
    logSuccess('Backup completed successfully');

    // Step 2: Check migration status
    console.log('🔍 Checking migration status...');
    try {
      execSync('npx prisma migrate status', { stdio: 'inherit' });
    } catch (error) {
      console.warn('⚠️  Migration status check failed, but continuing...');
    }

    // Step 3: Run production migration
    console.log('🔄 Running production migration...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    logSuccess('Production migration completed successfully');

    // Step 4: Generate Prisma client
    console.log('🔧 Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    logSuccess('Prisma client generated successfully');

    console.log('\n🎉 Production migration completed successfully!');
    console.log('Your database is now up to date with all applied migrations.');

  } catch (error) {
    handleError('Production migration failed', error);
  }
}

main().catch((error) => {
  handleError('Script execution failed', error);
});
