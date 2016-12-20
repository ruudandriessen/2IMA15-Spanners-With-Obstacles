'use strict';

var Graph = require('../core/Graph');
var Util = require('../core/Util');
var greedy = require('../algorithms/Greedy');
var wspd = require('../algorithms/WSPD');
var d3 = require('d3');
var $ = require('jquery');

class Visualization {
	constructor() {
		this.settings = {
			w: 1920,
			h: 1080,
			t: 1.1
		}

		// var selector = document.getElementById('selectedObstacle');
		// for (var obs in inputData.obstacles){
		// 	if (!this.obstacles){
		// 		this.obstacles = inputData.obstacles[obs];
		// 	}
		// 	var opt = document.createElement("option");
		// 	opt.innerHTML = obs;
		// 	selector.appendChild(opt)
		// }

		this.g = new Graph();
		this.container = d3.select("div#container");
		var aspect = this.settings.w / this.settings.h;

		this.svg = this.container
			.append("svg")
			.attr("width", this.settings.w)
			.attr("height", this.settings.h)
			.attr("ar", aspect)
			.attr("preserveAspectRatio", "xMinYMid")
	  	.attr("viewBox", "0 0 " + this.settings.w + " " + this.settings.h)
	  	.classed("svg-element", true);

		
		$(window).on("resize", function(e) {
			var targetWidth = $("div#container").width();
	    var svg = d3.select(".svg-element");
	    var aspect = svg.attr("ar");
	    var targetHeight = Math.round(targetWidth / aspect)
	    svg.attr("width", targetWidth);
	    svg.attr("height", targetHeight);
		}).trigger("resize");

	  this.lastRun = 0;

	  var that = this;
		this.svg.on("click", function() {
			var coords = d3.mouse(this);
		  var newData= {
				x: Math.round(coords[0]),
		    y: Math.round(coords[1])
		  };
		  var nodes = that.g.nodes;
		  that.g.addNode(nodes.length + 1, newData.x, newData.y);
		  that.recalculate();
		});

		for (var i = 0; i < 10; i++) {
			this.g.addNode(this.g.nodes.length, Util.getRandomArbitrary(0, this.settings.w), Util.getRandomArbitrary(0, this.settings.h))
		}
		this.recalculate();
	}

	// Update the visualization
	update() {
		var data = this.g;

		this.svg
			.selectAll("circle")
			.remove();

		this.svg
			.selectAll("line")
			.remove();

		this.svg
			.selectAll("square")
			.remove();
			
		this.svg
			.selectAll("polyline")
			.remove();

		this.svg
			.selectAll("text")
			.remove();


		//obstacles
		// this.svg.selectAll("polyline")
		// 	.data(this.obstacles)
		// 	.enter()
		// 	.append("polyline")
		// 	.attr("points", function(d){
		// 		var str = "";
		// 		for (var i = 0; i < d.length; i++){
		// 			str += d[i].x + "," + d[i].y + " ";
		// 		}
		// 		//close loop
		// 		str += d[0].x + "," + d[0].y;
		// 		return str;
		// 	})
		// 	.attr("stroke-width", "1px")
		// 	.attr("stroke", "rgb(100,100,100)")
		// 	.attr("fill", "rgb(220,220,220)");


		var nodes = this.svg
			.selectAll("circle")
			.data(data.nodes)
			.enter()
			.append("circle")
			.attr("cx", function (d) { return d.x; })
			.attr("cy", function (d) { return d.y; })
			.attr("r", function (d) { return 2; })
			.style("fill", "blue");

		//Add the SVG Text Element to the svgContainer
		var text = this.svg.selectAll("text")
			.data(data.nodes)
			.enter()
			.append("text")
			.attr("x", function(d) { return d.x - 3; })
			.attr("y", function(d) { return d.y - 3; })
			.text( function (d) { return d.id })
			.attr("font-family", "sans-serif")
			.attr("font-size", "12px")
			.attr("fill", "red");

		var edges = this.svg
			.selectAll("line")
			.data(data.edges)
			.enter()
			.append("line")
			.attr("x1", function (d) { return d.source.x; })
			.attr("y1", function (d) { return d.source.y; })
			.attr("x2", function (d) { return d.target.x; })
			.attr("y2", function (d) { return d.target.y; })
			.style("stroke", "grey" )
	    .attr( "opacity", 1 )

		// var rects = this.svg
		// 	.selectAll("rect")
		// 	.data(data.rects)
		// 	.enter()
		// 	.append("rect")
		// 	.attr("x", function (d) { return d.x; })
		// 	.attr("y", function (d) { return d.y; })
		// 	.attr("width", function (d) { return d.width; })
		// 	.attr("height", function (d) { return d.height; })
		// 	.style("stroke", "grey" )
		// 	.style("fill", "none" )
		// 	.style("opacity", 0.1 )

		// var circles = this.svg
		// 	.selectAll("circle")
		// 	.data(data.circles)
		// 	.enter()
		// 	.append("circle")
		// 	.attr("cx", function (d) { return d.x; })
		// 	.attr("cy", function (d) { return d.y; })
		// 	.attr("r", function (d) { return d.r == 0 ? 5 : d.r; })
		// 	.style("stroke", function(d) { return d.color } )
		// 	.style("fill", "none" )
		// 	.style("opacity", "1" ) 
		// 	.attr( "opacity", 0.2 )
		// 	.transition()
		// 		.delay(function(d, i) { return i * 100 })
	 //    	.duration(100)
	 //    	.attr( "opacity", 1 );


	  $("#d_nodes").html(data.nodes.length);
	  $("#d_edges").html(data.edges.length);
	  $("#d_weight").html(data.totalWeight().toFixed(3));
	  $("#d_time").html(this.lastRun.toFixed(0) + " ms");
	}

 	recalculate() {
	  this.g.clearEdges();

	  var t0 = performance.now();
		greedy.calculate(this.g, this.settings, this.obstacles);
		// wspd(this.g, this.settings);
		var t1 = performance.now();
		this.lastRun = t1 - t0;

	  this.update();

	}
	// Update the settings based on the input values
	updateSettings() {
		tvalue = parseFloat(document.getElementById('tvalue').value);	
		selectedObstacle = document.getElementById('selectedObstacle').value;
		newObstacles = inputData.obstacles[selectedObstacle];
		if (newObstacles){
			this.obstacles = newObstacles;
		}
		if (tvalue != NaN && tvalue >= 1) {
			this.settings.t = tvalue;
		}


		this.recalculate();
	}

	// Clear all points from the graph
	clearPoints(){
		this.g.nodes = [];
		this.recalculate();
	}
};

module.exports = Visualization;