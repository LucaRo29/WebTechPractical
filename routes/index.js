var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    let user = 'Not logged in';
    if (req.session.loggedIn) {
        user = req.session.username;
        res.render('index', { currentuser: 'Logged in as ' + user});
    } else {
        res.render('index', { currentuser: user});
    }
});

router.get('/about', function (req, res, next) {
    res.render('about');
});
module.exports = router;
