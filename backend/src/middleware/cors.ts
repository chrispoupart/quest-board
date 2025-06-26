import cors from 'cors';

export const corsOptions = {
  origin: process.env['ALLOWED_ORIGINS']?.split(',') || ['http://localhost:3000'],
  credentials: true,
};

export default cors(corsOptions);
