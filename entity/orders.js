import DataTypes from 'sequelize'
import db from "../coctail_db.js"
import Client from "./clients.js";
import Status from "./statuses.js";

const Order = db.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ordering_date: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'orders',
  timestamps: false
});

Order.belongsTo(Client, { foreignKey: 'client_id', as: 'client' });
Order.belongsTo(Status, { foreignKey: 'status_id', as: 'status' });

export default Order;
