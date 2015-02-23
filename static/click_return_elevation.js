// Map test

//global variables
var routeNum = 0;
var currentLine = null;
var route_list = [];
var points = [];
var startPoint = null;
var endPoint = null;
var colors = ['#793FFF', '#394EE8', '#4CAAFF', '#39DCE8', '#33FFB4'];

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


function getDirectionsInfo(route) { 
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
	var leftTurns = 0;
	var mostDirectDistance = 0; //FIXIT this should be cleaned up to be null and connected to a specific object
	$.get(direction_url, function (result) {

		distance = result.routes[0].distance; //distance is in meters, route 0 is the "optimal" route
		routeDict[route.id].distance = distance;


		for (var i = 0; i < result.routes[0].steps.length; i++) {
			console.log("length steps:" + result.routes[0].steps.length );
			console.log("type:" + result.routes[0].steps[i].maneuver.type);

		 	if (result.routes[0].steps[i].maneuver.type.match(/left/g)) {
		 		leftTurns += 1;
		 	}
		}
		routeDict[route.id].leftTurns = leftTurns;

		console.log("distance" + distance);
		console.log("left turns: " + leftTurns);

	
	//calculate the most direct route distance for start and end points
	var mostDirectDirection_url = 'http://api.tiles.mapbox.com/v4/directions/mapbox.driving/'+ startPoint.lng + ',' + startPoint.lat + ';' + endPoint.lng + ',' + endPoint.lat + '.json?access_token=pk.eyJ1Ijoic2JpbmRtYW4iLCJhIjoiaENWQnlrVSJ9.0DQyCLWgA0j8yBpmvt3bGA'

	$.get(mostDirectDirection_url, function (result) {
		mostDirectDistance = result.routes[0].distance;
		routeDict[route.id].mostDirectDistance = mostDirectDistance;
		console.log("most direct distance: " + mostDirectDistance); 
	})
	});
}



//constructor for a new line object
function line(id) {
	this.id = id;
	this.name = null;
	var lineColor = colors[id];
	console.log("line color:" + lineColor);
	this.polyline = L.polyline([], { color:lineColor, weight:5.5, opacity:.8}).addTo(map);
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
		standardizeData(currentLine);
	} 
		, 2000);	


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
	//$("#points").text(points);
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



function standardizeData (route) {
	//will run through all of the routes and update all of the attributes to have an additional field with standardized rather than raw values
	var rawElevation = routeDict[route.id].elevation;
	var rawDistance = routeDict[route.id].distance;
	var rawDirectDistance = routeDict[route.id].mostDirectDistance;
	var rawLefts = routeDict[route.id].leftTurns;
	var ratio = rawDistance / rawDirectDistance;

	//standarize elevation -- these value cutoffs can be changed but seem reasonable
	
	if (rawElevation < 100) { 
		routeDict[route.id].sElevation = 3;
	} else if ( rawElevation >= 100 && rawElevation < 150 ) { 
		routeDict[route.id].sElevation = 2;
	} else if (rawElevation >= 150 ) { 
		routeDict[route.id].sElevation = 1; 
	} else {
		routeDict[route.id].sElevation = null;
	}

	console.log("standardized elevation: " + routeDict[route.id].sElevation);
	
	//standardize distance -- these value cutoffs can be changed but seem reasonable
	if (ratio < 1) { 
		routeDict[route.id].sDistance = null;
		console.log ("Error");
	} else if ( ratio >= 1 && ratio < 1.3) { 
		routeDict[route.id].sDistance = 3;
	} else if (ratio >= 1.3 && ratio < 1.6 ) { 
		routeDict[route.id].sDistance = 2;
	} else if (ratio >= 1.6) { 
		routeDict[route.id].sDistance = 1;  
	} else {
		routeDict[route.id].sElevation = null;
	}

	console.log("standardized distance: " + routeDict[route.id].sDistance);


//standardize left turns
	if (rawLefts < 5) { 
		routeDict[route.id].sLeftTurns = 3;
	} else if ( rawLefts >= 5 && rawLefts < 10 ) { 
		routeDict[route.id].sLeftTurns = 2;
	} else if (rawElevation >= 10 ) { 
		routeDict[route.id].sLeftTurns = 1; 
	} else {
		routeDict[route.id].sLeftTurns = null;
	}

	console.log("standardized left turns: " + routeDict[route.id].sLeftTurns);

}


//display information
function showRouteDict () {
	var html = "";
	for (var i = 0; i < Object.keys(routeDict).length; i++) {
		html += '<div> id: ' + i + "  route elevation: " + routeDict[i].elevation +  " route distance: " + routeDict[i].distance + " route left turns: " + routeDict[i].leftTurns + '</div>';
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





