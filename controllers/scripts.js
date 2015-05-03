// Handles relations w/ mysql table artist_social_media in schema setstory
var settings = require('../config/settings');
var mysql = require('mysql');
var connection = mysql.createPool(settings.db.setstory);
var rest = require('restler');

var scripts = {};

var artists = ["Taylor Swift", "AWOLNATION", "Coldplay", "Skrillex"];

scripts.startTimedSocialMedia = function(cb) {
	console.log("Starting timed social media script...")
	

	for(var i in artists) {
		console.log("Make social media request");
		var requestThresholdMin = 20000; // at least 20 seconds between requests
		var requestThresholdMax = 35000; // at most 35 seconds between requests

		var timer = Math.floor((Math.random() * requestThresholdMax) + requestThresholdMin);
		setTimeout()
	}

	cb();

	// function get
}

module.exports = scripts;