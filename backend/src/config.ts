import dotenv from 'dotenv';

dotenv.config();

// Helper function to validate and ensure environment variables are strings
function requireEnvVar(name: string): string {
    const value = process.env[name];
    if (!value) {
        console.error(`FATAL ERROR: ${name} is not defined in the environment variables.`);
        process.exit(1);
    }
    return value; // TypeScript now knows this is a string
}

const JWT_SECRET = requireEnvVar('JWT_SECRET');
const JWT_REFRESH_SECRET = requireEnvVar('JWT_REFRESH_SECRET');
const GOOGLE_CLIENT_ID = requireEnvVar('GOOGLE_CLIENT_ID');
const GOOGLE_CLIENT_SECRET = requireEnvVar('GOOGLE_CLIENT_SECRET');
const DATABASE_URL = requireEnvVar('DATABASE_URL');

export default {
    jwtSecret: JWT_SECRET,
    jwtRefreshSecret: JWT_REFRESH_SECRET,
    googleClientId: GOOGLE_CLIENT_ID,
    googleClientSecret: GOOGLE_CLIENT_SECRET,
    databaseUrl: DATABASE_URL,
    nodeEnv: process.env['NODE_ENV'] || 'development',
};
