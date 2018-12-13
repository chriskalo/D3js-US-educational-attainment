//JSON data
var data=[{"date":2013,"Απασχολούμενοι":3490841,"Άνεργοι":1347296,"Οικονομικά μη ενεργοί":3336120}, {"date":2014,"Απασχολούμενοι":3551069,"Άνεργοι":1249831,"Οικονομικά μη ενεργοί":3322864},{"date":2015,"Απασχολούμενοι":3626755,"Άνεργοι":1189544,"Οικονομικά μη ενεργοί":3261007},
{"date":2016,"Απασχολούμενοι":3702270,"Άνεργοι":1112259,"Οικονομικά μη ενεργοί":3224767}]

//array of keys except date
var keys = d3.keys(data[0]).filter(function(key) { return key !== "date"; });

data.forEach(function(d) {
   var y0 = 0;
    d.key = keys.map(function(name) { 
      console.log("printing the name: "+name+ " "+d[name])
      return {name: name, y0:y0, y1: y0 += +d[name],value: +d[name]}; });
    d.total = d.key[d.key.length - 1].y1;
});

// Set our margins
var margin = {
    top: 20,
    right: 20,
    bottom: 30,
    left: 60
},
width = 700 - margin.left - margin.right,
height = 350 - margin.top - margin.bottom;
yGroupMax = d3.max(data, function(d) { return d3.max(d.key, function(d) { return d.value; }); }),
yStackMax = d3.max(data, function (d) {return d.total;});

var x0 = d3.scale.ordinal()
          .domain(data.map(function(d) { return d.date; }))
          .rangeRoundBands([0, width], .1);

var x1 = d3.scale.ordinal()
            .domain(keys).rangeRoundBands([0, x0.rangeBand()]);

var y = d3.scale.linear()
    .domain([0, yStackMax])
    .range([height, 0]);

var color = d3.scale.ordinal()
    .range(["#82af6f", "#525252", "#d15b47"]);

var xAxis = d3.svg.axis()
    .scale(x0)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickFormat(d3.format(".2s"));

// Add our chart to the #chart div
var svg = d3.select("#change-chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("count");

  var date = svg.selectAll(".date")
      .data(data)
      .enter().append("g")
      .attr("class", "g")
      .attr("transform", function(d) { return "translate(" + x0(d.date) + ",0)"; });

 var rect=date.selectAll("rect")
    .data(function (d) {return d.key;})
    .enter().append("rect")
    .attr("width", x0.rangeBand())
    .attr("x", function(d) { return x0(d.name); })
    .attr("y", function (d) {return y(d.y1);})
    .attr("height", function (d) {return y(d.y0) - y(d.y1);})
    .style("fill", function (d) {return color(d.name);});

//for showing the legend
var legend = svg.selectAll(".legend")
    .data(color.domain().slice().reverse())
    .enter().append("g")
    .attr("class", "legend")
    .attr("transform", function (d, i) {
    return "translate(0," + i * 20 + ")";
});

legend.append("rect")
    .attr("x", width - 18)
    .attr("width", 18)
    .attr("height", 18)
    .style("fill", color);

legend.append("text")
    .attr("x", width - 24)
    .attr("y", 9)
    .attr("dy", ".35em")
    .style("text-anchor", "end")
    .text(function (d) {
    return d;
});


d3.selectAll("input").on("change", change);

var timeout = setTimeout(function() {
  d3.select("input[value=\"grouped\"]").property("checked", true).each(change);
}, 2000);

function change() {
  clearTimeout(timeout);
  if (this.value === "grouped") transitionGrouped();
  else transitionStacked();
}

function transitionGrouped() {
 y.domain([0, yGroupMax]);
  svg.select(".y.axis")
    .call(yAxis);
  rect.transition()
      .duration(500)
      .delay(function(d, i) { return i * 10; })
      .attr("width", x1.rangeBand())
      .attr("x", function(d) { return x1(d.name); })
      .attr("y", function(d) { return y(d.value); })
      .attr("height", function(d) { return height - y(d.value); })
      .style("fill", function(d) { return color(d.name); });
  
}

function transitionStacked() {
  y.domain([0, yStackMax]); 
  svg.select(".y.axis")
    .call(yAxis);
   rect.transition()
      .duration(500)
      .delay(function(d, i) { return i * 10; })
      .attr("width", x0.rangeBand())
      .attr("x", function(d) { return x0(d.name); })
      .attr("y", function (d) {return y(d.y1);})
      .attr("height", function (d) {return y(d.y0) - y(d.y1);})
      .style("fill", function (d) {return color(d.name);});
}
