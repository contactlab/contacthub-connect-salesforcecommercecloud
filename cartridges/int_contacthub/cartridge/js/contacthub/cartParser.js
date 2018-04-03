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
