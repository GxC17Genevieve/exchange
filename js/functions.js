var networkArray = {
	1 :'Mainet',
	2 :'Ropsten',
	3 :'',
	4 :'Rinkeby'
}
function getExchangeAddress(){
	return $.ajax({
		url:'./ExchAddress.json',
		async:false
	}).responseJSON
}
function getTokenAddress(){
	return $.ajax({
		url:'./GXVCTokenAdd.json',
		async:false
	}).responseJSON
}

function getBalance(){
	window.GenevExch.balanceOf.call(0,
               window.coinbase,
               {gas:500000, from:web3.eth.accounts[0]},function(err,result){
    if(!err) {
        $("#eth_balance").text(web3.fromWei(result)+" ether");
        $("#eth_bal_buy").text(web3.fromWei(result)+" ether");
      }
    else
        showModal("ERROR:",err);
    });
	window.GenevExch.balanceOf.call(window.token.tokenAddress,
               window.coinbase,
               {gas:500000, from:web3.eth.accounts[0]},function(err,result){

    if(!err) {
            $("#gxvc_balance").text((web3.fromWei(result,'nano') / 10)+" gxvc");
            $("#gxvc_bal_sell").text((web3.fromWei(result,'nano') / 10)+" gxvc");
      }
    else
        showModal("ERROR:",err);
    });
}

///////////////////////////////////////////////////////////////////////////////
function init(){
	window.orders = [];
	window.token = getTokenAddress();
	window.exchange = getExchangeAddress();
	/*variables to take the control*/

	window.GXVCtoken = web3.eth.contract(token.tokenAbi).at(token.tokenAddress);
	window.GenevExch = web3.eth.contract(exchange.exchangeAbi).at(exchange.exchangeAddress);
	$("#buy_price,#buy_amount,#buy_fee,#buy_total,#sell_price, #sell_amount,#sell_fee,#sell_total,#deposit_eth,#deposit_gxvc,#amount_gxvc,#total_gxvc").val(0)
	web3.eth.getAccounts(function(err, accounts){
	    if (err != null) {
	    	console.error("An error occurred: "+err);
	    }
	    else if (accounts.length == 0) {
	    	showModal('Warning',"User is not logged in to MetaMask, Please TURN MetaMask ON!")
	    }
	    else {
	    	web3.eth.defaultAccount = accounts[0];
	    	if (web3.version.network != 1) {
	    		showModal("New Message","User is logged in to MetaMask with <span class='bg-warning'>"+networkArray[web3.version.network]+"</span> network");
	    	}
	    }
	});
	window.coinbase = web3.eth.coinbase;
	getBalance();
	initEvents();
}
function initEvents(){
	var orderEvent = window.GenevExch.Order({},{fromBlock: 0, toBlock: 'latest'});
    orderEvent.watch(function(error, result){
        // console.log("orderEvent on watch"); 
        window.orders.push(result.args)
    });
}
function drawOrders(){
	var rowToSell = '';
	var rowToBuy = '';

	console.log('window.orders.length',window.orders.length)
	for (var i = 0; i < window.orders.length; i++) {
		console.log('window.orders[i].amountGive.toNumber() > 0',window.orders[i].amountGive.toNumber() > 0)
		if (window.orders[i].amountGive.toNumber() > 0) {
			rowToSell+="<tr><td style='font-size:10px'>"+window.orders[i].user+"</td><td>"+window.orders[i].amountGive.toNumber()+" eth</td><td>"+window.orders[i].expires.toNumber()+"</td></tr>";
		}else{
			rowToBuy+="<tr><td style='font-size:10px'>"+window.orders[i].user+"</td><td>"+window.orders[i].amountGet.toNumber()+" gxvc</td><td>"+window.orders[i].expires.toNumber()+"</td></tr>";
		}
	}
	$(".order_sell").html(rowToSell)
	$(".order_buy").html(rowToBuy)
}
function showModal(title,message){
	$("#myModalLabel").text(title);
	$("#myModalBody").html("<p>"+message+"</p>");
	$('#myModal').modal("show")
}
