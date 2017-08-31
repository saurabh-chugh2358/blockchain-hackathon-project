var app = angular.module('bituaApp', ['ngRoute', 'ngResource']).run(function($rootScope,$http) {
    $rootScope.authenticated = false;
	$rootScope.current_user = '';
    $rootScope.pubKey = ''
    $rootScope.customer_id = '';
	
	$rootScope.signout = function(){
    	$http.get('auth/signout');
    	$rootScope.authenticated = false;
    	$rootScope.current_user = '';
	};
    
    
    $rootScope.generateNewAddress = function(passphrase){
        var addDtl ={};
    	var newKey = Bitcoin.ECKey.makeRandom();
        addDtl.publicAddress = newKey.pub.getAddress(Bitcoin.networks.testnet).toString();
        //var bip38 = new Bip38();
        //bip38.versions ={
        //    private: 0xEF, 
        //    public: 0x6F
        //}
        //addDtl.privateKeyEncrypted= bip38.encrypt(newKey.toWIF(),passphrase,addDtl.publicAddress);
        addDtl.privateKeyEncrypted= newKey.toWIF();
        addDtl.addressLabel ='main';
        addDtl.addressType='testnet';
        
        return addDtl;
    };
    
    $rootScope.decryptPrivateKey = function(encryptedKey,passphrase){
        var bip38 = new Bip38();
        bip38.versions ={
            private: 0xEF, 
            public: 0x6F
        }
        var privateKeyWif = bip38.decrypt(encryptedKey, passphrase);
        
        return privateKeyWif;
    };
    
    
});

app.config(function($routeProvider){
	$routeProvider
		//the welcome page
		.when('/', {
			templateUrl: 'welcome.html'
			//controller: 'welcomeController'
		})
    
        //the about page
		.when('/about', {
			templateUrl: 'about.html'
			//controller: 'aboutController'
		})
    
        //the contact page
		.when('/contact', {
			templateUrl: 'contact.html'
			//controller: 'contactController'
		})
    
        //the user agreement page
		.when('/useragreement', {
			templateUrl: 'userag.html'
			//controller: 'useragController'
		})
    
        //the privacy policy page
		.when('/privacypolicy', {
			templateUrl: 'privacy.html'
			//controller: 'privacyController'
		})
    
        //the cookie policy page
		.when('/cookiepolicy', {
			templateUrl: 'cookie.html'
			//controller: 'cookieController'
		})
    
        //the login display
		.when('/login', {
			templateUrl: 'login.html',
			controller: 'loginController'
		})
    
		//the signup display
		.when('/register', {
			templateUrl: 'register.html',
			controller: 'registerController'
		})
    
        //the home page once logged in the wallet
        .when('/home', {
			templateUrl: 'home.html',
			controller: 'homeController'
		})
    
        //the home page once logged in the wallet
        .when('/adminhome', {
			templateUrl: 'adminhome.html',
			controller: 'adminhomeController'
		})
    
        //the signup display
		.when('/adminreg', {
			templateUrl: 'adminreg.html',
			controller: 'registerController'
		})
    
        //the home page once logged in the wallet
        .when('/adminissue', {
			templateUrl: 'adminissue.html',
			controller: 'adminissueController'
		})
    
         //the signup display
		.when('/adminsettings', {
			templateUrl: 'adminsettings.html',
			controller: 'registerController'
		})
    
        //the home page once logged in the wallet
        .when('/admintransfer', {
			templateUrl: 'admintransfer.html',
			controller: 'loginController'
		})
    
        //the signup display
		.when('/adminreg', {
			templateUrl: 'adminreg.html',
			controller: 'registerController'
		})
    
        //the home page once logged in the wallet
        .when('/adminlogin', {
			templateUrl: 'adminlogin.html',
			controller: 'loginController'
		})
    
        .when('/redeem', {
			templateUrl: 'redeem.html',
			controller: 'redeemController'
		})
    
        .when('/transactions', {
			templateUrl: 'transactions.html',
			controller: 'transactionsController'
		})
    
        .when('/settings', {
			templateUrl: 'settings.html',
			controller: 'settingsController'
		})
        
        .when('/transfer', {
			templateUrl: 'transfer.html',
			controller: 'transferController'
		});
	

		
});


app.controller('registerController', function($scope, $http, $rootScope, $location){
    $scope.user = {username: '', 
                   email: '', 
                   password: '',
                   addressDetails:{
                       publicAddress: '',
                       privateKeyEncrypted:'',
                       addressLabel:'',
                       addressType:''
                   }
                  };
    $scope.error_message = '';
    $scope.regInProgress = false;
    $rootScope.formError=false;
        
  $scope.register = function(){
    $rootScope.formError=false;
    $scope.regInProgress = false;
    if($scope.user.password !==$scope.confirmPassword){
        $scope.error_message = "Password not same as confirm password."
        $rootScope.formError= true;
    }
    else{
        //Generate the bitcoin address for the user
        $scope.regInProgress = true;       
        $scope.user.addressDetails = $rootScope.generateNewAddress($scope.user.password);
        console.log($scope.user);
        $http.post('/auth/signup', $scope.user).success(function(data){
            if(data.state == 'success'){
                $location.path('/login');
           }
            else{
                $scope.error_message = data.message;
                $rootScope.formError=true;
                $scope.regInProgress = false;
           }
        });
    }
  };
    
  $scope.adminregister = function(){
    $rootScope.formError=false;
    $scope.regInProgress = false;
    if($scope.user.password !==$scope.confirmPassword){
        $scope.error_message = "Password not same as confirm password."
        $rootScope.formError= true;
    }
    else{
        //Generate the bitcoin address for the user
        $scope.regInProgress = true;       
        $scope.user.addressDetails = $rootScope.generateNewAddress($scope.user.password);
        console.log($scope.user);
        $http.post('/auth/adminsignup', $scope.user).success(function(data){
            if(data.state == 'success'){
                $location.path('/adminlogin');
           }
            else{
                $scope.error_message = data.message;
                $rootScope.formError=true;
                $scope.regInProgress = false;
           }
        });
    }
  };
    
});

app.controller('loginController', function($scope, $http, $rootScope, $location){
    $scope.user = {username: '',email: '', password: ''};
    $scope.error_message = '';
    $rootScope.formError=false;
    $scope.loginProgress = false;
    
  $scope.login = function(){
    $scope.loginProgress = true;
    $http.post('/auth/login', $scope.user).success(function(data){
      if(data.state == 'success'){
        $rootScope.authenticated = true;
        $rootScope.current_user = data.user.username;
        $rootScope.customer_id = data.user.userIdentifier;
        $location.path('/home');
        $rootScope.formError=false;
      }
      else{
        $scope.error_message = data.message;
        $rootScope.formError=true;
        $scope.loginProgress = false;
      }
    });
  };
    
    
    $scope.adminlogin = function(){
    $scope.loginProgress = true;
    $http.post('/auth/adminlogin', $scope.user).success(function(data){
      if(data.state == 'success'){
        $rootScope.authenticated = true;
        //console.log(JSON.stringify(data));
        $rootScope.current_user = 'Admin';
        //$rootScope.customer_id = data.user.userIdentifier;
        $location.path('/adminhome');
        $rootScope.formError=false;
      }
      else{
        $scope.error_message = data.message;
        $rootScope.formError=true;
        $scope.loginProgress = false;
      }
    });
  };
    
});

app.controller('homeController', function($scope, $http, $rootScope, $location){
    if(!$rootScope.authenticated){
        $location.path('/');
    };
    
    $scope.initHome = function(){
        $http.get('/api/user/'+ $rootScope.current_user).then(function successCallback(response){
            $rootScope.userDetails = response.data;
            $rootScope.pubKey = $rootScope.userDetails.addresses.publicAddress;
            qr.canvas({ canvas: document.getElementById('qr-code'), value: $rootScope.pubKey }); 
    
            //get the balance
            $http.get('/api/addressbalance/'+ $rootScope.pubKey).then(function successCallback(response){
                    
                    $rootScope.bitcoinBalance =response.data.bitcoin/100000000; 
                    $rootScope.rewardPointBalance =response.data.reward;
            },function errorCallback(response) {
                console.log("error in calling get address balance api: " + response);
            });
            
   
        },function errorCallback(response) {
            console.log("error in calling get user api: " + response);
        });
    };
});


app.controller('redeemController', function($scope, $http, $rootScope, $location){
    $scope.redeem = {redeemPoint:'', redeemFor:'', username:'', pubKey:''};
    $scope.items = [{name: 'Service Fee', value: 1 },{ name: 'Investor Fee', value: 2 }];
    $rootScope.formError = false;
    
    $scope.redeemSubmit = function(){
        
        if( $scope.redeem.redeemPoint <= 0 ){
            $scope.error_message = "Redeem points should be more than 0";
            $rootScope.formError = true;
        }else if($scope.redeem.redeemFor <= 0){
            $scope.error_message = "Please select Redemption request for";
            $rootScope.formError = true;
        }else{
            $scope.redeem.username = $rootScope.current_user; 
            $scope.redeem.pubKey = $rootScope.pubKey;
            $scope.regInProgress = true; 
            $http.post('/api/redeemRequest', $scope.redeem).success(function(data){
                if(data.state = 'success'){
                    $scope.successTextAlert = data.message;
                    $scope.showSuccessAlert = true;
                    $scope.regInProgress = false;
                    $scope.redeem.redeemPoint ='';
                    $scope.redeemForm.$setPristine();
                }else{
                    $scope.error_message = data.message;
                    $rootScope.formError=true;
                    $scope.regInProgress = false;
           }
            });
        }
    }
});

app.controller('transferController', function($scope, $http, $rootScope, $location){

    $scope.issue = function(){
     
     var TrnDtl ={};
     TrnDtl.fromAddress=$rootScope.pubKey;
     TrnDtl.toAddress = $scope.issueDetail.address;
     TrnDtl.amount = $scope.issueDetail.amount;
     $http.post('/api/issueColorAsset', TrnDtl).success(function(data){
            if(data.state == 'success'){
                console.log(data);
           }
            else{
                $scope.error_message = data.message;
                console.log($scope.error_message);
                
           }
        });
    };
    
});

app.controller('transactionsController', function($scope, $http, $rootScope, $location){
    if(!$rootScope.authenticated){
        $location.path('/');
    };
    
    //$scope.getTransactions = function(){
        $scope.regInProgress = true;
        console.log("I'm in controller");
        $http.get('/api/getTransactions/'+ $rootScope.current_user).then(function successCallback(response){
            console.log(response.data.body);
            $scope.transactions = response.data.body;
            $scope.regInProgress = false;

        },function errorCallback(response) {
            console.log("error in calling get user api: " + response);
            $scope.regInProgress = false;
            
        });
        
    //};
});

app.controller('settingsController', function($scope, $http, $rootScope, $location){
    $scope.updatePassword = {username:'', newPassword:'' , currentPassword: ''};
    $scope.user = {username:'', userId:'', emailid:''};
    $scope.firstpaneisopen = false;
    $scope.secondpaneisopen = false;
    
    $scope.changePassword = function(){
        $rootScope.formError= false;
        if($scope.updatePassword.newPassword !== $scope.confirmPassword){
            $scope.error_message = "Password not same as confirm password."
            $rootScope.formError= true;
        }
        else{
            $scope.updatePassword.username = $rootScope.current_user;
      
            $scope.regInProgress = true;       
            $http.post('/api/changePassword', $scope.updatePassword).success(function(data){
            if(data.state == 'success'){
                $scope.successTextAlert = data.message;
                $scope.showSuccessAlert = true;
                $scope.regInProgress = false;
                $scope.updatePassword ='';
                $scope.confirmPassword ='';
                $scope.passwordForm.$setPristine();
            }else{
                $scope.error_message = data.message;
                $rootScope.formError=true;
                $scope.regInProgress = false;
           }
        });        
        }
    };
    
    $scope.updateProfile = function(){
        $rootScope.formError= false;
        if($scope.user.userId === $rootScope.customer_id ){
            $scope.error_message = "Use different Id"
            $rootScope.formError= true;
        }
        else{
            $scope.user.username = $rootScope.current_user;
      
            $scope.profileRegInProgress = true;       
            $http.post('/api/updateProfile', $scope.user).success(function(data){
            if(data.state == 'success'){
                $scope.profileSuccessTextAlert = data.message;
                $scope.showProfileSuccessAlert = true;
                $scope.profileRegInProgress = false;
                $scope.user.userId ='';
                $scope.user.emailid ='';
                $scope.passwordForm.$setPristine();
            }else{
                $scope.profile_error_message = data.message;
                $rootScope.formError=true;
                $scope.profileRegInProgress = false;
           }
        });        
        }
    };
    
});


app.controller('adminhomeController', function($scope, $http, $rootScope, $location){
    if(!$rootScope.authenticated){
        $location.path('/');
    };
    
    $scope.initadminHome = function(){
        $http.get('/api/admin').then(function successCallback(response){
            $rootScope.userDetails = response.data;
            $rootScope.pubKey = $rootScope.userDetails.addresses.publicAddress;
            qr.canvas({ canvas: document.getElementById('qr-code'), value: $rootScope.pubKey }); 
    
            //get the balance
            $http.get('/api/adminbalance/'+ $rootScope.pubKey).then(function successCallback(response){
                    $rootScope.bitcoinBalance = response.data.bitcoin/100000000;
                    $rootScope.rewardPointBalance = response.data.reward;
                    
            },function errorCallback(response) {
                console.log("error in calling get address balance api: " + response);
            });
            
   
        },function errorCallback(response) {
            console.log("error in calling get user api: " + response);
        });
    };
});

app.controller('adminissueController', function($scope, $http, $rootScope, $location){
    if(!$rootScope.authenticated){
        $location.path('/');
    };
    
    $scope.adminissue = function(){
           var issueAssetData = {};
           issueAssetData.fromAddress = $rootScope.pubKey;
           issueAssetData.toAddress = $rootScope.pubKey;
           issueAssetData.amount = $scope.issueDetail.amount;
           issueAssetData.fees = $scope.issueDetail.fees;
           
           $http.post('/api/issueColorAsset', issueAssetData).success(function(data){
                if(data.state = 'success'){
                    $scope.successTextAlert = data.message;
                    $scope.showSuccessAlert = true;
                    //$scope.regInProgress = false;
                    //$scope.redeem.redeemPoint ='';
                    //$scope.redeemForm.$setPristine();
                }else{
                    $scope.error_message = data.message;
                    $rootScope.formError=true;
                    $scope.regInProgress = false;
           }
        });
    };
});

