'use strict';

const cartParser = require('./cartParser');
const utils = require('./utils');
const ajax = require('./ajax');


const Selectors = {
    cartForm: '#cart-items-form'
}


function parseData(data) {
    data = data || {};
    data.bringBackProperties = {
        "type": "SESSION_ID",
        "value": utils.getCustomerID(),
        "nodeId": utils.getNodeId()
    };
    data.context = 'ECOMMERCE';
    return JSON.stringify(data);
}

function buildProduct(id, name, quantity, price, category) {
    return {
        "id": id,
        "sku": id,
        "name": name,
        //"quantity": quantity,
        "price": parseFloat(price),
        "category": category
    };
}

function showProduct(product) {
    $.ajax(ajax.buildEventAjax({
        method: 'POST',
        data: parseData({
            "type": "viewedProduct",
            "properties": product,
            "contextInfo": {}
        })
    })).done(function () {
        console.log('showProduct done');
    }).fail(function () {
        console.log('showProduct fail');
    });
}

function addProduct(product) {
    $.ajax(ajax.buildEventAjax({
        method: 'POST',
        data: parseData({
            "type": "addedProduct",
            "properties": product,
            "contextInfo": {}
        })
    })).done(function () {
        console.log('addProduct done');
    }).fail(function () {
        console.log('addProduct fail');
    });
}

function removeProduct(product) {
    $.ajax(ajax.buildEventAjax({
        method: 'POST',
        data: parseData({
            "type": "removedProduct",
            "properties": product,
            "contextInfo": {}
        })
    })).done(function () {
        console.log('removeProduct done');
    }).fail(function () {
        console.log('removeProduct fail');
    });
}

function init() {
	var chCart = {};
	
	$(document).ajaxSend(function (event, xhr, settings) {
	    if (settings.url.search(/Cart-AddProduct/i) > -1 && settings.url.search(/format=ajax/i) > -1) {
	        var data = settings.data;
	        var params = new URLSearchParams(data);
	        var product = products.buildProduct(
	            params.get('pid'),
	            $('h1.product-name').text(),
	            params.get('Quantity'),
	            utils.getPriceInPdp(),
	            utils.collectCategoriesFromBreadcrumb()
	        );
	        products.addProduct(product);
	    }
	});

	$(document).ready(function (event) {
	    var $productShow = $('[data-product-show]');
	    if ($productShow.length > 0 && $productShow.data('productShow') === true) {
	        var product = products.buildProduct(
	            utils.getPidInPdp(),
	            $('h1.product-name').text(),
	            $('#Quantity').val(),
	            utils.getPriceInPdp(),
	            utils.collectCategoriesFromBreadcrumb()
	        );
	        products.showProduct(product);
	    }
	});

	$(document).ready(function (event) {
	    var $cartForm = $(Selectors.cartForm);
	    if ($cartForm.length > 0) {
	        $cartForm.find('tr.cart-row').each(function () {
	            var $line = $(this);
	            chCart[cartParser.getPidInCart($line)] = parseInt(cartParser.getQuantityInCart($line));
	        });
	    }
	});

	$('button[name$="deleteProduct"]').on('click', function (e) {
	    var $this = $(this);
	    var $line = $this.closest('tr.cart-row');
	    var product = products.buildProduct(
	        cartParser.getPidInCart($line),
	        cartParser.getNameInCart($line),
	        0,
	        cartParser.getPriceInCart($line), []
	    );
	    products.removeProduct(product);
	});

	$(Selectors.cartForm).on('submit', function (e) {
	    var $this = $(this);
	    $this.find('tr.cart-row').each(function () {
	        var $line = $(this);
	        var pid = cartParser.getPidInCart($line);
	        var newQuantity = cartParser.getQuantityInCart($line);
	        var product = products.buildProduct(
	            pid,
	            cartParser.getNameInCart($line),
	            parseInt(newQuantity) - chCart[pid],
	            cartParser.getPriceInCart($line), []
	        );
	        if (newQuantity == 0) {
	            products.removeProduct(product);
	        }
	    })
	});
}

var products = {
    showProduct: showProduct,
    addProduct: addProduct,
    removeProduct: removeProduct,
    buildProduct: buildProduct,
    init: init
};

module.exports = products;
