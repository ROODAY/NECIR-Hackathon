var config = {
	apiKey: "AIzaSyBbzmALixt_f1-i0qP41JBi_X74bp-ly68",
	authDomain: "necir-hackathon.firebaseapp.com",
	databaseURL: "https://necir-hackathon.firebaseio.com",
	storageBucket: ""
};
firebase.initializeApp(config);
var provider = new firebase.auth.GoogleAuthProvider();
var database = firebase.database();
var user = JSON.parse(window.localStorage.getItem("user"));
var unfilteredIndices = JSON.parse(window.localStorage.getItem('unfilteredIndices'));
var repeatUser = window.localStorage.getItem("repeatUser");
var currentReport, currentReportID;

//database.ref('currentlyAccessedIndices').set(null);

if (unfilteredIndices === null || unfilteredIndices === undefined) {
	database.ref('unfilteredIndices/').once('value').then(function(snapshot){
		unfilteredIndices = snapshot.val();
		window.localStorage.setItem('unfilteredIndices', JSON.stringify(unfilteredIndices));
	});
}

var landing = document.querySelector('#landing');
var landingLogin = document.querySelector('#landing-login');
var logout = document.querySelector('#logout');
var login = document.querySelector('#login');
var adminAuth = document.querySelector('#admin-auth');
var reportIDSpan = document.querySelector('#report-id');
var reportTypeSpan = document.querySelector('#report-type');
var filingDateSpan = document.querySelector('#filing-date');
var beginEndDateSpan = document.querySelector('#begin-end-date');
var receiptsSpan = document.querySelector('#receipts');
var candidateSpan = document.querySelector('#candidate-name');
var committeeSpan = document.querySelector('#committee-name');
var districtSpan = document.querySelector('#district');
var officeSpan = document.querySelector('#office');
var preElement = document.querySelector('#raw-data');
var tablePreElement = document.querySelector('#table-raw-data');
var snackbarContainer = document.querySelector('#necir-snackbar');
var showFullReportButton = document.querySelector("#show-full-report");
var fullReportDialog = document.querySelector('#full-report-dialog');
var tableFullReportDialog = document.querySelector('#table-full-report-dialog');
var searchBar = document.querySelector('#search-bar');
var reportsFilter = document.querySelector('#reports-filter');
var resultsLengthWrapper = document.querySelector('#results-length-wrapper')
var tabs = document.querySelectorAll('.necir-tab');
var navLinks = document.querySelectorAll(".tab-link");

if (! fullReportDialog.showModal) {
  dialogPolyfill.registerDialog(fullReportDialog);
  dialogPolyfill.registerDialog(tableFullReportDialog);
}

showFullReportButton.addEventListener('click', function() {
	fullReportDialog.showModal();
	fullReportDialog.scrollTop = 0;
});
fullReportDialog.querySelector('button').addEventListener('click', function() {
	fullReportDialog.close();
});
tableFullReportDialog.querySelector('button').addEventListener('click', function() {
	tableFullReportDialog.close();
});

for (var i = 0; i < navLinks.length; i++) {
	navLinks[i].addEventListener('click', function(){
		for (var i = 0; i < tabs.length; i++) {
			addClass(tabs[i], "hidden");
		}
		var query = this.href.substring(this.href.indexOf("#"));
		removeClass(document.querySelector(query), "hidden");
		var num = parseInt(query.substring(query.length - 1));
		if (num === 3 || num === 4) {
			removeClass(searchBar, 'hidden');
			removeClass(reportsFilter, 'hidden');
			removeClass(resultsLengthWrapper, 'hidden');
		} else {
			addClass(searchBar, 'hidden');
			addClass(reportsFilter, 'hidden');
			addClass(resultsLengthWrapper, 'hidden');
		}
	});
}

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
	  database.ref('admins/' + user.uid).once('value').then(function(snapshot){
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
	}, function(error) {
		var snackbarData = {
		    message: 'Logout Unsuccessful',
		    timeout: 2000
		  };
	  	snackbarContainer.MaterialSnackbar.showSnackbar(snackbarData);
		console.error(error);
	});
}

function getNextReport(startIndex) {
	if (unfilteredIndices != null && unfilteredIndices != undefined) {
		currentReportID = unfilteredIndices[Object.keys(unfilteredIndices)[startIndex]];
		database.ref('currentlyAccessedIndices/' + currentReportID).once('value').then(function(snapshot){
			if (snapshot.val() === null) {
				database.ref('currentlyAccessedIndices/' + currentReportID).set(true, function() {
					database.ref('reports/' + currentReportID).once('value').then(function(snapshot){
						currentReport = snapshot.val();
						fillReportData();
					});
				});
			} else {
				getNextReport(startIndex + 1);
			}
		});
	} else {
		var snackbarData = {
		    message: 'Please wait as data downloads',
		    timeout: 2000
		  };
	  	snackbarContainer.MaterialSnackbar.showSnackbar(snackbarData);
	}
}

function fillReportData() {
	reportIDSpan.innerHTML = currentReport.Report_ID;
	reportTypeSpan.innerHTML = currentReport.Report_Type_Description;
	filingDateSpan.innerHTML = currentReport.Filing_Date.replace(/\\/g, '');
	beginEndDateSpan.innerHTML = currentReport.Beginning_Date.replace(/\\/g, '') + ' - ' + currentReport.Ending_Date.replace(/\\/g, '');
	receiptsSpan.innerHTML = currentReport.Receipts;
	candidateSpan.innerHTML = currentReport.Full_Name;
	committeeSpan.innerHTML = currentReport.Comm_Name;
	districtSpan.innerHTML = currentReport.District;
	officeSpan.innerHTML = currentReport.Office;
	preElement.innerHTML = JSON.stringify(currentReport, null, 4);
	removeClass(document.querySelector("#current-report"), "hidden");
	addClass(document.querySelector("#get-report"), 'hidden');
}

function saveCategorizations() {
	swal({
	    title: "Are you sure?", 
	    text: "Continuing will save the current categorization and move on to the next report.", 
	    type: "warning", 
	    showCancelButton: true, 
	    confirmButtonColor: "#DD6B55", 
	    confirmButtonText: "Yes, continue!", 
	    closeOnConfirm: true
	}, function() {
	    currentReport.Individual_Or_Organization = document.querySelector('input[name="organizationOptions"]:checked').value;
		currentReport.Location = document.querySelector('input[name="locationOptions"]:checked').value;
		currentReport.Notable_Contributor = document.querySelector("#switch-notable").checked;
		database.ref('reports/' + currentReportID).set(currentReport, function(err){
			database.ref('filteredIndices/' + currentReportID).set(currentReportID, function(){
				database.ref('unfilteredIndices/' + currentReportID).set(null, function(){
					database.ref('currentlyAccessedIndices/' + currentReportID).set(null, function(){
						delete unfilteredIndices[currentReportID];
						window.localStorage.setItem('unfilteredIndices', JSON.stringify(unfilteredIndices));
						getNextReport(0);
					});
				});
			});		
		});
	});
}

function authenticateAsAdmin() {
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
		    database.ref('adminCode').once('value').then(function(snapshot) {
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
}

if (user != null) {
	document.getElementById('user-name').innerHTML = user.displayName;
	if (isReal(user.photoURL)) {
		document.getElementById('propic').src = user.photoURL;
	}
	addClass(login, 'hidden');
	removeClass(logout, 'hidden');
	database.ref('admins/' + user.uid).once('value').then(function(snapshot){
		if (snapshot.val() === null) {
			removeClass(adminAuth, 'hidden2');
			addClass(document.querySelector('#approve-reports'), 'hidden2');
		} else {
			removeClass(document.querySelector('#approve-reports'), 'hidden2');
		}
	});
	landing.style.margin = "-100vh";
	setTimeout(function(){
		addClass(landing, 'hidden');
	}, 500);
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
adminAuth.addEventListener('click', authenticateAsAdmin);
document.querySelector("#get-report").addEventListener('click', function(){
	getNextReport(0);
});
document.querySelector('#save-categorization').addEventListener('click', saveCategorizations);
landingLogin.addEventListener('click', function() {
	firebaseLogin();
	landing.style.margin = "-100vh";
	setTimeout(function(){
		addClass(landing, 'hidden');
	}, 500);
}, false);


var resultsLength = 10;
var firstResultIndex = 0;
var resultSection = 'unfilteredIndices';

function fillViewReports(index) {
	if (unfilteredIndices != null && unfilteredIndices != undefined) {
		var key = unfilteredIndices[Object.keys(unfilteredIndices)[index]];
		database.ref('reports/' + key).once('value').then(function(snapshot){
			var report = snapshot.val();
			var tr = document.createElement('tr');
			tr.innerHTML = '<td>' + report.Report_ID + '</td><td class="mdl-data-table__cell--non-numeric">' + report.Full_Name + '</td><td class="mdl-data-table__cell--non-numeric">' + report.District + '</td><td class="mdl-data-table__cell--non-numeric"><button data-reportid="' + report.Report_ID + '" class="mdl-button mdl-js-button mdl-button--icon view-report-idbutton"><i class="material-icons">zoom_out_map</i></button></td>'
			document.querySelector('#view-reports-table > tbody').appendChild(tr);
			if (index < firstResultIndex + resultsLength) {
				fillViewReports(index + 1);
			} else {
				addViewReportsListeners();
			}
		});
	} else {
		var snackbarData = {
		    message: 'Please wait as data downloads',
		    timeout: 2000
		  };
	  	snackbarContainer.MaterialSnackbar.showSnackbar(snackbarData);
	}
}

function addViewReportsListeners() {
	var viewReportIDButtons = document.querySelectorAll(".view-report-idbutton");
	for (var i = 0; i < viewReportIDButtons.length; i++) {
		viewReportIDButtons[i].addEventListener('click', function(){
			var key = this.dataset.reportid;
			console.log(key)
			database.ref('reports/' + key).once('value').then(function(snapshot){
				var report = snapshot.val();
				tablePreElement.innerHTML = JSON.stringify(report, null, 4);
				tableFullReportDialog.showModal();
				tableFullReportDialog.scrollTop = 0;
			});
		});
	}
}

document.querySelector("#refresh-view-reports").addEventListener('click', function(){
	document.querySelector('#view-reports-table > tbody').innerHTML = "";
	fillViewReports(firstResultIndex);
});
document.querySelector("#view-reports-previous").addEventListener('click', function(){
	if ((firstResultIndex - (resultsLength + 1)) >= 0) {
		firstResultIndex -= (resultsLength + 1);
		document.querySelector('#view-reports-table > tbody').innerHTML = "";
		fillViewReports(firstResultIndex);
	}
});
document.querySelector("#view-reports-next").addEventListener('click', function(){
	if ((firstResultIndex + resultsLength + 1) < Object.keys(unfilteredIndices).length) {
		firstResultIndex += (resultsLength + 1);
		document.querySelector('#view-reports-table > tbody').innerHTML = "";
		fillViewReports(firstResultIndex);
	}
});

window.onload = function() {
	document.querySelector('#view-reports-table > tbody').innerHTML = "";
	fillViewReports(firstResultIndex);
}