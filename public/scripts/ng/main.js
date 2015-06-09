var myApp = angular.module('myApp', ['autocomplete', 'ngAnimate', 'infinite-scroll','angularMoment','ngRoute']).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/', 
    {
      templateUrl: '/scripts/ng/partials/search.html', 
      controller: 'SearchController'
    });
  
  $routeProvider.when('/artists/:name', 
    {
      templateUrl: '/scripts/ng/partials/artists.html', 
      controller: 'ArtistsController'
    });
  
   $routeProvider.when('/events/:name', 
    {
      templateUrl: '/scripts/ng/partials/concerts.html', 
      controller: 'EventsController'
    });
 
}]);



myApp.controller('SearchController', function($scope,$rootScope,$location, $http){

    $rootScope.main = true;
    $rootScope.detail = false;
        $scope.artists = [];
        $scope.events = [];

        // gives another movie array on changez
        $scope.updateArtists = function(typed){
            // MovieRetriever could be some service returning a promise
            var url = '/api/autocomplete/artists/' + typed;
            
            $http.get(url).success(function(data) {
            	console.log(data);
		    	$scope.artists = data;
		    });
            
        };
        $scope.gotoArtist = function(c){	
        	$location.path("/artists/" + c);
        };

        $scope.updateEvents = function(typed){
            // MovieRetriever could be some service returning a promise
            var url = '/api/autocomplete/events/' + typed;
            
            $http.get(url).success(function(data) {
		    	$scope.events = data;
		    });
            
        };
        $scope.gotoEvent = function(c){	
        	$location.path("/events/" + c);
        };
    
});


myApp.controller('ArtistsController', function($scope, $interval, $filter, $sce,$filter, $rootScope,$routeParams,$location, $http) {
	
	$scope.choice = $routeParams.name;
	var plays = []

	$scope.getArtistScore = function() {

    	var url = '/api/artist/avascore/' + $scope.choice;

    	console.log(url);

    	$http.get(url).success(function(metadata) {
    		console.log(metadata);
    		$scope.artistScore = metadata.ava_score || 12345;
    	});
		

    }

    $scope.getArtistScore();


    $scope.getArtistMediaData = function() {
    	var url = 'http://setmine.com/api/v/7/artist/metrics/social/' + $scope.choice;

    	console.log(url);

    	$http.get(url).success(function(metadata) {
    	
    	console.log(metadata);
    	
    	var social = {
			facebook_followers: resumedNumberStringToNumber(metadata.payload.metrics.social.facebook.total),
			twitter_followers: resumedNumberStringToNumber(metadata.payload.metrics.social.twitter.total),
			instagram_followers: resumedNumberStringToNumber(metadata.payload.metrics.social.instagram.total),
			soundcloud_followers: resumedNumberStringToNumber(metadata.payload.metrics.social.soundcloud.total_plays),
			youtube_followers: resumedNumberStringToNumber(metadata.payload.metrics.social.youtube.total_plays),
		}

	    var data = [];
		    data.push({number: 1, value: social.facebook_followers, name: "facebook", max: 10000000 * 1.2});
		    data.push({number: 2, value: social.twitter_followers, name: "twitter", max: 70697964 * 1.2});
		    data.push({number: 3, value: social.instagram_followers, name: "instagram", max: 356000000});
		    data.push({number: 4, value: social.soundcloud_followers, name: "soundcloud", max: 100000000});
		    data.push({number: 5, value: social.youtube_followers,name:"youtube", max: 30000000000});
		 $scope.socialset = data;


		 $scope.playsOverTime = {
			setmine: [
				2000,
				3000,
				4000,
				5000
			],
			soundcloud: [
				2500,
				3500,
				4500,
				5500
			],
			youtube: [
				2800,
				3800,
				4800,
				5800
			],
		}
	var setmineOverTime =[];
	var youtubeOverTime =[];
	var soundcloudOverTime =[];

	maxYoutube = 10000000;
 	maxSoundCloud = 10000000;
	//TODO : INTEGRATE SETMINE!
	setmineOverTime.push({name:"FEB", plays: $scope.playsOverTime.setmine[0]});
	setmineOverTime.push({name:"MAR", plays: $scope.playsOverTime.setmine[1]});
	setmineOverTime.push({name:"APR", plays: $scope.playsOverTime.setmine[2]});
	setmineOverTime.push({name:"MAY", plays: $scope.playsOverTime.setmine[3]});


	youtubeOverTime.push({name:"FEB", plays: metadata.payload.metrics.social.youtube.overtime[1][1]});
	youtubeOverTime.push({name:"MAR", plays:  metadata.payload.metrics.social.youtube.overtime[2][1]});
	youtubeOverTime.push({name:"APR", plays:  metadata.payload.metrics.social.youtube.overtime[3][1]});
	youtubeOverTime.push({name:"MAY", plays:  metadata.payload.metrics.social.youtube.overtime[4][1]});


 	soundcloudOverTime.push({name:"FEB", plays: metadata.payload.metrics.social.soundcloud.overtime[1][1]});
	soundcloudOverTime.push({name:"MAR", plays:  metadata.payload.metrics.social.soundcloud.overtime[2][1]});
	soundcloudOverTime.push({name:"APR", plays:  metadata.payload.metrics.social.soundcloud.overtime[3][1]});
	soundcloudOverTime.push({name:"MAY", plays:  metadata.payload.metrics.social.soundcloud.overtime[4][1]});

	console.log(soundcloudOverTime)
	console.log(youtubeOverTime)


	plays.push({name:'setmine', max :maxSetMine, months:setmineOverTime});
	plays.push({name:'youtube', max: maxYoutube, months:youtubeOverTime});
	plays.push({name:'soundcloud', max:maxSoundCloud, months:soundcloudOverTime});

	$scope.plays = plays;



    	});

		

    }

    $scope.getArtistMediaData();

	maxYoutube = 10000;
	maxSoundCloud = 10000;
	maxSetMine  = 10000;

	
	$scope.scaleHeight = function(item, play){
		var scaleY = d3.scale.linear()
              .domain([0, item.max])
              .range([0, 160]);
        var styles = {height: scaleY(play) + "px"};
        console.log(styles);      
		return styles;

	};

	var format = d3.format('.1s');

	$scope.formatOutput = function(play) {
		return format(play);
	};

	$scope.getArtistID = function() {
		var url = "api/getArtistID/" + $scope.choice; 
		
		$http.get(url).success(function(data) {
			$scope.artistsPhoto = data;
		});
	}
	
	$scope.getArtistPhoto = function(){
		
		var url = "api/getArtistPic/" + $scope.choice; 
		
		$http.get(url).success(function(data) {
			$scope.artistsPhoto = data;
		});
		
	}
	$scope.getArtistPhoto();

    $scope.getArtistData = function(){
        var url = "api/artist/" + $scope.choice;

        $http.get(url).success(function(data) {
            $scope.artistData = data;
        })

    }

    $scope.getArtistData();

	$scope.back = function(){
		window.history.back();
	}
	var media =[];
	  $scope.sets = [];
	  $scope.page= 1;
	  // $scope.loadMore = function() {
	   
	  // };
	  // $scope.loadMore();
	$scope.showVideo = function(media){
		if (!media) return false;
		return media.type ==='video';
	};
	$scope.showEmbed = function(media){
		if (!media) return false;
		return media.type ==='embed';
	}
	$scope.showVideoUrl = function(url) {
		return $sce.trustAsResourceUrl(url);
	}
	$scope.showImage = function(media){

		console.log(media.type)
		
		if (media.type === 'image')
		{
			if (parseInt(media.width) >= 620 && parseInt(media.width) <= 800){
				return true;
			}
			else return false;
		}
		else {return false; }

	};
	var url = "/api/story/"+ $scope.choice; 
	
	

	$http.get(url).success(function(data) {
		$scope.sets= data;
		var mockDatasetUrl = '/SkrillexSets.json';
		$http.get(mockDatasetUrl).success(function(metadata) {


			for (var i = 0; i < metadata.length; i++) {
				metadata[i].genres = $filter('orderBy')(metadata[i].genres, '-count');
				data[i].meta = metadata[i];
			};
		});
	});

	$scope.choice = decodeURIComponent($scope.choice);

});
myApp.controller('EventsController', function($interval, $scope,$sce,$filter, $rootScope,$routeParams,$location, $http) {

	
	$scope.socialset =
	    [{"number":1, "value":20, "max":20},
	    {"number":2, "value":20, "max":20},
	    {"number":3, "value":20, "max":20},
	    {"number":4, "value":20, "max":20},
	    {"number":5, "value":20, "max":20},
	    {"number":6, "value":20, "max":20},
	    {"number":7, "value":20, "max":20}];

    var sources = [];
	    sources.push({name: "google-plus", max: 10000000  * 1.2});
	    sources.push({name: "vimeo-square", max: 90000 * 1.2});
	    sources.push({name: "facebook", max: 100000000 * 1.2});
	    sources.push({name: "twitter", max: 70697964 * 1.2});
	    sources.push({name: "youtube", max: 30000000000});
	    sources.push({name: "soundcloud", max: 1000000});
	    sources.push({name: "setmine", max: 1000000});


	$interval(function(){
		  var data = [];
      for(var i = 0; i < sources.length; i++) {
      	var s = sources[i]
        data.push({
        	"name": s.name, 
        	"number":i, 
        	"max": s.max,
        	"value": Math.floor(Math.random()*s.max)});
      }

    	$scope.socialset = data;  
  	},3000);
    

	$scope.eventName = $routeParams.name;

	
	var loadData = function(url){
		console.log(url)
		$http.get(url).success(function(data) {
			$scope.event = data.response;

			$scope.calculateEventScore();
			
			for (var i = 0; i < $scope.event.lineup.length; i++) {
				if ( $scope.event.lineup[i].artistimageURL === 'ca6a250fc84f30e571a62286fc8c2c16c7ce64b4.png')
				{
					 $scope.event.lineup[i].artistimageURL = '';
				}
				else {
					 $scope.event.lineup[i].artistimageURL = 'http://stredm.s3-website-us-east-1.amazonaws.com/namecheap/' +  $scope.event.lineup[i].artistimageURL;	
				}

						
			};
		});
	}

	loadData("/api/lineup/event/" + $scope.eventName)


	$scope.calculateEventScore = function() {
		$scope.eventScore = $scope.event.lineup.length * 13000;

	}

	$scope.gotoArtist = function(artist){
		var encoded = encodeURIComponent(artist.artist);
		$scope.gotoArtist = function(c){	
        	$location.path("/artists/" + encoded);
        };
	}

	$scope.detail = {
		lineup:[]
	};


	$rootScope.main = true;
	$rootScope.detail = false;
    $scope.artists = [];
    $scope.events = [];

    // gives another movie array on changez
    $scope.updateArtists = function(typed){
        // MovieRetriever could be some service returning a promise
        var url = '/api/autocomplete/artists/' + typed;
        
        $http.get(url).success(function(data) {
        	if (data) {
        		var autocompleteArtistOptions = data
        		var lineup = $scope.event.lineup

        		console.log(autocompleteArtistOptions.length)

        		// Splices allArtists and returns the artists not in lineup

        		for(var i in lineup) {
        			var index = autocompleteArtistOptions.indexOf(lineup[i].artist)
        			console.log(lineup[i])
        			console.log(index)

        			if(index > -1) {
        				autocompleteArtistOptions.splice(index, 1)
        			}
        		}
        		console.log(autocompleteArtistOptions.length)


		    	$scope.artists = autocompleteArtistOptions;
	    	}
	    });
        
    };
    $scope.addArtists = function(artistName){	
    	var url = "api/artist/setmine/" + artistName;

        $http.get(url).success(function(data) {
        	console.log(data)
            var artist = data[0];
            processArtistImage(data[0]);
            $scope.event.lineup.unshift(data[0]);
            $scope.calculateEventScore();
            var socialMediaURL = "api/artist/social_media/" + artistName;
            (function(smURL,item){
            	$http.get(smURL).success(function(data) {
            		item.socialMedia = data;
            		calculateSocialAverage();
            	});
            })(socialMediaURL,artist);
            
            
        });
        $scope.choice = '';
        $scope.artists= [];

	};

	


	$scope.removeArtist = function(i,a){
		 $scope.detail.lineup.splice(i, 1);
		 calculateSocialAverage();
	};



});



function processArtistImage(artist){


	if ( artist.imageURL === 'ca6a250fc84f30e571a622185fc8c2c16c7ce64b4.png')
	{
		 artist.imageURL ='';
		 artist.artistimageURL =	artist.imageURL;
	}
	else {
		artist.imageURL = 'http://stredm.s3-website-us-east-1.amazonaws.com/namecheap/' +  artist.imageURL;	
		artist.artistimageURL =	artist.imageURL;
	}

}


function resumedNumberStringToNumber(a){
	if (!a){
		return 0;
	}
	var symbol = a.split('').reverse()[0].toLowerCase();
	console.log(symbol);
	if (symbol != 'm' &&  symbol != 'k'){
		return parseFloat(a);
	}
	else {
		var number = parseFloat(a.replace(symbol,'') + 0);

		var power = 1;
		if (symbol === 'm'){
			power = 1000000;
		}
		else if (symbol === 'k'){
			power = 1000;
		}
		console.log(number ,power);
		return number * power;
	}

}