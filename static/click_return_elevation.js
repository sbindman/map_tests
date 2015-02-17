// Map test

var lat = 0;
var lng = 0;


function showElevation() {
	// function that (calculates) displays elevation for a given point
	elevation_url = 'https://api.tiles.mapbox.com/v4/surface/mapbox.mapbox-terrain-v1.json?layer=contour&fields=ele&points='+lng+','+lat+'&access_token=pk.eyJ1Ijoic2JpbmRtYW4iLCJhIjoiaENWQnlrVSJ9.0DQyCLWgA0j8yBpmvt3bGA';
	$.get(elevation_url, function (result) {
		elevation = result.results[0].ele;
		$("#map-results").text(elevation);
	});
}

function collectLatLong(evt) {
	// function collects lat long for a given point
	console.log("lat:" + evt.latlng.lat);
 	console.log("long: " + evt.latlng.lng);
 	lat = evt.latlng.lat;
 	lng = evt.latlng.lng;
 	return ([lat,lng]);
}


// add a new line to a map
var polyline = L.polyline([]).addTo(map);
var points = [];

function addPoint(evt) {
	// take a new point and add it to the end of a line
	var point = collectLatLong(evt);
	polyline.addLatLng(point);
	points.push(point);
	$("#points").text(points);
}


function addLine(evt) {
	//create a new line from a set of points
}



map.on('click', collectLatLong);
map.on('click', showElevation);
map.on('click', addPoint);


