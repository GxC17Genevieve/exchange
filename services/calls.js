module.exports = function(){
	
	const Web3 = require('web3');

	var url = {
		'kovan':'https://kovan.infura.io/YIzss5D72r9iTVYvjB2G',
		'main':'https://mainnet.infura.io/YIzss5D72r9iTVYvjB2G',
		'rinkeby':'https://rinkeby.infura.io/YIzss5D72r9iTVYvjB2G'
	};
	
	net = 'kovan';

	var web3 = new Web3(new Web3.providers.HttpProvider(url[net]));
	var genevieveAuth = require('../config/genevieveAuth')();
	var contract = new web3.eth.Contract(genevieveAuth.abi, genevieveAuth.address);

	var batch = new web3.BatchRequest();

	batch.add(contract.methods.getSecret(currentAddress).call.request({from: genevieveAuth.admin}, function(e,r){

	}));

	return {
		haveTwoFactorEnable:function(_clientAddress){
			batch.add(contract.methods.getSecret(currentAddress).call.request({from: genevieveAuth.admin}, function(e,r){
				if (e) {
					return e;
				}else{
					if (true) {}
				}
			}));
			batch.execute();

		}
	}

}