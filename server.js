const express = require('express');
const http = require('http');
const url = require('url');
const WebSocket = require('ws');
 
const app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
 
var connections = []
var user_ids = []


app.post('/addPoint',function (req, res) {
	console.log(req.body)
	let user = req.body.user;
	let s1 = req.body.sensor1;
	let s2 = req.body.sensor2;
	let tstamp = req.body.timestamp;

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
	


	res.send({ msg: "cool beans" });
});

 
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', function connection(ws, req) {
	const location = url.parse(req.url, true);
  // You might use location.query.access_token to authenticate or share sessions
  // or req.headers.cookie (see http://stackoverflow.com/a/16395220/151312)
 
 	console.log("hi")
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

	/*ws.on('open', function open() {
		console.log('connected');
		ws.send(Date.now());
	});*/

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

 
  	//ws.send('something');
});


function removeFromArray(arr, elm){
	const index = arr.indexOf(elm);
    arr.splice(elm, 1);
}
 
server.listen(process.env.PORT || 80, function listening() {
  console.log('Listening on %d', server.address().port);
});