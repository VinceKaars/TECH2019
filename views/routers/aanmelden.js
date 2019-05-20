// routers/hello.js
var express = require('express');
var router = express.Router();

router.get('/aanmelden', function (req, res) {
	res.render('aanmelden');
});


router.post('/aanmelden', function (req, res) {
	
	req.getConnection(function (err, connection) {
		if (err) {
			console.log('Error connecting to Db');
			return;
		} else {
			console.log('Connection established');
		}
	
		console.log(req.body.username)
		
		connection.query("SELECT * FROM users WHERE username= ?", [req.body.username], function (err, user) {

			if (err) {
				console.log(err);
				res.send('Invalid username or email');

			}
			
			console.log("Test als ie deze niet logt wordt ik gek.")
			if (user[0] && user[0].password == req.body.password) {
					req.session.ingelogd = true;
					req.session.userID = user[0].ID
					req.session.username = req.body.username;
					req.session.password = req.body.password;
					req.session.gender = user[0].gender;
					req.session.sexuality = user[0].sexuality;
				
				res.redirect('dashboard');
				console.log("het is gelukt");
				console.log(user[0].gender)
				console.log(user[0].sexuality)
			} else {
				res.send('Invalid username or email');
				console.log("het is niet gelukt");
			}
		});
	});
});


module.exports = router;