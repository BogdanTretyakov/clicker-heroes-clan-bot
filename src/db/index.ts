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
  declare discordId: string
}

ClanMember.init(
  {
    uid: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    nickname: {
      type: DataTypes.STRING,
    },
    discordId: {
      type: DataTypes.STRING,
    },
  },
  { sequelize, paranoid: true }
)

export class ClanActivity extends Model {
  declare uid: string
  declare inactiveCount: number
}

ClanActivity.init(
  {
    uid: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    inactiveCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    }
  },
  {
    sequelize,
  }
)


await sequelize.sync({ alter: true })

export { sequelize as sequelizeInstance }
