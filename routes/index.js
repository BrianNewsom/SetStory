var express = require('express');
var router = express.Router();
var skrillex = require('../data/Skrillex.json');
var decibel = require('../apiHandlers/decibel');
var openaura = require('../apiHandlers/openaura');
var setlistFM = require('../apiHandlers/setlistfm');
var unified = require('../apiHandlers/unified');
var musicgraph = require('../apiHandlers/musicgraph');
var setmine = require('../apiHandlers/setmine')
var echonest = require('../apiHandlers/echonest')
var artist_social_media = require('../controllers/artist_social_media');
var artist_media_plays = require('../controllers/artist_media_plays');
var scripts = require('../controllers/scripts')

var jf = require('jsonfile')

setmine.init(function() {
    console.log("setmine models stored.")
})

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

router.get('/api/artist/social_media', function(req, res, next){
  artist_social_media.getArtist(req.query.id, req.query.id_type, function(data){
    res.json(data);
  })
});

/* Get plays data for an artist (Returns an array of data in order */
router.get('/api/artist/media_plays', function(req, res, next){
    artist_media_plays.getArtist(req.query.id, req.query.id_type, function(data){
        res.json(data);
    })
});

/* Endpoint so we can update artists by hitting a url.  Probably shouldn't be on prod. */
router.get('/api/artist/social_media/updateById', function(req, res, next){
    artist_social_media.updateArtistById(req.query.id, function(data){
        res.json(data);
    })
})

router.get('/api/artist/social_media/:artistName', function(req, res, next){
    /* TODO: Get MBID from artists table once it's populated - this should always work but often requires two calls to openaura. */
    openaura.getMBID(req.params.artistName, function(musicbrainz_id){
        artist_social_media.getArtist(musicbrainz_id, 'musicbrainz_id', function(data){
            res.json(data);
        })
    });
})

router.get('/api/artist/getMBID', function(req, res, next){
    if(!req.query.artist_name){
        res.send("Please include artist_name query parameter");
    }
    var artist_name = req.query.artist_name;
    artists.getMBIDByName(artist_name, function(musicbrainz_id){
        if (!musicbrainz_id){
            res.send("No matching musicbrainz_id for artist in table artists");
        }
        res.json({"artist_name": artist_name, "musicbrainz_id": musicbrainz_id })
    });
})


router.get('/api/search/:name', function(req, res, next) {

    var result = [];

    if(req.params.name.length > 2) {
        var artists = setmine.artists
        for (var i = 0; i < artists.length; i++) {
            if (artists[i].artist.toLowerCase().indexOf(req.params.name.toLowerCase()) > -1) {
                result.push(artists[i])
            }
        };
    }
    res.json(result)


});
router.get('/api/autocomplete/:name', function(req, res, next) {

    var result = [];

    if(req.params.name.length > 2) {
        var artists = setmine.artists
        for (var i = 0; i < artists.length; i++) {
            if (artists[i].artist.toLowerCase().indexOf(req.params.name.toLowerCase()) > -1) {
                result.push(artists[i].artist)
            }
        };
    }
    res.json(result)


});

router.get('/api/artist/:artistName/:page/:count', function(req, res, next){
    // TODO: Make dynamic
    if (parseInt(req.params.page) > 5){
        res.json({sets:[]});
    }
    else{
        res.json(skrillex);
    }

});

router.get('/api/artist/:artistName', function(req,res,next){
    musicgraph.getArtistInfo(req.params.artistName, function(data){
        res.json(data);
    });
});

router.get('/api/getArtistPic/:artistName', function(req, res, next){
    openaura.getArtistImage(req.params.artistName, function(data){
        res.json(data);
    })
})


router.get('/api/genres/:artistName', function(req, res, next){
    try{
        decibel.getArtistGenres(req.params.artistName, function(data){
            res.json(data);
        });
    } catch(e){
        console.log(e);

    }
});

router.get('/api/songInfo', function(req, res, next){
    musicgraph.getSongInfo(req.query.artist,req.query.title, function(data){
        res.json(data);
    })
});

router.get('/api/gigs/:artistName', function(req, res, next){
    setlistFM.getArtistGigs(req.params.artistName, function(data){
        res.json(data);
    })
});

router.get('/api/getSocialMedia', function(req, res, next){
    openaura.getSocialFeed(req.query.artist,req.query.limit ,req.query.offset,function(data){
        res.json(data);
    })
})

router.get('/api/story/:artistName', function(req, res, next){
    unified.story(req.params.artistName, function(data) {
        res.json(data);
    })
})

router.get('/api/popularity/set/:artist/:event', function(req, res, next){
    setmine.popularity(req.params.artist, req.params.event, function(data) {
        res.json(data);
    })
})

router.get('/api/popularity/track/:trackTitle', function(req, res, next){
    echonest.getTrackPopularity(req.params.trackTitle, function(data) {
        res.json(data);
    })
})

router.get('/api/popularity/artist/:artistName', function(req,res,next){
    echonest.getArtistPopularity(req.params.artistName, function(data){
        res.json(data);
    })
})

router.get('/api/scripts/startTimedSocialMedia', function(req,res,next){
    scripts.startTimedSocialMedia(function() {
        res.json({"response": "Script finished."});
    })
})


module.exports = router;
