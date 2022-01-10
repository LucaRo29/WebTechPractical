var express = require('express');
const fs = require("fs");
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    let user = 'Not logged in';
//TODO login first

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


        let questions_sorted = JSON.parse(data);

        questions_sorted.sort(function(a, b) {
            let keya = Object.keys(a);
            let keyb = Object.keys(b);
            return  b[keyb].Score - a[keya].Score;
        });

        let top5 = JSON.parse("[]");

        for (let i = 0; i < 5; i++) {
            top5.push(questions_sorted[i]);
        }


            if (req.session.loggedIn) {
                user = req.session.username;
                res.render('index', {currentuser: 'Logged in as ' + user, questions: top5});
            } else {
                res.render('index', {message: 'You have to be logged in to post a question',currentuser: user, questions: top5});
            }


    })
});

router.get('/about', function (req, res, next) {
    res.render('about');
});

router.post('/search', function (req, res, next) {
    res.render('about');
});


module.exports = router;

function sortByProperty(property){
    return function(a,b){
        if(a[property] > b[property])
            return 1;
        else if(a[property] < b[property])
            return -1;

        return 0;
    }
}
