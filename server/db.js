const { Pool } = require('pg');

const dbHost = process.env.DB_HOST || 'localhost';
const dbUser = process.env.DB_USER || 'postgres';
const dbPassword = process.env.DB_PASSWORD || 'postgres';
const dbName = process.env.DB_NAME || 'postgres';

const pool = new Pool({
    host: dbHost,
    port: 5432,
    user: dbUser,
    password: dbPassword,
    database: dbName
});

const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    dialect: 'postgres'
});

const Users = sequelize.define('Users', {
    username: {type: DataTypes.STRING, allowNull: false, unique: true},
    password: {type: DataTypes.STRING, allowNull: false}
});
const QueryResult = sequelize.define('QueryResult', {
    username: { type: DataTypes.STRING, allowNull: false },
    responseData: { type: DataTypes.JSONB, allowNull: false }
}, {});

sequelize.sync();

module.exports = { sequelize, QueryResult, Users, pool };