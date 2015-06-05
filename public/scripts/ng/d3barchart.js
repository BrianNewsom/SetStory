var duration   = 1000,
    transition = 300;

angular.module('myApp')
  .directive('d3barchart', function() {
  return {
    restrict: 'E',
    replace: true,
    template: '<div><div class="wow fadeIn bar-chart" id="test-chart"></div></div>',
    scope: {
      // creates a scope variable in your directive
      // called `dataset` bound to whatever was passed
      // in via the `dataset` attribute in the DOM
      dataset: '=dataset'
    },
    link: function(scope, element, attrs) {
      var chartData = [];
      var w = 515;
      var h = 660;
      

    

      //initial svg creation
      var svg = d3.select("#test-chart")
        .append("svg")
          .attr("width", 815 + 40)
          .attr("height", h + 20)
        .append("g")
          .attr("transform", "translate(20,0)");

      //bars
      var ready = false;
      var x,y,color;
      var drawChart = function(){
        if (ready){return;}
        ready = true;
      
      color = d3.scale.ordinal()
        .range(["lightblue", "lightgreen"]);
        var bars = svg.selectAll(".bar")
        .data(chartData, function(d,i){ return i;})
        .enter().append("g")
          .attr("class", "bar")
          .attr("transform", function(d, i) 
            { return "translate(" + x(i+1) + "," + 0 + ")"; });
        //bar rectangles
        bars.append("rect")
          .attr("fill", function(d, i) { return color(i%2); })
          .attr("width", x.rangeBand())
          .attr("height", function(d) { return y(d.value); });
        //bar labels
        bars.append("text")
          .attr("x", 0 + x.rangeBand() / 2)
          .attr("y", function(d) { return y(d.value); })
          .attr("dy", -6)
          .attr("dx", ".35em")
          .attr("text-anchor", "end")
          .text(function(d) { return d.value; });

        
      }



        scope.$watch('dataset', function(dataset) {
          console.log(dataset);

          chartData = dataset;
          
          //SetDimensions
          x = d3.scale.ordinal()
            .domain(d3.range(chartData.length))
            .rangeBands([0, h], 0.1);
          y = d3.scale.linear()
            .domain([0, d3.max(chartData, function(d) { return d.value; })])
            .range([0, w]);

          drawChart();
           var rect = svg.selectAll(".bar rect").data(dataset);
          var text = svg.selectAll(".bar text").data(dataset);
          var delay = function(d, i) { return i * 50; };
          rect.transition().duration(750)
            .delay(delay)
            .attr("height", function(d) { return y(d.value); });
          text.transition().duration(750)
            .delay(delay)
            .attr("y", function(d) { return y(d.value); })
            .text(function(d) { return d.value; });
          
      });

     
        
    }
  }

    


});




