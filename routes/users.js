var express = require('express');
var router = express.Router();
const fs = require('fs');

const {check, validationResult} = require('express-validator');
let user = 'Not logged in';

/* GET users listing. */
router.get('/login', function (req, res, next) {


    if (req.session.loggedIn) {
        user = 'Logged in as ' +req.session.username;
        res.render('login', {message: " Please login to your account",currentuser:  user});
    } else {
        res.render('login', {message: " Please login to your account",currentuser: user});
    }

});

router.post('/login', (req, res, next) => {

    if (req.body.username.length === 0 || req.body.password.length === 0 ) {
        res.render('login', {message: 'Please fill out the whole form',currentuser: user});

    } else {
        fs.readFile('data/users.json', function (err, data) {

            let users = JSON.parse(data);

            let authenticated = false;
            for (let i = 0; i < users.length; i++) {

                if (users[i].username == req.body.username && users[i].password == req.body.password) {
                    // res.locals.username = req.body.username;

                    authenticated = true;
                    req.session.loggedIn = true;
                    req.session.username = req.body.username;
                    console.log(req.session);
                    res.redirect('/');
                   return;

                }
            }

            if (!authenticated) {

                res.render('login', {message: "Username or password were incorrect",currentuser: user});

            }

        });
    }
});


router.get('/register', function (req, res, next) {


    if (req.session.loggedIn) {
        user = 'Logged in as ' +req.session.username;
        res.render('register', {message: " Please register an account",currentuser: user});
    } else {
        res.render('register', {message: " Please register an account",currentuser: user});
    }


});
//[check('username').not().isEmpty(), check('password').not().isEmpty(), check('passwordRepeat').not().isEmpty()],
router.post('/register', function (req, res, next) {

    // var errors = validationResult(req);
    if (req.body.username.length == 0 || req.body.password.length == 0 || req.body.passwordRepeat.length == 0) {
          res.render('register', {message: 'Please fill out the whole form',currentuser: user});

    } else {

        if (req.body.password !== req.body.passwordRepeat) {

            res.render('register', {message: 'Passwords were different',currentuser: user});
            return;
        }

        fs.readFile('data/users.json', function (err, data) {

            if (data.length == 0) {
                data = "[]";
                fs.writeFile("data/users.json", data, (err) => {

                    if (err) {
                        throw err;
                    }

                });
            }

            let users = JSON.parse(data)

            let found = false;
            for (let i = 0; i < users.length; i++) {
                // Check each id against the newThing
                if (users[i].username === req.body.username) {
                    found = true;
                    console.log('username already exists');
                    res.render('register', {message: 'Username is already taken',currentuser: user});
                    return;
                }
            }
            if (!found) {
                users.push({username: req.body.username, password: req.body.password});

                fs.writeFile("data/users.json", JSON.stringify(users), (err) => {

                    if (err) {
                        throw err;
                    } else {
                        res.redirect(302, 'login');
                        return;
                    }
                });
            }


            if (err) {
                throw err;
            }
            // else {
            //     res.render('register', {message: 'Please fill out the whole form'});
            // }

        });

        //}
        //else {
        //     res.render('register', {message: 'Please fill out the whole form'});
        //}
    }
});
module.exports = router;
