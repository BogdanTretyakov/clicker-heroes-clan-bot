import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from "sequelize";
import { sequelize } from "../db";

export class ClickerHeroesMemberActivityEntity extends Model<
  InferAttributes<ClickerHeroesMemberActivityEntity>,
  InferCreationAttributes<ClickerHeroesMemberActivityEntity>
> {
  declare id: CreationOptional<number>
  declare uid: string
  declare date: Date
  declare status: boolean
}

ClickerHeroesMemberActivityEntity.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  uid: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: 'combine',
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
    unique: 'combine',
  },
  status: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  }
}, {
  sequelize,
})
