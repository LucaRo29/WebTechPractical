var express = require('express');
var router = express.Router();
const fs = require('fs');

const { check, validationResult } = require('express-validator');


/* GET users listing. */
router.get('/login', function(req, res, next) {
  res.render('login',{message : " Please login to your account"});
});

router.post('/login',function(req, res, next) {
  res.render('index');
});

router.get('/register', function(req, res, next) {
  res.render('register',{message : " Please register an account"});
});

router.post('/register',[check('username').not().isEmpty(), check('password').not().isEmpty(), check('password2').not().isEmpty()] ,function(req, res, next) {

  var errors = validationResult(req);
  if(errors.isEmpty()){

    if (req.body.password !== req.body.password2){
      req.flash()
      res.render('register',{message : 'Passwords were different'});
    }
    // fs.readFile('results.json', function (err, data) {
    //   var json = JSON.parse(data)
    //   json.push('search result: ' + currentSearchResult)

    fs.readFile('DB/users.json', function(err, data) {

      var users = JSON.parse(data)

      let found = false;
      for (let i = 0; i < users.length; i++) {
        // Check each id against the newThing
        if (users[i].username === req.body.username) {
          found = true;
          console.log('username already exists');
          res.render('register',{message : 'Username is already taken'});
        }
      }

      users.push({username:req.body.username,password:req.body.password});

      fs.writeFile("DB/users.json", JSON.stringify(users),(err) =>{

      if(err)throw err;});

      res.redirect(302, 'login');
    })}else{
    res.render('register',{message : 'Please fill out the whole form'});
  }

});
module.exports = router;
