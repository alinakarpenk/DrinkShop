import DataTypes from 'sequelize'
import db from "../coctail_db.js"

const Status = db.define('Status', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(50)
  },
  description: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'statuses',
  timestamps: false
});

export default Status;
