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