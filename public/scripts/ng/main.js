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


myApp.controller('ArtistsController', function($scope,$sce,$filter, $rootScope,$routeParams,$location, $http) {
	
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
    	var url = '/coachellaPopularity.json';

    	$http.get(url).success(function(metadata) {
    		$scope.artistScore = " - ";
    		for(var i in metadata) {
    			if(metadata[i].artist_name == $scope.choice) {
    				var score = Math.floor(metadata[i].popularity*10000);
    				$scope.artistScore = score;
    			}
    		}
    	});
    }

    $scope.getArtistScore();

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
    [{"number":1, "value":20},
    {"number":2, "value":20},
    {"number":3, "value":20},
    {"number":4, "value":20},
    {"number":4, "value":20}];

    var names = ["google-plus", "stumbleupon","dribbble", "facebook", "twitter", "youtube", "vimeo", "soudcloud"];
	$interval(function(){
		  var data = [];
      for(var i = 0; i < names.length; i++) {
        data.push({"name": names[i], "number":i, "value": Math.floor(Math.random()*900000)});
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

	// var getSocialScore= function(lineup) {

	// 	// TODO: Get social route from Setmine and Openaura
		 
	// 	// $http.get(url).success(function(data) {
			
	// 	// 	$scope.socialset = [{"number":1, "value":900000},
	// 	// 		{"number":2, "value":900000},
	// 	// 		{"number":3, "value":900000},
	// 	// 		{"number":4, "value":900000}];
			
	// 	// });

	// 	$scope.socialset = [{"number":1, "value":900000},
	// 		{"number":2, "value":900000},
	// 		{"number":3, "value":900000},
	// 		{"number":4, "value":900000}];
	// }

	loadData("/api/lineup/event/" + $scope.eventName)
	// getSocialScore($scope.event.lineup)


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

      $scope.socialset =
        [{"number":1, "value":900000},
        {"number":2, "value":900000},
        {"number":3, "value":900000},
        {"number":4, "value":900000}];

  $interval(function(){
 		  var data = [];
          for(var i = 0; i < 4; i++) {
            data.push({"number":i, "value": Math.floor(Math.random()*900000)});
          }
          $scope.socialset = data;

  }, 3000);
        
			


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