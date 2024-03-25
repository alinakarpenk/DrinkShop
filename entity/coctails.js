import DataTypes from 'sequelize'
import db from "../coctail_db.js"
import Category from "./categories.js";

const Coctail = db.define('Coctail', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(50)
  },
  description: {
    type: DataTypes.TEXT
  },
  volume: {
    type: DataTypes.INTEGER
  }
}, {
  tableName: 'coctails',
  timestamps: false
});

// В файлі coctails.js
Coctail.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });
//Coctail.hasMany(IngredientCoctail, { foreignKey: 'coctail_id', as: 'coctails' });
export default Coctail;
