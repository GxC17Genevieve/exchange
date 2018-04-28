$(document).ready(function(){
	init();
	$("body").on('click','#gear',function(){

		window.exchange2faContract.getSecret(web3.eth.defaultAccount,{from:window.exchange2fa.admin},function(e,r){
			if (e) {
				alert(r);
			}else{
				console.log('r',web3.toAscii(r));
				isAuthenticated();
			}
		});

		// return;

		$('.wrong').addClass('hide')
		$("#key").val('');
		$.ajax({
			url:'/qr/'+web3.eth.defaultAccount,
			success:function(r){
				console.log(r);
				if (r.registered == true) {
					$("#2faModalBody").html("<div class='row'>"+
						"<div class='col-md-12 text-center'>"+
							// "<img src='"+r.image+"'><br>"+
							"<input type='text' class='form-control' id='key' placeholder='Enter Code Here'><br>"+
							"<center><img  width='50' class='loading_auth hide' src='https://media1.tenor.com/images/8ac12962c05648c55ca85771f4a69b2d/tenor.gif?itemid=9212724'></center><br>"+
							"<div class='alert alert-danger hide wrong'>Authentication failed</div>"+
							// "<p><a href=''>if you lost your code, create a new one</a></p>"+
							"<br><input type='button' class='btn btn-success' value='Authenticate' id='btn-authenticate'>"+
							"</div>"+
						"</div>");

				}else{
				$("#2faModalBody").html("<div class='row'>"+
						"<div class='col-md-12 text-center'>"+
							"<img id='qr_image_code' src='"+r.image+"'><br>"+
							"<p id='text_qr'>Download Google Authenticator on your phone and scan this QR code with it. Once your new key is created in your phone, press the Register button below.<br>"+
							"<br><p id='text_check_qr'><labeL><input type='checkbox' id='registered'> I already added the QR code</label></p><br>"+
							"<input type='button' class='btn btn-success hide' value='Register' secret='"+r.secret+"' id='btn-add-2fa'>"+
							"</div>"+
						"</div>");
				}
				$("#2faModal").modal('show');
			}
		})
		
	})
	$("body").on("click",'#registered',function(){
		if($(this).is(":checked")){
			$("#btn-add-2fa").removeClass('hide');
		}else{
			$("#btn-add-2fa").addClass('hide');

		}
	})
	$("body").on('click','#btn-authenticate',function(){
		$(".loading_auth").removeClass('hide');
		$.ajax({
			url:'/verify/'+$("#key").val()+'/'+web3.eth.defaultAccount,
			success:function(r){
				$(".loading_auth").addClass('hide');
				if (r.verified == true) {
					console.log(r);
					location.reload('/');
				}else{
					console.log(r);
					$('.wrong').removeClass('hide')
				}
				
			}
		})
	})
	$('body').on('click','#btn-add-2fa',function(){
		window.exchange2faContract.setSecret($(this).attr('secret'),{from:web3.eth.defaultAccount},function(e,r){
			console.log(e,r);
			if (e) {
				alert(e);
			}else{
				$("#text_qr").html("Your address is being registered in the blockchain. You can close this window now");
				$("#btn-add-2fa,#qr_image_code,#text_check_qr").addClass('hide');
			}
		})
	})
	$("body").on("click",".token_div",function(){
		var pair = $(this).attr('value').split("_");
		$('body').find('.pair_selected').eq(0).removeClass('pair_selected')
		$(this).addClass('pair_selected');
		if (pair.length == 1) {
			for (var i = 0; i < window.tokens.tokens.length; i++) {
				if (window.tokens.tokens[i].symbol == pair[0].toUpperCase()) {
					window.CurrentTokenOne = web3.eth.contract(window.tokens.tokens[i].abi).at(window.tokens.tokens[i].address);
					window.CurrentTokenOne.decimals(function(e,r){
						window.CurrentTokenOne.decimals = r.toNumber();
					})
					window.CurrentTokenTwo = {};
					window.CurrentTokenTwo.address = "0x0000000000000000000000000000000000000000";
					window.CurrentTokenTwo.decimals = 18;
					window.CurrentTokenTwo.symbol = function(cb){
						cb(null,"ETH");
					}
					$(".currentTokenOne").text(window.tokens.tokens[i].symbol);
					$(".currentTokenTwo").text("ETH");
					
					break;
				}
			}
		}
		if (pair.length == 2) {
			console.log('pair 2')
			for (var i = 0; i < window.tokens.tokens.length; i++) {
				if (window.tokens.tokens[i].symbol == pair[0].toUpperCase()) {
					window.CurrentTokenOne = web3.eth.contract(window.tokens.tokens[i].abi).at(window.tokens.tokens[i].address);
					$(".currentTokenOne").text(window.tokens.tokens[i].symbol);
					window.CurrentTokenOne.decimals(function(e,r){
						window.CurrentTokenOne.decimals = r.toNumber();
					})
					console.log('encontro1')
					break;
				}
			}	
			for (var i = 0; i < window.tokens.tokens.length; i++) {
				if (window.tokens.tokens[i].symbol == pair[1].toUpperCase()) {
					console.log(">")
					window.CurrentTokenTwo = web3.eth.contract(window.tokens.tokens[i].abi).at(window.tokens.tokens[i].address);
					$(".currentTokenTwo").text(window.tokens.tokens[i].symbol);
					window.CurrentTokenTwo.decimals(function(e,r){
						window.CurrentTokenTwo.decimals = r.toNumber();
					})
					console.log('encontro2')
					break;
				}
			}
		}
		$("#waiting_modal").modal('show');

		setTimeout(function(){
			getBalance();
			$("#waiting_modal").modal('toggle');
			reloadPairOrders();
			createChart();
			crearInputs();
		},2500)
	})

	$("body").on("click","#look_book_orders",function(){
		drawOrders()
	})
	/*to calculate buy price*/
	$("body").on("keyup","#buy_price, #buy_amount",function(){
		$(this).val($.trim($(this).val()));
		long = $(this).val().length;
		if (!IsNumeric($(this).val()) && $(this).val()!="" && $(this).val()[long-1] != '.') {
			$(this).val(parseFloat(0));
			return;
		}
		if ($("#buy_amount").val()) {
			amount = parseFloat($("#buy_amount").val())
		}else{
			amount = parseFloat(0);
			return;
			// $("#buy_amount").val(amount)
		}
		if ($(this).val()) {
			price = parseFloat($("#buy_price").val());
		}else{
			price = parseFloat(0);
			return;

			// $(this).val(price)
		}

		if (IsNumeric(amount) && IsNumeric(price) && amount != '' && price != '') {
			total = amount * price;
	  		/*
			total -> 100
			    x <- 0.2
			*/
			feetotal = 0.2 * total / 100;
			//feetotal = total - feetotal;
			

			$("#buy_fee").val(parseFloat(feetotal));
			$("#buy_total").val(parseFloat(total));			
		}

	});
	/*to calculate sell price*/
	$("body").on("keyup","#sell_price, #sell_amount",function(){
		$(this).val($.trim($(this).val()));
		long = $(this).val().length;
		if (!IsNumeric($(this).val()) && $(this).val()!="" && $(this).val()[long-1] != '.') {
			$(this).val(parseFloat(0));
			return;
		}
		if ($("#sell_amount").val()) {
			amount = parseFloat($("#sell_amount").val())
		}else{
			amount = parseFloat(0);
			// $("#sell_amount").val(amount)
		}
		if ($(this).val()) {
			price = parseFloat($("#sell_price").val());
		}else{
			price = parseFloat(0);
			// $(this).val(price)
		}
		//feetotal = amount * price + ( amount * price * 0.2);
		if (IsNumeric(amount) && IsNumeric(price) && amount != '' && price != '') {
			total = amount * price;
			feetotal = 0.2 * total / 100;
			$("#sell_fee").val(feetotal);
			$("#sell_total").val(total);
		}
	});
	function recorrerSell(array,index){
		if (typeof array[index] != 'undefined') {
			value = array[index];
			if (parseFloat(value.ask) == parseFloat($("#buy_price").val()) && value.ready == false &&
				value.bk.tokenGet.toUpperCase() == window.CurrentTokenTwo.address.toUpperCase() && value.bk.tokenGive.toUpperCase() == window.CurrentTokenOne.address.toUpperCase()) {
				amount = parseFloat($("#buy_total").val()) * Math.pow(10,window.CurrentTokenTwo.decimals);
				amount = Math.round(amount);
				window.GenevExch.testTrade(value.bk.tokenGet, Math.round(value.bk.amountGet), value.bk.tokenGive, Math.round(value.bk.amountGive), value.bk.expires, value.bk.nonce, value.bk.user, 0, 0, 0, amount, web3.eth.defaultAccount,{from:web3.eth.defaultAccount},function(error,result){
					console.log('Test trade ',result)
					if (result) {
						window.GenevExch.trade(value.bk.tokenGet, Math.round(value.bk.amountGet), value.bk.tokenGive, Math.round(value.bk.amountGive), value.bk.expires, value.bk.nonce, value.bk.user, 0, 0, 0, amount,{from:web3.eth.defaultAccount},function(errorTrade,resultTrade){
							console.log('trade error:',errorTrade);
							console.log('trade result:',resultTrade);
						})
					}else{
						if (typeof array[index+1] !='undefined') {
							recorrerSell(array,index+1);
						}else{
							addBuyOrder();
						}					
					}
				})
			}else{
				if (typeof array[index+1] !='undefined') {
					recorrerSell(array,index+1);
				}else{
					addBuyOrder();
				}
			}			
		}else{
			addBuyOrder();
		}

	}
	function recorrerBuy(array,index){
		if (typeof array[index] != 'undefined') {
			value = array[index];
				if (parseFloat(value.bid) == parseFloat($("#sell_price").val())  && value.ready == false && 
					value.bk.tokenGet.toUpperCase() == window.CurrentTokenOne.address.toUpperCase() && value.bk.tokenGive.toUpperCase() == window.CurrentTokenTwo.address.toUpperCase()) {
					amount = parseFloat($("#sell_amount").val())  * Math.pow(10,window.CurrentTokenOne.decimals);
					amount = Math.round(amount);
					window.GenevExch.testTrade(value.bk.tokenGet, Math.round(value.bk.amountGet), value.bk.tokenGive, Math.round(value.bk.amountGive), value.bk.expires, value.bk.nonce, value.bk.user, 0, 0, 0, amount, web3.eth.defaultAccount,{from:web3.eth.defaultAccount},function(error,result){
						console.log('Test trade ',result)
						if (result) {
							window.GenevExch.trade(value.bk.tokenGet, Math.round(value.bk.amountGet), value.bk.tokenGive, Math.round(value.bk.amountGive), value.bk.expires, value.bk.nonce, value.bk.user, 0, 0, 0, amount,{from:web3.eth.defaultAccount},function(errorTrade,resultTrade){
								console.log('trade error:',errorTrade);
								console.log('trade result:',resultTrade);
							})
						}else{
							if (typeof array[index+1] !='undefined') {
								recorrerBuy(array,index+1);
							}else{
								addSellOrder();
							}					
						}
					})
			}else{
				if (typeof array[index+1] !='undefined') {
					recorrerBuy(array,index+1);
				}else{
					addSellOrder();
				}
			}			
		}else{
			addSellOrder();
		}

	}
	/*event to buy*/
	$("body").on("click","#order_buy_btn",function(e){
		e.preventDefault();
		recorrerSell(amountSellFilledArray,0);
	});
	function addBuyOrder(){
		console.log('addBuyOrder!')
		web3.eth.getBlockNumber(function(error, currentBlock){ 
			nonce = Date.now();
			tokenGet = window.CurrentTokenOne.address;
			amountGet = (parseFloat($("#buy_amount").val()) * cf) * (Math.pow(10,window.CurrentTokenOne.decimals) * cf) / (cf*cf);
			tokenGive = window.CurrentTokenTwo.address;
			amountGive = (parseFloat($("#buy_total").val())* cf) * (Math.pow(10,window.CurrentTokenTwo.decimals)* cf)/ (cf*cf);
			amountGive = Math.round(amountGive);
			amountGet = Math.round(amountGet);
			console.log(tokenGet, amountGet, tokenGive, amountGive, currentBlock+1000, nonce);
			window.GenevExch.order(tokenGet, amountGet, tokenGive, amountGive, currentBlock+1000, nonce,{from:web3.eth.defaultAccount},function(error,result){
				console.log('error:',error);
				console.log('result:',result);
			})
		})
	}
	/*event to sell*/
	$("body").on("click","#order_sell_btn",function(e){
		e.preventDefault();
		recorrerBuy(amountBuyFilledArray,0);

	});
	function addSellOrder(){
		console.log('addSellOrder')
		web3.eth.getBlockNumber(function(error, currentBlock){ 
			nonce = Date.now();
			tokenGet = window.CurrentTokenTwo.address;
			amountGet = (parseFloat($("#sell_price").val()) * cf) * (parseFloat($("#sell_amount").val()) * cf) * (Math.pow(10,window.CurrentTokenTwo.decimals) * cf) / (cf * cf * cf);
			tokenGive = window.CurrentTokenOne.address;
			amountGive = (parseFloat($("#sell_amount").val()) * cf) * (Math.pow(10,window.CurrentTokenOne.decimals) * cf) / (cf * cf);
			amountGive = Math.round(amountGive);
			amountGet = Math.round(amountGet);
			console.log(tokenGet, amountGet, tokenGive, amountGive, currentBlock+1000, nonce);
			
			window.GenevExch.order(tokenGet, amountGet, tokenGive, amountGive, currentBlock+1000, nonce,{from:web3.eth.defaultAccount},function(error,result){
				console.log('error:',error);
				console.log('result:',result);
			})
		})		
	}
	/*to cancel orders*/
	$("body").on("click",".cancel_order_btn",function(e){
		e.preventDefault();
		var attributes = JSON.parse($(this).attr('id'));
		console.log(attributes);
		if (confirm('Are you sure?')) {
			//(address tokenGet, uint amountGet, address tokenGive, uint amountGive, uint expires, uint nonce, uint8 v, bytes32 r, bytes32 s)
			window.GenevExch.cancelOrder(attributes.tokenGet,attributes.amountGet,attributes.tokenGive,attributes.amountGive,attributes.expires,attributes.nonce,0,0,0,{from:web3.eth.defaultAccount},function(error,result){
				if (error) {
					alert(error);
				}else{
					console.log('result:',result);
				}
			})
		}
	})

	/*to deposit ether modal event*/
	$('body').on('click','.deposit_ether',function(){
		tokenIndex = false;
		window.tokens.tokens.forEach(function(value,index,array){
			console.log('value.address.toUpperCase() == CurrentTokenTwo.address.toUpperCase()',value.address.toUpperCase(), CurrentTokenTwo.address.toUpperCase(),value.address.toUpperCase() == CurrentTokenTwo.address.toUpperCase())
			if (value.address.toUpperCase() == CurrentTokenTwo.address.toUpperCase()) {
				tokenIndex = index;
			}
		})
		if (tokenIndex !== false && window.tokens.tokens[tokenIndex].type == 'ERC223') {
			// console.log('this madafoka')
			window.CurrentTokenTwo.symbol(function(e,symbol){
				text='To deposit ERC223 tokens, please send them directly<br>'+
				'to the exchange contract address:<br>'+
				window.GenevExch.address+"<br>"+
				'Please check that your token '+symbol+' is at address '+
				CurrentTokenTwo.address+'<br>'+
				'Deposit will be credited once the transaction was mined';
				$("#depositERC223_myModalBody").html('<p>'+text+'</p>');
				$("#depositERC223").modal('show');					
			})

		}else{
			$("#depositEtherModal").modal('show');
		}
	})
	/*to deposit token modal event*/
	$('body').on('click','.deposit_token',function(){
				tokenIndex = false;
		window.tokens.tokens.forEach(function(value,index,array){
			if (value.address.toUpperCase() == CurrentTokenOne.address.toUpperCase()) {
				tokenIndex = index;
			}
		})
		if (tokenIndex !== false && window.tokens.tokens[tokenIndex].type == 'ERC223') {
			window.CurrentTokenOne.symbol(function(e,symbol){
				text='To deposit ERC223 tokens, please send them directly<br>'+
				'to the exchange contract address:<br>'+
				window.GenevExch.address+"<br>"+
				'Please check that your token '+symbol+' is at address '+
				CurrentTokenOne.address+'<br>'+
				'Deposit will be credited once the transaction was mined';
				$("#depositERC223_myModalBody").html('<p>'+text+'</p>');
				$("#depositERC223").modal('show');					
			})

		}else{
			$("#depositTokenModal").modal('show');
			window.CurrentTokenOne.allowance(web3.eth.defaultAccount,window.GenevExch.address,function(err,allowanceResult){
				if (!err) {
					$("#allowance_result").val(allowanceResult/Math.pow(10,window.CurrentTokenOne.decimals));
					if (allowanceResult == 0) {
						$('.allowance_message').html("Please approve some tokens <br> Owner:"+web3.eth.defaultAccount+"<br>Spender:"+window.GenevExch.address);
					}
				}
			})
		}

	})
	/*to withdraw ether modal event*/
	$('body').on('click','.withdraw_ether',function(){
		$("#withdrawEtherModal").modal('show');
		$("#ether_to_withdraw").val($("#eth_bal_buy").text().split(" ")[0])
	})
	/*to withdraw token modal event*/
	$('body').on('click','.withdraw_token',function(){
		$("#withdrawTokenModal").modal('show');
		$("#token_to_withdraw").val($("#tokenOne_bal_sell").text().split(" ")[0])
	})
	/*withdraw token btn*/
	$('body').on('click','#withdraw_token_btn',function(){
		if ($("#token_to_withdraw").val()) {
			token = parseInt($("#token_to_withdraw").val())*Math.pow(10,window.CurrentTokenOne.decimals);
			console.log('Token Quantity:',token);
			window.GenevExch.withdrawToken(window.CurrentTokenOne.address,token,{from:web3.eth.defaultAccount},function(err,result){
				if (err) {
					alert(err)
				}else{
					if (window.networkVersion == 4) {
						url = 'https://rinkeby.etherscan.io/tx/'+result;
						showModal("Success","txAddress:<p><a target='_blank' href='"+url+"'>Click Here to see tx state</a></p>");
					}else{
						showModal("Success","txAddress:<p>"+result+"</p>");
					}
				}
			})			
		}

	})
	/*withdraw ether btn*/
	$('body').on('click','#withdraw_ether_btn',function(){
		if ($("#ether_to_withdraw").val()) {
			ethersWeis = parseFloat($("#ether_to_withdraw").val())*Math.pow(10,window.CurrentTokenTwo.decimals);
			window.GenevExch.withdraw(ethersWeis,{from:web3.eth.defaultAccount},function(err,result){
				if (err) {
					alert(err)
				}else{
					if (window.networkVersion == 4) {
						url = 'https://rinkeby.etherscan.io/tx/'+result;
						showModal("Success","txAddress:<p><a target='_blank' href='"+url+"'>Click Here to see tx state</a></p>");
					}else{
						showModal("Success","txAddress:<p>"+result+"</p>");
					}
				}
			})			
		}

	})
	/*to withdraw token modal event*/
	$('body').on('click','.withdraw_token',function(){
		$("#withdrawTokenModal").modal('show');
	})
	/*deposit ether btn*/
	$('body').on('click','#deposit_ether_btn',function(){
		if ($("#ether_to_deposit").val()) {
			ethersWeis = $("#ether_to_deposit").val()*Math.pow(10,18);
			window.GenevExch.deposit({value:ethersWeis,from:web3.eth.defaultAccount},function(err,result){
				if (err) {
					alert(err)
				}else{
					console.log('Result:',result);
				}
			})			
		}

	})
		/*deposit token btn*/
	$('body').on('click','#deposit_token_btn',function(){
		if ($("#token_to_deposit").val()) {
			tokenQuantity = $("#token_to_deposit").val()*Math.pow(10,window.CurrentTokenOne.decimals);//i dont know why deposit multi by 2
			console.log("deposit:",tokenQuantity);
			window.GenevExch.depositToken(window.CurrentTokenOne.address,parseInt(tokenQuantity),{from:web3.eth.defaultAccount},function(err,result){
				if (err) {
					alert(err)
				}else{
					console.log('Result:',result);
				}
			})			
		}

	})
	$("body").on("click","#eth_bal_buy",function(){
		var text = $(this).text().split(" ")[0];
		$("#buy_price").val(parseFloat(text));
	})
	$("body").on("click","#tokenOne_bal_sell",function(){
		var text = $(this).text().split(" ")[0];
		$("#sell_amount").val(parseFloat(text));
	})
});