const express = require('express');
const http = require('http');
const url = require('url');
const WebSocket = require('ws');
const database = require('./database.js')
var cors = require('cors')

const app = express();
app.use(cors())

var path = require("path");


var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
 
var connections = []
var user_ids = []

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/front_end_html/index.html'));
});

app.post('/add_point',function (req, res) {
	console.log(req.body)
	let user = req.body.user_id;
	let s1 = req.body.sensor1;
	let s2 = req.body.sensor2;
	let tstamp = req.body.timestamp;

	let date = new Date(tstamp[0],tstamp[1]-1,tstamp[2],tstamp[3],tstamp[4],tstamp[5])

	console.log("Add point called")
	console.log(user_ids)
	console.log(user)
	for (i = 0; i<user_ids.length; i++)
	{
		if (user_ids[i] == user)
		{
			let data = {sensor1:s1,sensor2:s2,timestamp:tstamp}
			connections[i].send(JSON.stringify(data))
		}
	}
	database.add_point(user,s1,s2,date,function(result){
		res.send(result)
	})
});

app.post('/sign_up',function (req, res) {
	bluetooth_id = "b"
	if ("bluetooth_id" in req.body){
		bluetooth_id = req.body.bluetooth_id;
	}
	database.add_user(req.body.e_mail, req.body.password, req.body.f_name, req.body.l_name, req.body.user_type, bluetooth_id, function(result){
		res.send(result)
	})
	
});

app.post('/login',function (req, res) {
	console.log(req.body)
	database.sign_in(req.body.e_mail, req.body.password, function(result){
		res.send(result)
	})
	
});

app.post('/get_all_points',function (req, res) {
	database.get_all_points(req.body.user_id, function(result){
		res.send(result)
	})
	
});

app.post('/get_points_hours',function (req, res) {
	database.get_last_hours(req.body.user_id, req.body.hours, function(result){
		res.send(result)
	})
	
});
app.post('/get_points_days',function (req, res) {
	database.get_last_days(req.body.user_id, req.body.days, function(result){
		res.send(result)
	})
	
});

app.post('/create_relationship',function (req, res) {
	database.create_relationship(req.body.patient_id, req.body.doctor_id, function(result){
		res.send(result)
	})
	
});

app.post('/get_doctors',function (req, res) {
	database.get_docs(req.body.patient_id, function(result){
		res.send(result)
	})
	
});

app.post('/get_patients',function (req, res) {
	database.get_patients(req.body.doctor_id, function(result){
		res.send(result)
	})
});

app.post('/get_user_info',function (req, res) {
	database.get_user(req.body.user_id, function(result){
		res.send(result)
	})
});

 
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', function connection(ws, req) {
	const location = url.parse(req.url, true); 

	//Store new connection and set user_id
 	connections.push(ws)
 	user_ids.push("-1")

	ws.on('message', function incoming(message) {
		console.log("received")
		let the_json = JSON.parse(message)
		console.log(the_json)
		if (the_json.message_type == "set_id")
		{
			index = connections.indexOf(ws)
			user_ids[index] = the_json.user
		}
	});
	ws.on('close', function close() {
	  console.log('disconnected');

	  	const index = connections.indexOf(ws);

	  	if (index > -1) {
    		connections.splice(index, 1);
    		user_ids.splice(index,1)
		}

	});
	ws.on('error', function error() {
	  console.log('error');
	});
 });


function removeFromArray(arr, elm){
	const index = arr.indexOf(elm);
    arr.splice(elm, 1);
}
 
server.listen(process.env.PORT || 80, function listening() {
  console.log('Listening on %d', server.address().port);
});