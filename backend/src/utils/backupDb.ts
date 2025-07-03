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
  const projectRoot = __dirname.includes('dist')
    ? path.resolve(__dirname, '../../..')
    : path.resolve(__dirname, '../..');
  const absDbPath = path.isAbsolute(dbPath)
    ? dbPath
    : path.resolve(projectRoot, 'prisma', dbPath);
  const backupDir = path.resolve(projectRoot, 'backups');
  const timestamp = new Date().toISOString().replace(/[.:\-T]/g, '').slice(0, 15);
  const backupFile = path.join(backupDir, `sqlite_backup_${timestamp}.db`);

  fs.mkdirSync(backupDir, { recursive: true });

  try {
    fs.copyFileSync(absDbPath, backupFile);
    console.log(`SQLite database backup complete: ${backupFile}`);
  } catch (err) {
    console.error('SQLite backup failed:', err);
  }
}

if (require.main === module) {
  backupDatabase();
}
