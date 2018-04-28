var express = require('express');
var router = express.Router();
var speakeasy = require('speakeasy');
var QRCode = require('qrcode');
const Web3 = require('web3');
var session = require('express-session');

var url = {
	'kovan':'https://kovan.infura.io/YIzss5D72r9iTVYvjB2G',
	'main':'https://mainnet.infura.io/YIzss5D72r9iTVYvjB2G',
	'rinkeby':'https://rinkeby.infura.io/YIzss5D72r9iTVYvjB2G'
};
net = 'kovan';

var web3 = new Web3(new Web3.providers.HttpProvider(url[net]));
var genevieveAuth = require('../config/genevieveAuth')();
var contract = new web3.eth.Contract(genevieveAuth.abi, genevieveAuth.address);

/* GET home page. */
router.get('/', function(req, res, next) {
	// console.log('req.session',req.session)
	
	if (typeof req.session.user != 'undefined' && req.session.user.verified) {
		res.render('index', { title: 'Express',verified:req.session.user.verified });
	}else{
		res.render('login', { title: 'Express',verified:false });
	}
  	
});
router.get('/isAuthenticated',function(req,res,next){
	res.send(req.session);
});
/* GET help page. */
router.get('/help', function(req, res, next) {
  res.render('help', { title: 'Express' });
});
/* GET tokens page. */
router.get('/tokens', function(req, res, next) {
  res.render('tokens', { title: 'Express' });
});
router.get('/ExchAddress', function(req, res, next) {
	var exchange = require('../config/exchange')();
  	res.send(exchange);
});
router.get('/2fa', function(req, res, next) {
	var Twofa = require('../config/genevieveAuth')();
  	res.send(Twofa);
});
router.get('/tokensInfo', function(req, res, next) {
	var tokens = require('../config/tokens')();
  	res.send(tokens);
});
router.get('/qr/:currentAddress', function(req, res, next) {

	var currentAddress = req.params['currentAddress'];
	var batch = new web3.BatchRequest();
	console.log('currentAddress',currentAddress)
	var secret = speakeasy.generateSecret({length: 20});
	batch.add(contract.methods.getSecret(currentAddress).call.request({from: genevieveAuth.admin}, function(e,r){

		
		console.log('r:',r,r.length)
		console.log('r:',typeof r)
		if (r == '0x0000000000000000000000000000000000000000000000000000000000000000') {
			QRCode.toDataURL(secret.otpauth_url, function(err, image_data) {
			  res.send({
			  	image:image_data,
			  	registered:false,
			  	secret:secret.base32
			  });
			});
		}else{
			r = web3.utils.toAscii(r).trim();
		  	res.send({
		  		registered:true
		  	});
		}
		
	}));

	batch.execute();



  	
});
router.get('/verify/:token/:currentAddress',function(req,res,next){
	// This is provided the by the user via form POST
	var batch = new web3.BatchRequest();
	var userToken = req.params['token'];
	var currentAddress = req.params['currentAddress'];

	batch.add(contract.methods.getSecret(currentAddress).call.request({from: genevieveAuth.admin}, function(e,r){
		r = web3.utils.toAscii(r).trim();
		// Verify that the user token matches what it should at this moment
		var verified = speakeasy.totp.verify({
		  secret: r,
		  encoding: 'base32',
		  token: userToken
		});
		req.session.user = {
			currentAddress:currentAddress,
			verified:verified
		};
		res.send({
	  		verified:verified
	  	});
	}));

	batch.execute();

})
module.exports = router;
