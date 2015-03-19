var express = require('express');
var router = express.Router();
var skrillex = require('../data/Skrillex.json');
var decibel = require('../apiHandlers/decibel');
var openaura = require('../apiHandlers/openaura');
var setlistFM = require('../apiHandlers/setlistfm');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

router.get('/api/artist/:artistName/:page/:count', function(req, res, next){
    // TODO: Make dynamic
    console.log(req.params.page);
    console.log(req.params.artistName);
    if (parseInt(req.params.page) > 5){
        res.json({sets:[]});
    }
    else{
        res.json(skrillex);
    }
    
});

router.get('/api/getArtistPic/:artistName', function(req, res, next){
    openaura.getArtistImage(req.params.artistName, function(data){
        res.json(data);
    })
})


router.get('/api/genres/:artistName', function(req, res, next){
    console.log('hey', req.params.artistName);
    try{
        decibel.getArtistGenres(req.params.artistName, function(data){
            res.json(data);
        });
    }catch(e){
        console.log(e);

    }
});

router.get('/api/songInfo', function(req, res, next){
    decibel.getSongInfo(null,req.query.artist, function(data){
        console.log('hi');
        console.log(data);
        res.json(data);
    })
});

router.get('/api/gigs/:artistName', function(req, res, next){
    setlistFM.getArtistGigs(req.params.artistName, function(data){
        console.log(data);
        res.json(data);
    })
});


module.exports = router;
