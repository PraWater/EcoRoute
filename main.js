import axios from "axios";
import {getDestinations} from "./ui.js";
// const apikey = import.meta.env.VITE_APIKEY;
// const appid = import.meta.env.VITE_APPID;
const apikey = "B71DvfBZ9Q5ABZRWhDBqAGyEZY9krolmeL3X2Pe59X4"
const appid = "x75FUBvR34xyVXesEcBQ"
console.log(apikey)
const mapContainer = document.getElementById("map");
const platform = new H.service.Platform({
	apikey: apikey,
});
const defaultLayers = platform.createDefaultLayers();
const map = new H.Map(mapContainer, defaultLayers.vector.normal.map, {
	zoom: 10,
	center: { lat: 37.7397, lng: -121.4252 },
	pixelRatio: window.devicePixelRatio || 1,
});
const behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
const ui = H.ui.UI.createDefault(map, defaultLayers);

window.addEventListener("resize", () => map.getViewPort().resize());

function calculateRouteFromAtoB(platform, origin, destination) {
	const router = platform.getRoutingService(null, 8),
		routeRequestParams = {
			routingMode: "fast",
			transportMode: "car",
			origin: origin,
			destination: destination,
			return: "polyline,turnByTurnActions,actions,instructions,travelSummary",
		};

	router.calculateRoute(routeRequestParams, onSuccess, onError);
}

function onSuccess(result) {
	const route = result.routes[0];
	addRouteShapeToMap(route);
	addManueversToMap(route);
}

function onError(error) {
	alert("Can't reach the remote server");
}

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

function addManueversToMap(route) {
	const svgMarkup =
			'<svg width="18" height="18" ' +
			'xmlns="http://www.w3.org/2000/svg">' +
			'<circle cx="8" cy="8" r="8" ' +
			'fill="#1b468d" stroke="white" stroke-width="1" />' +
			"</svg>",
		dotIcon = new H.map.Icon(svgMarkup, { anchor: { x: 8, y: 8 } }),
		group = new H.map.Group();

	route.sections.forEach((section) => {
		let poly = H.geo.LineString.fromFlexiblePolyline(
			section.polyline
		).getLatLngAltArray();

		let actions = section.actions;
		// Add a marker for each maneuver
		for (let i = 0; i < actions.length; i += 1) {
			let action = actions[i];
			const marker = new H.map.Marker(
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

async function pathsOnMap(data) {
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
}
async function runMain(){
	let apiURL = '';
	let destinations = [];
	const startLocation = document.getElementById("start").value;
	destinations = getDestinations();

	let dynamicURL = `https://wse.cit.api.here.com/2/findsequence.json?start=${startLocation}`;
	for(let i=1; i<=destinations.length; i++){
		dynamicURL += `&destination${i}=${destinations[i-1]}`
	}
	dynamicURL += `&end=${startLocation}&improveFor=time&mode=fastest;car&app_id=${appid}&apikey=${apikey}`;
	console.log(dynamicURL);
	apiURL = dynamicURL;
	return apiURL;
}


// const apiURL = `https://wse.cit.api.here.com/2/findsequence.json?start=50.0715,8.2434&destination1=50.1073,8.6647&destination2=49.8728,8.6326&destination3=50.0505,8.5698&destination4=50.1218,8.9298&end=50.0021,8.259&improveFor=time&mode=fastest;car&app_id=${appid}&apikey=${apikey}`;

async function getPaths() {
	const apiURL = await runMain();
	axios
		.get(apiURL)
		.then((response) => {
			console.log(response);
			response.data.results.forEach((result) => {
				console.log(result.waypoints);
			});
			pathsOnMap(response.data);
		})
		.catch((error) => {
			console.log(error);
		});
}

export { getPaths };
