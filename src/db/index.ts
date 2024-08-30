import { dirname, resolve } from "path";
import { Sequelize, DataTypes, Model } from "sequelize";
import {fileURLToPath} from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = resolve(__dirname, 'database.sqlite');

const storage = process.env.NODE_ENV === 'production' ? dbPath : ':memory:'

export const sequelize = new Sequelize({
  username: 'root',
  password: 'root',
  host: 'localhost',
  dialect: 'sqlite',
  storage,
  logging: process.env.NODE_ENV !== 'production'
});

await sequelize.authenticate()

export class ClanMember extends Model {
  declare uid: string
  declare nickname: string
}

ClanMember.init(
  {
    uid: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    nickname: {
      type: DataTypes.STRING,
    }
  },
  { sequelize }
)

await sequelize.sync({ alter: true })
