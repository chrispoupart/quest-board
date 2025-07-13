import path from 'path';
import fs from 'fs';

export function backupDatabase() {
  const dbUrl = process.env['DATABASE_URL'];
  if (!dbUrl || !dbUrl.startsWith('file:')) {
    console.error('DATABASE_URL must be set and start with file: for SQLite backups.');
    return;
  }

  // Extract the file path from DATABASE_URL (e.g., file:./dev.db)
  const dbPath = dbUrl.replace(/^file:/, '');

  // Resolve the absolute path to the database
  const absDbPath = path.isAbsolute(dbPath)
    ? dbPath
    : path.resolve(process.cwd(), dbPath);

  // Create backup directory in the same location as the database
  // This ensures backups persist in container volumes
  const dbDir = path.dirname(absDbPath);
  const backupDir = path.join(dbDir, 'backups');
  const timestamp = new Date().toISOString().replace(/[.:\-T]/g, '').slice(0, 15);
  const backupFile = path.join(backupDir, `sqlite_backup_${timestamp}.db`);

  try {
    // Ensure backup directory exists
    fs.mkdirSync(backupDir, { recursive: true });

    // Copy the database file
    fs.copyFileSync(absDbPath, backupFile);
    console.log(`SQLite database backup complete: ${backupFile}`);
  } catch (err) {
    console.error('SQLite backup failed:', err);
    throw err; // Re-throw to allow calling code to handle the error
  }
}

if (require.main === module) {
  backupDatabase();
}
