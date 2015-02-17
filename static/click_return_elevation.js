// Map test

var lat = 0;
var lng = 0;
var routeNum = 1;
var currentPolyline = null;
route_list = [];
var points = [];



function showElevation() {
	// function that (calculates) displays elevation for a given point
	//working
	elevation_url = 'https://api.tiles.mapbox.com/v4/surface/mapbox.mapbox-terrain-v1.json?layer=contour&fields=ele&points='+lng+','+lat+'&access_token=pk.eyJ1Ijoic2JpbmRtYW4iLCJhIjoiaENWQnlrVSJ9.0DQyCLWgA0j8yBpmvt3bGA';
	$.get(elevation_url, function (result) {
		elevation = result.results[0].ele;
		$("#map-results").text(elevation);
		return elevation;
	});
}


function getElevation(point) {
	// function that (calculates) displays elevation for a given point
	//working
	elevation_url = 'https://api.tiles.mapbox.com/v4/surface/mapbox.mapbox-terrain-v1.json?layer=contour&fields=ele&points='+point[1]+','+point[0]+'&access_token=pk.eyJ1Ijoic2JpbmRtYW4iLCJhIjoiaENWQnlrVSJ9.0DQyCLWgA0j8yBpmvt3bGA';
	$.get(elevation_url, function (result) {
		elevation = result.results[0].ele;
		console.log("get elevation" + elevation);
		return elevation;
	});
}


function collectLatLong(evt) {
	//function collects lat long for a given point
	//working
	console.log("lat:" + evt.latlng.lat);
 	console.log("long: " + evt.latlng.lng);
 	lat = evt.latlng.lat;
 	lng = evt.latlng.lng;
 	return ([lat,lng]);
}


function addPoint(evt) {
	// take a new point and add it to the end of a 
	//working
	var point = collectLatLong(evt);
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
	this.routePoints = currentPolyline.polyline.getLatLngs();
	this.elevation = 0;


	for (var i = 0; i < this.routePoints.length; i++) {
		ele = 5;
		console.log("ele" + ele);
	}


}

//create a new line object
function startNewLine() {
	var polyline = new line(routeNum);
	//console.log("hello" + polyline);

	currentPolyline = polyline;

}

function endLine() {
	var route1 = new route();
	console.log("route:"+route1.id);
	route_list.push(route);

	routeNum ++;
	currentPolyline = null;
	points = [];
	
}




	// this.elevation = getElevation(point_list[0]);
	// for (var i = 0; i < points.length; i++) {
	// 	ele = getElevation(point_list[i]);
	// 	console.log("q" + ele);
	// 	this.elevation += ele;
	// 	console.log("elevation:" + this.elevation);
	// }
	//create a new line from a set of points


//button that starts a new route
$("#add-route").on("click", startNewLine);
//map.on('click', showElevation);
map.on('click', addPoint);
map.on('dblclick', endLine);



