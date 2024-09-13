import { dirname, resolve } from "path";
import { Sequelize, Transaction } from "sequelize";
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = resolve(__dirname, 'database.sqlite');

const storage = process.env.NODE_ENV === 'production' || true ? dbPath : ':memory:'

export const sequelize = new Sequelize({
  username: 'root',
  password: 'root',
  host: 'localhost',
  dialect: 'sqlite',
  storage,
  logging: process.env.NODE_ENV !== 'production',
  pool: {
    max: 1,
  },
  transactionType: Transaction.TYPES.IMMEDIATE
});
