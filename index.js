const dbConnection = require('./db');
const express = require('express')
const config = require('config')
const app = express()

const home = require('./routes/home');
const user = require('./routes/user');


if (!config.get('jwtPrivateKey')){
    console.error('FATAL ERROR: jwtPrivateKey is not defined.');
    process.exit(1);
}

app.use(express.json());

//Static Folder
app.use(express.static('public'));

app.use('/api/user',user);
app.use('/',home);

//PORT
const port = process.env.port || 3000;//配置端口号，并且放在环境变量里
app.listen(port,() => {
    console.log(`listening on port ${port}......`);
});

async function dataBaseConnection()
{
    // try{
        app.set('db',await dbConnection());//'db':全局变量
        console.log('Database connected');
    // }catch(err){
    //     console.err(err.message);
    //     process.exit(1);
    // }   
}

dataBaseConnection();