import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export default {
  port: process.env.PORT || '3000',
  knex: {
    client: 'sqlite3',
    connection: {
      filename: path.join(__dirname, '../data/db.sqlite3'),
    },
    useNullAsDefault: true,
    // Use a single connection for SQLite
    pool: {
      min: 1,
      max: 1,
    },
  },
};
