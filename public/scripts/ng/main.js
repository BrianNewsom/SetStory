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
 
   $routeProvider.when('/lineup/builder', 
    {
      templateUrl: '/scripts/ng/partials/lineup-builder.html', 
      controller: 'LineupBuilderController'
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
            var url = '/api/autocomplete/' + typed;
            
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
            var url = '/api/autocomplete/' + typed;
            
            $http.get(url).success(function(data) {
		    	$scope.events = data;
		    });
            
        };
        $scope.gotoEvent = function(c){	
        	$location.path("/events/" + c);
        };
    
});


myApp.controller('ArtistsController', function($scope,$interval, $filter, $sce,$filter, $rootScope,$routeParams,$location, $http) {
	

	var plays = []
	var months =[];



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

	$scope.formatOutput = function(play){
		return format(play);
	};
	months.push({name:"JAN", plays: Math.round(Math.random()*maxYoutube)});
	months.push({name:"FEB", plays: Math.round(Math.random()*maxYoutube)});
	months.push({name:"APR", plays: Math.round(Math.random()*maxYoutube)});
	months.push({name:"MAY", plays: Math.round(Math.random()*maxYoutube)});


	plays.push({name:'setmine', max:maxSetMine ,months:months});
	plays.push({name:'youtube', max: maxYoutube,months:months});
	plays.push({name:'soundcloud',max:maxSoundCloud, months:months});
	
	$scope.plays = plays;


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
	$scope.choice = $routeParams.name;

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


    $scope.getArtistScore = function() {

    	// var url = '/api/artist/avascore/' + $scope.choice;

    	// console.log(url);

    	// $http.get(url).success(function(metadata) {
    	// 	console.log(metadata);
    	// 	$scope.artistScore = metadata.ava_score || 12345;
    	// });
		$scope.artistScore = 1234567

    }

    $scope.getArtistScore();

    $scope.getArtistSocialData = function() {
    	// var url = '/api/artist/avascore/' + $scope.choice;

    	// console.log(url);

    	// $http.get(url).success(function(metadata) {
    	// 	console.log(metadata);
    	// 	$scope.artistScore = metadata.ava_score || 12345;
    	// });
		$scope.socialData = {
			facebook_followers: 100,
			twitter_followers: 200,
			instagram_followers: 300,
			soundcloud_followers: 400,
			youtube_followers: 500,
		}

    }

    $scope.getArtistSocialData();

    $scope.getArtistMediaData = function() {
    	// var url = '/api/artist/avascore/' + $scope.choice;

    	// console.log(url);

    	// $http.get(url).success(function(metadata) {
    	// 	console.log(metadata);
    	// 	$scope.artistScore = metadata.ava_score || 12345;
    	// });
		$scope.totalPlays = {
			setmine: 1000,
			soundcloud: 2000,
			youtube: 3000,
		}

		$scope.playsOverTime = {
			setmine: [
				2000,
				3000,
				4000,
				5000
			],
			soundcloud: 
				2000,
				3000,
				4000,
				5000
			],
			youtube: 
				2000,
				3000,
				4000,
				5000
			],
		}

    }

    $scope.getArtistMediaData();

	$scope.back = function(){
		$location.path("/");
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
		$scope.eventScore = $scope.event.lineup.length * 13000
	}

	$scope.gotoArtist = function(artist){
		var encoded = encodeURIComponent(artist.artist);
		$scope.gotoArtist = function(c){	
        	$location.path("/artists/" + encoded);
        };
	}


});
myApp.controller('LineupBuilderController', function($scope,$sce,$filter,   $interval, $rootScope,$routeParams,$location, $http) {
	

	$scope.detail = {
		lineup:[]
	};

	$scope.gotoArtist = function(artist){
		var encoded = encodeURIComponent(artist.artist);
		$scope.gotoArtist = function(c){	
        	$location.path("/artists/" + encoded);
        };
	}

		$rootScope.main = true;
    	$rootScope.detail = false;
        $scope.artists = [];
        $scope.events = [];

        // gives another movie array on changez
        $scope.updateArtists = function(typed){
            // MovieRetriever could be some service returning a promise
            var url = '/api/autocomplete/' + typed;
            
            $http.get(url).success(function(data) {
            	if (data){
			    	$scope.artists = data;
		    	}
		    });
            
        };
        $scope.addArtists = function(c){	


        	
        	var url = "api/search/" + c;

	        $http.get(url).success(function(data) {
	            var artist = data[0];
	            processArtistImage(data[0]);
	            $scope.detail.lineup.push(data[0]);
	            var socialMediaURL = "api/artist/social_media/" + c;
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
		$scope.detail.calculateEventScore = function() {
			return $scope.detail.lineup.length * 1300;
		};


			


		$scope.removeArtitst = function(i,a){
			 $scope.detail.lineup.splice(i, 1);
			 calculateSocialAverage();
		};

});

myApp.controller('ConcertsController', function($scope){

});

function processArtistImage(artist){
	if ( artist.imageURL === 'ca6a250fc84f30e571a622185fc8c2c16c7ce64b4.png')
	{
		 artist.imageURL ='';
	}
	else {
		artist.imageURL = 'http://stredm.s3-website-us-east-1.amazonaws.com/namecheap/' +  artist.imageURL;	
	}

}