const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

async function createDbConnection(){
    return open({
        filename:'./application.db',
        driver: sqlite3.Database
    });
}

module.exports = createDbConnection;