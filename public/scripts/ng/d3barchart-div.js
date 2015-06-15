var duration   = 1000,
    transition = 300;

angular.module('myApp')
  .directive('d3barchart', function() {
  return {
    restrict: 'E',
    replace: true,
    template: '<div><div class="wow fadeIn bar-chart" id="social-chart"></div></div>',
    scope: {
      // creates a scope variable in your directive
      // called `dataset` bound to whatever was passed
      // in via the `dataset` attribute in the DOM
      dataset: '=dataset'
    },
    link: function(scope, element, attrs) {
      

      scope.$watch('dataset', function(dataset) {
        var chartData = [];
        //Display everything on 10M 10k and over
        var formatValue = d3.format(".1s"); 

        //initial svg creation
        $("#social-chart").empty()
        var svg = d3.select("#social-chart")
          .append("div")
          .append("ul")
            .attr('class', 'bars');

        //bars
        var ready = false;
        var x,y,color;
        var drawChart = function(callback){
          if (ready){return;}
          ready = true;
        
          color = d3.scale.ordinal()
            .range(["lightblue", "lightgreen"]);

          console.log(chartData) 
          var bars = svg.selectAll(".bar")
            .data(chartData, function(d,i){ return i;})
            .enter().append("li")
            .attr("class", "bar");
          bars.append('i')
            .attr('class', function(d,i){
              return 'fa fa-' + d.name;
            });
          bars.append('div')
            .attr('class', 'bars--item')
            .style('height',function(d,i){
              return d.value + 'px';
            }).append('p')
              .attr('class','value');
          callback()
        }

        if(dataset) {
          chartData = dataset;

          drawChart(function() {
            var rect = svg.selectAll(".bar div").data(dataset)
              .style("height", function(d) {
                return "5px"
              });
            var values = svg.selectAll(".bar div p.value").data(dataset);
            var icons = svg.selectAll(".bar i").data(dataset);

            var delay = function(d, i) { return i * 50; };

            rect.transition().duration(750)
              .style("height", function(d) { 
              var scaleY = d3.scale.linear()
                .domain([0, d.max])
                .range([0, 160]);
              
              console.log(d.value)

              var height = scaleY(d.value);
              return height + 'px'; 
            });

            values.transition().duration(750).text(function(d){
              return formatValue(d.value).toUpperCase();
            });

            icons.transition().duration(750)
              .delay(delay)
              .attr('class', function(d,i){
              return 'fa fa-' + d.name;
            });
          });
          
        }

      });
    }
  }
});




