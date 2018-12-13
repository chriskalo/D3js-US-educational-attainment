(function(d3) {
	"use strict";
	var dataset = [
		{ label: "Ελλάς", count: 40.2, enabled: false },
		{ label: "Βόρεια", count: 41.3, enabled: true },
		{ label: "Κεντρική", count: 35.5, enabled: true },
		{ label: "Αττική", count: 40.6, enabled: true },
		{ label: "Αιγ,Κρήτη", count: 45.7, enabled: true }
	];

	var totalObj = dataset.length;

	var sumDatasetCount = (function() {
		var totalItems = 0;
		for (var i = 0; i < dataset.length; i++) {
			totalItems += dataset[i].count;
		}
		return totalItems;
	})();

	var svgCanvasWidth = 480,
		svgCanvasHeight = 320,
		donutRadius = Math.min(svgCanvasWidth, svgCanvasHeight) / 2,
		donutWidth = 42;

	//d3js color palette: https://bl.ocks.org/aaizemberg/78bd3dade9593896a59d
	//var color = d3.scale.category20c();

	//my custom color palette
	var color = d3.scale
		.ordinal()
		.range([
			"#141D2B",
			"#1D3440",
			"#4F969C",
			"#5DC9B3",
			"#64D9A0",
			"#2FA197",
			"#35B6C4"
		]);

	//Create SVG wrapper
	var svg = d3
		.select("#donut")
		.append("svg")
		.attr("width", svgCanvasWidth)
		.attr("height", svgCanvasHeight)
		.append("g")
		.attr("id", "containerwr")
		//.attr("transform", "translate(" + svgCanvasWidth / 2 + "," + svgCanvasHeight / 2 + ")");//align donut: center
		.attr("transform", "translate("+donutRadius+","+donutRadius+")");//align donut: left
	
	// Define the donutRadius
	var arc = d3.svg
		.arc()
		.innerRadius(donutRadius - donutWidth) // Make PIE chart a Donut
		.outerRadius(donutRadius);

	// Define the angles
	var donut = d3.layout
		.pie()
		.value(function(d) {
			return d.count;
		})
		.sort(null);

	// Define the PIE chart
	var path = svg
		.selectAll("path")
		.data(donut(dataset))
		.enter()
		.append("path")
		.attr("d", arc)
		.attr("fill", function(d, i) {
			return color(d.data.label);
		})
		.each(function(d) {
			this._current = d;
		});

	// Define the Legend
	var legendRectSize = 18, legendSpacing = 4;

	var legend = svg
		.selectAll(".legend")
		.data(color.domain())
		.enter()
		.append("g")
		.attr("class", "legend")
		.attr("transform", function(d, i) {
			var height = legendRectSize + legendSpacing,
				offset = height * color.domain().length / 2,
				//horz = -2 * legendRectSize, //legend inside donut
				horz = donutRadius+50, 
				vert = i * height - offset;
			return "translate(" + horz + "," + vert + ")";
		});

	// Legend Content
	/*
	legend.append('legendColorWr')
	.attr('width', legendRectSize)
	.attr('height', legendRectSize)
	*/

	var legendCircleSize = 10;
	
	//create inner donuts
	legend
		.append("circle")
		.attr("height", legendCircleSize)
		.attr("height", legendCircleSize)
		.attr("cx", function(d, i) { //position horizontally
			//console.log(i)
			return 1 * i;
		})
		.attr("cy", function(d, i) { //position vertically
			//console.log(i)
			return legendCircleSize / 2 * i;
		})
		.attr("r", 9)
		.style("fill", color)
		.style("stroke", color)
		.on("click", function(label) {
			console.log(label);
			var legendColorWr = d3.select(this);
			var enabled = true;
			var totalEnabled = d3.sum(
				dataset.map(function(d) {
					if (d.enabled) {
						return 1;
					} else {
						return 0;
					}
				})
			);
			
			//toggle & animate sectors from parent donut
			if (legendColorWr.attr("class") === "disabled") {
				legendColorWr.attr("class", "");
			} else {
				if (totalEnabled < 2) {
					return;
				}
				legendColorWr.attr("class", "disabled");
				enabled = false;
			}

			donut.value(function(d) {
				if (d.label === label) {
					d.enabled = enabled;
				}
				if (d.enabled) {
					return d.count;
				} else if (!d.enabled) {
					return 0;
				}
			});

			path = path.data(donut(dataset));

			path.transition().duration(600).attrTween("d", function(d) {
				var interpolate = d3.interpolate(this._current, d);
				this._current = interpolate(0);
				return function(t) {
					return arc(interpolate(t));
				};
			});
		});

		//Create text node 
		legend
		.append("text")
		.attr('class','text_rep')
		.attr('text-anchor',"start")
		.attr("dy", "-2px")
		.attr("x", legendRectSize + legendSpacing)
		.attr("y", function(d, i) {
			//draw each circle (i)
			var i = i + 1;
			return legendCircleSize / 2 * i;
		})
		.style("font-family", "arial, sans-serif")	
		.style("font-size", "12px")
		.style("fill", "#2c3e50");
		
		//Create tspan nodes
		legend
		.select('text')	
		.data(dataset)	
		.append("tspan")
		.style("font-weight", "bold")
		.attr("fill", function(d, i) {
			return color(d.label);
		})		
		.text(function(d) {
			return d.count + '%';
		})

	
		legend
		.select('text')	
		.data(dataset)	
		.append("tspan")
		.text(function(d) {
			//add text nodes 1st so I could get later the text node width
			return ' '+d.label;
		});

})(window.d3);
