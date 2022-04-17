const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();
const Joi = require('joi');
const admin = require('../middleware/admin');

router.get('/', async (req,res) => {
    const db = req.app.get('db');
    const courses = await db.all('Select * from Courses Where IsDisabled = 0;');
    res.send(courses);
});

router.post('/', auth, async (req,res) =>{

    const {error} = validateCourse(req.body);
    if(error){
        res.status(400).send(error.details[0].message);
        return;
    }

    const db = req.app.get('db');
    const result = await db.run('INSERT INTO Courses (Name) VALUES (?)', req.body.name);
    const course = await db.get('Select * from Courses where Id=?',result.lastID);
    res.send(course);
});

router.get('/:id', async (req,res) => {
    const result = await isExistingCourse(req,res);
    if (!result) return;
    res.send(result);
})

router.put('/:id',async (req,res) =>{
    const db = req.app.get('db');
    const result = await isExistingCourse(req,res);
    if (!result) return;
    
    const {error} = validateCourse(req.body);
    if(error){
        res.status(400).send(error.details[0].message);
        return;
    }

    await db.run('UPDATE Courses SET Name=? WHERE Id=?',req.body.name,
        parseInt(req.params.id));
    course = await db.get('Select * from Courses Where IsDisabled = 0 AND Id=?;', 
        parseInt(req.params.id));
    res.send(course);
});

router.delete('/:id',[auth,admin],async (req,res)=>{
    const db = req.app.get('db');
    const result = await isExistingCourse(req,res);
    if (!result) return;
    await db.run('UPDATE Courses SET IsDisabled=? WHERE Id=?',1,
        parseInt(req.params.id));
    course = await db.get('Select * from Courses Where IsDisabled = 1 AND Id=?;', 
        parseInt(req.params.id));
    res.send(course);
});

function validateCourse(course){
    const schema = Joi.object({
        name : Joi.string().min(3).required()
    });

    return schema.validate(course);
}

async function isExistingCourse(req,res){
    const db = req.app.get('db');
    let course = await db.get('Select * from Courses Where IsDisabled = 0 AND Id=?;',
        parseInt(req.params.id));
    if (!course) {
        res.status(404).send('给定的id课程没有找到');
        return false;
    }
    return course;
}

module.exports = router;