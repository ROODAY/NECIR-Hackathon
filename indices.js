var firebase = require("firebase");
firebase.initializeApp({
  serviceAccount: "./credentials.json",
  databaseURL: "https://necir-hackathon.firebaseio.com/"
});

var db = firebase.database();
var ref = db.ref("/unfilteredIndices");
var fs = require('fs');
var Converter = require("csvtojson").Converter;
var header = "Report_ID,Status,CPF_ID,Filing_ID,Report_Type_ID,Report_Type_Description,Amendment,Amendment_Reason,Amendment_To_Report_ID,Amended_By_Report_ID,Filing_Date,Reporting_Period,Report_Year,Beginning_Date,Ending_Date,Beginning_Balance,Receipts,Subtotal,Expenditures,Ending_Balance,Inkinds,Receipts_Unitemized,Receipts_Itemized,Expenditures_Unitemized,Expenditures_Itemized,Inkinds_Unitemized,Inkinds_Itemized,Liabilities,Savings_Total,Report_Month,UI,Reimbursee,Candidate_First_Name,Candidate_Last_Name,Full_Name,Full_Name_Reverse,Bank_Name,District_Code,Office,District,Comm_Name,Report_Candidate_First_Name,Report_Candidate_Last_Name,Report_Office_District,Report_Comm_Name,Report_Bank_Name,Report_Candidate_Address,Report_Candidate_City,Report_Candidate_State,Report_Candidate_Zip,Report_Treasurer_First_Name,Report_Treasurer_Last_Name,Report_Comm_Address,Report_Comm_City,Report_Comm_State,Report_Comm_Zip,Category,Candidate_Clarification,Rec_Count,Exp_Count,Inkind_Count,Liab_Count,R1_Count,CPF9_Count,SV1_Count,Asset_Count,Savings_Account_Count,R1_Item_Count,CPF9_Item_Count,SV1_Item_Count,Filing_Mechanism,Also_Dissolution,Segregated_Account_Type,Municipality_Code,Current_Report_ID,Location,Individual_Or_Organization,Notable_Contributor,Currently_Accessed"
var queue = [];
var count = 0;
var upload_lock = false;
var lineReader = require('readline').createInterface({
  input: fs.createReadStream('test.csv')
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
			var indexRef = ref.child(result[0].Report_ID);
			count += 1;
			indexRef.set(result[0].Report_ID);
			console.log("Sent Index #" + count);
	  }
	});
});