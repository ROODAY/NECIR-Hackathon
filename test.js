var firebase = require("firebase");
firebase.initializeApp({
  serviceAccount: "./credentials.json",
  databaseURL: "https://necir-hackathon.firebaseio.com/"
});

var db = firebase.database();
var ref = db.ref("/reports");

var stdin = process.openStdin();
console.log("Enter a Report ID: ");

stdin.addListener("data", function(d) {
	ref.child(d.toString().trim()).once("value", function(snapshot) {
	  console.log(snapshot.val());
	  console.log("Enter a Report ID: ");
	});
});

	