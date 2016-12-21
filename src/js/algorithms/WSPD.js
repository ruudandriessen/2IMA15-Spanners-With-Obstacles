'use strict';

var Util = require('../core/Util');
var Quadtree = require('../core/Quadtree');
var shortest = require('./Dijkstra');
var debug;

class WSPD {
	static calculate(graph, settings) {
		// Build quad tree
		var pointQuad = true;
		var bounds = {
		    x:0,
		    y:0,
		    width: settings.w,
		    height: settings.h
		}
		debug = {circles: [], rects: []};
		var quad = new QuadTree(bounds, pointQuad, 9999999, 1);
		quad.insert(graph.nodes);

		var t = settings.t
		var s = 4 * (t+1)/(t-1)

		var r = WSPD.wsPairs(quad.root, quad.root, quad, s);
		
		var map2 = {};
		for (var key in r) {
			var pair = r[key];
			var repu = WSPD.rep(pair.u);
			var repv = WSPD.rep(pair.v);

			if (!WSPD.isLeaf(pair.u))
				repu.color = "green";
			if (!WSPD.isLeaf(pair.v))
				repv.color = "green";
			
			map2[repu.id] ? map2[repu.id].push(repv.id) : map2[repu.id] = [repv.id];
			map2[repv.id] ? map2[repv.id].push(repu.id) : map2[repv.id] = [repu.id];
			// console.log(repu.id, repv.id)
			graph.addEdge(repu, repv, Util.distance(repu, repv));
		}
		console.log(map2);
		return debug;
	}

	// Check if this node is a leaf
	static isLeaf(u) {
		return u.nodes.length == 0;
	}

	static distance(c1, c2) {
		var dx = Math.pow(c1.x - c2.x, 2);
		var dy = Math.pow(c1.y - c2.y, 2);
		var r = Math.pow(c1.r + c2.r, 2);
		var result = dx + dy - r < 0 ? 0 : Math.sqrt(dx + dy - r);
		return result;
	}
	// Creates the bounding circle of a node u
	static createCircle(u, depth, leaves) {
		if (u._depth > depth) {
			return WSPD.createCircle(u.parent, depth, leaves);
		}
		return {
			x: leaves ? WSPD.rep(u).x : u._bounds.x + u._bounds.width / 2,
			y: leaves ? WSPD.rep(u).y : u._bounds.y + u._bounds.height / 2,
			r: leaves ? 0 : Math.sqrt(Math.pow(u._bounds.height, 2), Math.pow(u._bounds.width, 2))
		}
	}

	// Well seperated
	static seperated(u, v, s) {
		var leaves = false;
		if (WSPD.isLeaf(u) && WSPD.isLeaf(v)) {
			leaves = true;
		}
		var depth = u._depth > v._depth ? v._depth : u._depth;

		var cu = WSPD.createCircle(u, depth, leaves);
		var cv = WSPD.createCircle(v, depth, leaves);

		var maxr = cu.r > cv.r ? cu.r : cv.r;
		cu.r = maxr;
		cv.r = maxr;

		var d = WSPD.distance(cu, cv);
		var result =  d >= s * maxr;
		if (result) {
			cu.color = result ? "black" : "red";
			cv.color = result ? "black" : "red";
			debug.circles.push(cu);
			debug.circles.push(cv);

			if (!leaves) {
				// data.circedge.push({x1: cu.x, x2: cv.x, y1: cu.y, y2: cv.y })
			}
		}
		return result;
	}

	static isempty(u) {
		return Array.isArray(u) && u.length == 0;
	}
	// Representative of u
	static rep(u) {
		if (WSPD.isLeaf(u)) {
			// If u is leaf
			if (u.children.length > 0) {
				// It has only one child, which is therefore the representative
				return u.children[0];
			}
			else {
				// Or it is empty, meaning we return the empty set
				return [];
			}
		} else {
			// If it is not a leaf
			for (var key in u.nodes) {
				var node = u.nodes[key];
				var r = WSPD.rep(node);

				// Find it's first non empty subnode
				if (!WSPD.isempty(r)) {
					// Our representative is this nodes representative
					return r;
				}
			}
		}
		return [];
	}

	static union(r1, r2) {
		if (r1.length == 0) {
			r1 = r1.concat(r2);
		}
		for (var k1 in r1) {
			var v1 = r1[k1];
			for (var k2 in r2) {
				var v2 = r2[k2];
				if ((v1[0] == v2[0] && v1[1] == v2[1]) || (v1[0] == v2[1] && v1[1] == v2[0])) {
					continue;
				}
				r1.push(v2);
			}
		}
		return r1;
	}

	// ws pairs function
	static wsPairs(u, v, T, s) {
		var result = [];
		debug.rects.push(u._bounds)
		debug.rects.push(v._bounds)
		if (WSPD.isempty(WSPD.rep(u)) || WSPD.isempty(WSPD.rep(v)) || (WSPD.isLeaf(u) && WSPD.isLeaf(v) && u == v)) {
			result = [];
		} else if (WSPD.seperated(u, v, s)) {
			return [{u, v}];
		} else {
			if (u._depth > v._depth) {
				var temp = v;
				v = u;
				u = temp;
			}
			var childNodes = u.nodes;
			for (var key in childNodes) {
				var childNode = childNodes[key];
				var r = WSPD.wsPairs(childNode, v, T, s);
				result = result.concat(r);
				// result = WSPD.union(result, r);
			}
		}		
		return result;
	}
};

module.exports = WSPD;