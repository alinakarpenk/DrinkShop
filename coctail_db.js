import Sequelize from "sequelize";

const db = new Sequelize(
    'cocktails_db',
    'root',
    'bellik56',
    {
        host: 'localhost',
        dialect: 'mysql',
        logging: false
    }
);

export default db;