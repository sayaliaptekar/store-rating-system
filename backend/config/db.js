const mysql = require("mysql2/promise");
require("dotenv").config();

console.log("DB USER:", process.env.DB_USER);
console.log("DB NAME:", process.env.DB_NAME);

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function testConnection() {
    try {
        const connection = await pool.getConnection();

        console.log("✅ MySQL Database Connected Successfully!");

        connection.release();
    } catch (error) {
        console.error("❌ Database Connection Failed!");
        console.error(error.message);
    }
}

testConnection();

module.exports = pool;