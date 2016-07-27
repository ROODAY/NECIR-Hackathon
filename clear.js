var firebase = require('firebase');
firebase.initializeApp({
  serviceAccount: "./credentials.json",
  databaseURL: "https://necir-hackathon.firebaseio.com"
});
var db = firebase.database();
var ref = db.ref("/");
ref.set(null, function(err){
	if (err) {
		console.error(err);
		process.exit(1);
	} else {
		console.log("Database Cleared");
		process.exit();
	}
});