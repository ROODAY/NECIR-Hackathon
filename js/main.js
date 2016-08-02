/*/
/* Variables
/*/

firebase.initializeApp({
	apiKey: "AIzaSyBbzmALixt_f1-i0qP41JBi_X74bp-ly68", // Take this if you want, but the api calls are restricted to specific domains :p
	authDomain: "necir-hackathon.firebaseapp.com",
	databaseURL: "https://necir-hackathon.firebaseio.com",
	storageBucket: ""
});

var currentReport, currentReportID;
var database = firebase.database();

var firstResultIndex = 0;
var resultSection = null;
var resultsLength = 9;
var resultSectionNum = 1;

var adminReviewedIndices  = JSON.parse(window.localStorage.getItem('adminReviewedIndices'));
var filteredIndices       = JSON.parse(window.localStorage.getItem('filteredIndices'));
var unfilteredIndices     = JSON.parse(window.localStorage.getItem('unfilteredIndices'));
var user                  = JSON.parse(window.localStorage.getItem("user"));
var repeatUser            = window.localStorage.getItem("repeatUser");

var adminAuth                        = document.querySelector('#admin-auth');
var approveReportsLoader             = document.querySelector('#approve-reports-loader');
var approveReportsNavButton          = document.querySelector('#approve-reports');
var approveReportsNextButton         = document.querySelector('#approve-reports-next');
var approveReportsPreviousButton     = document.querySelector('#approve-reports-previous');
var approveReportsTableBody          = document.querySelector('#approve-reports-table > tbody');
var approveTableCategorizationButton = document.querySelector('#approve-table-categorization');
var beginEndDateSpan                 = document.querySelector('#begin-end-date');
var candidateSpan                    = document.querySelector('#candidate-name');
var categorizationOptions            = document.querySelector('#categorization-options');
var committeeSpan                    = document.querySelector('#committee-name');
var currentReportDiv                 = document.querySelector("#current-report");
var currentReportLoader              = document.querySelector('#current-report-loader');
var districtSpan                     = document.querySelector('#district');
var filingDateSpan                   = document.querySelector('#filing-date');
var fullReportDialog                 = document.querySelector('#full-report-dialog');
var getNextReportButton              = document.querySelector("#get-report");
var landing                          = document.querySelector('#landing');
var navLogout                        = document.querySelector('#nav-logout');
var navNecirLogin                    = document.querySelector('#nav-necir-login');
var necirLoginButton                 = document.querySelector('#necir-login');
var necirLoginDialog                 = document.querySelector('#necir-login-dialog');
var officeSpan                       = document.querySelector('#office');
var preElement                       = document.querySelector('#raw-data');
var profilePicture                   = document.querySelector('#propic')
var receiptsSpan                     = document.querySelector('#receipts');
var refreshApproveReportsButton      = document.querySelector("#refresh-approve-reports");
var refreshViewReportsButton         = document.querySelector("#refresh-view-reports");
var reportIDSpan                     = document.querySelector('#report-id');
var reportsFilter                    = document.querySelector('#reports-filter');
var reportTypeSpan                   = document.querySelector('#report-type');
var resetPasswordDialog              = document.querySelector('#reset-password-dialog');
var resetReportButton                = document.querySelector('#reset-report');
var resyncDataButton                 = document.querySelector('#resync-data-button');
var resultsLengthWrapper             = document.querySelector('#results-length-wrapper')
var saveCategorizationButton         = document.querySelector('#save-categorization');
var saveTableCategorizationButton    = document.querySelector('#save-table-categorization');
var settingsButton                   = document.querySelector('#settings-button');
var settingsDialog                   = document.querySelector('#settings-dialog');
var show10ReportsButton              = document.querySelector("#show-10-reports");
var show25ReportsButton              = document.querySelector("#show-25-reports");
var show50ReportsButton              = document.querySelector("#show-50-reports");
var showApprovedReportsButton        = document.querySelector("#show-approved-reports");
var showFilteredReportsButton        = document.querySelector("#show-filtered-reports");
var showFullReportButton             = document.querySelector("#show-full-report");
var showUnfilteredReportsButton      = document.querySelector("#show-unfiltered-reports");
var snackbarContainer                = document.querySelector('#necir-snackbar');
var startButton                      = document.querySelector('#start-button');
var tableCategories                  = document.querySelector('#table-categories');
var tableCategoriesLocation          = document.querySelector('#table-categories-location');
var tableCategoriesNotable           = document.querySelector('#table-categories-notable');
var tableCategoriesType              = document.querySelector('#table-categories-type');
var tableCategorizationOptions       = document.querySelector('#table-categorization-options');
var tableFullReportDialog            = document.querySelector('#table-full-report-dialog');
var tablePreElement                  = document.querySelector('#table-raw-data');
var userNameSpan                     = document.querySelector('#user-name');
var viewReportsHeader                = document.querySelector('#view-reports-header');
var viewReportsLoader                = document.querySelector('#view-reports-loader');
var viewReportsNextButton            = document.querySelector("#view-reports-next");
var viewReportsPreviousButton        = document.querySelector("#view-reports-previous");
var viewReportsTableBody             = document.querySelector('#view-reports-table > tbody');

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
String.prototype.hashCode = function(){
	var hash = 0;
	if (this.length == 0) return hash;
	for (i = 0; i < this.length; i++) {
		char = this.charCodeAt(i);
		hash = ((hash<<5)-hash)+char;
		hash = hash & hash;
	}
	return hash;
}
function resyncData() {
	console.log('Resyncing')
	database.ref('adminReviewedIndices').once('value').then(function(snapshot){
		adminReviewedIndices = snapshot.val();
		window.localStorage.setItem('adminReviewedIndices', JSON.stringify(adminReviewedIndices));
		database.ref('filteredIndices').once('value').then(function(snapshot){
			filteredIndices = snapshot.val();
			window.localStorage.setItem('filteredIndices', JSON.stringify(filteredIndices));
			if (resultSectionNum === 1) {
				resultSection = unfilteredIndices;
			} else if (resultSectionNum === 2) {
				resultSection = filteredIndices;
			} else if (resultSectionNum === 3) {
				resultSection = adminReviewedIndices;
			}
			viewReportsTableBody.innerHTML = "";
			fillViewReports(firstResultIndex);
			approveReportsTableBody.innerHTML = "";
			fillApproveReports(firstResultIndex);
			var snackbarData = {
				message: 'Data Synced',
				timeout: 2000
			};
			snackbarContainer.MaterialSnackbar.showSnackbar(snackbarData);
		}).catch(function(error){
			console.log(error);
		});
	}).catch(function(error){
		console.log(error);
	});
}
function resyncAllData() {
	database.ref('adminReviewedIndices').once('value').then(function(snapshot){
		adminReviewedIndices = snapshot.val();
		window.localStorage.setItem('adminReviewedIndices', JSON.stringify(adminReviewedIndices));
		database.ref('filteredIndices').once('value').then(function(snapshot){
			filteredIndices = snapshot.val();
			window.localStorage.setItem('filteredIndices', JSON.stringify(filteredIndices));
			database.ref('unfilteredIndices').once('value').then(function(snapshot){
				unfilteredIndices = snapshot.val();
				window.localStorage.setItem('unfilteredIndices', JSON.stringify(unfilteredIndices));
				if (resultSectionNum === 1) {
					resultSection = unfilteredIndices;
				} else if (resultSectionNum === 2) {
					resultSection = filteredIndices;
				} else if (resultSectionNum === 3) {
					resultSection = adminReviewedIndices;
				}
				viewReportsTableBody.innerHTML = "";
				fillViewReports(firstResultIndex);
				approveReportsTableBody.innerHTML = "";
				fillApproveReports(firstResultIndex);
				var snackbarData = {
					message: 'All Data Synced',
					timeout: 2000
				};
				snackbarContainer.MaterialSnackbar.showSnackbar(snackbarData);
				if (currentReport === undefined || currentReport === null) {
					getNextReport(0);
				}
			}).catch(function(error){
				console.log(error);
			});
		}).catch(function(error){
			console.log(error);
		});
	}).catch(function(error){
		console.log(error);
	});
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
			addClass(navNecirLogin, 'hidden');
			removeClass(navLogout, 'hidden');
			removeClass(settingsButton, 'hidden');
			user = firebase.auth().currentUser;
			database.ref('admins/' + user.uid).once('value').then(function(snapshot){
				if (snapshot.val() === null) {
					removeClass(adminAuth, 'hidden2');
					addClass(approveReportsNavButton, 'hidden2');
					addClass(approveTableCategorizationButton, 'hidden');
					addClass(resetReportButton, 'hidden');
				} else {
					removeClass(approveReportsNavButton, 'hidden2');
					removeClass(approveTableCategorizationButton, 'hidden');
					removeClass(resetReportButton, 'hidden');
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
	  		removeClass(currentReportLoader, 'hidden');
	  		getNextReport(0);
		}).catch(function(error) {
		  	if (error) {
			  	if (error.code === 'auth/user-not-found') {
			  		necirLoginDialog.close();
			  		swal({
					    title: "Hello New User!", 
					    text: "Please enter the Event Code to register:", 
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
				    	if (inputValue.hashCode() === 444786303) {
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
								addClass(navNecirLogin, 'hidden');
								removeClass(settingsButton, 'hidden');
								removeClass(navLogout, 'hidden');
								database.ref('admins/' + user.uid).once('value').then(function(snapshot){
									if (snapshot.val() === null) {
										removeClass(adminAuth, 'hidden2');
										addClass(approveReportsNavButton, 'hidden2');
										addClass(approveTableCategorizationButton, 'hidden');
										addClass(resetReportButton, 'hidden');
									} else {
										removeClass(approveReportsNavButton, 'hidden2');
										removeClass(approveTableCategorizationButton, 'hidden');
										removeClass(resetReportButton, 'hidden');
									}
								});
								window.localStorage.setItem("user", JSON.stringify(user));
								if (!user.emailVerified) {
									user.sendEmailVerification();
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
									necirLoginDialog.showModal();
									necirLoginDialog.querySelector('.error-message').innerHTML = error.message;
									removeClass(necirLoginDialog.querySelector('.error-message'), 'hidden');
								}
							});
				    	} else {
				    		swal("Oops...", "That password wasn't correct!", "error");
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

function firebaseLogout() {
	database.ref('currentlyAccessedIndices/' + currentReportID).set(null);
	firebase.auth().signOut().then(function() {
		userNameSpan.innerHTML = "Log In";
		profilePicture.src = "images/user.jpg";
		addClass(adminAuth, 'hidden2');
		addClass(approveReportsNavButton, 'hidden2');
		addClass(approveTableCategorizationButton, 'hidden');
		addClass(resetReportButton, 'hidden');
		removeClass(navNecirLogin, 'hidden');
		addClass(settingsButton, 'hidden');
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
	 	swal({
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
		    			addClass(adminAuth, 'hidden2');
						removeClass(approveReportsNavButton, 'hidden2');
						removeClass(approveTableCategorizationButton, 'hidden');
						removeClass(resetReportButton, 'hidden');
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
				database.ref('unfilteredIndices/' + currentReportID).once('value').then(function(snapshot){
					if (snapshot.val() != null) {
						database.ref('currentlyAccessedIndices/' + currentReportID).set(true, function() {
							database.ref('reports/' + currentReportID).once('value').then(function(snapshot){
								currentReport = snapshot.val();
								fillReportData();
							});
						});
					} else {
						delete unfilteredIndices[currentReportID];
						getNextReport(startIndex + 1);
					}
				});	
			} else {
				getNextReport(startIndex + 1);
			}
		});
	} else {
		var snackbarData = {
		    message: 'Downloading Data...',
		    timeout: 2000
		};
		addClass(currentReportLoader, 'hidden');
		resyncAllData();
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
	addClass(currentReportLoader, 'hidden');
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
						removeClass(currentReportLoader, 'hidden');
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
		addClass(viewReportsLoader, 'hidden');
		var snackbarData = {
		    message: 'Waiting for Data...',
		    timeout: 2000
		};
	  	snackbarContainer.MaterialSnackbar.showSnackbar(snackbarData);
	  	if (resultSectionNum === 2) {
	  		database.ref('filteredIndices/').once('value').then(function(snapshot){
	  			if (snapshot.val() === null) {
					var snackbarData = {
					    message: 'Data Does Not Yet Exist',
					    timeout: 2000
					};
				  	snackbarContainer.MaterialSnackbar.showSnackbar(snackbarData);
	  			} else {
	  				resyncData();
	  			}
	  		});
	  	} else if (resultSectionNum === 3) {
			database.ref('adminReviewedIndices/').once('value').then(function(snapshot){
				if (snapshot.val() === null) {
					var snackbarData = {
					    message: 'Data Does Not Yet Exist',
					    timeout: 2000
					};
				  	snackbarContainer.MaterialSnackbar.showSnackbar(snackbarData);
				} else {
					resyncData();
				}
	  		});
	  	}
	}
}

function addViewReportsListeners() {
	var viewReportIDButtons = document.querySelectorAll(".view-report-idbutton");
	addClass(viewReportsLoader, 'hidden');
	removeClass(viewReportsTableBody, 'hidden');
	for (var i = 0; i < viewReportIDButtons.length; i++) {
		viewReportIDButtons[i].addEventListener('click', function(){
			var key = this.dataset.reportid;
			tableFullReportDialog.dataset.reportid = key;
			if (resultSectionNum === 2) {
				addClass(tableCategorizationOptions, 'hidden');
				addClass(saveTableCategorizationButton, 'hidden');
				removeClass(approveTableCategorizationButton, 'hidden');
				removeClass(resetReportButton, 'hidden');
				removeClass(tableCategories, 'hidden');
			} else if (resultSectionNum === 3) {
				addClass(tableCategorizationOptions, 'hidden');
				addClass(saveTableCategorizationButton, 'hidden');
				addClass(approveTableCategorizationButton, 'hidden');
				removeClass(resetReportButton, 'hidden');
				removeClass(tableCategories, 'hidden');
			} else {
				removeClass(tableCategorizationOptions, 'hidden');
				removeClass(saveTableCategorizationButton, 'hidden');
				addClass(approveTableCategorizationButton, 'hidden');
				addClass(resetReportButton, 'hidden');
				addClass(tableCategories, 'hidden');
			}
			database.ref('reports/' + key).once('value').then(function(snapshot){
				var report = snapshot.val();
				tablePreElement.innerHTML = JSON.stringify(report, null, 4);
				tableCategoriesType.innerHTML = report.Individual_Or_Organization;
				tableCategoriesLocation.innerHTML = report.Location;
				tableCategoriesNotable.innerHTML = report.Notable_Contributor;
				hljs.highlightBlock(tablePreElement);
				tableFullReportDialog.showModal();
				tableFullReportDialog.scrollTop = 0;
			});
		});
	}
}

function saveTableCategorizations() {
	database.ref('currentlyAccessedIndices/' + tableFullReportDialog.dataset.reportid).once('value').then(function(snapshot){
		if (snapshot.val() === null) {
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
								addClass(viewReportsTableBody, 'hidden');
								removeClass(viewReportsLoader, 'hidden');
								fillViewReports(firstResultIndex);
								swal("Success!", "Report has been categorized!", "success");
							});
						});		
					});
				}).catch(function(error){
					console.error(error);
				});
			});
		} else {
			tableFullReportDialog.close();
			swal("Oops...", "Looks like another user is currently reviewing this report!", "error");
		}
	}).catch(function(error){
		console.error(error);
	})
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
					fillApproveReports(index + 1);
				} else {
					addApproveReportsListeners();
				}
			} else {
				addApproveReportsListeners();
			}
		});
	} else {
		addClass(approveReportsLoader, 'hidden');
	  	var snackbarData = {
		    message: 'Waiting for Data...',
		    timeout: 2000
		};
	  	snackbarContainer.MaterialSnackbar.showSnackbar(snackbarData);
	  	if (resultSectionNum === 2) {
	  		database.ref('filteredIndices/').once('value').then(function(snapshot){
	  			if (snapshot.val() === null) {
					var snackbarData = {
					    message: 'Data Does Not Yet Exist',
					    timeout: 2000
					};
				  	snackbarContainer.MaterialSnackbar.showSnackbar(snackbarData);
	  			} else {
	  				resyncData();
	  			}
	  		});
	  	} else if (resultSectionNum === 3) {
			database.ref('adminReviewedIndices/').once('value').then(function(snapshot){
				if (snapshot.val() === null) {
					var snackbarData = {
					    message: 'Data Does Not Yet Exist',
					    timeout: 2000
					};
				  	snackbarContainer.MaterialSnackbar.showSnackbar(snackbarData);
				} else {
					resyncData();
				}
	  		});
	  	}
	}
}

function addApproveReportsListeners() {
	var approveReportIDButtons = document.querySelectorAll(".approve-report-idbutton");
	removeClass(approveReportsTableBody, 'hidden');
	addClass(approveReportsLoader, 'hidden');
	for (var i = 0; i < approveReportIDButtons.length; i++) {
		approveReportIDButtons[i].addEventListener('click', function(){
			var key = this.dataset.reportid;
			tableFullReportDialog.dataset.reportid = key;
			addClass(tableCategorizationOptions, 'hidden');
			addClass(saveTableCategorizationButton, 'hidden');
			removeClass(approveTableCategorizationButton, 'hidden');
			removeClass(resetReportButton, 'hidden');
			removeClass(tableCategories, 'hidden');
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

function approveReport() {
	database.ref('filteredIndices/' + tableFullReportDialog.dataset.reportid).once('value').then(function(snapshot){
		if (snapshot.val() != null) {
			database.ref('adminReviewedIndices/' + tableFullReportDialog.dataset.reportid).set(tableFullReportDialog.dataset.reportid, function(){
				database.ref('filteredIndices/' + tableFullReportDialog.dataset.reportid).set(null, function(){
					resyncData();
					addClass(viewReportsTableBody, 'hidden');
					removeClass(viewReportsLoader, 'hidden');
					addClass(approveReportsTableBody, 'hidden');
					removeClass(approveReportsLoader, 'hidden');
					tableFullReportDialog.close();
					swal("Success!", "Report has been approved!", "success");
				});
			});
		} else {
			console.log('report is not filtered')
		}
	}).catch(function(error){
		console.error(error);
	});
}

function resetReport() {
	database.ref('currentlyAccessedIndices/' + tableFullReportDialog.dataset.reportid).once('value').then(function(snapshot){
		if (snapshot.val() === null) {
			swal({
			    title: "Are you sure?", 
			    text: "Continuing will reset the current report's categorizations and mark it as unfiltered.", 
			    type: "warning", 
			    showCancelButton: true, 
			    confirmButtonColor: "#DD6B55", 
			    confirmButtonText: "Yes, continue!", 
			    closeOnConfirm: true
			}, function() {
				database.ref('adminReviewedIndices/' + tableFullReportDialog.dataset.reportid).set(null, function(){
					database.ref('filteredIndices/' + tableFullReportDialog.dataset.reportid).set(null, function(){
						database.ref('unfilteredIndices/' + tableFullReportDialog.dataset.reportid).set(tableFullReportDialog.dataset.reportid, function(){
							database.ref('reports/' + tableFullReportDialog.dataset.reportid).once('value').then(function(snapshot){
								var report = snapshot.val();
								report.Individual_Or_Organization = '';
								report.Location                   = '';
								report.Notable_Contributor        = '';
								addClass(viewReportsTableBody, 'hidden');
								removeClass(viewReportsLoader, 'hidden');
								addClass(approveReportsTableBody, 'hidden');
								removeClass(approveReportsLoader, 'hidden');
								resyncAllData();
								database.ref('reports/' + tableFullReportDialog.dataset.reportid).set(report, function(){
									swal("Success!", "Report has successfully been reset!", "success");
								});
							});
						}).catch(function(error){
							console.error(error);
						});
					}).catch(function(error){
						console.error(error);
					});
				}).catch(function(error){
					console.error(error);
				});
			});
		} else {
			swal("Oops...", "Looks like another user is currently reviewing this report!", "error");
		}
	}).catch(function(error){
		console.error(error);
	});
}

/*/
/* Main Code
/*/

for (var i = 0; i < navLinks.length; i++) {
	navLinks[i].addEventListener('click', function(){
		for (var i = 0; i < tabs.length; i++) {
			addClass(tabs[i], "hidden");
		}
		for (var i = 0; i < navLinks.length; i++) {
			removeClass(navLinks[i], 'active');
		}
		var query = this.href.substring(this.href.indexOf("#"));
		removeClass(document.querySelector(query), "hidden");
		addClass(this, 'active');
		var num = parseInt(query.substring(query.length - 1));
		if (num === 3) {
			firstResultIndex = 0;
			viewReportsTableBody.innerHTML = "";
			addClass(viewReportsTableBody, 'hidden');
			removeClass(viewReportsLoader, 'hidden');
			//fillViewReports(firstResultIndex);
			removeClass(reportsFilter, 'hidden');
			removeClass(resultsLengthWrapper, 'hidden');
			resyncData();
		} else if (num === 4) {
			firstResultIndex = 0;
			approveReportsTableBody.innerHTML = "";
			addClass(approveReportsTableBody, 'hidden');
			removeClass(approveReportsLoader, 'hidden');
			//fillApproveReports(firstResultIndex);
			addClass(reportsFilter, 'hidden');
			removeClass(resultsLengthWrapper, 'hidden');
			resyncData();
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
  dialogPolyfill.registerDialog(settingsDialog);
  dialogPolyfill.registerDialog(resetPasswordDialog);
}
if (unfilteredIndices === null || unfilteredIndices === undefined) {
	database.ref('unfilteredIndices/').once('value').then(function(snapshot){
		unfilteredIndices = snapshot.val();
		window.localStorage.setItem('unfilteredIndices', JSON.stringify(unfilteredIndices));
		resultSection = unfilteredIndices;
		viewReportsTableBody.innerHTML = "";
		addClass(viewReportsTableBody, 'hidden');
		removeClass(viewReportsLoader, 'hidden');
		fillViewReports(firstResultIndex);
		removeClass(currentReportLoader, 'hidden');
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
	addClass(viewReportsTableBody, 'hidden');
	removeClass(viewReportsLoader, 'hidden');
	fillViewReports(firstResultIndex);
	removeClass(currentReportLoader, 'hidden');
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
	addClass(navNecirLogin, 'hidden');
	removeClass(navLogout, 'hidden');
	removeClass(settingsButton, 'hidden');
	database.ref('admins/' + user.uid).once('value').then(function(snapshot){
		if (snapshot.val() === null) {
			removeClass(adminAuth, 'hidden2');
			addClass(approveReportsNavButton, 'hidden2');
			addClass(approveTableCategorizationButton, 'hidden');
			addClass(resetReportButton, 'hidden');
		} else {
			removeClass(approveReportsNavButton, 'hidden2');
			removeClass(approveTableCategorizationButton, 'hidden');
			removeClass(resetReportButton, 'hidden');
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

startButton.addEventListener('click', function(){
	window.localStorage.setItem("repeatUser", true);
	for (var i = 0; i < tabs.length; i++) {
		addClass(tabs[i], "hidden");
	}
	removeClass(document.querySelector("#tab-2"), "hidden");
});
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
	removeClass(currentReportLoader, 'hidden');
	getNextReport(0);
});
necirLoginButton.addEventListener('click', function() {
	necirLoginDialog.showModal();
}, false);
refreshViewReportsButton.addEventListener('click', function(){
	viewReportsTableBody.innerHTML = "";
	addClass(viewReportsTableBody, 'hidden');
	removeClass(viewReportsLoader, 'hidden');
	fillViewReports(firstResultIndex);
});
refreshApproveReportsButton.addEventListener('click', function(){
	approveReportsTableBody.innerHTML = "";
	fillApproveReports(firstResultIndex);
	addClass(approveReportsTableBody, 'hidden');
	removeClass(approveReportsLoader, 'hidden');
});
viewReportsPreviousButton.addEventListener('click', function(){
	if ((firstResultIndex - (resultsLength + 1)) >= 0) {
		firstResultIndex -= (resultsLength + 1);
		viewReportsTableBody.innerHTML = "";
		addClass(viewReportsTableBody, 'hidden');
		removeClass(viewReportsLoader, 'hidden');
		fillViewReports(firstResultIndex);
		if (viewReportsNextButton.disabled) {
			viewReportsNextButton.disabled = false;
		}
	} else if (firstResultIndex > 0) {
		viewReportsTableBody.innerHTML = "";
		firstResultIndex = 0;
		addClass(viewReportsTableBody, 'hidden');
		removeClass(viewReportsLoader, 'hidden');
		fillViewReports(firstResultIndex);
		if (viewReportsNextButton.disabled) {
			viewReportsNextButton.disabled = false;
		}
	} else {
		viewReportsPreviousButton.disabled = true;
	}
});
viewReportsNextButton.addEventListener('click', function(){
	if ((firstResultIndex + resultsLength + 1) < Object.keys(resultSection).length) {
		firstResultIndex += (resultsLength + 1);
		viewReportsTableBody.innerHTML = "";
		addClass(viewReportsTableBody, 'hidden');
		removeClass(viewReportsLoader, 'hidden');
		fillViewReports(firstResultIndex);
		if (viewReportsPreviousButton.disabled) {
			viewReportsPreviousButton.disabled = false;
		}
	} else {
		viewReportsNextButton.disabled = true;
	}
});
approveReportsPreviousButton.addEventListener('click', function(){
	if ((firstResultIndex - (resultsLength + 1)) >= 0) {
		firstResultIndex -= (resultsLength + 1);
		approveReportsTableBody.innerHTML = "";
		fillApproveReports(firstResultIndex);
		addClass(approveReportsTableBody, 'hidden');
		removeClass(approveReportsLoader, 'hidden');
		if (approveReportsNextButton.disabled) {
			approveReportsNextButton.disabled = false;
		}
	} else if (firstResultIndex > 0) {
		approveReportsTableBody.innerHTML = "";
		firstResultIndex = 0;
		fillApproveReports(firstResultIndex);
		addClass(approveReportsTableBody, 'hidden');
		removeClass(approveReportsLoader, 'hidden');
		if (approveReportsNextButton.disabled) {
			approveReportsNextButton.disabled = false;
		}
	} else {
		approveReportsPreviousButton.disabled = true;
	}
});
approveReportsNextButton.addEventListener('click', function(){
	if ((firstResultIndex + resultsLength + 1) < Object.keys(resultSection).length) {
		firstResultIndex += (resultsLength + 1);
		approveReportsTableBody.innerHTML = "";
		fillApproveReports(firstResultIndex);
		addClass(approveReportsTableBody, 'hidden');
		removeClass(approveReportsLoader, 'hidden');
		if (approveReportsPreviousButton.disabled) {
			approveReportsPreviousButton.disabled = false;
		}
	} else {
		approveReportsNextButton.disabled = true;
	}
});
show10ReportsButton.addEventListener('click', function(){
	resultsLength = 9;
	viewReportsTableBody.innerHTML = "";
	addClass(viewReportsTableBody, 'hidden');
	removeClass(viewReportsLoader, 'hidden');
	fillViewReports(firstResultIndex);
	approveReportsTableBody.innerHTML = "";
	fillApproveReports(firstResultIndex);
	addClass(approveReportsTableBody, 'hidden');
	removeClass(approveReportsLoader, 'hidden');
});
show25ReportsButton.addEventListener('click', function(){
	resultsLength = 24;
	viewReportsTableBody.innerHTML = "";
	addClass(viewReportsTableBody, 'hidden');
	removeClass(viewReportsLoader, 'hidden');
	fillViewReports(firstResultIndex);
	approveReportsTableBody.innerHTML = "";
	fillApproveReports(firstResultIndex);
	addClass(approveReportsTableBody, 'hidden');
	removeClass(approveReportsLoader, 'hidden');
});
show50ReportsButton.addEventListener('click', function(){
	resultsLength = 49;
	viewReportsTableBody.innerHTML = "";
	addClass(viewReportsTableBody, 'hidden');
	removeClass(viewReportsLoader, 'hidden');
	fillViewReports(firstResultIndex);
	approveReportsTableBody.innerHTML = "";
	fillApproveReports(firstResultIndex);
	addClass(approveReportsTableBody, 'hidden');
	removeClass(approveReportsLoader, 'hidden');
});
showUnfilteredReportsButton.addEventListener('click', function(){
	resultSection = unfilteredIndices;
	resultSectionNum = 1;
	viewReportsTableBody.innerHTML = "";
	firstResultIndex = 0;
	addClass(viewReportsTableBody, 'hidden');
	removeClass(viewReportsLoader, 'hidden');
	fillViewReports(firstResultIndex);
	if (viewReportsNextButton.disabled) {
			viewReportsNextButton.disabled = false;
		}
		if (viewReportsPreviousButton.disabled) {
			viewReportsPreviousButton.disabled = false;
		}
	viewReportsHeader.innerHTML = 'Unfiltered Reports';
});
showFilteredReportsButton.addEventListener('click', function(){
	database.ref('filteredIndices/').once('value').then(function(snapshot){
		filteredIndices = snapshot.val();
		window.localStorage.setItem('filteredIndices', JSON.stringify(filteredIndices));
		resultSection = filteredIndices;
		resultSectionNum = 2;
		viewReportsTableBody.innerHTML = "";
		firstResultIndex = 0;
		addClass(viewReportsTableBody, 'hidden');
		removeClass(viewReportsLoader, 'hidden');
		fillViewReports(firstResultIndex);
		if (viewReportsNextButton.disabled) {
			viewReportsNextButton.disabled = false;
		}
		if (viewReportsPreviousButton.disabled) {
			viewReportsPreviousButton.disabled = false;
		}
		viewReportsHeader.innerHTML = 'Filtered Reports';
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
		resultSectionNum = 3;
		viewReportsTableBody.innerHTML = "";
		firstResultIndex = 0;
		addClass(viewReportsTableBody, 'hidden');
		removeClass(viewReportsLoader, 'hidden');
		fillViewReports(firstResultIndex);
		if (viewReportsNextButton.disabled) {
			viewReportsNextButton.disabled = false;
		}
		if (viewReportsPreviousButton.disabled) {
			viewReportsPreviousButton.disabled = false;
		}
		viewReportsHeader.innerHTML = 'Approved Reports';
		var snackbarData = {
			message: 'Approved Report Indices Downloaded',
			timeout: 2000
		};
		snackbarContainer.MaterialSnackbar.showSnackbar(snackbarData);
	});
});
approveTableCategorizationButton.addEventListener('click', function(){
	database.ref('admins/' + user.uid).once('value').then(function(snapshot){
		if (snapshot.val() != null) {
			approveReport();
		} else {
			swal("Oops...", "You must be an admin to do that!", "error");
		}
	});
});
resetReportButton.addEventListener('click', function(){
	database.ref('admins/' + user.uid).once('value').then(function(snapshot){
		if (snapshot.val() != null) {
			tableFullReportDialog.close();
			resetReport();
		} else {
			swal("Oops...", "You must be an admin to do that!", "error");
		}
	});
});
settingsButton.addEventListener('click', function(){
	if (!firebase.auth().currentUser.emailVerified) {
		removeClass(settingsDialog.querySelector('#resend-verification'), 'hidden');
	} else {
		addClass(settingsDialog.querySelector('#resend-verification'), 'hidden');
	}
	if (isReal(user.displayName)) {
		settingsDialog.querySelector('#settings-display-name').value = user.displayName;
	} else if (isReal(user.email)) {
		settingsDialog.querySelector('#settings-display-name').value = user.email;
	}
	if (isReal(user.photoURL)) {
		settingsDialog.querySelector('#settings-photo-url').value = user.photoURL;
	} else {
	  	settingsDialog.querySelector('#settings-photo-url').value = 'images/user.jpg';
	}
	settingsDialog.showModal();
});
settingsDialog.querySelector('#close').addEventListener('click', function() {
	settingsDialog.close();
});
settingsDialog.querySelector('#settings-update').addEventListener('click', function() {
	user = firebase.auth().currentUser;
	var name = settingsDialog.querySelector('#settings-display-name').value;
	var pURL = settingsDialog.querySelector('#settings-photo-url').value;
	user.updateProfile({
	  displayName: name,
	  photoURL: pURL
	}).then(function() {
		settingsDialog.close();
		firebase.auth().currentUser = user;
		window.localStorage.setItem("user", JSON.stringify(user));
	 	swal("Success!", "Preferences updated!", "success");
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
	}, function(error) {
	  console.error(error);
	});
});
settingsDialog.querySelector('#resend-verification').addEventListener('click', function(){
	user.sendEmailVerification()
});
necirLoginDialog.querySelector('#forgot-password').addEventListener('click', function(){
	necirLoginDialog.close();
	resetPasswordDialog.showModal();
});
resetPasswordDialog.querySelector('#reset-password-button').addEventListener('click', function(){
	var email = resetPasswordDialog.querySelector('#reset-password-email').value;
	if (isReal(email)){
		resetPasswordDialog.querySelector('.error-message').value = ''
		removeClass(resetPasswordDialog.querySelector('.error-message'), 'hidden');
		var auth = firebase.auth();
		auth.sendPasswordResetEmail(email).then(function() {
			resetPasswordDialog.close();
			swal("Success!", "A password reset has been sent to the email you provided!", "success");
		}, function(error) {
			resetPasswordDialog.querySelector('.error-message').innerHTML = error.message;
			removeClass(resetPasswordDialog.querySelector('.error-message'), 'hidden');
			console.error(error);
		});
	} else {
		resetPasswordDialog.querySelector('.error-message').innerHTML = 'You must enter a valid email!'
		removeClass(resetPasswordDialog.querySelector('.error-message'), 'hidden');
	}
});
resyncDataButton.addEventListener('click', function(){
	settingsDialog.close();
	swal({
	    title: "Are you sure?", 
	    text: "Resyncing data might take a bit, so be prepared to wait. (The webpage may also become unresponsive for a few seconds.)", 
	    type: "warning", 
	    showCancelButton: true, 
	    confirmButtonColor: "#DD6B55", 
	    confirmButtonText: "Resync Data", 
	    closeOnConfirm: true
	}, function() {
		resyncAllData();
		var snackbarData = {
			message: 'Beginning Resync...',
			timeout: 2000
		};
		snackbarContainer.MaterialSnackbar.showSnackbar(snackbarData);
	});
});
/*/
/* Page Hooks
/*/

window.onload = function() {
	hljs.initHighlightingOnLoad();
}

window.onbeforeunload = confirmExit;
function confirmExit(){
	database.ref('currentlyAccessedIndices/' + currentReportID).set(null, function(){
		return false;
	});
}