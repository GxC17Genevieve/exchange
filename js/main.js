$(document).ready(function(){
	init();
	$('.sell_table,.buy_table').DataTable({
		"info":     false
	});
	$("body").on("click","#look_book_orders",function(){
		drawOrders()
	})
	/*to calculate buy price*/
	$("body").on("keyup","#buy_price, #buy_amount",function(){
		if ($("#buy_amount").val()) {
			amount = parseFloat($("#buy_amount").val())
		}else{
			amount = parseFloat(0);
			$("#buy_amount").val(amount)
		}
		if ($(this).val()) {
			price = parseFloat($("#buy_price").val());
		}else{
			price = parseFloat(0);
			$(this).val(price)
		}
		feetotal = amount * price + ( amount * price * 0.2);
		total = amount * price;

		$("#buy_fee").val(feetotal);
		$("#buy_total").val(total);
	});
	/*to calculate sell price*/
	$("body").on("keyup","#sell_price, #sell_amount",function(){
		if ($("#sell_amount").val()) {
			amount = parseFloat($("#sell_amount").val())
		}else{
			amount = parseFloat(0);
			$("#sell_amount").val(amount)
		}
		if ($(this).val()) {
			price = parseFloat($("#sell_price").val());
		}else{
			price = parseFloat(0);
			$(this).val(price)
		}
		feetotal = amount * price + ( amount * price * 0.2);
		total = amount * price;
		
		$("#sell_fee").val(feetotal);
		$("#sell_total").val(total);
	});
	/*event to buy*/
	$("body").on("click","#order_buy_btn",function(){
	    _tokenGet = token.tokenAddress;
	    _amountGet = parseFloat($("#buy_amount").val());
	    _tokenGive = 0;
	    _amountGive = _amountGet / parseFloat($("#buy_price").val());
	    _expires = 200;
	    var _nonce = 120;
		//address tokenGet, uint amountGet, address tokenGive, uint amountGive, uint expires, uint nonce
		window.GenevExch.order(_tokenGet, _amountGet, _tokenGive , _amountGive , _expires,_nonce,{gas:500000,from:web3.eth.defaultAccount},function(error,result){
			if (error) {
				showModal("Error",error);
			}else{
				showModal("Success","txAddress:<p>"+result+"</p>");
			}
		})
	});
	/*event to sell*/
	$("body").on("click","#order_sell_btn",function(){
	    _tokenGet = 0;
	    _amountGet = parseFloat($("#sell_amount").val());
	    _tokenGive = token.tokenAddress;
	    _amountGive = _amountGet * parseFloat($("#sell_price").val());
	    _expires = 200;
	    var _nonce = 120;
		window.GenevExch.order(_tokenGet, _amountGet, _tokenGive , _amountGive , _expires,_nonce,{gas:500000,from:web3.eth.defaultAccount},function(error,result){
			if (error) {
				showModal("Error",error);
			}else{
				showModal("Success","txAddress:<p>"+result+"</p>");
			}
		})
	});

});