import DataTypes from 'sequelize'
import db from "../coctail_db.js"
const Client = db.define('Client', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  first_name: {
    type: DataTypes.STRING(30)
  },
  last_name: {
    type: DataTypes.STRING(50)
  },
  email: {
    type: DataTypes.STRING(255)
  },
  address: {
    type: DataTypes.STRING(255)
  }
}, {
  tableName: 'clients',
  timestamps: false
});

export default Client;
