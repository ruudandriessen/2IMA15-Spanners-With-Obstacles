var w = 1000;
var h = 600;

var svg = d3.select("#view").append("svg").attr("width", w).attr("height", h).style("border", "1px solid black");

function update() {
	var nodes = svg
		.selectAll("circle")
		.data(data.nodes)
		.enter()
		.append("circle");

	var nodeAttr = nodes
		.attr("cx", function (d) { return d.x; })
		.attr("cy", function (d) { return d.y; })
		.attr("r", function (d) { return 2; })
		.style("fill", function(d) { return "blue"; });
}

update();

svg.on("click", function() {
	var coords = d3.mouse(this);
    var newData= {
		x: Math.round(coords[0]),
        y: Math.round(coords[1])
    };
    data.nodes.push(newData);
    update();
});