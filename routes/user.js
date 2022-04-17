const express = require('express');
const config = require('config');
const router = express.Router();
const Joi = require('joi');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

router.get('/me',auth, async (req,res)=>{
    const db = req.app.get('db');
    let user = await db.get('Select Id,Nickname,Phone,IsAdmin from Users where Id=?',req.user.Id);
    res.send(user);
});

router.post('/', async (req,res) =>{
    const {error} = validateUser(req.body);
    if(error){
        return res.status(400).send(error.details[0].message);
    }
    const db = req.app.get('db');
    let user = await db.get('Select * from Users where Phone=? And IsDisabled=0',req.body.phone);
    if (user) return res.status(400).send('Phone Number already been used.');
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password,salt);
    
    await db.run('INSERT INTO Users (Nickname,Phone,Password) VALUES (?,?,?)',
        req.body.nickname,
        req.body.phone,
        hashedPassword);//req.body.password
    user = await db.get('Select Id,Nickname,Phone,IsAdmin from Users where Phone=?',req.body.phone);
    const token = jwt.sign({Id:user.Id, isAdmin:user.IsAdmin},config.get('jwtPrivateKey'));
    res.header('x-auth-token',token).send(user);
});

function validateUser(user){
    const schema = Joi.object({
        nickname : Joi.string().min(2).max(20).required(),
        phone:Joi.number().min(0).max(11).required(),
        password: Joi.string().regex(new RegExp('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$')).required()
    });

    return schema.validate(user);
    //res.send(result);
}

module.exports = router;