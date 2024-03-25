import DataTypes from 'sequelize';
import db from "../coctail_db.js";
const Ingredient = db.define('Ingredient', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(50)
  },
  price: {
    type: DataTypes.DECIMAL(5, 2)
  }
}, {
  tableName: 'ingredients',
  timestamps: false
});


export default Ingredient;
