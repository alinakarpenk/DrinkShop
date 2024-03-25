import DataTypes from 'sequelize'
import db from "../coctail_db.js"
import Coctail from "./coctails.js"
import Order from "./orders.js"

const CoctailOrder = db.define('CoctailOrder', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  count: {
    type: DataTypes.INTEGER
  },
  price: {
    type: DataTypes.DECIMAL(8, 2)
  }
}, {
  tableName: 'coctail_orders',
  timestamps: false
});

CoctailOrder.belongsTo(Coctail, { foreignKey: 'coctail_id' });
CoctailOrder.belongsTo(Order, { foreignKey: 'order_id' });

export default CoctailOrder;
