const mysql = require("mysql");
const util = require('util')
const config = require("../config/config.js");

// Create a connection to the database
const Connection = mysql.createConnection({
    host: config.DB_HOST,
    user: config.DB_USER,
    password: config.DB_PASSWORD,
    database: config.DB_NAME,
    multipleStatements: true
});
  
// open the MySQL connection
Connection.connect(error => {
    if (error) throw error;
    console.log("Successfully connected to the database.");
});

Connection.query = util.promisify(Connection.query);

module.exports = Connection;