var firebase = require("firebase");
firebase.initializeApp({
  serviceAccount: "./credentials.json",
  databaseURL: "https://necir-hackathon.firebaseio.com/"
});

var db = firebase.database();
var ref = db.ref("/test");

var spam = {"Report_ID":39,"Status":"C","CPF_ID":13771,"Filing_ID":13771,"Report_Type_ID":60,"Report_Type_Description":"Deposit Report","Amendment":false,"Amendment_Reason":"","Amendment_To_Report_ID":"","Amended_By_Report_ID":"","Filing_Date":"1\/2\/2002 11:01","Reporting_Period":"1\/2\/2002","Report_Year":2002,"Beginning_Date":"","Ending_Date":"1\/2\/2002 0:00","Beginning_Balance":"","Receipts":"$185.00","Subtotal":"","Expenditures":"","Ending_Balance":"","Inkinds":"","Receipts_Unitemized":"$0.00","Receipts_Itemized":"$185.00","Expenditures_Unitemized":"","Expenditures_Itemized":"","Inkinds_Unitemized":"","Inkinds_Itemized":"","Liabilities":"","Savings_Total":"","Report_Month":"","UI":2000001,"Reimbursee":"","Candidate_First_Name":"Jill","Candidate_Last_Name":"Stein","Full_Name":"Jill Stein","Full_Name_Reverse":"Stein, Jill","Bank_Name":"","District_Code":1109,"Office":"Constitutional","District":"Governor","Comm_Name":"Stein Committee","Report_Candidate_First_Name":"Jill","Report_Candidate_Last_Name":"Stein","Report_Office_District":"Governor of Massachusetts","Report_Comm_Name":"Jill Stein For Governor Campaign","Report_Bank_Name":"Citizen's Bank","Report_Candidate_Address":"","Report_Candidate_City":"","Report_Candidate_State":"","Report_Candidate_Zip":"","Report_Treasurer_First_Name":"","Report_Treasurer_Last_Name":"","Report_Comm_Address":"","Report_Comm_City":"","Report_Comm_State":"","Report_Comm_Zip":"","Category":"D","Candidate_Clarification":"","Rec_Count":24,"Exp_Count":0,"Inkind_Count":0,"Liab_Count":0,"R1_Count":0,"CPF9_Count":0,"SV1_Count":0,"Asset_Count":0,"Savings_Account_Count":0,"R1_Item_Count":0,"CPF9_Item_Count":0,"SV1_Item_Count":0,"Filing_Mechanism":"Unspecified Client Software","Also_Dissolution":0,"Segregated_Account_Type":"","Municipality_Code":0,"Current_Report_ID":39,"Location":"","Individual_Or_Organization":"","Notable_Contributor":"","Currently_Accessed":""}

for (var i = 1; i < 10001; i++) {
	var reportRef = ref.child(i);
    reportRef.set(spam, function(err){
    	console.log("Uploaded: " + i);
    	if (i === 10000) { 
    		console.log("Done");
			process.exit();
    	}
    });
    console.log("Looped through: " + i);
}