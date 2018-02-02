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