import axios from "axios";
import { getDestinations } from "./ui.js";
const apikey = import.meta.env.VITE_APIKEY;
const appid = import.meta.env.VITE_APPID;
const mapContainer = document.getElementById("map");
const platform = new H.service.Platform({
	apikey: apikey,
});
const defaultLayers = platform.createDefaultLayers();
const map = new H.Map(mapContainer, defaultLayers.vector.normal.map, {
	zoom: 7,
	center: { lat: 17.4065, lng: 78.4772 },
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
		var randomColor = Math.floor(Math.random() * 16777215).toString(16);
		let polyline = new H.map.Polyline(linestring, {
			style: {
				lineWidth: 4,
				strokeColor: "#" + randomColor,
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

let markers = [];

async function pathsOnMap(data) {
	const waypointCoordinates = {};
	data.results[0].waypoints.forEach((waypoint) => {
		waypointCoordinates[waypoint.id] = {
			lat: waypoint.lat,
			lng: waypoint.lng,
		};
	});
	for (let i = 0; i < markers.length; i++) {
		map.removeObject(markers[i]);
	}
	markers = [];
	Object.keys(waypointCoordinates).forEach((key) => {
		const waypoint = waypointCoordinates[key];
		const marker = new H.map.Marker(waypoint);
		map.addObject(marker);
		markers.push(marker);
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
async function runMain() {
	let apiURL = "";
	let destinations = [];
	const startLocation = document.getElementById("start").value;
	destinations = getDestinations();

	let dynamicURL = `https://wse.cit.api.here.com/2/findsequence.json?start=${startLocation}`;
	for (let i = 1; i <= destinations.length; i++) {
		dynamicURL += `&destination${i}=${destinations[i - 1]}`;
	}
	dynamicURL += `&end=${startLocation}&improveFor=time&mode=fastest;car&app_id=${appid}&apikey=${apikey}`;
	console.log(dynamicURL);
	apiURL = dynamicURL;
	return apiURL;
}

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

function markerLocation(idNo) {
	const temp = idNo;
	const center = map.getCenter();
	const marker = new H.map.Marker(center, { volatility: true });
	marker.draggable = true;
	map.addObject(marker);

	// Add event listeners for marker movement
	map.addEventListener(
		"dragstart",
		(evt) => {
			if (evt.target instanceof H.map.Marker) behavior.disable();
		},
		false
	);
	map.addEventListener(
		"dragend",
		function dragEndFunc(evt) {
			const deliveryCount = temp;
			console.log("current selected is: " + deliveryCount);
			if (evt.target instanceof H.map.Marker) {
				console.log(evt.target.getGeometry());
				behavior.enable();
				const loc = evt.target.getGeometry();
				if (deliveryCount > 0)
					document.getElementById(
						`delivery${deliveryCount}`
					).value = `${loc.lat}, ${loc.lng}`;
				else document.getElementById("start").value = `${loc.lat}, ${loc.lng}`;
				map.removeObject(evt.target);
				map.removeEventListener("dragend", dragEndFunc, false);
			}
		},
		false
	);
	map.addEventListener(
		"drag",
		(evt) => {
			const pointer = evt.currentPointer;
			if (evt.target instanceof H.map.Marker) {
				evt.target.setGeometry(
					map.screenToGeo(pointer.viewportX, pointer.viewportY)
				);
			}
		},
		false
	);
}

export { getPaths, markerLocation };
