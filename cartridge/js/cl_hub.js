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