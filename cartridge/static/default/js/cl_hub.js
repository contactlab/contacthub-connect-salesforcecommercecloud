(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

const customers = require('./contacthub/customers');
const products = require('./contacthub/products');


customers.init();
products.init();


if (navigator.appVersion.search(/MSIE [789]\./) > -1) {
  window.onload = function() {
    window.onerror = function() {
      return true;
    }
  }
}
},{"./contacthub/customers":4,"./contacthub/products":5}],2:[function(require,module,exports){
'use strict';

const utils = require('./utils');


var ajax = {};

function setAjaxSettings(settings) {
	settings.contentType = 'application/json';
    settings.beforeSend = function (request) {
        utils.setAuth(request);
    };
    return settings;
}

ajax.buildEventAjax = function(settings) {
    settings.url = utils.getEventsUrl();
    return setAjaxSettings(settings);
};

ajax.buildCustomerAjax = function(settings) {
	settings.url = utils.getCustomersUrl();
    return setAjaxSettings(settings);
};

module.exports = ajax;
},{"./utils":6}],3:[function(require,module,exports){
'use strict';

var cartParser = {};

cartParser.getNameInCart = function($cartLine) {
	return $cartLine.find('td.item-details .name').find('a').text();
};

cartParser.getPidInCart = function($cartLine) {
	return $cartLine.find('td.item-details .sku').find('.value').text();
};

cartParser.getPriceInCart = function($cartLine) {
	var $priceSales = $cartLine.find('td.item-price .price-sales');
	var $price = $priceSales.length > 0 ? $priceSales : $cartLine.find('td.item-price .price-standard');
	return $price.text().slice(1);
};

cartParser.getQuantityInCart = function($cartLine) {
	return parseInt($cartLine.find('td.item-quantity input').val());
};


module.exports = cartParser;

},{}],4:[function(require,module,exports){
'use strict';

const utils = require('./utils');
const ajax = require('./ajax');


var customers = {};

function parseData(data) {
    data = data || {};
    return JSON.stringify(data);
}

function sessionSettings(value) {
	var settings = ajax.buildCustomerAjax({
		method: 'POST',
		data: parseData({
			value: value
		})
	});
	settings.url += '/' + utils.getCustomerChId() + '/sessions';
	return settings;
}

function getReconciliationCookie() {
	var reconciliation = utils.getCookie('ch_reconciliation') || 0;
	if (reconciliation !== '') {
		reconciliation = parseInt(reconciliation);
	}
	return reconciliation;
}

function doCreateSession(sessionId) {
	$.ajax(sessionSettings(sessionId))
	.done(function () {
		console.log('createSession done: ' + sessionId);
	}).fail(function () {
		console.log('createSession fail');
	}).always(function() {
		var newReconciliation = getReconciliationCookie() + 1;
		utils.addCookie('ch_reconciliation=' + newReconciliation);
	});
}

customers.createSession = function() {
	if (utils.getCustomerChId() != null && getReconciliationCookie() < 2) {
		doCreateSession(utils.getCustomerAnonymousId());
		doCreateSession(utils.getCustomerID());
	}
};

customers.init = function() {
	$(document).ready(function(event) {
	    if (utils.isCustomerLogged()) {
	    	customers.createSession();
	    } else {
	    	document.cookie = 'ch_reconciliation=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
	    }
	});
};

module.exports = customers;
},{"./ajax":2,"./utils":6}],5:[function(require,module,exports){
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

},{"./ajax":2,"./cartParser":3,"./utils":6}],6:[function(require,module,exports){
'use strict';

var utils = {};
var $clHub = $('#cl_hub');

utils.addCookie = function(cookie) {
	document.cookie = cookie;
};

utils.getCookie = function(name) {
	var matched = document.cookie.split(';').filter(function(cookie) {
		return cookie.trim().search(new RegExp(name + '=')) === 0;
	});
	if (matched.length > 0) {
		return matched[0].split('=')[1];
	}
	return null;
}

utils.getCustomerID = function() {
	return $clHub.data('customer');
};

utils.getCustomerAnonymousId = function() {
	var anonymousCookies = document.cookie.split(';').filter(function(cookie) {
		return cookie.trim().search(/^dwanonymous_.*/) === 0;
	});
	if (anonymousCookies.length > 0) {
		return anonymousCookies[0].split('=')[1];
	}
	return '';
};

utils.getCustomerChId = function() {
	return $clHub.data('customerCh');
};

utils.isCustomerLogged = function() {
	return $clHub.data('authenticated') === true;
};

utils.getCustomersUrl = function() {
	return $clHub.data('url') + '/customers';
};

utils.getEventsUrl = function() {
	return $clHub.data('url') + '/events';
};

utils.getNodeId = function() {
	return $clHub.data('node');
};

utils.getToken = function() {
	return $clHub.data('token');
};

utils.setAuth = function(request) {
	request.setRequestHeader('Authorization', 'Bearer ' + utils.getToken());
};

utils.collectCategoriesFromBreadcrumb = function() {
	var a = [];
	var $breadcrumbs = $('a.breadcrumb-element');
	$breadcrumbs.map(function(i,e) {
		a.push($(e).text())
	});
	return a;
};

utils.getPidInPdp = function() {
	return $('#pid').val();
};

utils.getPriceInPdp = function() {
	var $priceSales = $('div.product-price .price-sales');
	var $price = $priceSales.length > 0 ? $priceSales : $('div.product-price .price-standard');
	return $price.text().slice(1);
};

module.exports = utils;

},{}]},{},[1]);
