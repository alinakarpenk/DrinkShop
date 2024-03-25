import DataTypes from 'sequelize'
import db from "../coctail_db.js"
import Coctail from "./coctails.js";
import Ingredient from "./ingredients.js";

const IngredientCoctail = db.define('IngredientCoctail', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  amount: {
    type: DataTypes.DECIMAL(5, 2)
  }
}, {
  tableName: 'ingredient_coctails',
  timestamps: false
});

IngredientCoctail.belongsTo(Coctail, { foreignKey: 'coctail_id', as: 'coctail' });
IngredientCoctail.belongsTo(Ingredient, { foreignKey: 'ingredient_id', as: 'ingredient' });

export default IngredientCoctail;
