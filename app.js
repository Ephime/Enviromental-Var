//jshint esversion:6
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');

const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));

mongoose.set('strictQuery', true);
mongoose.connect('mongodb://127.0.0.1:27017/userDB', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        console.log(`CONNECTED TO MONGO!`);
    })
    .catch((err) => {
        console.log(err);
    })

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});


userSchema.plugin(encrypt, {
    secret: process.env.SECRET,
    encryptedFields: ['password']
});
const User = new mongoose.model('User', userSchema);



app.get("/", (req, res) => {
    res.render('home');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.route('/register')
    .get((req, res) => {
        res.render('register');
    })
    .post((req, res) => {
        const newUser = new User({
            email: req.body.username,
            password: req.body.password
        });

        newUser.save((err) => {
            if (err) {
                console.log(err);
            } else {
                res.render('secrets');
            }
        });

    });

app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({
        email: username
    }, (err, foundUser) => {
        if (err) {
            res.send(err);
        } else {
            if (foundUser) {
                if (foundUser.password === password) {
                    res.render("secrets");
                } else {
                    res.send("Either the password or username is incorrect");
                }
            } else {
                res.send('Either the password or username is incorrect');
            }
        }
    });
});

app.listen(3000, function () {
    console.log("Running on port 3000");
});