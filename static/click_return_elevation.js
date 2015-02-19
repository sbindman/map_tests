// Map test

//global variables
var routeNum = 0;
var currentLine = null;
var route_list = [];
var points = [];

//tests
var exRoute;
var exID;
var exElevation;

var routeDict = {};

//api connections

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


function getElevation(point, callback) {
	// function that (calculates) displays elevation for a given point
	var elevation_url = 'https://api.tiles.mapbox.com/v4/surface/mapbox.mapbox-terrain-v1.json?layer=contour&fields=ele&points='+point.lng+','+point.lat+'&access_token=pk.eyJ1Ijoic2JpbmRtYW4iLCJhIjoiaENWQnlrVSJ9.0DQyCLWgA0j8yBpmvt3bGA';
	$.get(elevation_url, function (result) {
		elevation = result.results[0].ele;
		console.log("get elevation" + elevation);
		return callback(undefined, elevation);
	});
}


// function getDirections(point1, point2) {
// 	var direction_url = 'http://api.tiles.mapbox.com/v4/directions/mapbox.driving/'+point1+';'+point2+'.json?access_token=pk.eyJ1Ijoic2JpbmRtYW4iLCJhIjoiaENWQnlrVSJ9.0DQyCLWgA0j8yBpmvt3bGA'
// 	var distance;
// 	var duration;
// 	var turn;
// 	$.get(direction_url, function (result) {
// 		distance = result.routes[0].distance; //distance is in meters, route 0 is the "optimal" route
// 		duration = result.routes[0].duration; //time in seconds
// 		turn = result.routes[0].steps[3].maneuver.type; //example left turn, looking at a single turn

// 		console.log(distance);
// 		console.log(duration);
// 		console.log(turn);
// 		console.log("hello");
// 		console.log("result" + result);
// 		return callback (undefined, result);


// 	});
// }

//   var ex = getDirections([[37.759, -122.42487], [37.749, -122.42477]]);


//constructor for a new line object
function line(id) {
	this.id = id;
	this.polyline = L.polyline([]).addTo(map);
	this.elevation = 10;
	//more data associated with a specific line
}


//general functions

function addPoint(evt) {
	// take a new point and add it to the end of a 
	var point = evt.latlng;
	currentLine.polyline.addLatLng(point);

	//extra text to display points
	points.push(point);
	$("#points").text(points);
	console.log("points: " + points);
}

//create a new line object
function startNewLine() {
	var polyline = new line(routeNum);
	currentLine = polyline;
}

function endLine() {
	routeDict[currentLine.id] = currentLine;
	calcElevation(currentLine.id);

	setTimeout(function () {
		routeNum ++;
		currentLine = null;
	} 
		, 2000);	
	}


function calcElevation (routeID) {
	// calculates overall elevation
	var routeID = routeID; //asynchronous fix
	var positiveEle = 0; //to be used laster
	var negativeEle = 0; // to be used later
	var totalEle = 10; //does not take into account total positive or total neg
	var routePoints = routeDict[routeID].polyline.getLatLngs();
	console.log("rp"+routePoints);
	for (var i = 0; i < routePoints.length; i++) {
		elevation = getElevation(routePoints[i], function(err, ele) {
			totalEle += ele;
		});
	}
	setTimeout(function () {  //should be fixed to be a callback rather than this
		routeDict[routeID].elevation = totalEle;
		console.log(routeDict[routeID].elevation);
	} 
		, 1000);	
	}


function showRouteDict () {
	var html = "";
	for (var i = 0; i < Object.keys(routeDict).length; i++) {
		html += '<div>id: ' + i + "  route elevation: " + routeDict[i].elevation + '</div>';
	}
	$("#route-info").html(html);
}


function standardizeData () {
	//will run through all of the routes and update all of the attributes to have an additional field with standardized rather than raw values
}


//button that starts a new route
$("#add-route").on("click", startNewLine);
$("#calcElevation").on("click", calcElevation);
$("#routes").on("click", showRouteDict);

//show elevation on click
map.on('click', function(evt) {
	showElevation(evt.latlng);
});

map.on('click', addPoint);
map.on('dblclick', endLine);



