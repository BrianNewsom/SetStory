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
      //Display everything on 10M 10k and over
      var formatValue = d3.format(".1s"); 

    

      //initial svg creation
      var svg = d3.select("#test-chart")
        .append("div")
          .attr("width", 815 + 40)
          .attr("height", h + 20)
        .append("ul")
          .attr('class', 'bars');

      //bars
      var ready = false;
      var x,y,color;
      var drawChart = function(){
        if (ready){return;}
        ready = true;
      
      color = d3.scale.ordinal()
        .range(["lightblue", "lightgreen"]);


        var bars = 
        svg.selectAll(".bar")
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
          
        
        
      }



        scope.$watch('dataset', function(dataset) {

          chartData = dataset;
          
          //SetDimensions
          x = d3.scale.ordinal()
            .domain(d3.range(chartData.length))
            .rangeBands([0, h], 0.1);

          drawChart();
           var rect = svg.selectAll(".bar div").data(dataset);
           var values = svg.selectAll(".bar div p.value").data(dataset);
           var icons = svg.selectAll(".bar i").data(dataset);

          

          var delay = function(d, i) { return i * 50; };

          rect.transition().duration(750)
            .style("height", function(d) { 
            
            var scaleY = d3.scale.linear()
              .domain([0, d.max])
              .range([0, 160]);
            
            var height = scaleY(d.value);
              if (height < 40){
                height = 40;
              }
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
  }

    


});




