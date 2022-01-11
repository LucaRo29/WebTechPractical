var express = require('express');
const fs = require("fs");
var router = express.Router();
const bg = require("../background")

let unauthorized = false;

let user = 'Not logged in';
/* GET home page. */
router.get('/', function (req, res, next) {


    fs.readFile('data/Questions_head.json', function (err, data) {


            data = data.toString().replaceAll(/\r|\n/g, '');


            let datastring = data;
            datastring = '[' + datastring + ']'
            //datastring = datastring.replaceAll('"  },  "', '"}},{"');
            datastring = datastring.replaceAll(/\"\s+\},\s+\"/g, '"}},{"');
            let questions_sorted = JSON.parse(datastring);


            questions_sorted.sort(function (a, b) {
                let keya = Object.keys(a);
                let keyb = Object.keys(b);
                return b[keyb].Score - a[keya].Score;
            });


            let top5 = JSON.parse("{}");

            if (Object.keys(questions_sorted).length != 0) {

                for (let i = 0; i < 5; i++) {

                    let id = Object.keys(questions_sorted[i])[0]
                    top5[id] = questions_sorted[i][id];
                }

            }


            if (req.session.loggedIn) {
                user = req.session.username;
                res.render('index', {currentuser: 'Logged in as ' + user, questions: top5, query: false});
            } else {
                res.render('index', {
                    message: 'You have to be logged in to post a question',
                    currentuser: user,
                    questions: top5
                    , query: false
                });
            }


        }
    )
});

router.get('/about', function (req, res, next) {
    res.render('about');
});

router.post('/search', function (req, res, next) {
    // //TODO render index with additional parameter query= true
    let searchedString = req.body.searchString;
    bg.calcQuery(searchedString, "data/word_vectors.txt", "data/entities.txt", (similarQuestions) => {
        res.render('index', {
            currentuser: user,
            questions: JSON.parse(similarQuestions),
            query : true});
    });

});


module.exports = router;


