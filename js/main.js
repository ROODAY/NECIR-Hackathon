/*/
/* Variables
/*/

firebase.initializeApp({
	apiKey: "AIzaSyBbzmALixt_f1-i0qP41JBi_X74bp-ly68",
	authDomain: "necir-hackathon.firebaseapp.com",
	databaseURL: "https://necir-hackathon.firebaseio.com",
	storageBucket: ""
});

var currentReport, currentReportID;
var database = firebase.database();
var provider = new firebase.auth.GoogleAuthProvider();

var firstResultIndex = 0;
var resultSection = null;
var resultsLength = 9;

var adminReviewedIndices  = JSON.parse(window.localStorage.getItem('adminReviewedIndices'));
var filteredIndices       = JSON.parse(window.localStorage.getItem('filteredIndices'));
var unfilteredIndices     = JSON.parse(window.localStorage.getItem('unfilteredIndices'));
var user                  = JSON.parse(window.localStorage.getItem("user"));
var repeatUser            = window.localStorage.getItem("repeatUser");

var adminAuth                   = document.querySelector('#admin-auth');
var approveReportsNavButton     = document.querySelector('#approve-reports');
var approveReportsTableBody     = document.querySelector('#approve-reports-table > tbody');
var beginEndDateSpan            = document.querySelector('#begin-end-date');
var candidateSpan               = document.querySelector('#candidate-name');
var categorizationOptions = document.querySelector('#categorization-options');
var committeeSpan               = document.querySelector('#committee-name');
var currentReportDiv            = document.querySelector("#current-report");
var districtSpan                = document.querySelector('#district');
var filingDateSpan              = document.querySelector('#filing-date');
var fullReportDialog            = document.querySelector('#full-report-dialog');
var getNextReportButton         = document.querySelector("#get-report");
var googleLoginButton           = document.querySelector('#google-login');
var landing                     = document.querySelector('#landing');
var navGoogleLogin              = document.querySelector('#nav-google-login');
var navLogout                   = document.querySelector('#nav-logout');
var navNecirLogin               = document.querySelector('#nav-necir-login');
var necirLoginButton            = document.querySelector('#necir-login');
var necirLoginDialog            = document.querySelector('#necir-login-dialog');
var officeSpan                  = document.querySelector('#office');
var preElement                  = document.querySelector('#raw-data');
var profilePicture              = document.querySelector('#propic')
var receiptsSpan                = document.querySelector('#receipts');
var refreshApproveReportsButton = document.querySelector("#refresh-approve-reports");
var refreshViewReportsButton    = document.querySelector("#refresh-view-reports");
var reportIDSpan                = document.querySelector('#report-id');
var reportsFilter               = document.querySelector('#reports-filter');
var reportTypeSpan              = document.querySelector('#report-type');
var resultsLengthWrapper        = document.querySelector('#results-length-wrapper')
var saveCategorizationButton    = document.querySelector('#save-categorization');
var saveTableCategorizationButton    = document.querySelector('#save-table-categorization');
var show10ReportsButton         = document.querySelector("#show-10-reports");
var show25ReportsButton         = document.querySelector("#show-25-reports");
var show50ReportsButton         = document.querySelector("#show-50-reports");
var showApprovedReportsButton   = document.querySelector("#show-approved-reports");
var showFilteredReportsButton   = document.querySelector("#show-filtered-reports");
var showFullReportButton        = document.querySelector("#show-full-report");
var showUnfilteredReportsButton = document.querySelector("#show-unfiltered-reports");
var snackbarContainer           = document.querySelector('#necir-snackbar');
var tableCategorizationOptions = document.querySelector('#table-categorization-options');
var tableFullReportDialog       = document.querySelector('#table-full-report-dialog');
var tablePreElement             = document.querySelector('#table-raw-data');
var userNameSpan                = document.querySelector('#user-name');
var viewReportsNextButton       = document.querySelector("#view-reports-next");
var viewReportsPreviousButton   = document.querySelector("#view-reports-previous");
var viewReportsTableBody        = document.querySelector('#view-reports-table > tbody');

var navLinks                    = document.querySelectorAll(".tab-link");
var tabs                        = document.querySelectorAll('.necir-tab');

/*/
/* Helper Functions
/*/

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

/*/
/* Authentication Functions
/*/

function necirLogin() {
	var email = necirLoginDialog.querySelector('#login-email').value;
	var password = necirLoginDialog.querySelector('#login-password').value;
	if (email === null || email === "", password === null || password === "") {
		necirLoginDialog.querySelector('.error-message').innerHTML = 'Please enter both a valid email and password.';
		removeClass(necirLoginDialog.querySelector('.error-message'), 'hidden');
	} else {
		addClass(necirLoginDialog.querySelector('.error-message'), 'hidden');
		firebase.auth().signInWithEmailAndPassword(email, password).then(function(){
			necirLoginDialog.close();
			landing.style.margin = "-100vh";
			setTimeout(function(){
				addClass(landing, 'hidden');
			}, 500);
			var snackbarData = {
				message: 'Login Successful',
				timeout: 2000
			};
			snackbarContainer.MaterialSnackbar.showSnackbar(snackbarData);
			necirLoginDialog.querySelector('#login-email').value ='';
			necirLoginDialog.querySelector('#login-password').value ='';
			addClass(navGoogleLogin, 'hidden');
			addClass(navNecirLogin, 'hidden');
			removeClass(navLogout, 'hidden');
			user = firebase.auth().currentUser;
			database.ref('admins/' + user.uid).once('value').then(function(snapshot){
				if (snapshot.val() === null) {
					removeClass(adminAuth, 'hidden2');
					addClass(approveReportsNavButton, 'hidden2');
				} else {
					removeClass(approveReportsNavButton, 'hidden2');
				}
			});
			if (isReal(user.displayName)) {
				userNameSpan.innerHTML = user.displayName;
			} else if (isReal(user.email)) {
				userNameSpan.innerHTML = user.email;
			}
			if (isReal(user.photoURL)) {
				profilePicture.src = user.photoURL;
			} else {
				profilePicture.src = 'images/user.jpg'
			}
			window.localStorage.setItem("user", JSON.stringify(user));
	  		window.localStorage.setItem("repeatUser", true);
		}).catch(function(error) {
		  	if (error) {
			  	if (error.code === 'auth/user-not-found') {
					firebase.auth().createUserWithEmailAndPassword(email, password).then(function(){
						user = firebase.auth().currentUser;
						if (isReal(user.displayName)) {
							userNameSpan.innerHTML = user.displayName;
						} else if (isReal(user.email)) {
							userNameSpan.innerHTML = user.email;
						}
						if (isReal(user.photoURL)) {
							profilePicture.src = user.photoURL;
						} else {
							profilePicture.src = 'images/user.jpg'
						}
						addClass(navGoogleLogin, 'hidden');
						addClass(navNecirLogin, 'hidden');
						removeClass(navLogout, 'hidden');
						database.ref('admins/' + user.uid).once('value').then(function(snapshot){
							if (snapshot.val() === null) {
								removeClass(adminAuth, 'hidden2');
								addClass(approveReportsNavButton, 'hidden2');
							} else {
								removeClass(approveReportsNavButton, 'hidden2');
							}
						});
						window.localStorage.setItem("user", JSON.stringify(user));
	  					window.localStorage.setItem("repeatUser", true);
						if (!user.emailVerified) {
							user.sendEmailVerification();
							necirLoginDialog.close();
							landing.style.margin = "-100vh";
							setTimeout(function(){
								addClass(landing, 'hidden');
							}, 500);
							swal("Success!", "You've registered! Check your email to verify your account!", "success");
							necirLoginDialog.querySelector('#login-email').value ='';
							necirLoginDialog.querySelector('#login-password').value ='';
						}
					}).catch(function(error) {
						if (error) {
							console.error(error);
						}
					});
			  	} else {
			  		console.error(error)
				  	necirLoginDialog.querySelector('.error-message').innerHTML = error.message;
					removeClass(necirLoginDialog.querySelector('.error-message'), 'hidden');
			  	}
		  	}
		});
	}
}

function googleLogin() {
	firebase.auth().signInWithPopup(provider).then(function(result) {
	  var token = result.credential.accessToken;
	  var user = result.user;
	  if (isReal(user.displayName)) {
	  	userNameSpan.innerHTML = user.displayName;
	  } else if (isReal(user.email)) {
	  	userNameSpan.innerHTML = user.email;
	  }
	  if (isReal(user.photoURL)) {
	  	profilePicture.src = user.photoURL;
	  } else {
	  	profilePicture.src = 'images/user.jpg'
	  }
	  addClass(navGoogleLogin, 'hidden');
	  addClass(navNecirLogin, 'hidden');
	  removeClass(navLogout, 'hidden');
	  database.ref('admins/' + user.uid).once('value').then(function(snapshot){
	  	if (snapshot.val() === null) {
	  		removeClass(adminAuth, 'hidden2');
	  		addClass(approveReportsNavButton, 'hidden2');
	  	} else {
	  		removeClass(approveReportsNavButton, 'hidden2');
	  	}
	  });
	  var snackbarData = {
	    message: 'Login Successful',
	    timeout: 2000
	  };
	  snackbarContainer.MaterialSnackbar.showSnackbar(snackbarData);
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
		userNameSpan.innerHTML = "Log In";
		profilePicture.src = "images/user.jpg";
		addClass(adminAuth, 'hidden2');
		addClass(approveReportsNavButton, 'hidden2');
		removeClass(navGoogleLogin, 'hidden');
		removeClass(navNecirLogin, 'hidden');
		addClass(navLogout, 'hidden');
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

/*/
/* Review Reports Page Functions
/*/

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
		    message: 'Data Does Not Yet Exist',
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
	removeClass(currentReportDiv, "hidden");
	addClass(getNextReportButton, 'hidden');
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
	    currentReport.Individual_Or_Organization = categorizationOptions.querySelector('input[name="organizationOptions"]:checked').value;
		currentReport.Location                   = categorizationOptions.querySelector('input[name="locationOptions"]:checked').value;
		currentReport.Notable_Contributor        = categorizationOptions.querySelector("#switch-notable").checked;
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

/*/
/* View All Reports Page Functions
/*/

function fillViewReports(index) {
	if (resultSection != null && resultSection != undefined) {
		var key = resultSection[Object.keys(resultSection)[index]];
		database.ref('reports/' + key).once('value').then(function(snapshot){
			var report = snapshot.val();
			if (report != null) {
				var tr = document.createElement('tr');
				tr.innerHTML = '<td>' + report.Report_ID + '</td><td class="mdl-data-table__cell--non-numeric">' + report.Full_Name + '</td><td class="mdl-data-table__cell--non-numeric">' + report.District + '</td><td class="mdl-data-table__cell--non-numeric"><button data-reportid="' + report.Report_ID + '" class="mdl-button mdl-js-button mdl-button--icon view-report-idbutton"><i class="material-icons">zoom_out_map</i></button></td>'
				viewReportsTableBody.appendChild(tr);
				if (index < firstResultIndex + resultsLength) {
					fillViewReports(index + 1);
				} else {
					addViewReportsListeners();
				}
			} else {
				addViewReportsListeners();
			}
		});
	} else {
		var snackbarData = {
		    message: 'Data Does Not Yet Exist',
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
			tableFullReportDialog.dataset.reportid = key;
			if (resultSection === filteredIndices || resultSection === adminReviewedIndices) {
				addClass(tableCategorizationOptions, 'hidden');
				addClass(saveTableCategorizationButton, 'hidden');
			} else {
				removeClass(tableCategorizationOptions, 'hidden');
				removeClass(saveTableCategorizationButton, 'hidden');
			}
			database.ref('reports/' + key).once('value').then(function(snapshot){
				var report = snapshot.val();
				tablePreElement.innerHTML = JSON.stringify(report, null, 4);
				hljs.highlightBlock(tablePreElement);
				tableFullReportDialog.showModal();
				tableFullReportDialog.scrollTop = 0;
			});
		});
	}
}

function saveTableCategorizations() {
	tableFullReportDialog.close();
	swal({
	    title: "Are you sure?", 
	    text: "Continuing will save the current categorization and mark it as filtered.", 
	    type: "warning", 
	    showCancelButton: true, 
	    confirmButtonColor: "#DD6B55", 
	    confirmButtonText: "Yes, continue!", 
	    closeOnConfirm: true
	}, function() {
		database.ref('currentlyAccessedIndices/' + tableFullReportDialog.dataset.reportid).once('value').then(function(snapshot){
			if (snapshot.val() === null) {
				database.ref('reports/' + tableFullReportDialog.dataset.reportid).once('value').then(function(snapshot){
					var report = snapshot.val();
					report.Individual_Or_Organization = tableFullReportDialog.querySelector('input[name="tableOrganizationOptions"]:checked').value;
					report.Location                   = tableFullReportDialog.querySelector('input[name="tableLocationOptions"]:checked').value;
					report.Notable_Contributor        = tableFullReportDialog.querySelector("#table-switch-notable").checked;
					database.ref('reports/' + tableFullReportDialog.dataset.reportid).set(report, function(){
						database.ref('filteredIndices/' + tableFullReportDialog.dataset.reportid).set(tableFullReportDialog.dataset.reportid, function(){
							database.ref('unfilteredIndices/' + tableFullReportDialog.dataset.reportid).set(null, function(){
								delete unfilteredIndices[tableFullReportDialog.dataset.reportid];
								window.localStorage.setItem('unfilteredIndices', JSON.stringify(unfilteredIndices));
								viewReportsTableBody.innerHTML = "";
								fillViewReports(firstResultIndex);
								swal("Success!", "Report has been categorized!", "success");
							});
						});		
					});
				}).catch(function(error){
					console.error(error);
				});
			} else {
				setTimeout(function(){
					swal("Oops...", "Looks like another user is currently reviewing this report!", "error");
				}, 100);
			}
		}).catch(function(error){
			console.error(error);
		});
	});
}

/*/
/* Approve Filtered Reports Page Functions
/*/

function fillApproveReports(index) {
	if (filteredIndices != null && filteredIndices != undefined) {
		var key = filteredIndices[Object.keys(filteredIndices)[index]];
		database.ref('reports/' + key).once('value').then(function(snapshot){
			var report = snapshot.val();
			if (report != null) {
				var tr = document.createElement('tr');
				tr.innerHTML = '<td>' + report.Report_ID + '</td><td class="mdl-data-table__cell--non-numeric">' + report.Full_Name + '</td><td class="mdl-data-table__cell--non-numeric">' + report.District + '</td><td class="mdl-data-table__cell--non-numeric"><button data-reportid="' + report.Report_ID + '" class="mdl-button mdl-js-button mdl-button--icon approve-report-idbutton"><i class="material-icons">zoom_out_map</i></button></td>'
				approveReportsTableBody.appendChild(tr);
				if (index < firstResultIndex + resultsLength) {
					fillViewReports(index + 1);
				} else {
					addApproveReportsListeners();
				}
			} else {
				addApproveReportsListeners();
			}
		});
	} else {
		var snackbarData = {
		    message: 'Data Does Not Yet Exist',
		    timeout: 2000
		  };
	  	snackbarContainer.MaterialSnackbar.showSnackbar(snackbarData);
	}
}

function addApproveReportsListeners() {
	var approveReportIDButtons = document.querySelectorAll(".approve-report-idbutton");
	for (var i = 0; i < viewReportIDButtons.length; i++) {
		viewReportIDButtons[i].addEventListener('click', function(){
			var key = this.dataset.reportid;
			console.log(key)
			database.ref('reports/' + key).once('value').then(function(snapshot){
				var report = snapshot.val();
				tablePreElement.innerHTML = JSON.stringify(report, null, 4);
				hljs.highlightBlock(tablePreElement);
				tableFullReportDialog.showModal();
				tableFullReportDialog.scrollTop = 0;
			});
		});
	}
}

/*/
/* Main Code
/*/

database.ref('currentlyAccessedIndices').set(null); // Development setting, remove for production

for (var i = 0; i < navLinks.length; i++) {
	navLinks[i].addEventListener('click', function(){
		for (var i = 0; i < tabs.length; i++) {
			addClass(tabs[i], "hidden");
		}
		var query = this.href.substring(this.href.indexOf("#"));
		removeClass(document.querySelector(query), "hidden");
		var num = parseInt(query.substring(query.length - 1));
		if (num === 3) {
			firstResultIndex = 0;
			viewReportsTableBody.innerHTML = "";
			fillViewReports(firstResultIndex);
			removeClass(reportsFilter, 'hidden');
			removeClass(resultsLengthWrapper, 'hidden');
		} else if (num === 4) {
			firstResultIndex = 0;
			approveReportsTableBody.innerHTML = "";
			fillApproveReports(firstResultIndex);
			addClass(reportsFilter, 'hidden');
			removeClass(resultsLengthWrapper, 'hidden');
		} else {
			addClass(reportsFilter, 'hidden');
			addClass(resultsLengthWrapper, 'hidden');
		}
	});
}

if (! fullReportDialog.showModal) {
  dialogPolyfill.registerDialog(fullReportDialog);
  dialogPolyfill.registerDialog(tableFullReportDialog);
  dialogPolyfill.registerDialog(necirLoginDialog);
}
if (unfilteredIndices === null || unfilteredIndices === undefined) {
	database.ref('unfilteredIndices/').once('value').then(function(snapshot){
		unfilteredIndices = snapshot.val();
		window.localStorage.setItem('unfilteredIndices', JSON.stringify(unfilteredIndices));
		resultSection = unfilteredIndices;
		viewReportsTableBody.innerHTML = "";
		fillViewReports(firstResultIndex);
		getNextReport(0);
		var snackbarData = {
			message: 'Unfiltered Report Indices Downloaded',
			timeout: 2000
		};
		snackbarContainer.MaterialSnackbar.showSnackbar(snackbarData);
	});
} else {
	resultSection = unfilteredIndices;
	viewReportsTableBody.innerHTML = "";
	fillViewReports(firstResultIndex);
	getNextReport(0);
}
if (filteredIndices === null || filteredIndices === undefined) {
	database.ref('filteredIndices/').once('value').then(function(snapshot){
		filteredIndices = snapshot.val();
		window.localStorage.setItem('filteredIndices', JSON.stringify(filteredIndices));
		var snackbarData = {
			message: 'Filtered Report Indices Downloaded',
			timeout: 2000
		};
		snackbarContainer.MaterialSnackbar.showSnackbar(snackbarData);
	});
}
if (adminReviewedIndices === null || adminReviewedIndices === undefined) {
	database.ref('adminReviewedIndices/').once('value').then(function(snapshot){
		adminReviewedIndices = snapshot.val();
		window.localStorage.setItem('adminReviewedIndices', JSON.stringify(adminReviewedIndices));
		var snackbarData = {
			message: 'Admin Reviewed Report Indices Downloaded',
			timeout: 2000
		};
		snackbarContainer.MaterialSnackbar.showSnackbar(snackbarData);
	});
}
if (user != null) {
	if (isReal(user.displayName)) {
		userNameSpan.innerHTML = user.displayName;
	} else if (isReal(user.email)) {
		userNameSpan.innerHTML = user.email;
	}
	if (isReal(user.photoURL)) {
		profilePicture.src = user.photoURL;
	} else {
	  	profilePicture.src = 'images/user.jpg'
	}
	addClass(navGoogleLogin, 'hidden');
	addClass(navNecirLogin, 'hidden');
	removeClass(navLogout, 'hidden');
	database.ref('admins/' + user.uid).once('value').then(function(snapshot){
		if (snapshot.val() === null) {
			removeClass(adminAuth, 'hidden2');
			addClass(approveReportsNavButton, 'hidden2');
		} else {
			removeClass(approveReportsNavButton, 'hidden2');
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

/*/
/* Event Listeners
/*/

navGoogleLogin.addEventListener('click', googleLogin);
navNecirLogin.addEventListener('click', function(){
	necirLoginDialog.showModal();
});
navLogout.addEventListener('click', firebaseLogout);
adminAuth.addEventListener('click', authenticateAsAdmin);
saveCategorizationButton.addEventListener('click', saveCategorizations);
saveTableCategorizationButton.addEventListener('click', saveTableCategorizations);
showFullReportButton.addEventListener('click', function() {
	hljs.highlightBlock(preElement);
	fullReportDialog.showModal();
	fullReportDialog.scrollTop = 0;
});
fullReportDialog.querySelector('button').addEventListener('click', function() {
	fullReportDialog.close();
});
tableFullReportDialog.querySelector('#close').addEventListener('click', function() {
	tableFullReportDialog.close();
});
necirLoginDialog.querySelector('#close').addEventListener('click', function() {
	necirLoginDialog.close();
});
necirLoginDialog.querySelector('#necir-login-button').addEventListener('click', necirLogin);
getNextReportButton.addEventListener('click', function(){
	getNextReport(0);
});
googleLoginButton.addEventListener('click', function() {
	googleLogin();
	landing.style.margin = "-100vh";
	setTimeout(function(){
		addClass(landing, 'hidden');
	}, 500);
}, false);
necirLoginButton.addEventListener('click', function() {
	necirLoginDialog.showModal();
}, false);
refreshViewReportsButton.addEventListener('click', function(){
	viewReportsTableBody.innerHTML = "";
	fillViewReports(firstResultIndex);
});
refreshApproveReportsButton.addEventListener('click', function(){
	approveReportsTableBody.innerHTML = "";
	fillApproveReports(firstResultIndex);
});
viewReportsPreviousButton.addEventListener('click', function(){
	if ((firstResultIndex - (resultsLength)) >= 0) {
		firstResultIndex -= (resultsLength);
		viewReportsTableBody.innerHTML = "";
		fillViewReports(firstResultIndex);
	} else if (firstResultIndex > 0) {
		viewReportsTableBody.innerHTML = "";
		firstResultIndex = 0;
		fillViewReports(firstResultIndex);
	} else {
		viewReportsPreviousButton.disabled = true;
	}
});

// Fix below

viewReportsNextButton.addEventListener('click', function(){
	if ((firstResultIndex + resultsLength) < Object.keys(unfilteredIndices).length) {
		firstResultIndex += (resultsLength);
		viewReportsTableBody.innerHTML = "";
		fillViewReports(firstResultIndex);
		if (viewReportsPreviousButton.disabled) {
			viewReportsPreviousButton.disabled = false;
		}
	}
});
show10ReportsButton.addEventListener('click', function(){
	resultsLength = 9;
	viewReportsTableBody.innerHTML = "";
	fillViewReports(firstResultIndex);
});
show25ReportsButton.addEventListener('click', function(){
	resultsLength = 24;
	viewReportsTableBody.innerHTML = "";
	fillViewReports(firstResultIndex);
});
show50ReportsButton.addEventListener('click', function(){
	resultsLength = 49;
	viewReportsTableBody.innerHTML = "";
	fillViewReports(firstResultIndex);
});

// Fix below

showUnfilteredReportsButton.addEventListener('click', function(){
	resultSection = unfilteredIndices;
	viewReportsTableBody.innerHTML = "";
	firstResultIndex = 0;
	fillViewReports(firstResultIndex);
});
showFilteredReportsButton.addEventListener('click', function(){
	database.ref('filteredIndices/').once('value').then(function(snapshot){
		filteredIndices = snapshot.val();
		window.localStorage.setItem('filteredIndices', JSON.stringify(filteredIndices));
		resultSection = filteredIndices;
		viewReportsTableBody.innerHTML = "";
		firstResultIndex = 0;
		fillViewReports(firstResultIndex);
		var snackbarData = {
			message: 'Filtered Report Indices Downloaded',
			timeout: 2000
		};
		snackbarContainer.MaterialSnackbar.showSnackbar(snackbarData);
	});
});
showApprovedReportsButton.addEventListener('click', function(){
	database.ref('adminReviewedIndices/').once('value').then(function(snapshot){
		adminReviewedIndices = snapshot.val();
		window.localStorage.setItem('adminReviewedIndices', JSON.stringify(adminReviewedIndices));
		resultSection = adminReviewedIndices;
		viewReportsTableBody.innerHTML = "";
		firstResultIndex = 0;
		fillViewReports(firstResultIndex);
		var snackbarData = {
			message: 'Approved Report Indices Downloaded',
			timeout: 2000
		};
		snackbarContainer.MaterialSnackbar.showSnackbar(snackbarData);
	});
});

/*/
/* Run on Page Load
/*/

window.onload = function() {
	hljs.initHighlightingOnLoad();
}