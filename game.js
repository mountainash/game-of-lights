var _ = require('underscore')._;

var tick = function (worldBools) {
	var sideLength = 7;

	var pointToIndex = function (point) {
		return point.x + (point.y * sideLength);
	}

	var indexToPoint = function (index) {
		var pointX = index % sideLength;
		var pointY = Math.floor(index / sideLength);
		return { x: pointX, y: pointY };
	}

	var pointEquals = function (p1, p2) {
		return p1.x == p2.x && p1.y == p2.y;
	}

	var neighbours = function (p) {
		return [{ x: p.x - 1, y: p.y - 1 }, { x: p.x, y: p.y - 1 }, { x: p.x + 1, y: p.y - 1 },
		{ x: p.x - 1, y: p.y }, { x: p.x + 1, y: p.y },
		{ x: p.x - 1, y: p.y + 1 }, { x: p.x, y: p.y + 1 }, { x: p.x + 1, y: p.y + 1 }]
			.map(wrapPoints);
	};

	var wrapPoints = function (point) {
		return { x: inBound(point.x), y: inBound(point.y) };
	}

	var inBound = function (coord) {
		if (coord == -1) { return sideLength - 1; }
		if (coord >= sideLength) { return coord % sideLength; }
		return coord;
	}

	var livePoints = worldBools.reduce(function (acc, elem, index) {
		if (elem) { acc.push(index); }
		return acc;
	}, []).map(indexToPoint);

	var containsPoint = function (pointList, point) {
		return undefined !== _.find(pointList, _.partial(pointEquals, point));
	};

	var liveNeighbours = function (point, livePoints) {
		return _.filter(neighbours(point), function (neighbour) {
			return containsPoint(livePoints, neighbour);
		});
	};

	var survivors = _.filter(livePoints, function (point) {
		var live = liveNeighbours(point, livePoints).length;
		return live == 2 || live == 3;
	});

	var spawnCandidates = _.filter(_.reduce(livePoints, function (acc, point) {
		return acc.concat(neighbours(point));
	}, []), function (point) {
		return !containsPoint(livePoints, point);
	});

	var uniqueCandidates = _.reduce(spawnCandidates, function (acc, point) {
		if (!containsPoint(acc, point)) { acc.push(point); }
		return acc;
	}, []);

	var spawned = _.filter(uniqueCandidates, function (point) {
		return liveNeighbours(point, livePoints).length == 3;
	});

	var newWorldIndices = survivors.concat(spawned).map(pointToIndex);

	return _.map(_.range(sideLength * sideLength), function (index) {
		return _.contains(newWorldIndices, index);
	});
};

module.exports = tick