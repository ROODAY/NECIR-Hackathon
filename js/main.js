var config = {
	apiKey: "AIzaSyBbzmALixt_f1-i0qP41JBi_X74bp-ly68",
	authDomain: "necir-hackathon.firebaseapp.com",
	databaseURL: "https://necir-hackathon.firebaseio.com",
	storageBucket: ""
};
firebase.initializeApp(config);
var provider = new firebase.auth.GoogleAuthProvider();
var database = firebase.database();

var landing = document.getElementById('landing');
var landingLogin = document.getElementById('landing-login');
var logout = document.getElementById('logout');
var login = document.getElementById('login');
var tabs = document.getElementsByClassName('necir-tab');
var adminAuth = document.getElementById('admin-auth');
var user = JSON.parse(window.localStorage.getItem("user"));
var unfilteredIndices = JSON.parse(window.localStorage.getItem('unfilteredIndices'));
var repeatUser = window.localStorage.getItem("repeatUser");

landing.style.margin = "-100vh";
setTimeout(function(){
	addClass(landing, 'hidden');
}, 500);
var sampleData = {"Report_ID":39,"Status":"C","CPF_ID":13771,"Filing_ID":13771,"Report_Type_ID":60,"Report_Type_Description":"Deposit Report","Amendment":false,"Amendment_Reason":"","Amendment_To_Report_ID":"","Amended_By_Report_ID":"","Filing_Date":"1\/2\/2002 11:01","Reporting_Period":"1\/2\/2002","Report_Year":2002,"Beginning_Date":"","Ending_Date":"1\/2\/2002 0:00","Beginning_Balance":"","Receipts":"$185.00","Subtotal":"","Expenditures":"","Ending_Balance":"","Inkinds":"","Receipts_Unitemized":"$0.00","Receipts_Itemized":"$185.00","Expenditures_Unitemized":"","Expenditures_Itemized":"","Inkinds_Unitemized":"","Inkinds_Itemized":"","Liabilities":"","Savings_Total":"","Report_Month":"","UI":2000001,"Reimbursee":"","Candidate_First_Name":"Jill","Candidate_Last_Name":"Stein","Full_Name":"Jill Stein","Full_Name_Reverse":"Stein, Jill","Bank_Name":"","District_Code":1109,"Office":"Constitutional","District":"Governor","Comm_Name":"Stein Committee","Report_Candidate_First_Name":"Jill","Report_Candidate_Last_Name":"Stein","Report_Office_District":"Governor of Massachusetts","Report_Comm_Name":"Jill Stein For Governor Campaign","Report_Bank_Name":"Citizen's Bank","Report_Candidate_Address":"","Report_Candidate_City":"","Report_Candidate_State":"","Report_Candidate_Zip":"","Report_Treasurer_First_Name":"","Report_Treasurer_Last_Name":"","Report_Comm_Address":"","Report_Comm_City":"","Report_Comm_State":"","Report_Comm_Zip":"","Category":"D","Candidate_Clarification":"","Rec_Count":24,"Exp_Count":0,"Inkind_Count":0,"Liab_Count":0,"R1_Count":0,"CPF9_Count":0,"SV1_Count":0,"Asset_Count":0,"Savings_Account_Count":0,"R1_Item_Count":0,"CPF9_Item_Count":0,"SV1_Item_Count":0,"Filing_Mechanism":"Unspecified Client Software","Also_Dissolution":0,"Segregated_Account_Type":"","Municipality_Code":0,"Current_Report_ID":39,"Location":"","Individual_Or_Organization":"","Notable_Contributor":"","Currently_Accessed":""}
var preElement = document.getElementById('raw-data');
preElement.innerHTML = JSON.stringify(sampleData, null, 4);

var snackbarContainer = document.querySelector('#necir-snackbar');
var showFullReportButton = document.querySelector("#show-full-report");
var fullReportDialog = document.querySelector('#full-report-dialog');
if (! fullReportDialog.showModal) {
  dialogPolyfill.registerDialog(fullReportDialog);
}

showFullReportButton.addEventListener('click', function() {
	fullReportDialog.showModal();
	fullReportDialog.scrollTop = 0;
});
fullReportDialog.querySelector('button').addEventListener('click', function() {
	fullReportDialog.close();
});

function hasClass(el, className) {
  if (el.classList)
    return el.classList.contains(className)
  else
    return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'))
}

function addClass(el, className) {
  if (el.classList)
    el.classList.add(className)
  else if (!hasClass(el, className)) el.className += " " + className
}

function removeClass(el, className) {
  if (el.classList)
    el.classList.remove(className)
  else if (hasClass(el, className)) {
    var reg = new RegExp('(\\s|^)' + className + '(\\s|$)')
    el.className=el.className.replace(reg, ' ')
  }
}

function isReal(el) {
	if (el != null && el != undefined && el != "") {
		return true;
	} else {
		return false;
	}
}

function firebaseLogin() {
	firebase.auth().signInWithPopup(provider).then(function(result) {
	  var token = result.credential.accessToken;
	  var user = result.user;
	  document.getElementById('user-name').innerHTML = user.displayName;
	  if (isReal(user.photoURL)) {
	  	document.getElementById('propic').src = user.photoURL;
	  }
	  addClass(login, 'hidden');
	  removeClass(logout, 'hidden');
	  database.ref('admins/' + user.uid).on('value', function(snapshot){
	  	if (snapshot.val() === null) {
	  		removeClass(adminAuth, 'hidden2');
	  		addClass(document.querySelector('#approve-reports'), 'hidden2');
	  	} else {
	  		removeClass(document.querySelector('#approve-reports'), 'hidden2');
	  	}
	  });
	  var snackbarData = {
	    message: 'Login Successful',
	    timeout: 2000
	  };
	  snackbarContainer.MaterialSnackbar.showSnackbar(snackbarData);
	  user.lastLogin = new Date();
	  window.localStorage.setItem("user", JSON.stringify(user));
	  window.localStorage.setItem("repeatUser", true);
	  console.log(user);
	}).catch(function(error) {
	  console.error(error);
	  var err = {
	  	"Code": error.code,
	  	"Message": error.message,
	  	"Email": error.email,
	  	"Credential": error.credential
	  }
	  console.log(err);
	  var snackbarData = {
	    message: 'Login Unsuccessful',
	    timeout: 2000
	  };
	  snackbarContainer.MaterialSnackbar.showSnackbar(snackbarData);
	});
}

function firebaseLogout() {
	firebase.auth().signOut().then(function() {
		document.getElementById('user-name').innerHTML = "Log In";
		document.getElementById('propic').src = "images/user.jpg";
		addClass(logout, 'hidden');
		addClass(adminAuth, 'hidden2');
		addClass(document.querySelector('#approve-reports'), 'hidden2');
		removeClass(login, 'hidden');
		var snackbarData = {
		    message: 'Logout Successful',
		    timeout: 2000
		  };
	  	snackbarContainer.MaterialSnackbar.showSnackbar(snackbarData);
	  	window.localStorage.setItem("user", null);
		console.log("sign out successful");
	}, function(error) {
		var snackbarData = {
		    message: 'Logout Unsuccessful',
		    timeout: 2000
		  };
	  	snackbarContainer.MaterialSnackbar.showSnackbar(snackbarData);
		console.error(error);
	});
}

if (user != null) {
	document.getElementById('user-name').innerHTML = user.displayName;
	if (isReal(user.photoURL)) {
		document.getElementById('propic').src = user.photoURL;
	}
	addClass(login, 'hidden');
	removeClass(logout, 'hidden');
	database.ref('admins/' + user.uid).on('value', function(snapshot){
		if (snapshot.val() === null) {
			removeClass(adminAuth, 'hidden2');
			addClass(document.querySelector('#approve-reports'), 'hidden2');
		} else {
			removeClass(document.querySelector('#approve-reports'), 'hidden2');
		}
	});
	firebase.auth().currentUser = user;
}

if (repeatUser != null) {
	for (var i = 0; i < tabs.length; i++) {
		addClass(tabs[i], "hidden");
	}
	removeClass(document.querySelector("#tab-2"), "hidden");
}

login.addEventListener('click', firebaseLogin);
logout.addEventListener('click', firebaseLogout);
landingLogin.addEventListener('click', function() {
	firebaseLogin();
	landing.style.margin = "-100vh";
	setTimeout(function(){
		addClass(landing, 'hidden');
	}, 500);
}, false);

adminAuth.addEventListener('click', function(){
	user = firebase.auth().currentUser;
	if (user) {
	  swal( {
		    title: "Authenticate as Admin", 
		    text: "Enter the NECIR Admin password:", 
		    type: "input", 
		    showCancelButton: true, 
		    closeOnConfirm: false, 
		    animation: "slide-from-top", 
		    inputPlaceholder: "xxxxxxxxxx"
		}, function(inputValue) {
		    if (inputValue===false) return false;
		    if (inputValue==="") {
		        swal.showInputError("You need to write something!");
		        return false
		    }
		    database.ref('adminCode').on('value', function(snapshot) {
		    	if (inputValue === snapshot.val()) {
		    		database.ref('admins/' + user.uid).set(true, function(err){
		    			swal("Success!", "Your account is now an admin account!", "success");
		    		});
		    	} else {
		    		swal("Oops...", "That password wasn't correct!", "error");
		    	}
			});
		});
	} else {
	  swal("Oops...", "You must be logged in to authenticate as admin!", "error");
	}
});

var navLinks = document.getElementsByClassName("tab-link");

for (var i = 0; i < navLinks.length; i++) {
	navLinks[i].addEventListener('click', function(){
		for (var i = 0; i < tabs.length; i++) {
			addClass(tabs[i], "hidden");
		}
		removeClass(document.querySelector(this.href.substring(this.href.indexOf("#"))), "hidden");
	});
}

if (isReal(unfilteredIndices)) {
	console.log(unfilteredIndices[Object.keys(unfilteredIndices)[0]]);
	console.log(unfilteredIndices[Object.keys(unfilteredIndices)[Object.keys(unfilteredIndices).length - 1]]);
}