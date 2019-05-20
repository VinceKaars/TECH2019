// Load modules
var path = require('path'), // core
	express = require('express'),
	bodyParser = require('body-parser'),
	mysql = require('mysql'),
	myConnection = require('express-myconnection'),
	session = require('express-session'),
	app = express()
multer = require('multer'),
	fs = require('fs');
//	md5 = require('md5');


var userProfiel;
// Connect to MySQL
app.use(myConnection(mysql, {
	host: '192.168.56.101',
	user: 'student',
	password: 'serverSide',
	port: 3306,
	database: 'datingsite'
}, 'single'));

// Define bodyparser (handles POST requests)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

// Css images en js toevoegen
app.use(express.static(path.join(__dirname, 'public')));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// initialiseer sessies
app.use(session({
	secret: "YourSuperSecretStringWithStrangeCharacters#@$!",
	resave: false,
	saveUninitialized: true
}));

// Define upload dir
var upload = multer({
	dest: 'public/uploads/'
});
// geef de form input name op
app.use(upload.single('profielfoto'));

app.get('/', function (req, res) {
	if (!req.session.ingelogd) {
		res.render('index');
	} else {
		res.redirect('dashboard')
	}
});

app.post('/', function (req, res, next) {

	var gegevens = {
		username: req.body.username,
		birthday: req.body.birthday,
		gender: req.body.gender,
		sexuality: req.body.sexuality,
		email: req.body.email,
		password: req.body.password,
		profielfoto: '../uploads/' + req.file.originalname,
		bio: req.body.bio
	}

	console.log(gegevens);



	req.getConnection(function (err, connection) {
		if (err) {
			console.log(err);
			return;
		}
		connection.query('INSERT INTO users SET ?', [gegevens], function (err) {
			if (err) {
				console.log(err);

			}
			console.log(req.file);
			// A file was uploaded if req.file is not undefined
			if (req.file !== undefined) {
				// Move the file
				fs.rename(req.file.path, req.file.destination + req.file.originalname, function (err) {

					if (err)

						console.log('Upload error.')
					return next(err);
				});
			}

			res.redirect('/aanmelden')

		});
	});
});


app.get('/dashboard/', function (req, res) {
	if (req.session.ingelogd) {
		req.getConnection(function (err, connection) {
			if (err) {
				return next(err)
			}

			connection.query('SELECT *, TIMESTAMPDIFF(YEAR, birthday, CURDATE()) AS age FROM users WHERE gender = ? AND sexuality = ?', [req.session.sexuality, req.session.gender], function (err, user) {
				if (err) {
					// return next(err)
				}

				if (user[0]) {
					res.locals.user = user;
					userProfiel = user;
					res.render('dashboard')
				}

				console.log(req.session.username)
				console.log(req.session.password)
				console.log(req.session.gender)
				console.log(req.session.sexuality)
				console.log(req.session.bio)
				console.log(req.session.profielfoto)







			})

		})


	} else {
		res.redirect("/");
	}

})

app.get('/aanmelden', function (req, res) {
	res.render('aanmelden');
});


app.post('/aanmelden', function (req, res) {

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

			if (user[0] && user[0].password == req.body.password) {
				if (user[0].admin > 0) {
					req.session.ingelogd = true;
					res.redirect("/admin");
				}
				req.session.ingelogd = true;
				req.session.userID = user[0].ID
				req.session.username = req.body.username;
				req.session.password = req.body.password;
				req.session.gender = user[0].gender;
				req.session.sexuality = user[0].sexuality;
				
				if (user[0].admin == 0) {
					req.session.ingelogd = true;
					res.redirect("dashboard");
				}
				
			} else {
				res.send('Invalid username or email');
				console.log("login failed.");
			}
		});
	});
});


app.get('/signout', function (req, res) {
	res.render('dashboard/signout');
});

app.post('/signout', function (req, res) {
	req.session.destroy(function () {
		res.render('dashboard/signout');
	});
});



app.get('/profiel/:nummer', function (req, res) {
	if (req.session.ingelogd == true) {
	res.locals.match = userProfiel[req.params.nummer];
	res.render('dashboard/matchdetail');
	} else {
		res.redirect('/');
	}

});

app.post('/profiel/:nummer', function (req, res) {


	var reportedinfo = {
		username: req.body.reporteduser,
		toelichting: req.body.toelichting


	};

	req.getConnection(function (err, connection) {
		if (err) {
			console.log('Error connecting to Db');
			return;
		} else {
			console.log('Connection established');
			console.log(userProfiel[req.params.nummer].ID);
			console.log(req.session.iduser);
		}
		connection.query('INSERT INTO datingsite.reported SET ?', reportedinfo, function (err) {
			if (err) {
				console.log(err);

			} else {

				res.redirect('/verstuurd');
			}

		});



	});
});






app.get('/matches', function (req, res) {
	if (req.session.ingelogd == true) {
		res.locals.matchnaam = "Liza";
		res.locals.matchleeftijd = "19";
		res.render('dashboard/matchdetail');
	} else {
		res.redirect('/');
	}
});

app.get('/edit', function (req, res) {
	if (req.session.ingelogd == true) {
		res.render('dashboard/edit');
	} else {
		res.redirect('/');
	}
});

app.post('/edit', function (req, res) {
	req.getConnection(function (err, connection) {
		var gegevens = {
			username: req.body.username,
			birthday: req.body.birthday,
			gender: req.body.gender,
			sexuality: req.body.sexuality,
			email: req.body.email,
			password: req.body.password,
			profielfoto: '../uploads/' + req.file.originalname,
			bio: req.body.bio
		};
		if (err) {
			return next(err)
		}
		connection.query("UPDATE users SET ? WHERE ID=?", [gegevens, req.session.userID], function (err) {
			if (err) {}
			res.redirect("/dashboard");
		})
	})

})

app.get('/berichtdetail', function (req, res) {
	if (req.session.ingelogd == true) {
		res.render('dashboard/berichtdetail');
	} else {
		res.redirect('/');
	}
});

app.get('/verstuurd', function (req, res) {
	res.render('dashboard/verstuurd');
});

app.get('/report', function (req, res) {
	res.render('dashboard/report');
});

app.get('/mijnprofiel', function (req, res) {
	req.getConnection(function (err, connection) {
		connection.query("SELECT *, TIMESTAMPDIFF(YEAR, birthday, CURDATE()) AS age FROM users where username = ?", [req.session.username], function (err, user) {
			if (err) {
				console.log(err);
			}

			if (user[0]) {
				res.locals.username = user[0].username
				res.locals.bio = user[0].bio
				res.locals.profielfoto = user[0].profielfoto
				res.locals.age = user[0].age
				res.render('dashboard/mijnprofiel');
			} else {
				res.redirect('/');
			}
		});
	});
});

app.get('/delete', function (req, res) {
	res.render('dashboard/delete');
});

app.post('/delete', function (req, res) {
	req.getConnection(function (err, connection) {
		if (err) {
			return next(err)
		}
		connection.query("DELETE FROM users WHERE ID=?", [req.session.userID], function (err) {
			if (err) {
				console.log('Error. Dit is trouwens ook de error die hij logt.')
			}
			req.session.destroy(function () {
				res.redirect("/");
			});
		})
	})
})


app.get('/admin/', function(req, res) {
	if (req.session.ingelogd) {
		req.getConnection(function(err, connection) {
			if (err) {
				return next(err)
			}
			connection.query('SELECT * FROM datingsite.reported JOIN datingsite.users ON reported.username = datingsite.users.username WHERE reported = 0   ', function(err, user) {
				if (err) {
					return next(err)
				}
				res.locals.user = user
				res.render('admin/admin')
			})
		})
	} else {
		res.redirect("/login");
	}
})

app.get('/deletereported', function(req, res) {
	req.query.id;
	req.getConnection(function(err, connection) {
		if (err) {
			console.log('Error connecting to Db');
			return;
		}
		connection.query("DELETE FROM users WHERE ID=? limit 1", [req.query.id], function(err, result) {
			if (err) {
			} else {
				res.redirect("/admin");
			}
		});
	});
});

app.get('/admindashboard', function (req, res) {
	res.render('admin/admindashboard');
});

app.get('/matchdetailadmin', function (req, res) {
	res.render('admin/matchdetailadmin');
});

app.get('/reportdetail', function (req, res) {
	res.render('admin/reportdetail');
});

app.get('/reports', function (req, res) {
	res.render('admin/reports');
});

app.listen(3000, function () {
	console.log("Webserver gestart op poort 3000");
});