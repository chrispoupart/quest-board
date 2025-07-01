export default async () => {
  process.env['DATABASE_URL'] = `file:${process.cwd()}/prisma/test.db`;
  process.env['NODE_ENV'] = 'test';
  process.env['JWT_SECRET'] = 'test-secret-key';
  process.env['JWT_REFRESH_SECRET'] = 'test-refresh-secret-key-that-is-long-enough-for-security';
  process.env['GOOGLE_CLIENT_ID'] = 'dummy';
  process.env['GOOGLE_CLIENT_SECRET'] = 'dummy';

  console.log('\n✅ Jest global setup complete: Environment variables set.');
};
