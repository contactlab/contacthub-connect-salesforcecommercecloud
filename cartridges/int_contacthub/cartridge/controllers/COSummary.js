'use strict';

/**
 * This controller implements the last step of the checkout. A successful handling
 * of billing address and payment method selection leads to this controller. It
 * provides the customer with a last overview of the basket prior to confirm the
 * final order creation.
 *
 * @module controllers/COSummary
 */

const CLUtils = require('~/cartridge/scripts/utils/utils');
const baseCartridge = CLUtils.getBaseCartridge();
const baseScriptsDirectory = baseCartridge + '/cartridge/scripts/';
const log = CLUtils.getLogger();
const guard = require(baseScriptsDirectory + 'guard');
const app = require(baseScriptsDirectory + 'app');
const events = require('~/cartridge/scripts/events');

var SGCOSummary = require(baseCartridge + '/cartridge/controllers/COSummary');

for (let i in SGCOSummary) {
	exports[i] = SGCOSummary[i];
}


/**
 * This function is called when the "Place Order" action is triggered by the
 * customer.
 */
function submit() {
    // Calls the COPlaceOrder controller that does the place order action and any payment authorization.
    // COPlaceOrder returns a JSON object with an order_created key and a boolean value if the order was created successfully.
    // If the order creation failed, it returns a JSON object with an error key and a boolean value.
    var placeOrderResult = app.getController('COPlaceOrder').Start();
    if (placeOrderResult.error) {
        start({
            PlaceOrderError: placeOrderResult.PlaceOrderError
        });
    } else if (placeOrderResult.order_created) {
        showConfirmation(placeOrderResult.Order);
    }
}

/**
 * Renders the order confirmation page after successful order
 * creation. If a nonregistered customer has checked out, the confirmation page
 * provides a "Create Account" form. This function handles the
 * account creation.
 */
function showConfirmation(order) {
	events.sendCompletedOrder(customer.getID(), order);
	SGCOSummary.ShowConfirmation(order);
}


/** @see module:controllers/COSummary~Submit */
exports.Submit = guard.ensure(['https', 'post', 'csrf'], submit);

/*
 * Local method
 */
exports.ShowConfirmation = showConfirmation;
