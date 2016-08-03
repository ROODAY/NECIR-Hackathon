var firebase = require("firebase");
firebase.initializeApp({
  serviceAccount: "./credentials.json",
  databaseURL: "https://necir-hackathon.firebaseio.com/"
});

var db = firebase.database();
var ref = db.ref("/unfilteredIndices");
var fs = require('fs');
var Converter = require("csvtojson").Converter;
var header = "Report_ID,Date,Contributor,Address,City,State,Zip,Occupation,Employer,Amount,Recipient,Question,Position,question_year,Categorized_By,Approved_By"
var queue = [];
var count = 0;
var upload_lock = false;
var lineReader = require('readline').createInterface({
  input: fs.createReadStream('data.csv')
});

lineReader.on('line', function (line) {
	var line = line.replace(/'/g, "\\'");
	var csvString = header + '\n' + line;
	var converter = new Converter({});
  	converter.fromString(csvString, function(err,result){
		if (err) {
			var errstring = err + "\n";
			fs.appendFile('converter_error_log.txt', errstring, function(err){
				if (err) {
	  			console.log("Converter: Append Log File Error Below:");
	  			console.error(err);
	  			process.exit(1);
	  		} else {
	  			console.log("Converter Error Saved");
	  		}
			});
		} else {
			result[0].Location = "";
			result[0].Individual_Or_Organization = "";
			result[0].Notable_Contributor = "";
			result[0].Categorized_By = "";
			result[0].Approved_By = "";
			var reportRef = ref.child(result[0].Report_ID);
			count += 1;
			reportRef.set(result[0]);
			console.log("Sent Object #" + count);
	  }
	});
});