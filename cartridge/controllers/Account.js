'use strict';

/**
 * Controller that renders the account overview, manages customer registration and password reset,
 * and edits customer profile information.
 *
 * @module controllers/Account
 */

const CLUtils = require('~/cartridge/scripts/utils/utils');
const baseCartridge = CLUtils.getBaseCartridge();
const baseScriptsDirectory = baseCartridge + '/cartridge/scripts/';
const log = CLUtils.getLogger();
const ContactHUBCustomer = require('~/cartridge/scripts/customers');
const guard = require(baseScriptsDirectory + 'guard');
const app = require(baseScriptsDirectory + 'app');

var BaseAccountController = require(baseCartridge + '/cartridge/controllers/Account');

for (let i in BaseAccountController) {
	exports[i] = BaseAccountController[i];
}


exports.RegistrationForm = guard.ensure(['post', 'https', 'csrf'], function() {
	let email = app.getForm('profile.customer.email').value();

	BaseAccountController.RegistrationForm();

	let me;
	if (email != null) {
		me = ContactHUBCustomer.sendCustomerByEmail(email);
	} else if (customer != null) {
		me = ContactHUBCustomer.sendCustomer(customer);
	} else {
		log.error('no customer');
	}
});
