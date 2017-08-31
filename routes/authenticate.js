var express = require('express');
var router = express.Router();

module.exports = function(passport){

	//sends successful login state back to angular
	router.get('/success', function(req, res){
		res.send({state: 'success', user: req.user ? req.user : null});
	});

	//sends failure login state back to angular
	router.get('/failurelogin', function(req, res){
		res.send({state: 'failure', user: null, message: "Invalid username or password"});
	});
    
    //sends failure login state back to angular
	router.get('/failurereg', function(req, res){
        
		res.send({state: 'failure', user: null, message: "Username already exists"});
	});

	//log in
	router.post('/login', passport.authenticate('login', {
		successRedirect: '/auth/success',
		failureRedirect: '/auth/failurelogin'
	}));
    
    //log in
	router.post('/adminlogin', passport.authenticate('adminlogin', {
		successRedirect: '/auth/success',
		failureRedirect: '/auth/failurelogin'
	}));

	//sign up
	router.post('/signup', passport.authenticate('signup', {
		successRedirect: '/auth/success',
		failureRedirect: '/auth/failurereg'
	}));
    
    //sign up
	router.post('/adminsignup', passport.authenticate('adminsignup', {
		successRedirect: '/auth/success',
		failureRedirect: '/auth/failurereg'
	}));

	//log out
	router.get('/signout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

	return router;

}