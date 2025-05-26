const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const router = express.Router();
const { sequelize, QueryResult, Users, pool} = require('../db');
const SECRET_KEY = 'e91f696e93ce5cb5a43208aa0368aae3f711f1a03a66bb052290a22df6fd266fz';

const { Sequelize } = require('sequelize');
router.use(cookieParser());

router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    try{
        await Users.create({
            username: username,
            password: hashed
        });
        res.json({message:'Zarejestrowano pomyslnie'});
    }
    catch(err){
        if(err.code==='23505'){
            res.status(400).json({message:'Uzytkownik juz istnieje'});
        }
        else{
            res.status(500).json({message:'Blad serwera'});
        }
    }
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    // const result = await pool.query('SELECT * FROM Users WHERE username = $1',[username]);
    const result = await Users.findAll({
        where: { username: username }
    });

    const user = result[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: 'Błędne dane logowania' });
    }
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });

    res.cookie('token', token, {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 3600000 // 1 godzina
    });

    res.json({ message: 'Zalogowano pomyślnie' });
});

router.post("/logout",(req,res)=>{
    res.clearCookie('token', {
        httpOnly: true,
        sameSite: 'lax',
    });
    res.json({ message: 'Wylogowano pomyślnie' });
})

router.get('/me', (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: 'Brak tokena' });
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        res.json({ username: decoded.username });
    } catch {
        res.status(401).json({ message: 'Nieprawidłowy token' });
    }
});

module.exports = router;
