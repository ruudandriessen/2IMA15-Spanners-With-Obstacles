'use strict'

var Node = require('./Node');

class Graph {
	constructor() {
		this.nodes = [];
		this.edges = [];
	}

	load(data) {
		for (var key in data.nodes) {
			var node = data.nodes[key];
			this.addNode(node.id, node.x, node.y);
		}
	}

	addNode(id, x, y) {
		this.nodes.push(new Node(id, x, y, this));
	}

	addObstacleNode(id, x, y) {
		this.nodes.push(new Node(id, x, y, this, true));
	}

	copy(graph, obstacle) {
		var size = this.nodes.length;
		for (var key in graph.nodes) {
			var node = graph.nodes[key];
			var id = node.id;
			var x = node.x;
			var y = node.y;
			if (obstacle) {
				this.addObstacleNode(size + id, x, y);
			} else {
				this.addNode(size + id, x, y);
			}
		}

		for (var key in graph.edges) {
			var edge = graph.edges[key];
			var source = this.nodes[size + edge.source.id];
			var target = this.nodes[size + edge.target.id];
			var weight = edge.weight;
			this.addEdge(source, target, weight);
		}
	}

	addEdge(source, target, weight) {
		var newEdge = {source: source, target: target, weight: weight};
		source.addEdge(newEdge)
		target.addEdge(newEdge)
		this.edges.push(newEdge);
	}

	totalWeight() {
		var sum = 0;
		for (var key in this.edges) {
			sum += this.edges[key].weight
		}
		return sum;
	}

	dimensions() {
		var maxX = 0;
		var maxY = 0;
		var minX = 999999999999999999999;
		var minY = 999999999999999999999;
		for (var key in this.nodes) {
			var node = this.nodes[key];
			if (node.x > maxX) {
				maxX = node.x;
			}
			if (node.y > maxY) {
				maxY = node.y;
			}
			if (node.x < minX) {
				minX = node.x;
			}
			if (node.y < minY) {
				minY = node.y;
			}
		}
		return {xmax: maxX, ymax: maxY, xmin: minX, ymin: minY}
	}

	clearEdges() {
		for (var key in this.nodes) {
			var n = this.nodes[key];
			n.edges = [];
		}
		this._edges = [];
	}

	set nodes(n) {
    this._nodes = n;
  }
	get nodes() {
    return this._nodes;
  }

  set edges(e) {
  	this._edges = e;
  }
  get edges() {
  	return this._edges;
  }
  toJSON() {
  	var nodes = [];
  	for (var key in this.nodes) {
  		var node = this.nodes[key];
  		nodes.push({id: node.id, x: node.x, y: node.y})
  	}
  	var edges = [];
  	for (var key in this.edges) {
  		var edge = this.edges[key];
  		edges.push({
  			source: {id: edge.source.id, x: edge.source.x, y: edge.source.y}, 
  			target: {id: edge.target.id, x: edge.target.x, y: edge.target.y}, 
  			weight: edge.weight
  		});
  	}

		return {
			nodes: nodes,
			edges: edges
		}
  }
};

module.exports = Graph;