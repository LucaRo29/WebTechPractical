var express = require('express');
var router = express.Router();
const fs = require('fs');
//const bg = require('background.js');

//TODO search
let user = 'Not logged in';

// router.post('/search', function (req, res, next) {
//     let searchedString = req.body.searchString;
//
//
//     return;
// });
router.get('/questionClap/(:id)', function (req, res, next) {

    fs.readFile('data/Questions.json', function (err, data) {

        data = data.toString().replaceAll(/\r|\n/g, '');
        let questions = JSON.parse(data);

        let questionScore = parseInt(questions[req.params.id].Score);
        questionScore++;
        questions[req.params.id].Score = questionScore;


        fs.writeFile("data/Questions.json", JSON.stringify(questions), (err) => {

            if (err) {
                throw err;
            } else {
                res.redirect(302, '/questions/get/' + req.params.id);

            }
        });

    });

});

router.get('/answerClap/(:id)', function (req, res, next) {

    fs.readFile('data/Answers.json', function (err, data) {

        data = data.toString().replaceAll(/\r|\n/g, '');
        let paramarray = req.params.id.toString().split('&');
        let aid = paramarray[0];
        let qid = paramarray[1];
        let answers = JSON.parse(data);

        let questionScore = parseInt(answers[aid].Score);
        questionScore++;
        answers[aid].Score = questionScore;


        fs.writeFile("data/Answers.json", JSON.stringify(answers), (err) => {

            if (err) {
                throw err;
            } else {
                res.redirect(302, '/questions/get/' + qid);

            }
        });

    });

});

router.get('/get/(:id)', function (req, res, next) {

    let reqQuestion;
    fs.readFile('data/Questions.json', function (err, data) {
        data = data.toString().replaceAll(/\r|\n/g, '');
        let questions = JSON.parse(data);
        reqQuestion = questions[req.params.id];


        let reqAnswers = JSON.parse("{}");
        fs.readFile('data/Answers.json', function (err, data) {
            data = data.toString().replaceAll(/\r|\n/g, '');
            let answers = JSON.parse(data);

            for (let x in answers) {
                //let entries = Object.entries(answers[x]);
                if (answers[x].ParentId == parseInt(req.params.id)) {
                    reqAnswers[x]=answers[x];
                }
            }



                if (req.session.loggedIn) {
                    user = 'Logged in as ' + req.session.username;
                    res.render('question', {currentuser: user, question: reqQuestion, answers: reqAnswers,id :req.params.id});
                } else {
                    res.render('question', {
                        // message: 'You have to be logged in to post a ',
                        currentuser: user,
                        question: reqQuestion,
                        answers: reqAnswers,
                        id :req.params.id
                    });
                }


        });
    });


});
router.get('/new', function (req, res, next) {

    if (req.session.loggedIn) {
        user = 'Logged in as ' + req.session.username;
        res.render('new', {message: " Please create your question", currentuser: user});
    } else {
        // res.ERROR = 'Unauthorized';
        // res.req.statusCode=401;
        res.redirect(302, '/');
        return;
    }

});

router.post('/new', function (req, res, next) {

    if (req.body.title.length === 0 || req.body.body.length === 0) {
        res.render('new', {message: 'Please fill out the whole form', currentuser: user});
    } else {
        fs.readFile('data/Questions.json', function (err, data) {
            data = data.toString().replaceAll(/\r|\n/g, '');


            let questions = JSON.parse(data);

            var today = new Date();
            var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
            var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
            var dateTime = date+' '+time;

            let ID = Object.keys(questions).length+1;
            let question = '{' +
                ' "OwnerUserId":"' + req.session.username +
                '","CreationDate":"' + dateTime +
                '","Score": "0",' +
                '"Title":"' + req.body.title +
                '","Body":"' + req.body.body + '"}';

            questions[ID]=JSON.parse(question);

            fs.writeFile("data/Questions.json", JSON.stringify(questions), (err) => {

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

router.post('/answer/(:id)', function (req, res, next) {

    if (!req.session.loggedIn) {

        req.ERROR = 'Unauthorized';
        res.redirect('/questions/get/' + req.params.id);
        return;
    }

    if (req.body.body.length === 0) {
        res.render('new', {message: 'Please type in your answer', currentuser: user});
    } else {
        fs.readFile('data/Answers.json', function (err, data) {

            data = data.toString().replaceAll(/\r|\n/g, '');


            let answers = JSON.parse(data);
            var today = new Date();
            var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
            var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
            var dateTime = date+' '+time;
            let ID = Object.keys(answers).length+1
            let answer =  '{' +
                '"OwnerUserId":"' + req.session.username +
                '","ParentId":' + req.params.id +
                ',"CreationDate":"' + dateTime +
                '","Score":"0",' +
                '"Body":"' + req.body.body + '"}';


            answers[ID]=JSON.parse(answer);

            fs.writeFile("data/Answers.json", JSON.stringify(answers), (err) => {

                if (err) {
                    throw err;
                } else {
                    res.redirect(302, '/questions/get/' + req.params.id);
                }
            });


            if (err) {
                throw err;
            }


        });
    }
});


module.exports = router;
