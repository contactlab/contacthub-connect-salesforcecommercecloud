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
