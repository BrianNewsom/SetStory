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
  
   $routeProvider.when('/retailers', 
    {
      templateUrl: '/scripts/ng/partials/retailers.html', 
      controller: 'RetailersController'
    });

   $routeProvider.when('/events/:name', 
    {
      templateUrl: '/scripts/ng/partials/concerts.html', 
      controller: 'EventsController'
    });
 
}]);

myApp.controller('RetailersController', function($scope,$rootScope,$location,$http){
	$scope.largeCurrentFootTraffic = 8; 
	$scope.smallYesterdayFootTraffic = 4; 
	$scope.smalltotalFootTraffic = 2300; 
});

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
        	console.log(data)
	    	$scope.events = data;
	    	console.log($scope.events)
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

    	var url = '/api/artist/ava/bookingvalue/' + $scope.choice;

    	$http.get(url).success(function(data) {
    		$scope.artistScore = data.response.raw_score || "No Score";
    	});
		

    }
    // Openaura Social Media

    // $scope.getArtistSocialMedia() = function() {
    // 	var url = "/api/getSocialMedia/?query=" + $scope.choice

    // 	$http.get(url).success(function(data) {
    // 		console.log(data)
    // 	})
    // }

    // Setstory Social Media

    // $scope.getArtistSocialMedia() = function() {
    // 	var url = "/api/getSocialMedia/?query=" + $scope.choice

    // 	$http.get(url).success(function(data) {
    // 		console.log(data)
    // 	})
    // }

	// Setmine Social Media

	$scope.scaleHeight = function(item, play){
		var scaleY = d3.scale.linear()
              .domain([0, item.max])
              .range([0, 160]);
        var styles = {height: scaleY(play) + "px"};
		return styles;
	};

    $scope.getArtistSocialMedia = function() {
    	var url = '/api/artist/social/' + $scope.choice;
    	console.log(url)
    	$http.get(url).success(function(data) {
    		console.log(data)
    		$scope.artistSocialSet = data.response
    	})

	}

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

	$scope.getArtistData = function(){
	    var url = "api/artist/info/musicgraph/" + $scope.choice;
	    console.log(url)
	    $http.get(url).success(function(data) {
	    	console.log(data)

	        $scope.artistData = data;
	    })

	}

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
		if (media.type === 'image')
		{
			if (parseInt(media.width) >= 620 && parseInt(media.width) <= 800){
				return true;
			}
			else return false;
		}
		else {return false; }

	};

	$scope.getArtistScore();

    $scope.getArtistSocialMedia();

	var format = d3.format('.1s');

	$scope.getArtistPhoto();

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
	
	var url = "/api/story/"+ $scope.choice; 
	
	$http.get(url).success(function(data) {
		$scope.sets = data;
	});

	$scope.choice = decodeURIComponent($scope.choice);

});

myApp.controller('EventsController', function($interval, $scope,$sce,$filter, $rootScope,$routeParams,$location, $http) {
    
	$scope.eventName = $routeParams.name;
	
	var loadData = function(url){
		console.log(url)
		$http.get(url).success(function(data) {
			console.log(data)
			$scope.event = data.response;

			$scope.calculateEventScore();
			$scope.calculateLineupScore();
			$scope.getLineupSocialMedia();

		});
	}

	loadData("/api/lineup/event/" + $scope.eventName)

	// Pulls from latest database values from setmine/api/v/7/artist/metrics/social/:artistName for all artists in lineup.
	// If none found, pull from the route that live generates

	$scope.calculateEventScore = function() {
		$scope.eventScore = 94;
		$scope.venueCapacity = "131K"
		$scope.trendingHashtags = 4
	}

	$scope.calculateLineupScore = function() {
		var lowestBooking = $scope.event.lineup[0].booking_value;
		var highestBooking = $scope.event.lineup[$scope.event.lineup.length-1].booking_value;
		var totalBooking = 0;

		for (var i = 0; i < $scope.event.lineup.length; i++) {
			totalBooking += $scope.event.lineup[i].booking_value
			if($scope.event.lineup[i].booking_value < lowestBooking) {
				lowestBooking = $scope.event.lineup[i].booking_value
			}
			if($scope.event.lineup[i].booking_value > highestBooking) {
				highestBooking = $scope.event.lineup[i].booking_value
			}
			if ( $scope.event.lineup[i].artistimageURL === 'ca6a250fc84f30e571a62286fc8c2c16c7ce64b4.png')
			{
				 $scope.event.lineup[i].artistimageURL = '';
			}
			else {
				 $scope.event.lineup[i].artistimageURL = 'http://stredm.s3-website-us-east-1.amazonaws.com/namecheap/' +  $scope.event.lineup[i].artistimageURL;	
			}

					
		};

		$scope.event.totalBooking = totalBooking;
		$scope.event.averageBooking = parseInt(totalBooking/$scope.event.lineup.length);
		$scope.event.lowestBooking = lowestBooking;
		$scope.event.highestBooking = highestBooking;

	}

	$scope.getLineupSocialMedia = function() {
		var url = '/api/lineup/social/' + $scope.event.id;
		$http.get(url).success(function(data) {
			var totalSMR = 0;
			$scope.eventSocialSet = data.response
			console.log(data.response)
			for(var i in data.response) {
				totalSMR += data.response[i].value
			}
			$scope.totalSocialMediaReach = totalSMR;
		})
		
	}

	$scope.updateLineupSocialMedia = function(add) {
		var url = '/api/lineup/social/' + $scope.event.id;
		var new_lineup = []
		for(var i in $scope.event.lineup) {
			new_lineup.push($scope.event.lineup[i].id)
		}
		$http.post(url, {
			new_lineup: new_lineup
		}).success(function(data) {
			console.log(data)
			var newSMR = 0;
			for(var i in data.response) {
				for(var j in $scope.eventSocialSet) {
					if($scope.eventSocialSet[j].name == i) {
						if(add) {
							$scope.eventSocialSet[j].value += (data.response[i].length > 0)? data.response[i][i + '_followers'] : 0
							newSMR += (data.response[i].length > 0)? parseInt(data.response[i][0][i + '_followers']) : 0
						} else {
							$scope.eventSocialSet[j].value -= (data.response[i].length > 0)? data.response[i][i + '_followers'] : 0
							newSMR += (data.response[i].length > 0)? parseInt(data.response[i][0][i + '_followers']) : 0
						}
						
					}
				}

			}
			if(add) {
				$scope.totalSocialMediaReach += newSMR;
			} else {
				$scope.totalSocialMediaReach -= newSMR;
			}
		})
		
	}

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
        var url = '/api/autocomplete/artists/' + typed;
        
        $http.get(url).success(function(data) {
        	if (data) {
        		var autocompleteArtistOptions = data
        		var lineup = $scope.event.lineup

        		// Splices allArtists and returns the artists not already in lineup

        		for(var i in lineup) {
        			var index = autocompleteArtistOptions.indexOf(lineup[i].artist)
        			if(index > -1) {
        				autocompleteArtistOptions.splice(index, 1)
        			}
        		}

		    	$scope.artists = autocompleteArtistOptions;
	    	}
	    });
        
    };
    $scope.addArtists = function(artistName){

    	var url = "api/artist/info/setmine/" + artistName;

        $http.get(url).success(function(data) {
        	console.log(data)
            var artist = data[0];
            processArtistImage(data[0]);
            $scope.event.lineup.unshift(data[0]);
            $scope.calculateEventScore();
            $scope.updateLineupSocialMedia(true);
            
        });
        $scope.choice = '';
        $scope.artists= [];

	};

	$scope.removeArtist = function(i,a){
		 $scope.event.lineup.splice(i, 1);
         $scope.calculateEventScore();
         $scope.updateLineupSocialMedia(false);

	};



});



function processArtistImage(artist){
	if (artist){

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