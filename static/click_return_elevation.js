// Map test

// var lat = 0;
// var lng = 0;
var routeNum = 1;
var currentPolyline = null;
var route_list = [];
var points = [];



function showElevation(point) {
	// function that (calculates) displays elevation for a given point
	//working
	var elevation_url = 'https://api.tiles.mapbox.com/v4/surface/mapbox.mapbox-terrain-v1.json?layer=contour&fields=ele&points='+point.lng+','+point.lat+'&access_token=pk.eyJ1Ijoic2JpbmRtYW4iLCJhIjoiaENWQnlrVSJ9.0DQyCLWgA0j8yBpmvt3bGA';
	$.get(elevation_url, function (result) {
		elevation = result.results[0].ele;
		$("#map-results").text(elevation);
		return elevation;
	});
}



function getElevation(point) {
	// function that (calculates) displays elevation for a given point
	//working
	var elevation_url = 'https://api.tiles.mapbox.com/v4/surface/mapbox.mapbox-terrain-v1.json?layer=contour&fields=ele&points='+point.lng+','+point.lat+'&access_token=pk.eyJ1Ijoic2JpbmRtYW4iLCJhIjoiaENWQnlrVSJ9.0DQyCLWgA0j8yBpmvt3bGA';
	$.get(elevation_url, function (result) {
		elevation = result.results[0].ele;
		console.log("get elevation" + elevation);
		return elevation;
	});
}




function getDirections(point1, point2) {
	var direction_url = 'http://api.tiles.mapbox.com/v4/directions/mapbox.driving/'+point1+';'+point2+'.json?access_token=pk.eyJ1Ijoic2JpbmRtYW4iLCJhIjoiaENWQnlrVSJ9.0DQyCLWgA0j8yBpmvt3bGA'
	var distance;
	var duration;
	var turn;
	$.get(direction_url, function (result) {
		distance = result.routes[0].distance; //distance is in meters, route 0 is the "optimal" route
		duration = result.routes[0].duration; //time in seconds
		turn = result.routes[0].steps[3].maneuver.type; //example left turn, looking at a single turn

		console.log(distance);
		console.log(duration);
		console.log(turn);


	});
}
//test
getDirections([-122.42,37.78],[-122.52,37.88]);


function addPoint(evt) {
	// take a new point and add it to the end of a 
	var point = evt.latlng;
	currentPolyline.polyline.addLatLng(point);
	points.push(point);
	$("#points").text(points);
	console.log("points: " + points);
	listPoints(currentPolyline);
}


function listPoints(line) {
	linePoints = line.polyline.getLatLngs();
	console.log("listPoints:" + linePoints.length);
}

//constructor for a new line object
function line(id) {
	this.id = id;
	this.polyline = L.polyline([]).addTo(map);
}

//save a route
function route() {
	this.id = currentPolyline.id;
	this.elevation = 0;
	this.routePoints = currentPolyline.polyline.getLatLngs();


}

//create a new line object
function startNewLine() {
	var polyline = new line(routeNum);
	currentPolyline = polyline;

}

function endLine() {
	var route1 = new route();
	console.log("route:"+route1.routePoints[0]);
	route_list.push(route1);

	routeNum ++;
	currentPolyline = null;
	points = [];
	
}

function showRouteList() {
	var html = "";
	for (var i = 0; i < route_list.length; i++) {
		routeId = route_list[i].id;
		routeEle = route_list[i].elevation;
		routeFirstPoint = route_list[i].routePoints[0]; //test of how to display data
		html += "<tr><td>"+routeId+"</td>"+routeEle+"<td>"+routeFirstPoint+"</td</tr>><br>";
		console.log(html);
	}
	$("#route-info").append(html);
}



//button that starts a new route
$("#add-route").on("click", startNewLine);
$("#show-route").on("click", showRouteList);

//show elevation on click
map.on('click', function(evt) {
	showElevation(evt.latlng);
}
);


map.on('click', addPoint);
map.on('dblclick', endLine);



