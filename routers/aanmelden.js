// routers/hello.js
var express = require('express');
var router = express.Router();

router.get('/aanmelden', function (req, res) {
	res.render('aanmelden');
});


router.post('/aanmelden', function (req, res) {
	var sess = req.session;
	req.session.username = req.body.username;
	req.session.password = req.body.password;

	req.getConnection(function (err, connection) {
		if (err) {
			console.log('Error connecting to Db');
			return;
		} else {
			console.log('Connection established');
		}
		connection.query("SELECT username, password FROM users WHERE username= ?", [req.body.username], function (err, rows) {

			if (err) {
				console.log(err);
				res.send('Invalid username or email');

			}
			if (rows[0] && rows[0].password == req.body.password) {
				req.session.ingelogd = true;
				res.redirect('dashboard');
				console.log("het is gelukt");
			} else {
				res.send('Invalid username or email');
				console.log("het is niet gelukt");
			}
		});
	});
});


module.exports = router;