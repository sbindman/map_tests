// Map test

//global variables
var routeNum = 0;
var currentLine = null;
var route_list = [];
var points = [];
var startPoint = null;
var endPoint = null;

//tests
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
		console.log("get elevation: " + elevation);
		return callback(undefined, elevation);
	});
}


function getDirectionsInfo(route) { //can this be changed to take in a route? or a list of points rather than simply start and end
	var points = route.polyline.getLatLngs();
	var pointsString = "";

	for (i = 0; i < points.length - 1; i++) {
		pointsString += points[i].lng + "," + points[i].lat + ";";
	}
	pointsString += points[points.length - 1].lng + "," + points[points.length - 1].lat; // so the last point doesnt have a semicolon
	console.log("ps: " + pointsString);
	console.log(typeof pointsString);

	var direction_url = 'http://api.tiles.mapbox.com/v4/directions/mapbox.driving/'+ pointsString + '.json?access_token=pk.eyJ1Ijoic2JpbmRtYW4iLCJhIjoiaENWQnlrVSJ9.0DQyCLWgA0j8yBpmvt3bGA'

	console.log(direction_url); //FIXIT this is not correctly working

	var distance = 0;
	var duration = 0;
	var leftTurns = 0;
	$.get(direction_url, function (result) {

		distance += result.routes[0].distance; //distance is in meters, route 0 is the "optimal" route
		//duration += result.routes[i].duration; //time in seconds
		for (var i = 0; i < result.routes[0].steps.length; i++) {
			console.log("length steps:" + result.routes[0].steps.length );
			console.log("type:" + result.routes[0].steps[i].maneuver.type);

		 	if (result.routes[0].steps[i].maneuver.type.match(/left/g)) {
		 		leftTurns += 1;
		 	}
		}
		console.log("distance" + distance);
		console.log("duration: " + duration);
		console.log("left turns: " + leftTurns);
	

	var mostDirectDirection_url = 'http://api.tiles.mapbox.com/v4/directions/mapbox.driving/'+ pointsString + '.json?access_token=pk.eyJ1Ijoic2JpbmRtYW4iLCJhIjoiaENWQnlrVSJ9.0DQyCLWgA0j8yBpmvt3bGA'



	});
}




//constructor for a new line object
function line(id) {
	this.id = id;
	this.name = null;
	this.polyline = L.polyline([]).addTo(map);
	this.elevation = null;
	this.distance = null;
	this.mostDirectDistance = null;
	this.leftTurns = null;

	//standardized values
	this.sElevation = null;
	this.sDistance = null;
	this.sLeftTurns = null;
}


//general functions

//create a new line object
function startNewLine() {
	var polyline = new line(routeNum);
	currentLine = polyline;
}

function endLine() {
	startPoint = currentLine.polyline.getLatLngs()[0];
	endPoint = currentLine.polyline.getLatLngs()[currentLine.polyline.getLatLngs().length - 1]; 

	routeDict[currentLine.id] = currentLine;
	calcElevation(currentLine.id);
	getDirectionsInfo(currentLine);



	setTimeout(function () {
		routeNum ++;
		currentLine = null;
	} 
		, 2000);	
	}


//functionality of lines

function addPoint(evt) {
	// take a new point and add it to the end of a 
	var point = evt.latlng;
	currentLine.polyline.addLatLng(point);

	//extra text to display points
	points.push(point);
	$("#points").text(points);
	console.log("points: " + points);
}


//calculations

function calcElevation (routeID) {
	// calculates overall elevation
	var routeID = routeID; //asynchronous fix
	var totalEle = 0; //does not take into account total positive or total neg
	var elevationPoints = [];
	var routePoints = routeDict[routeID].polyline.getLatLngs();
	console.log("rp"+routePoints);
	for (var i = 0; i < routePoints.length; i++) {
		elevation = getElevation(routePoints[i], function(err, ele) {
			elevationPoints.push(elevation);
		});
	}


	setTimeout(function () {  //FIXIT add in async
	var currentEle = elevationPoints[0];
	for (var i = 1; i < routePoints.length; i++) {
		totalEle += Math.abs(elevationPoints[i] - currentEle);
		console.log ("total elevation: " + totalEle);
		currentEle = elevationPoints[i];
	}
	routeDict[routeID].elevation = totalEle;
		} , 1000);	
	}



function standardizeData () {
	//will run through all of the routes and update all of the attributes to have an additional field with standardized rather than raw values
	rawElevation = currentLine.elevation;
	rawDistance = currentLine.distance;
	rawLefts = currentLine.leftTurns;

	//standarize elevation -- these value cutoffs can be changed but seem reasonable
	if (rawElevation < 300) { s.Elevation = 3 };
	else if ( rawElevation >= 300 && rawElevation < 500) { s.Elevation = 2 };
	else if (raw Elevation >= 500 ) { s.Elevation = 1 };
	else s.Elevation = null;







}





//display information
function showRouteDict () {
	var html = "";
	for (var i = 0; i < Object.keys(routeDict).length; i++) {
		html += '<div>id: ' + i + "  route elevation: " + routeDict[i].elevation + '</div>';
	}
	$("#route-info").html(html);
}





//button on the page

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





