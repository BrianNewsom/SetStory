var socialmedia = {};
var cheerio = require('cheerio');
var request = require( 'request' );
var async = require( 'async' );
var _ = require('lodash');
var setmine = require('../apiHandlers/setmine');

var settings = require('../config/settings');
var mysql = require('mysql');
var connection = mysql.createPool(settings.db.main);

var artists = {}

artists.init = function(callback) {
}

module.exports = artists;
