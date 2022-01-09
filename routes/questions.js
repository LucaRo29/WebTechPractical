var express = require('express');
var router = express.Router();
const fs = require('fs');

const {check, validationResult} = require('express-validator');
let user = 'Not logged in';

/* GET users listing. */
router.get('/new', function (req, res, next) {

    if (req.session.loggedIn) {
        user = req.session.username;
        res.render('new', {message: " Please create your question", currentuser: 'Logged in as ' + user});
    } else {
        res.render('index', {message: "You have to be logged in to create a question!", currentuser: user});
    }

});

router.post('/new', function (req, res, next) {

    if (req.body.title.length === 0 || req.body.body.length === 0) {
        res.render('new', {message: 'Please fill out the whole form', currentuser: user});
    } else {
        fs.readFile('DB/questions.json', function (err, data) {

            if (data.length == 0) {
                data = "[]";
                fs.writeFile("DB/users.json", data, (err) => {

                    if (err) {
                        throw err;
                    }

                });
            }

            let questions = JSON.parse(data);
            let ID = questions.length.toString();
            let date = new Date(3600000*Math.floor(Date.now()/3600000));
            let question = '{"'+ questions.length.toString()+
                                    '":{ "OwnerUserId":'+ req.session.username+
                                    ',"CreationDate":"'+date+
                                    '","Score": "0",'+
                                    '"Title":"'+ req.body.title+
                                    '","Body":"'+req.body.body+'"}}';

            questions.push(JSON.parse(question));

            // let question = '{'+ questions.length.toString()+
            //     ':{ \"OwnerUserId\":'+ req.session.username+
            //     ',\"CreationDate\":'+date+
            //     ',\"Score\": \"0\",'+
            //     '\"Title\":'+ req.body.Title+
            //     ',\"Body\":'+req.body.Body+'}}';

            fs.writeFile("DB/questions.json", JSON.stringify(questions), (err) => {

                if (err) {
                    throw err;
                } else {
                    res.redirect(302, '/');

                }
            });


            if (err) {
                throw err;
            }


        });
    }



});


// router.post('/register',[check('username').not().isEmpty(), check('password').not().isEmpty(), check('passwordrepeat').not().isEmpty()] ,function(req, res, next) {
//
//     var errors = validationResult(req);
//     if(errors.isEmpty()){
//
//         if (req.body.password !== req.body.passwordrepeat){
//             req.flash()
//             res.render('register',{message : 'Passwords were different'});
//         }
//         // fs.readFile('results.json', function (err, data) {
//         //   var json = JSON.parse(data)
//         //   json.push('search result: ' + currentSearchResult)
//
//         fs.readFile('DB/users.json', function(err, data) {
//
//             var users = JSON.parse(data)
//
//             let found = false;
//             for (let i = 0; i < users.length; i++) {
//                 // Check each id against the newThing
//                 if (users[i].username === req.body.username) {
//                     found = true;
//                     console.log('username already exists');
//                     res.render('register',{message : 'Username is already taken'});
//                 }
//             }
//
//             users.push({username:req.body.username,password:req.body.password});
//
//             fs.writeFile("DB/users.json", JSON.stringify(users),(err) =>{
//
//                 if(err)throw err;});
//
//             res.redirect(302, 'login');
//         })}else{
//         res.render('register',{message : 'Please fill out the whole form'});
//     }
//
// });
module.exports = router;
