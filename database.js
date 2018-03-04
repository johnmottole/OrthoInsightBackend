var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://johnmottole:john123@ds147228.mlab.com:47228/heroku_l59s96ps";
var crypto = require('crypto');
var ObjectId = require('mongodb').ObjectID;


module.exports.add_user = function (e_mail, password, f_name, l_name, user_type,bluetooth_id, callback)
{
	console.log(typeof(callback))
	MongoClient.connect(url, function(err, db) {
	  if (err) throw err;
	  var dbo = db.db("heroku_l59s96ps");
	  database = dbo

	  var query = { e_mail: e_mail };
	  dbo.collection("users").find(query).toArray(function(err, result) {

	    if (err) throw err;

	    if (result.length == 0)
	    {
	    	salt = crypto.randomBytes(16).toString('hex');
		  	hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
		  	var user = { e_mail: e_mail, salt: salt, hash:hash,f_name:f_name,l_name:l_name, user_type:user_type};
		  	if (user_type == "patient")
		  	{
		  		var user = { e_mail: e_mail, salt: salt, hash:hash,f_name:f_name,l_name:l_name, user_type:user_type, bluetooth_id:bluetooth_id};
		  	}
			dbo.collection("users").insertOne(user, function(err, res) {
			    if (err) throw err;
			    db.close();
			    callback({msg:"success", user_id:res.ops[0]._id})
			});
	    }
	    else
	    {
	   		db.close();
			callback({msg:"failure", error:"Name already taken"})
			
		}
	  });

	});
}

module.exports.sign_in = function (e_mail, password, callback)
{
	MongoClient.connect(url, function(err, db) {
	  if (err) throw err;
	  var dbo = db.db("heroku_l59s96ps");
	  database = dbo

	  var query = { e_mail: e_mail };
	  dbo.collection("users").findOne(query,function(err, result) {
	  	
	    if (err) throw err;

	    if (!result)
	    {
	    	callback({msg:"failure", error:"User does not exist"})
	    }else
	    {
	    	let real_salt = result.salt 
			let real_hash = result.hash

			var test_hash = crypto.pbkdf2Sync(password, real_salt, 1000, 64, 'sha512').toString('hex');
			db.close();
	  		if (real_hash === test_hash)
	  		{
	  			callback({msg:"success", user_id:result._id})
	  		}else{
	  			callback({msg:"failure", error:"Incorrect password"})
	  		}
	    }

		

	  });
	})
}

module.exports.add_point = function(id, sensor1,sensor2,timestamp,callback)
{
	MongoClient.connect(url, function(err, db) {
	  if (err) throw err;
	  var dbo = db.db("heroku_l59s96ps");
	  database = dbo
	  point = {user_id: id, sensor1:sensor1, sensor2:sensor2, timestamp:timestamp}
	  dbo.collection("points").insertOne(point, function(err, res) {
			    if (err) throw err;
			    db.close();
			    callback({msg:"success"})
		});
	})
}

module.exports.get_all_points = function(id,callback)
{
	MongoClient.connect(url, function(err, db) {
	  if (err) throw err;
	  var dbo = db.db("heroku_l59s96ps");
	  database = dbo
	  current_time = new Date()
	  old_date = new Date()
	  old_date.setDate(current_time.getDate() - 5)
	  current_time.setDate(current_time.getDate() +10)
	  console.log("Old date " + old_date)
	  console.log("New Date: " + current_time)
	  query = {user_id: id}
	  dbo.collection("points").find(query).toArray(function(err, result) {
	  	callback(result)
	  })
	})
}

module.exports.get_last_hours = function(id,hours,callback)
{
	MongoClient.connect(url, function(err, db) {
	  if (err) throw err;
	  var dbo = db.db("heroku_l59s96ps");
	  database = dbo
	  current_time = new Date()
	  current_time.setHours(current_time.getHours()-5)
	  prev_time = new Date(current_time.getTime())
	  prev_time.setHours(prev_time.getHours() - parseInt(hours));
	  console.log("Times")
	  console.log(current_time)
	  console.log(prev_time)
	  query = {user_id: id, timestamp: {$gte:prev_time,$lt: current_time}}
	  dbo.collection("points").find(query).toArray(function(err, result) {
	  	callback(result)
	  })
	})
}

module.exports.get_last_days = function(id,days,callback)
{
	MongoClient.connect(url, function(err, db) {
	  if (err) throw err;
	  var dbo = db.db("heroku_l59s96ps");
	  database = dbo
	  current_time = new Date()
	  current_time.setHours(current_time.getHours()-5)
	  prev_time = new Date(current_time.getTime())
	  prev_time.setDate(prev_time.getDate() - parseInt(days));
	  query = {user_id: id, timestamp: {$gte:prev_time,$lt: current_time}}
	  console.log("Times")
	  console.log(current_time)
	  console.log(prev_time)
	  dbo.collection("points").find(query).toArray(function(err, result) {
	  	callback(result)
	  })
	})
}

module.exports.create_relationship = function(patient_id,doctor_id,callback)
{
	MongoClient.connect(url, function(err, db) {
	  if (err) throw err;
	  var dbo = db.db("heroku_l59s96ps");
	  database = dbo
	  relationship = {patient_id: patient_id, doctor_id:doctor_id}

	    dbo.collection("relationships").find(relationship).toArray(function(err, result) {
	  		if (result.length == 0)
	  		{
	  			dbo.collection("relationships").insertOne(relationship, function(err, res) {
				    if (err) throw err;
				    db.close();
				    callback({msg:"success"})
				});
	  		}else
	  		{
	  			callback({msg:"already exists!"})
	  		}
	  	})
	})
}

module.exports.get_docs = function (patient_id, callback)
{
	MongoClient.connect(url, function(err, db) {
	  if (err) throw err;
	  var dbo = db.db("heroku_l59s96ps");
	  database = dbo

	  var query = { patient_id: patient_id };
	  dbo.collection("relationships").find(query).toArray(function(err, result) {
	    if (err) throw err;
	    if (result.length != 0)
	    {
		  	var ids = []
		  	for (i = 0; i<result.length; i++)
		  	{
		  		ids.push(result[i].doctor_id)
		  	}
		  	callback({msg:"success", doctor_ids:ids})
	    }
	    else
	    {
	   		db.close();
			callback({msg:"failure", error:"Patient does not have doctors"})
		}
	  });

	});
}

module.exports.get_patients = function (doctor_id, callback)
{
	MongoClient.connect(url, function(err, db) {
	  if (err) throw err;
	  var dbo = db.db("heroku_l59s96ps");
	  database = dbo

	  var query = { doctor_id: doctor_id };

	  dbo.collection("relationships").find(query).toArray(function(err, result) {
	    if (err) throw err;

	    if (result.length != 0)
	    {
		  	var ids = []
		  	for (i = 0; i<result.length; i++)
		  	{
		  		ids.push(result[i].patient_id)
		  	}
		  	callback({msg:"success", patient_ids:ids})
	    }
	    else
	    {
	   		db.close();
			callback({msg:"failure", error:"Doctor does not have patients"})
		}
	  });

	});
}

module.exports.get_user = function (patient_id, callback)
{
	MongoClient.connect(url, function(err, db) {
	  if (err) throw err;
	  var dbo = db.db("heroku_l59s96ps");
	  database = dbo

	  var query = {_id:ObjectId(patient_id)}
	  	console.log(query)
	  	dbo.collection("users").findOne(query,function(err, result) {
		  	if(result){
		  		callback({msg:"success", user:result})
		  	}else{
		  		callback({msg:"failure"})
		  	}
	  	})
	  

	});
}