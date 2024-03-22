/** @param {H.service.Platform} platform */
var apikey = "B71DvfBZ9Q5ABZRWhDBqAGyEZY9krolmeL3X2Pe59X4";
var mapContainer = document.getElementById("map");
var platform = new H.service.Platform({
	apikey: apikey,
});
var defaultLayers = platform.createDefaultLayers();
var map = new H.Map(mapContainer, defaultLayers.vector.normal.map, {
	zoom: 10,
	center: { lat: 37.7397, lng: -121.4252 },
	pixelRatio: window.devicePixelRatio || 1,
});
var behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
var ui = H.ui.UI.createDefault(map, defaultLayers);

window.addEventListener("resize", () => map.getViewPort().resize());

function calculateRouteFromAtoB(platform, origin, destination) {
	var router = platform.getRoutingService();
	var router = platform.getRoutingService(null, 8),
		routeRequestParams = {
			routingMode: "fast",
			transportMode: "car",
			origin: origin,
			destination: destination,
			return: "polyline,turnByTurnActions,actions,instructions,travelSummary",
		};

	router.calculateRoute(routeRequestParams, onSuccess, onError);
}

/** @param {Object} result */
function onSuccess(result) {
	var route = result.routes[0];
	addRouteShapeToMap(route);
	addManueversToMap(route);
}

/** @param {Object} error */
function onError(error) {
	alert("Can't reach the remote server");
}

/** @param {Object} route */
function addRouteShapeToMap(route) {
	route.sections.forEach((section) => {
		// decode LineString from the flexible polyline
		let linestring = H.geo.LineString.fromFlexiblePolyline(section.polyline);

		// Create a polyline to display the route:
		let polyline = new H.map.Polyline(linestring, {
			style: {
				lineWidth: 4,
				strokeColor: "rgba(0, 128, 255, 0.7)",
			},
		});

		// Add the polyline to the map
		map.addObject(polyline);
		// And zoom to its bounding rectangle
		map.getViewModel().setLookAtData({
			bounds: polyline.getBoundingBox(),
		});
	});
}

/** @param {Object} route */
function addManueversToMap(route) {
	var svgMarkup =
			'<svg width="18" height="18" ' +
			'xmlns="http://www.w3.org/2000/svg">' +
			'<circle cx="8" cy="8" r="8" ' +
			'fill="#1b468d" stroke="white" stroke-width="1" />' +
			"</svg>",
		dotIcon = new H.map.Icon(svgMarkup, { anchor: { x: 8, y: 8 } }),
		group = new H.map.Group(),
		i,
		j;

	route.sections.forEach((section) => {
		let poly = H.geo.LineString.fromFlexiblePolyline(
			section.polyline
		).getLatLngAltArray();

		let actions = section.actions;
		// Add a marker for each maneuver
		for (i = 0; i < actions.length; i += 1) {
			let action = actions[i];
			var marker = new H.map.Marker(
				{
					lat: poly[action.offset * 3],
					lng: poly[action.offset * 3 + 1],
				},
				{ icon: dotIcon }
			);
			marker.instruction = action.instruction;
			group.addObject(marker);
		}

		group.addEventListener(
			"tap",
			function (evt) {
				map.setCenter(evt.target.getGeometry());
				openBubble(evt.target.getGeometry(), evt.target.instruction);
			},
			false
		);

		// Add the maneuvers group to the map
		map.addObject(group);
	});
}

var data = {
	results: [
		{
			waypoints: [
				{
					id: "start",
					lat: 50.0715,
					lng: 8.2434,
					sequence: 0,
					estimatedArrival: null,
					estimatedDeparture: null,
					fulfilledConstraints: [],
				},
				{
					id: "destination3",
					lat: 50.0505,
					lng: 8.5698,
					sequence: 1,
					estimatedArrival: null,
					estimatedDeparture: null,
					fulfilledConstraints: [],
				},
				{
					id: "destination1",
					lat: 50.1073,
					lng: 8.6647,
					sequence: 2,
					estimatedArrival: null,
					estimatedDeparture: null,
					fulfilledConstraints: [],
				},
				{
					id: "destination4",
					lat: 50.1218,
					lng: 8.9298,
					sequence: 3,
					estimatedArrival: null,
					estimatedDeparture: null,
					fulfilledConstraints: [],
				},
				{
					id: "destination2",
					lat: 49.8728,
					lng: 8.6326,
					sequence: 4,
					estimatedArrival: null,
					estimatedDeparture: null,
					fulfilledConstraints: [],
				},
				{
					id: "end",
					lat: 50.0021,
					lng: 8.259,
					sequence: 5,
					estimatedArrival: null,
					estimatedDeparture: null,
					fulfilledConstraints: [],
				},
			],
			distance: "164292",
			time: "7238",
			interconnections: [
				{
					fromWaypoint: "start",
					toWaypoint: "destination3",
					distance: 26630.0,
					time: 1072.0,
					rest: 0.0,
					waiting: 0.0,
				},
				{
					fromWaypoint: "destination3",
					toWaypoint: "destination1",
					distance: 15085.0,
					time: 808.0,
					rest: 0.0,
					waiting: 0.0,
				},
				{
					fromWaypoint: "destination1",
					toWaypoint: "destination4",
					distance: 34648.0,
					time: 1531.0,
					rest: 0.0,
					waiting: 0.0,
				},
				{
					fromWaypoint: "destination4",
					toWaypoint: "destination2",
					distance: 49219.0,
					time: 2066.0,
					rest: 0.0,
					waiting: 0.0,
				},
				{
					fromWaypoint: "destination2",
					toWaypoint: "end",
					distance: 38710.0,
					time: 1761.0,
					rest: 0.0,
					waiting: 0.0,
				},
			],
			description: "Targeted best time; without traffic",
			timeBreakdown: {
				driving: 7238,
				service: 0,
				rest: 0,
				waiting: 0,
			},
		},
	],
	errors: [],
	processingTimeDesc: "228ms",
	responseCode: "200",
	warnings: null,
	requestId: "3f871124-84ac-49cb-b671-d3dcedfa15c3",
};

const waypointCoordinates = {};
data.results[0].waypoints.forEach((waypoint) => {
	waypointCoordinates[waypoint.id] = {
		lat: waypoint.lat,
		lng: waypoint.lng,
	};
});

data.results[0].interconnections.forEach((interconnection) => {
	const fromWaypoint = waypointCoordinates[interconnection.fromWaypoint];
	const toWaypoint = waypointCoordinates[interconnection.toWaypoint];

	calculateRouteFromAtoB(
		platform,
		`${fromWaypoint.lat},${fromWaypoint.lng}`,
		`${toWaypoint.lat},${toWaypoint.lng}`
	);
});