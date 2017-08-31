var mongoose = require('mongoose');   
var User = mongoose.model('User');
var Admin = mongoose.model('Admin');
var LocalStrategy   = require('passport-local').Strategy;
var bCrypt = require('bcrypt-nodejs');
var Bip38 = require('bip38');
var Colu = require('colu');

module.exports = function(passport){
    
    var encryptPrivateKey = function(addDtl, passphrase){
        var encryptedKey = ' ';
        var bip38 = new Bip38();
        bip38.versions ={
            private: 0xEF, 
            public: 0x6F
        }
        encryptedKey = bip38.encrypt(addDtl.privateKeyEncrypted,passphrase,addDtl.publicAddress);
                
        return encryptedKey;
    };
    
    
    
    
	// Passport needs to be able to serialize and deserialize users to support persistent login sessions
	passport.serializeUser(function(user, done) {
		//console.log('serializing user:',user.username);
		done(null, user._id);
	});

	passport.deserializeUser(function(id, done) {
		User.findById(id, function(err, user) {
			//console.log('deserializing user:',user.username);
            done(err, user);
		});
	});
    
   
	passport.use('login', new LocalStrategy({
			passReqToCallback : true
		},
		function(req, username, password, done) { 
			// check in mongo if a user with username exists or not
			User.findOne({ 'username' :  username }, 
				function(err, user) {
					// In case of any error, return using the done method
					if (err)
						return done(err);
					// Username does not exist, log the error and redirect back
					if (!user){
						//console.log('User Not Found with username '+username);
						return done(null, false);                 
					}
					// User exists but wrong password, log the error 
					if (!isValidPassword(user, password)){
						//console.log('Invalid Password');
						return done(null, false); // redirect back to login page
					}
					// User and password both match, return user from done method
					// which will be treated like success
					return done(null, user);
				}
			);
		}
	));
    
    passport.use('adminlogin', new LocalStrategy({
			passReqToCallback : true
		},
		function(req, username, password, done) { 
			// check in mongo if a user with username exists or not
			Admin.findOne({ 'username' :  username }, 
				function(err, user) {
					// In case of any error, return using the done method
					if (err)
						return done(err);
					// Username does not exist, log the error and redirect back
					if (!user){
						//console.log('User Not Found with username '+username);
						return done(null, false);                 
					}
					// User exists but wrong password, log the error 
					if (!isValidPassword(user, password)){
						//console.log('Invalid Password');
						return done(null, false); // redirect back to login page
					}
					// User and password both match, return user from done method
					// which will be treated like success
					return done(null, user);
				}
			);
		}
	));

	passport.use('signup', new LocalStrategy({
			passReqToCallback : true // allows us to pass back the entire request to the callback
		},
		function(req, username, password, done) {

			// find a user in mongo with provided username
			User.findOne({ 'username' :  username }, function(err, user) {
				// In case of any error, return using the done method
				if (err){
					//console.log('Error in SignUp: '+err);
					return done(err);
				}
				// already exists
				if (user) {
					//console.log('User already exists with username: '+username);
					return done(null, false);
				} else {
					// if there is no user, create the user
					var newUser = new User();

					// set the user's local credentials
					newUser.username = username;
					newUser.password = createHash(password);
                    var usrDtl = req.body;
                    newUser.emailid = usrDtl.email;
                    
                    var settings = {
                        network: 'testnet',
                        privateSeed: '93b76c7d78cbf2df06366da4522f26150dac45019543ca1bf21f3abb07f21541'
                    };
                    
                    //var newSettings;
                    var colu = new Colu(settings);
                    colu.on('connect', function () {
                        var address = colu.hdwallet.getAddress();
                        newUser.addresses.publicAddress = address;
                        newUser.addresses.addressLabel ='main';
                        newUser.addresses.addressType ='testnet';
                        newUser.save(function(err) {
						      if (err){
							     return done(err);
                               }
				               return done(null, newUser);
					    });
                                                
                    });
                    colu.init();
                    
				};
			});
		}));
    
	passport.use('adminsignup', new LocalStrategy({
			passReqToCallback : true // allows us to pass back the entire request to the callback
		},
		function(req, username, password, done) {

            console.log("admin sign up" + username + password );
			// find a user in mongo with provided username
			Admin.findOne({ 'username' :  username }, function(err, admin) {
				// In case of any error, return using the done method
				if (err){
					console.log('Error in SignUp: ' + err);
					return done(err);
				}
				// already exists
				if (admin) {
					console.log('User already exists with username: ' + username);
					return done(null, false);
				} else {
					// if there is no user, create the user
                    console.log("admin here");
					var newUser = new Admin();

					// set the user's local credentials
					newUser.username = 'Admin';
					newUser.password = createHash(password);
                    var usrDtl = req.body;
                    newUser.emailid = usrDtl.email;
                    
                    var settings = {
                        network: 'testnet',
                        privateSeed: '93b76c7d78cbf2df06366da4522f26150dac45019543ca1bf21f3abb07f21541'
                    };
                    
                    //var newSettings;
                    var colu = new Colu(settings);
                    colu.on('connect', function () {
                        var address = colu.hdwallet.getAddress();
                        newUser.addresses.publicAddress = address;
                        newUser.addresses.addressLabel ='main';
                        newUser.addresses.addressType ='testnet';
                        newUser.save(function(err) {
						      if (err){
							     return done(err);
                               }
				               return done(null, newUser);
					    });
                                                
                    });
                    colu.init();
                    
				};
			});
		}));
    
    
	var isValidPassword = function(user, password){
		return bCrypt.compareSync(password, user.password);
	};
	// Generates hash using bCrypt
	var createHash = function(password){
		return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
	};

};
