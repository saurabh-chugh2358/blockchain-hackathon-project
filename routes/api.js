var request = require('request');
var express = require('express');
var router = express.Router();
var mongoose = require( 'mongoose' );
var User = mongoose.model('User');
var Admin = mongoose.model('Admin');
var Colu = require('colu');
var Redemption = mongoose.model('Redemption');
var bCrypt = require('bcrypt-nodejs');
var Bip38 = require('bip38');

var newSettings = {
    network: 'testnet',
    privateSeed: '93b76c7d78cbf2df06366da4522f26150dac45019543ca1bf21f3abb07f21541'
};

//function to traverse the nodes of the response objects returned by the colored coin api
function getAddressBalance(o) {
    var addressBalance={};
    addressBalance["bitcoin"]=0;
    addressBalance["reward"]=0;
    
    for(i=0;i<o.length;i++){
        if(o[i].assets.length==0){
            addressBalance["bitcoin"] += o[i].value;
        }
        else{
            addressBalance["reward"] += o[i].value;
        }
    }
    return addressBalance;
}

//
function process(key,value) {
    log(key + " : "+value);
}

//Used for routes that must be authenticated.
function isAuthenticated (req, res, next) {
	// if user is authenticated in the session, call the next() to call the next request handler 
	// Passport adds this method to request object. A middleware is allowed to add properties to
	// request and response objects

    if (req.isAuthenticated()){
		return next();
	}

	// if the user is not authenticated then redirect him to the login page
	return res.redirect('#/login');
};

//Register the authentication middleware
router.use('/user', isAuthenticated);

router.route('/user/:id')
	//gets specified post
	.get(function(req, res){
        //only send the details of the same user id.
        //if(req.username !==req.params.id)
        //    res.send({"error":"cannot fetch other users details"});
    
        User.findOne({ 'username' : req.params.id }, function(err, user) {
            // In case of any error, return using the done method
            //console.log(JSON.stringify(user));
            if(err)
				res.send(err);
            
			res.json(user);
		});
	}) 


router.route('/admin')
	//gets specified post
	.get(function(req, res){
        //only send the details of the same user id.
        //if(req.username !==req.params.id)
        //    res.send({"error":"cannot fetch other users details"});
    
        console.log("i am here");
        Admin.findOne({ 'username' : 'Admin' }, function(err,admin) {
            
            console.log("and here");
            // In case of any error, return using the done method
            //console.log(JSON.stringify(user));
            if(err)
				res.send(err);
            
			res.json(admin);
		});
	}) 


//Register the authentication middleware
router.use('/addressbalance', isAuthenticated);

router.route('/addressbalance/:id')
	//gets specified post
	.get(function(req, res){
    
    
    console.log("reached inside getaddressinfo" + req.params.id);
    var colu = new Colu(newSettings);
    colu.on('connect', function () {
        colu.coloredCoins.getAddressInfo(req.params.id, function (err, body) {
            console.log("reached inside getaddressinfo");

            if (err) {
                res.send(error);
                console.log(error);
            }
            if (body && typeof body === 'string') {
                body = JSON.parse(body)
            }
            else {
                body = body || {}
            };
            console.log(body);
            console.log(getAddressBalance(body.utxos));
            res.json(getAddressBalance(body.utxos));
        });
    });
    colu.init();
        
}) 


router.route('/adminbalance/:id')
	//gets specified post
	.get(function(req, res){
    
    
    //console.log("reached inside getaddressinfo" + req.params.id);
    var colu = new Colu(newSettings);
    colu.on('connect', function () {
        colu.coloredCoins.getAddressInfo(req.params.id, function (err, body) {
            console.log("reached inside getaddressinfo");

            if (err) {
                res.send(error);
                console.log(error);
            }
            if (body && typeof body === 'string') {
                body = JSON.parse(body)
            }
            else {
                body = body || {}
            };
            console.log(body);
            console.log(getAddressBalance(body.utxos));
            res.json(getAddressBalance(body.utxos));
        });
    });
    colu.init();
        
})


router.route('/issueColorAsset')
	//post the unsigned transaction
	.post(function(req, res){

    var asset = {
            'issueAddress':req.body.fromAddress,
            'amount': parseInt(req.body.amount),
            'divisibility': 0,
            'fee': parseInt(req.body.fees),
            'reissueable':false,
            'transfer': [{
               'address':req.body.toAddress,
    	       'amount': parseInt(req.body.amount)
            }],
            'metadata': {
                'assetName': 'Bitua Reward Point',
                'issuer': 'Bitua',
                'description': 'Bitua Reward Point',
                'userData': {
                    'meta' : [
                        {key: 'Item ID', value: 1, type: 'Number'},
                        {key: 'Item Name', value: 'Bitua Reward Point Programme', type: 'String'},
                        {key: 'Company', value: 'The Bitua Company', type: 'String'},
                        {key: 'Address', value: 'Gurgaon, Haryana', type: 'String'}
                    ]
                }
            }
        };
    
    console.log("reached here ");
    var colu = new Colu(newSettings);
    colu.on('connect', function () {
        colu.issueAsset(asset, function (err, body) {

                          
                if (err) {
                    res.send(error);
                    console.log(error);
                }
                if (body && typeof body === 'string') {
                    body = JSON.parse(body)
                }
                else {
                    body = body || {}
                };
            
                //Admin.update(
                //    { 'username' : 'Admin'},
                //    { $set : { 'assets' : [{body.assetId}]} },
                //    function( err, result ) {
                //        if ( err ) 
                //          res.send({state: 'failure', message: 'Database Error Occured'});
                //        res.send({state: 'success', message: 'Updated Successfully'});  
                //         
                //    });
                res.send({state: 'success', message: 'Updated Successfully'});  
                });
            
            });
     
    colu.init();
    
});

router.use('/getTransactions', isAuthenticated);

    router.route('/getTransactions/:id')
    //gets specified post
    .get(function(req, res){
        console.log('in side');
        var jsonObject = [{transactionId:9873453, transactionAmount:23, transactionTimeStamp:Date(),noOfConfirmations:32},
         {transactionId:8374, transactionAmount:24, transactionTimeStamp:Date(),noOfConfirmations:42},
          {transactionId:35654, transactionAmount:56, transactionTimeStamp:Date(),noOfConfirmations:65},
           {transactionId:35654, transactionAmount:56, transactionTimeStamp:Date(),noOfConfirmations:65}];

            User.findOne({ 'username' :  req.params.id }, function(err, user) {
            // In case of any error, return using the done method
            if (err){
                res.send({state: 'failure',message: "Invalid Scenario"});
            }else{
                res.send({state: 'success', body:jsonObject});
            };
        });
    })     
    
//Register the authentication middleware
//router.use('/changePassword', isAuthenticated);

router.route('/changePassword')
	//gets specified post
	.post(function(req, res){
    
   
    var updatePassword = req.body;
    var ePass = bCrypt.hashSync(updatePassword.newPassword, bCrypt.genSaltSync(10), null);
    User.findOne({ 'username' : updatePassword.username }, function(err, user){
       console.log(bCrypt.compareSync(updatePassword.currentPassword, user.password));
        if(err)
			res.send({state: 'failure', message: 'Update Failed'});
         //step1: validates the currentPassword supplied        
        if(!bCrypt.compareSync(updatePassword.currentPassword, user.password)){
            res.send({state: 'failure', message: 'Invalid Password'});
        }else{
        //step2: decrypt the private key using current password
        //    var encryptedKey = ' ';
        //    var bip38 = new Bip38();
        //    bip38.versions ={
        //        private: 0xEF, 
        //        public: 0x6F
        //    }
        //    decryptedKey = bip38.decrypt(user.addresses.privateKeyEncrypted, updatePassword.currentPassword);
        //    console.log(decryptedKey);
            
        //step3: Encrypt the private key decrypted with new password
        //    encryptedKey = bip38.encrypt(decryptedKey, updatePassword.newPassword, user.addresses.publicAddress);
            
        //step4: Update database with new password and key
            User.update(
                { 'username' : updatePassword.username },
                { $set : { 'password' :  ePass} },
                    function( err, result ) {
                        if ( err ) 
                          res.send({state: 'failure', message: 'Database Error Occured'});
                    res.send({state: 'success', message: 'Updated Successfully'});  

               });
        }
            
    });
});

router.use('/redeemRequest', isAuthenticated);

router.route('/redeemRequest')
	.post(function(req, res){
    
    var redeem = req.body;
    console.log(redeem.pubKey);
    //step1: get the balance for redeem.pubKey
    var balance = redeem.balance;
    //step2: Check reward point validity
    if(balance && (!balance >= redeem.redeemPoint)){
        res.send({state: 'failure', message: 'Invalid Redeem Points'});
    }else{
    //step3: do transfer to fidelity
            console.log("reached redeem ");
            var colu = new Colu(newSettings);
            colu.on('connect', function () {
                var toAddress = req.body.toAddress;
                var args = {
                from: [req.body.fromAddress],
                to: [{address: toAddress,
                    assetId: req.body.assetId,
                    amount: parseInt(req.body.amount)}],
                    'metadata': {
                        'assetName': 'Bitua Reward Point',
                        'issuer': 'Bitua',
                        'description': 'Bitua Reward Point',
                        'userData': {
                            'meta' : [
                                {key: 'Item ID', value: 1, type: 'Number'},
                                {key: 'Item Name', value: 'Bitua Reward Point Programme', type: 'String'},
                                {key: 'Company', value: 'The Bitua Company', type: 'String'},
                                {key: 'Address', value: 'Gurgaon, Haryana', type: 'String'}
                            ]
                        }
                    }
                };
        
                colu.sendAsset(args, function (err, body) {

                    
                    console.log("Body: ", body);
                    if (err) {
                        console.log(error);
                        res.send(error);
                    }
                    if (body && typeof body === 'string') {
                        body = JSON.parse(body)
                    }
                    else {
                        body = body || {}
                    };
                    console.log(body);
                    
                    var redemption = new Redemption();
            
                    redemption.username = redeem.username;
                    redemption.userIdentifier = redeem.user_id;
                    redemption.publicAddress = redeem.pubKey;
	                redemption.transactionId = body.txid;
                    redemption.redeemPoints = redeem.redeemPoint;
                    redemption.redeemFor = redeem.redeemFor;
                    
                    redemption.save(function(err) {
                        if (err){
                            res.send({state: 'failure', message: 'Database Error Occured'});
                        }else{
                            res.send({state: 'success', message: 'Redemption request has been sent successfully'}); 
                        }
                    });

                });
    
            });
            colu.init();
        }
  });
  

router.use('/updateProfile', isAuthenticated);

router.route('/updateProfile')
   //gets specified post
   .post(function(req, res){
       var user = req.body;
    
       User.update(
           { 'username' : user.username },
           { $set : { 'emailid' :  user.emailid, 'userIdentifier' : user.userId} },
               function( err, result ) {
                   if ( err )
                       res.send({state: 'failure', message: 'Database Error Occured'});
               res.send({state: 'success', message: 'Profile Updated Successfully'});  

              });
  });


//Register the authentication middleware
router.use('/transfer', isAuthenticated);

router.route('/transfer')
	//post the unsigned transaction
	.post(function(req, res){

    console.log("reached transfer ");
    var colu = new Colu(newSettings);
    colu.on('connect', function () {
            var toAddress = req.body.toAddress;
            var args = {
            from: [req.body.fromAddress],
            to: [{address:toAddress,
                assetId: req.body.assetId,
                amount: parseInt(req.body.amount)}],
            'metadata': {
                'assetName': 'Bitua Reward Point',
                'issuer': 'Bitua',
                'description': 'Bitua Reward Point',
                'userData': {
                    'meta' : [
                        {key: 'Item ID', value: 1, type: 'Number'},
                        {key: 'Item Name', value: 'Bitua Reward Point Programme', type: 'String'},
                        {key: 'Company', value: 'The Bitua Company', type: 'String'},
                        {key: 'Address', value: 'Gurgaon, Haryana', type: 'String'}
                    ]
                }
            }
        };
        
        colu.sendAsset(args, function (err, body) {

            if (err){
                res.send({state: 'failure', message: 'Error in sending Points :' + err});
            }
            console.log("Body: ", body);
            res.send({state: 'success', message: 'Profile Updated Successfully'});  

        });
    
    });
    colu.init();
    
});

          
module.exports = router;