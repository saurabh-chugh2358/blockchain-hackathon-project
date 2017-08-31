var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//To store the users login credentials
var userSchema = new mongoose.Schema({
	username: String,
    emailid: String,
	password: String, //hash created from password
    userIdentifier: String, //this is the id with which the firm can identify the user
	created_at: {type: Date, default: Date.now},
    addresses:{
        publicAddress: String,
	    privateKeyEncrypted: String, //encrypted private key WIF format
        addressLabel:String, //main for the main address
        addressType:String, //testnet
    }
})

//To store the redemption request data
var redeemSchema = new mongoose.Schema({
	username: String,
    userIdentifier: String,
    publicAddress: String,
	transactionId: String, //hash created from password
    redeemPoints: String, //this is the id with which the firm can identify the user
	created_at: {type: Date, default: Date.now},
    redeemFor: String
})

//Bitua Admin Schema
var adminSchema = new mongoose.Schema({
    username: String,
    emailid: String,
	password: String, //hash created from password
    created_at: {type: Date, default: Date.now},
    addresses:{
        publicAddress: String,
	    privateKeyEncrypted: String, //encrypted private key WIF format
        addressLabel:String, //main for the main address
        addressType:String, //testnet
    },
    assets:[{
        assetId:String
    }]


})

mongoose.model('User', userSchema);
mongoose.model('Redemption', redeemSchema);
mongoose.model('Admin', adminSchema);
