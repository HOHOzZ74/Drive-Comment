const express = require('express');
const config = require('config');
const router = express.Router();
const Joi = require('joi');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.post('/', async (req,res) =>{
    const {error} = validateUser(req.body);
    if(error){
        return res.status(400).send(error.details[0].message);
    }

    console.log(req.body);
    const db = req.app.get('db');
    const result = await db.run('INSERT INTO User (name,location) VALUES (?,?)',
        req.body.name,
        req.body.location);
    const user = await db.get('Select * from Courses where ID=? And IsDisabled=0',result.lastID);
    // let user = await db.get('Select * from Users where Phone=? And IsDisabled=0',req.body.phone);
    if (!user) return res.status(400).send('Invaild phone number or password.');
    
    const vaildPassword = await bcrypt.compare(req.body.password,user.Password);
    if (!vaildPassword) return res.status(400).send('Invaild phone number or password.');
    
    const token = jwt.sign({Id:user.Id, isAdmin: user.IsAdmin},config.get('jwtPrivateKey'));
    
    return res.send(token);
});

router.get('/:id',async (req,res)=> {
    const result = await isExistingUser(req,res);
    if(!result) return;
    res.send(result);
})

function validateUser(user){
    const schema = Joi.object({
        name : Joi.string().min(3).max(20).required(),
        phone : Joi.number().min(6).max(12).required(),
        Location : Joi.string().min(3).max(30).required(),
        password: Joi.string().regex(new RegExp('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$')).required()
    });

    return schema.validate(user);
}

module.exports = router;