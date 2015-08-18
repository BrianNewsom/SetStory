var express = require('express')
var router = express.Router()
var skrillex = require('../data/Skrillex.json')
var decibel = require('../apiHandlers/decibel')
var openaura = require('../apiHandlers/openaura')
var setlistFM = require('../apiHandlers/setlistfm')
var unified = require('../apiHandlers/unified')
var musicgraph = require('../apiHandlers/musicgraph')
var setmine = require('../apiHandlers/setmine')
var soundcloud = require('../apiHandlers/soundcloud')
var instagram = require('../apiHandlers/instagram')
var stubhub = require('../apiHandlers/stubhub')

var echonest = require('../apiHandlers/echonest')
var artist_social_media = require('../controllers/artist_social_media')
var artist_media_plays = require('../controllers/artist_media_plays')
var scripts = require('../controllers/scripts')
var winston = require('winston')
var ava;
var eva;


var jf = require('jsonfile')

setmine.init(function() {
    winston.info("setmine models stored.")
    ava = require('../controllers/ava')
    eva = require('../controllers/eva')

})


module.exports = router;
