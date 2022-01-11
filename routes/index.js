var express = require('express');
const fs = require("fs");
var router = express.Router();

let user = 'Not logged in';
/* GET home page. */
router.get('/', function (req, res, next) {


    fs.readFile('DB/questions.json', function (err, data) {

            if (data.length == 0) {
                data = "[]";
                fs.writeFile("DB/questions.json", data, (err) => {
                    if (err) {
                        throw err;
                    }
                });
            }
            data = data.toString().replaceAll(/\r|\n/g, '');
            // if (data[0] !== 91) {
            //     data = '[' + data + ']';
            // }

            let datastring = data;
            datastring = '[' + datastring + ']'
            datastring = datastring.replaceAll('"  },  "', '"}},{"')
            let questions_sorted = JSON.parse(datastring);

            // let questions = JSON.parse(data);
            // let id = Object.keys(questions_sorted).length
            // test = questions_sorted[0];
            // questions_sorted[questions_sorted.length] = questions_sorted[0];
            // questions_sorted[4]= questions_sorted[0];

            // questions_sorted.push(questions_sorted[0]);

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


                // for(let x in questions_sorted){
                //     for(y in top5){
                //
                //         if
                //     }
                // }
            }

            // if (questions_sorted.length < 5) {
            //     for (let i = 0; i < questions_sorted.length; i++) {
            //         top5.push(questions_sorted[i]);
            //     }
            // } else {
            //     for (let i = 0; i < 5; i++) {
            //         top5.push(questions_sorted[i]);
            //     }
            // }


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
    //TODO render index with additional parameter query= true
    let searchedString = req.body.searchString;
    res.render('index', {
        currentuser: user,
        questions: similarquestions
        , query: true
    });

});


module.exports = router;


