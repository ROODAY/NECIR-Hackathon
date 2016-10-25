/*/
/* Variables
/*/

firebase.initializeApp({
	apiKey: 'AIzaSyBbzmALixt_f1-i0qP41JBi_X74bp-ly68', // Take this if you want, but the API calls are restricted to specific domains :p
	authDomain: 'necir-hackathon.firebaseapp.com',
	databaseURL: 'https://necir-hackathon.firebaseio.com',
	storageBucket: ''
});

var currentReport, currentReportID, newUserEmail;
var database = firebase.database();

var firstResultIndex = 0;
var resultSection = null;
var resultsLength = 9;
var resultSectionNum = 1;
var totalReportsNumber = 1429;

var user                  = JSON.parse(window.localStorage.getItem('user'));
var userData              = JSON.parse(window.localStorage.getItem('userData'));
var confettiHappened      = window.localStorage.getItem('confettiHappened');
var currentTab            = window.localStorage.getItem('currentTab');
var repeatUser            = window.localStorage.getItem('repeatUser');

var adminAuth                        = document.querySelector('#admin-auth');
var approveReportsLoader             = document.querySelector('#approve-reports-loader');
var approveReportsNavButton          = document.querySelector('#approve-reports');
var approveReportsNextButton         = document.querySelector('#approve-reports-next');
var approveReportsPreviousButton     = document.querySelector('#approve-reports-previous');
var approveReportsTableBody          = document.querySelector('#approve-reports-table > tbody');
var approveTableCategorizationButton = document.querySelector('#approve-table-categorization');
var categorizationOptions            = document.querySelector('#categorization-options');
var currentReportDiv                 = document.querySelector("#current-report");
var currentReportLoader              = document.querySelector('#current-report-loader');
var eventProgress                    = document.querySelector('#event-progress');
var fullReportDialog                 = document.querySelector('#full-report-dialog');
var getNextReportButton              = document.querySelector("#get-report");
var landing                          = document.querySelector('#landing');
var navLogout                        = document.querySelector('#nav-logout');
var navNecirLogin                    = document.querySelector('#nav-necir-login');
var necirLoginButton                 = document.querySelector('#necir-login');
var necirLoginDialog                 = document.querySelector('#necir-login-dialog');
var preElement                       = document.querySelector('#raw-data');
var profilePicture                   = document.querySelector('#propic')
var refreshApproveReportsButton      = document.querySelector("#refresh-approve-reports");
var refreshViewReportsButton         = document.querySelector("#refresh-view-reports");
var reportsFilter                    = document.querySelector('#reports-filter');
var resetPasswordDialog              = document.querySelector('#reset-password-dialog');
var resetReportButton                = document.querySelector('#reset-report');
var resultsLengthWrapper             = document.querySelector('#results-length-wrapper')
var resyncDataButton                 = document.querySelector('#resync-data-button');
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
var spanAmount                       = document.querySelector('#span-amount');
var spanCitystate                    = document.querySelector('#span-citystate');
var spanContributor                  = document.querySelector('#span-contributor');
var spanDate                         = document.querySelector('#span-date');
var spanQuestion                     = document.querySelector('#span-question');
//var spanQuestionyear                 = document.querySelector('#span-questionyear');
var spanRecipient                    = document.querySelector('#span-recipient');
var startButton                      = document.querySelector('#start-button');
var tableCategories                  = document.querySelector('#table-categories');
var tableCategoriesLocation          = document.querySelector('#table-categories-location');
var tableCategoriesNotable           = document.querySelector('#table-categories-notable');
var tableCategoriesType              = document.querySelector('#table-categories-type');
var tableCategorizationOptions       = document.querySelector('#table-categorization-options');
var tableFullReportDialog            = document.querySelector('#table-full-report-dialog');
var tablePreElement                  = document.querySelector('#table-raw-data');
var userCounter                      = document.querySelector('#user-counter');
var userNameSpan                     = document.querySelector('#user-name');
var viewReportsHeader                = document.querySelector('#view-reports-header');
var viewReportsLoader                = document.querySelector('#view-reports-loader');
var viewReportsNextButton            = document.querySelector("#view-reports-next");
var viewReportsPreviousButton        = document.querySelector("#view-reports-previous");
var viewReportsTableBody             = document.querySelector('#view-reports-table > tbody');
var navLinks                         = document.querySelectorAll('.tab-link');
var tabs                             = document.querySelectorAll('.necir-tab');

/*/
/* Helper Functions
/*/

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
function validateEmail(email) {
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
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
					var snackbarData = {
						message: 'Fetching report...',
						timeout: 2000
					};
					snackbarContainer.MaterialSnackbar.showSnackbar(snackbarData);
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
function weDidIt() {
	if (!confettiHappened) {
		confettiHappened = false;
		window.localStorage.setItem("confettiHappened", confettiHappened);
		removeClass(document.querySelector('#confetti-wrapper'), 'hidden');
		database.ref('users').once('value').then(function(snapshot){
			var allusers = snapshot.val();
			var topusers = [];
			for (var i = 0; i < Object.keys(allusers).length; i++) {
				topusers.push(allusers[Object.keys(allusers)[i]]);
			}
			topusers.sort(function(a, b) {
			    return b.reportsCategorized - a.reportsCategorized;
			});
			swal("We Did It!", "All reports have been categorized! " + topusers[0].username + " categorized the most, at " + topusers[0].reportsCategorized + " reports!", "success");
			var COLORS, Confetti, NUM_CONFETTI, PI_2, canvas, confetti, context, drawCircle, i, range, resizeWindow, xpos;

			NUM_CONFETTI = 350;

			COLORS = [[85, 71, 106], [174, 61, 99], [219, 56, 83], [244, 92, 68], [248, 182, 70]];

			PI_2 = 2 * Math.PI;

			canvas = document.getElementById("world");

			context = canvas.getContext("2d");

			window.w = 0;

			window.h = 0;

			resizeWindow = function() {
			window.w = canvas.width = window.innerWidth;
			return window.h = canvas.height = window.innerHeight;
			};
			resizeWindow();

			window.addEventListener('resize', resizeWindow, false);

			range = function(a, b) {
			return (b - a) * Math.random() + a;
			};

			drawCircle = function(x, y, r, style) {
			context.beginPath();
			context.arc(x, y, r, 0, PI_2, false);
			context.fillStyle = style;
			return context.fill();
			};

			xpos = 0.5;

			document.onmousemove = function(e) {
			return xpos = e.pageX / w;
			};

			window.requestAnimationFrame = (function() {
			return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
			  return window.setTimeout(callback, 1000 / 60);
			};
			})();

			Confetti = (function() {
			function Confetti() {
			  this.style = COLORS[~~range(0, 5)];
			  this.rgb = "rgba(" + this.style[0] + "," + this.style[1] + "," + this.style[2];
			  this.r = ~~range(2, 6);
			  this.r2 = 2 * this.r;
			  this.replace();
			}

			Confetti.prototype.replace = function() {
			  this.opacity = 0;
			  this.dop = 0.03 * range(1, 4);
			  this.x = range(-this.r2, w - this.r2);
			  this.y = range(-20, h - this.r2);
			  this.xmax = w - this.r;
			  this.ymax = h - this.r;
			  this.vx = range(0, 2) + 8 * xpos - 5;
			  return this.vy = 0.7 * this.r + range(-1, 1);
			};

			Confetti.prototype.draw = function() {
			  var ref;
			  this.x += this.vx;
			  this.y += this.vy;
			  this.opacity += this.dop;
			  if (this.opacity > 1) {
			    this.opacity = 1;
			    this.dop *= -1;
			  }
			  if (this.opacity < 0 || this.y > this.ymax) {
			    this.replace();
			  }
			  if (!((0 < (ref = this.x) && ref < this.xmax))) {
			    this.x = (this.x + this.xmax) % this.xmax;
			  }
			  return drawCircle(~~this.x, ~~this.y, this.r, this.rgb + "," + this.opacity + ")");
			};

			return Confetti;

			})();

			confetti = (function() {
			var j, ref, results;
			results = [];
			for (i = j = 1, ref = NUM_CONFETTI; 1 <= ref ? j <= ref : j >= ref; i = 1 <= ref ? ++j : --j) {
			  results.push(new Confetti);
			}
			return results;
			})();

			window.step = function() {
			var c, j, len, results;
			requestAnimationFrame(step);
			context.clearRect(0, 0, w, h);
			results = [];
			for (j = 0, len = confetti.length; j < len; j++) {
			  c = confetti[j];
			  results.push(c.draw());
			}
			return results;
			};

			step();
		}).catch(function(error){
			console.error(error);
		});
	}
}

/*/
/* Authentication Functions
/*/

function necirLogin() {
	var username = necirLoginDialog.querySelector('#login-username').value;
	database.ref('users/' + username).once('value').then(function(snapshot){
		userData = snapshot.val();
		if (userData === null) {
			var newusername = necirLoginDialog.querySelector('#login-username').value;
			var newuserpassword = necirLoginDialog.querySelector('#login-password').value;
			necirLoginDialog.close();
			swal({
				title: "Hello New User!", 
				text: "Please enter your email:", 
				type: "input", 
				showCancelButton: true, 
				closeOnConfirm: false, 
				animation: "slide-from-top", 
				inputPlaceholder: "name@domain.com"
			}, function(inputValue) {
				if (inputValue===false) return false;
				if (inputValue==="" || !validateEmail(inputValue)) {
					swal.showInputError("You must provide a valid email!");
					return false
				}
				newUserEmail = inputValue;
				swal({
					title: "Almost there!", 
					text: "Please enter the Event Code to register:", 
					type: "input", 
					showCancelButton: true, 
					closeOnConfirm: false, 
					animation: "slide-from-top", 
					inputPlaceholder: "xxxxxxxxxx"
				}, function(inputValue2) {
					if (inputValue2===false) return false;
					if (inputValue2==="") {
						swal.showInputError("You need to write something!");
						return false
					}
					database.ref('eventCode').once('value').then(function(snapshot){
						var eventCode = snapshot.val();
						if (inputValue2 === eventCode) {
							firebase.auth().createUserWithEmailAndPassword(newUserEmail, newuserpassword).then(function(){
								user = firebase.auth().currentUser;
								var newUserData = {
									username: newusername,
									email: newUserEmail,
									password: newuserpassword.hashCode(),
									photoURL: '',
									reportsCategorized: 0
								};
								database.ref('users/' + newusername).set(newUserData, function(err){
									if (err) {
										console.error(error);
									} else {
										if (isReal(newUserData.username)) {
											userNameSpan.innerHTML = newUserData.username;
										} else if (isReal(newUserData.email)) {
											userNameSpan.innerHTML = newUserData.email;
										}
										if (isReal(newUserData.photoURL)) {
											profilePicture.src = newUserData.photoURL;
										} else {
											profilePicture.src = 'images/user.jpg'
										}
										if (isReal(newUserData.reportsCategorized)) {
											userCounter.innerHTML = newUserData.reportsCategorized;
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
										}).catch(function(error){
											console.error(error);
										});
										window.localStorage.setItem("user", JSON.stringify(user));
										window.localStorage.setItem("userData", JSON.stringify(newUserData));
										userData = newUserData;
										database.ref('users/' + userData.username + '/reportsCategorized').on('value', function(snapshot){
											console.log('report categorized');
											if (snapshot.val() === 1) {
												userCounter.innerHTML = '1 Report Categorized';
											} else {
												userCounter.innerHTML = snapshot.val() + ' Reports Categorized';
											}
										});
										resyncAllData();
										landing.style.margin = "-100vh";
										setTimeout(function(){
											addClass(landing, 'hidden');
										}, 500);
										swal("Success!", "You've registered!", "success");
										necirLoginDialog.querySelector('#login-email').value ='';
										necirLoginDialog.querySelector('#login-username').value ='';
										necirLoginDialog.querySelector('#login-password').value ='';
									}
								});
							}).catch(function(error) {
								if (error) {
									console.error(error);
									necirLoginDialog.showModal();
									necirLoginDialog.querySelector('.error-message').innerHTML = error.message;
									removeClass(necirLoginDialog.querySelector('.error-message'), 'hidden');
								}
							});
						} else {
							swal("Oops...", "That event code wasn't correct!", "error");
						}
					}).catch(function(error){
						console.error(error);
					});
				});
			});					
		} else {
			var username = necirLoginDialog.querySelector('#login-username').value;
			var password = necirLoginDialog.querySelector('#login-password').value;
			if (username === userData.username && password.hashCode() === userData.password) {
				addClass(necirLoginDialog.querySelector('.error-message'), 'hidden');
				firebase.auth().signInWithEmailAndPassword(userData.email, password).then(function(){
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
					necirLoginDialog.querySelector('#login-username').value = '';
					necirLoginDialog.querySelector('#login-email').value ='';
					necirLoginDialog.querySelector('#login-password').value ='';
					addClass(navNecirLogin, 'hidden');
					removeClass(navLogout, 'hidden');
					removeClass(settingsButton, 'hidden');
					user = firebase.auth().currentUser;
					resyncAllData();
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
					}).catch(function(error){
						console.error(error);
					});
					if (isReal(userData.username)) {
						userNameSpan.innerHTML = userData.username;
					} else if (isReal(user.email)) {
						userNameSpan.innerHTML = user.email;
					}
					if (isReal(userData.photoURL)) {
						profilePicture.src = userData.photoURL;
					} else {
						profilePicture.src = 'images/user.jpg'
					}
					if (isReal(userData.reportsCategorized)) {
						if (userData.reportsCategorized === 1) {
							userCounter.innerHTML = '1 Report Categorized';
						} else {
							userCounter.innerHTML = userData.reportsCategorized + ' Reports Categorized';
						}
						
					}
					database.ref('users/' + userData.username + '/reportsCategorized').on('value', function(snapshot){
						console.log('report categorized');
						if (snapshot.val() === 1) {
							userCounter.innerHTML = '1 Report Categorized';
						} else {
							userCounter.innerHTML = snapshot.val() + ' Reports Categorized';
						}
					});
					window.localStorage.setItem("user", JSON.stringify(user));
					window.localStorage.setItem("userData", JSON.stringify(userData));
					removeClass(currentReportLoader, 'hidden');
					getNextReport(0);
					var snackbarData = {
						message: 'Fetching report...',
						timeout: 2000
					};
					snackbarContainer.MaterialSnackbar.showSnackbar(snackbarData);
				}).catch(function(error) {
					if (error) {
						if (error.code === 'auth/user-not-found') {
							
						} else {
							console.error(error)
							necirLoginDialog.querySelector('.error-message').innerHTML = error.message;
							removeClass(necirLoginDialog.querySelector('.error-message'), 'hidden');
						}
					}
				});
			} else {
				necirLoginDialog.querySelector('.error-message').innerHTML = 'That username and password combo is invalid. If you are a new user, this means that username is taken.';
				removeClass(necirLoginDialog.querySelector('.error-message'), 'hidden');
			}
		}
	}).catch(function(error){
		console.error(error);
	});
}

function firebaseLogout() {
	database.ref('currentlyAccessedIndices/' + currentReportID).set(null, function(err){
		if (err) {
			console.error(err);
		}
	});
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
		userCounter.innerHTML = 0 + ' Reports Categorized';
		var snackbarData = {
			message: 'Logout Successful',
			timeout: 2000
		  };
		snackbarContainer.MaterialSnackbar.showSnackbar(snackbarData);
		window.localStorage.setItem("user", null);
		window.localStorage.setItem("userData", null);
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
						if (err) {
							console.error(err);
						}
					});
				} else {
					swal("Oops...", "That password wasn't correct!", "error");
				}
			}).catch(function(error){
				console.error(error);
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
	database.ref('unfilteredIndices').once('value').then(function(snapshot){
		var data = snapshot.val();
		currentReportID = data[Object.keys(data)[startIndex]];
		database.ref('currentlyAccessedIndices/' + currentReportID).once('value').then(function(snapshot){
			if (snapshot.val() === null) {
				database.ref('unfilteredIndices/' + currentReportID).once('value').then(function(snapshot){
					if (snapshot.val() != null) {
						database.ref('currentlyAccessedIndices/' + currentReportID).set(true, function(err) {
							if (err) {
								console.error(err);
							}
							database.ref('reports/' + currentReportID).once('value').then(function(snapshot){
								currentReport = snapshot.val();
								fillReportData();
								var snackbarData = {
									message: 'Report fetched',
									timeout: 2000
								};
								snackbarContainer.MaterialSnackbar.showSnackbar(snackbarData);
							}).catch(function(error){
								console.error(error);
							});
						});
					} else {
						getNextReport(startIndex + 1);
					}
				}).catch(function(error){
					console.error(error);
				});	
			} else {
				getNextReport(startIndex + 1);
			}
		}).catch(function(error){
			console.error(error);
		});
	}).catch(function(error){
		console.error(error);
	});
}

function fillReportData() {
	spanQuestion.innerHTML = currentReport.Question;
	//spanQuestionyear.innerHTML = currentReport.question_year;
	spanRecipient.innerHTML = currentReport.Recipient;
	spanContributor.innerHTML = currentReport.Contributor;
	spanCitystate.innerHTML = currentReport.City + ', ' + currentReport.State;
	spanAmount.innerHTML = currentReport.Amount;
	spanDate.innerHTML = currentReport.Date;
	preElement.innerHTML = JSON.stringify(currentReport, null, 4);
	database.ref('admins/' + user.uid).once('value').then(function(snapshot){
		if (snapshot.val() === null) {
			addClass(showFullReportButton, 'hidden');
		} else {
			removeClass(showFullReportButton, 'hidden');
		}
	}).catch(function(error){
		console.error(error);
	});
	var radio1 = categorizationOptions.querySelectorAll('input[name="organizationOptions"]');
	//var radio2 = categorizationOptions.querySelectorAll('input[name="locationOptions"]');
	for (var i = 0; i < radio1.length; i++) {
		radio1[i].parentNode.MaterialRadio.uncheck();
		if (i < 3) {
			//radio2[i].parentNode.MaterialRadio.uncheck();
		}
	}
	categorizationOptions.querySelector("#switch-notable").checked = false;
	removeClass(categorizationOptions.querySelector("#switch-notable").parentNode, 'is-checked');
	removeClass(currentReportDiv, "hidden");
	addClass(currentReportLoader, 'hidden');
	addClass(getNextReportButton, 'hidden');
}

function saveCategorizations() {
	if (categorizationOptions.querySelector('input[name="organizationOptions"]:checked') != null /*&& categorizationOptions.querySelector('input[name="locationOptions"]:checked') != null*/) {
		database.ref('unfilteredIndices/' + currentReportID).once('value').then(function(snapshot){
			if (snapshot.val() != null) {
				swal({
					title: "Are you sure?", 
					text: "Continuing will save the current categorization and move on to the next report.", 
					showCancelButton: true, 
					confirmButtonColor: "#DD6B55", 
					confirmButtonText: "Yes, continue!", 
					closeOnConfirm: true
				}, function() {
					currentReport.Individual_Or_Organization = categorizationOptions.querySelector('input[name="organizationOptions"]:checked').value;
					//currentReport.Location                   = categorizationOptions.querySelector('input[name="locationOptions"]:checked').value;
					currentReport.Notable_Contributor        = categorizationOptions.querySelector("#switch-notable").checked;
					currentReport.Categorized_By             = userData.username;
					database.ref('reports/' + currentReportID).set(currentReport, function(err){
						if (err) {
							console.error(err);
						}
						database.ref('filteredIndices/' + currentReportID).set(currentReportID, function(err){
							if (err) {
								console.error(err);
							}
							database.ref('unfilteredIndices/' + currentReportID).set(null, function(err){
								if (err) {
									console.error(err);
								}
								database.ref('currentlyAccessedIndices/' + currentReportID).set(null, function(err){
									if (err) {
										console.error(err);
									}
									userData.reportsCategorized += 1;
									database.ref('users/' + userData.username + '/reportsCategorized').set(userData.reportsCategorized, function(err){
										if (err) {
											console.error(err);
										} else {
											removeClass(currentReportLoader, 'hidden');
											getNextReport(0);
											var snackbarData = {
												message: 'Fetching report...',
												timeout: 2000
											};
											snackbarContainer.MaterialSnackbar.showSnackbar(snackbarData);
										}
									});	
								});
							});
						});		
					});
				});	
			} else {
				swal("Oops...", "Looks like this report has already been reviewed!", "error");
			}
		}).catch(function(error){
			console.error(error);
		});
	} else {
		swal("Oops...", "Looks like you didn't select some categorizations!", "error");
	}	
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
				tr.innerHTML = '<td>' + report.Report_ID + '</td><td class="mdl-data-table__cell--non-numeric">' + report.Recipient + '</td><td class="mdl-data-table__cell--non-numeric">' + report.Amount + '</td><td class="mdl-data-table__cell--non-numeric">' + report.Date + '</td><td class="mdl-data-table__cell--non-numeric"><button data-reportid="' + report.Report_ID + '" class="mdl-button mdl-js-button mdl-button--icon view-report-idbutton"><i class="material-icons">zoom_out_map</i></button></td>'
				viewReportsTableBody.appendChild(tr);
				if (index < firstResultIndex + resultsLength) {
					fillViewReports(index + 1);
				} else {
					addViewReportsListeners();
				}
			} else {
				addViewReportsListeners();
			}
		}).catch(function(error){
			console.log(error);
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
			}).catch(function(error){
				console.log(error);
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
			}).catch(function(error){
				console.log(error);
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
				tableFullReportDialog.querySelector("#table-span-question").innerHTML = report.Question;
				tableFullReportDialog.querySelector("#table-span-questionyear").innerHTML = report.question_year;
				tableFullReportDialog.querySelector("#table-span-recipient").innerHTML = report.Recipient;
				tableFullReportDialog.querySelector("#table-span-contributor").innerHTML = report.Contributor;
				tableFullReportDialog.querySelector("#table-span-citystate").innerHTML = report.City + ', ' + report.State;
				tableFullReportDialog.querySelector("#table-span-amount").innerHTML = report.Amount;
				tableFullReportDialog.querySelector("#table-span-date").innerHTML = report.Date;
				var radio1 = tableFullReportDialog.querySelectorAll('input[name="tableOrganizationOptions"]');
				//var radio2 = tableFullReportDialog.querySelectorAll('input[name="tableLocationOptions"]');
				for (var i = 0; i < radio1.length; i++) {
					radio1[i].parentNode.MaterialRadio.uncheck();
					if (i < 3) {
						//radio2[i].parentNode.MaterialRadio.uncheck();
					}
				}
				tableFullReportDialog.querySelector("#table-switch-notable").checked = false;
				removeClass(tableFullReportDialog.querySelector("#table-switch-notable").parentNode, 'is-checked');
				hljs.highlightBlock(tablePreElement);
				database.ref('admins/' + user.uid).once('value').then(function(snapshot){
					if (snapshot.val() != null) {
						tableFullReportDialog.querySelector("#table-span-reportid").innerHTML = report.Report_ID;
						tableFullReportDialog.querySelector("#table-span-admin-question").innerHTML = report.Question;
						tableFullReportDialog.querySelector("#table-span-admin-recipient").innerHTML = report.Recipient;
						tableFullReportDialog.querySelector("#table-span-admin-contributor").innerHTML = report.Contributor;
						tableFullReportDialog.querySelector("#table-span-admin-citystate").innerHTML = report.City + ', ' + report.State;
						tableFullReportDialog.querySelector("#table-span-admin-amount").innerHTML = report.Amount;
						tableFullReportDialog.querySelector("#table-span-admin-date").innerHTML = report.Date;
						removeClass(tableFullReportDialog.querySelector("#table-admin-reportid"), 'hidden');
						removeClass(tableFullReportDialog.querySelector("#table-raw-data-wrapper"), 'hidden');
						removeClass(tableFullReportDialog.querySelector("#table-admin-spans"), 'hidden');
						addClass(tableFullReportDialog.querySelector("#table-user-spans"), 'hidden');
						if (isReal(report.Categorized_By)) {
							tableFullReportDialog.querySelector("#table-span-categorizedby").innerHTML = report.Categorized_By;
							removeClass(tableFullReportDialog.querySelector("#table-admin-categorizedby"), 'hidden');
						} else {
							tableFullReportDialog.querySelector("#table-span-categorizedby").innerHTML = '';
							addClass(tableFullReportDialog.querySelector("#table-admin-categorizedby"), 'hidden');
						}
						if (isReal(report.Approved_By)) {
							tableFullReportDialog.querySelector("#table-span-approvedby").innerHTML = report.Approved_By;
							removeClass(tableFullReportDialog.querySelector("#table-admin-approvedby"), 'hidden');
						} else {
							tableFullReportDialog.querySelector("#table-span-approvedby").innerHTML = '';
							addClass(tableFullReportDialog.querySelector("#table-admin-approvedby"), 'hidden');
						}
					} else {
						addClass(approveTableCategorizationButton, 'hidden');
						addClass(resetReportButton, 'hidden');
						tableFullReportDialog.querySelector("#table-span-reportid").innerHTML = '';
						addClass(tableFullReportDialog.querySelector("#table-admin-reportid"), 'hidden');
						addClass(tableFullReportDialog.querySelector("#table-raw-data-wrapper"), 'hidden');
						addClass(tableFullReportDialog.querySelector("#table-admin-spans"), 'hidden');
						removeClass(tableFullReportDialog.querySelector("#table-user-spans"), 'hidden');
					}
					tableFullReportDialog.showModal();
					tableFullReportDialog.scrollTop = 0;
				}).catch(function(error){
					console.error(error);
				});
			}).catch(function(error){
				console.log(error);
			});
		});
	}
}

function saveTableCategorizations() {
	if (tableFullReportDialog.querySelector('input[name="tableOrganizationOptions"]:checked') != null /*&& tableFullReportDialog.querySelector('input[name="tableLocationOptions"]:checked') != null*/) {
		database.ref('unfilteredIndices/' + tableFullReportDialog.dataset.reportid).once('value').then(function(snapshot){
			if (snapshot.val() != null) {
				tableFullReportDialog.querySelector('.error-message').innerHTML = '';
				addClass(tableFullReportDialog.querySelector('.error-message'), 'hidden');
				database.ref('currentlyAccessedIndices/' + tableFullReportDialog.dataset.reportid).once('value').then(function(snapshot){
					if (snapshot.val() === null) {
						tableFullReportDialog.close();
						swal({
							title: "Are you sure?", 
							text: "Continuing will save the current categorization and mark it as filtered.", 
							showCancelButton: true, 
							confirmButtonColor: "#DD6B55", 
							confirmButtonText: "Yes, continue!", 
							closeOnConfirm: true
						}, function() {
							database.ref('reports/' + tableFullReportDialog.dataset.reportid).once('value').then(function(snapshot){
								var report = snapshot.val();
								report.Individual_Or_Organization = tableFullReportDialog.querySelector('input[name="tableOrganizationOptions"]:checked').value;
								//report.Location                   = tableFullReportDialog.querySelector('input[name="tableLocationOptions"]:checked').value;
								report.Notable_Contributor        = tableFullReportDialog.querySelector("#table-switch-notable").checked;
								report.Categorized_By             = userData.username;
								database.ref('reports/' + tableFullReportDialog.dataset.reportid).set(report, function(err){
									if (err) {
										console.error(err);
									}
									database.ref('filteredIndices/' + tableFullReportDialog.dataset.reportid).set(tableFullReportDialog.dataset.reportid, function(err){
										if (err) {
											console.error(err);
										}
										database.ref('unfilteredIndices/' + tableFullReportDialog.dataset.reportid).set(null, function(err){
											if (err) {
												console.error(err);
											}
											viewReportsTableBody.innerHTML = "";
											addClass(viewReportsTableBody, 'hidden');
											removeClass(viewReportsLoader, 'hidden');
											userData.reportsCategorized += 1;
											database.ref('users/' + userData.username + '/reportsCategorized').set(userData.reportsCategorized, function(err){
												if (err) {
													console.error(err);
												} else {
													fillViewReports(firstResultIndex);
													swal("Success!", "Report has been categorized!", "success");
												}
											});	
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
				});
			} else {
				swal("Oops...", "Looks like this report has already been reviewed!", "error");
			}
		}).catch(function(error){
			console.error(error);
		});	
	} else {
		tableFullReportDialog.querySelector('.error-message').innerHTML = 'Looks like you didn\'t select some categorizations!';
		removeClass(tableFullReportDialog.querySelector('.error-message'), 'hidden');
	}
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
				tr.innerHTML = '<td>' + report.Report_ID + '</td><td class="mdl-data-table__cell--non-numeric">' + report.Recipient + '</td><td class="mdl-data-table__cell--non-numeric">' + report.Amount + '</td><td class="mdl-data-table__cell--non-numeric">' + report.Date + '</td><td class="mdl-data-table__cell--non-numeric"><button data-reportid="' + report.Report_ID + '" class="mdl-button mdl-js-button mdl-button--icon approve-report-idbutton"><i class="material-icons">zoom_out_map</i></button></td>'
				approveReportsTableBody.appendChild(tr);
				if (index < firstResultIndex + resultsLength) {
					fillApproveReports(index + 1);
				} else {
					addApproveReportsListeners();
				}
			} else {
				addApproveReportsListeners();
			}
		}).catch(function(error){
			console.log(error);
		});
	} else {
		addClass(approveReportsLoader, 'hidden');
		var snackbarData = {
			message: 'Waiting for Data...',
			timeout: 2000
		};
		snackbarContainer.MaterialSnackbar.showSnackbar(snackbarData);
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
				tableCategoriesType.innerHTML = report.Individual_Or_Organization;
				tableCategoriesLocation.innerHTML = report.Location;
				tableCategoriesNotable.innerHTML = report.Notable_Contributor;
				tableFullReportDialog.querySelector("#table-span-reportid").innerHTML = report.Report_ID;
				tableFullReportDialog.querySelector("#table-span-admin-question").innerHTML = report.Question;
				tableFullReportDialog.querySelector("#table-span-admin-recipient").innerHTML = report.Recipient;
				tableFullReportDialog.querySelector("#table-span-admin-contributor").innerHTML = report.Contributor;
				tableFullReportDialog.querySelector("#table-span-admin-citystate").innerHTML = report.City + ', ' + report.State;
				tableFullReportDialog.querySelector("#table-span-admin-amount").innerHTML = report.Amount;
				tableFullReportDialog.querySelector("#table-span-admin-date").innerHTML = report.Date;
				removeClass(tableFullReportDialog.querySelector("#table-admin-reportid"), 'hidden');
				removeClass(tableFullReportDialog.querySelector("#table-raw-data-wrapper"), 'hidden');
				removeClass(tableFullReportDialog.querySelector("#table-admin-spans"), 'hidden');
				addClass(tableFullReportDialog.querySelector("#table-user-spans"), 'hidden');
				if (isReal(report.Categorized_By)) {
					tableFullReportDialog.querySelector("#table-span-categorizedby").innerHTML = report.Categorized_By;
					removeClass(tableFullReportDialog.querySelector("#table-admin-categorizedby"), 'hidden');
				} else {
					tableFullReportDialog.querySelector("#table-span-categorizedby").innerHTML = '';
					addClass(tableFullReportDialog.querySelector("#table-admin-categorizedby"), 'hidden');
				}
				if (isReal(report.Approved_By)) {
					tableFullReportDialog.querySelector("#table-span-approvedby").innerHTML = report.Approved_By;
					removeClass(tableFullReportDialog.querySelector("#table-admin-approvedby"), 'hidden');
				} else {
					tableFullReportDialog.querySelector("#table-span-approvedby").innerHTML = '';
					addClass(tableFullReportDialog.querySelector("#table-admin-approvedby"), 'hidden');
				}
				tableFullReportDialog.showModal();
				tableFullReportDialog.scrollTop = 0;
			}).catch(function(error){
				console.log(error);
			});
		});
	}
}

function approveReport() {
	database.ref('admins/' + user.uid).once('value').then(function(snapshot){
		if (snapshot.val() != null) {
			database.ref('reports/' + tableFullReportDialog.dataset.reportid).once('value').then(function(snapshot){
				var report = snapshot.val();
				report.Approved_By = userData.username;
				database.ref('reports/' + tableFullReportDialog.dataset.reportid).set(report, function(err){
					if (err) {
						console.error(error);
					} else {
						database.ref('filteredIndices/' + tableFullReportDialog.dataset.reportid).once('value').then(function(snapshot){
							if (snapshot.val() != null) {
								database.ref('adminReviewedIndices/' + tableFullReportDialog.dataset.reportid).set(tableFullReportDialog.dataset.reportid, function(err){
									if (err) {
										console.error(err);
									}
									database.ref('filteredIndices/' + tableFullReportDialog.dataset.reportid).set(null, function(err){
										if (err) {
											console.error(err);
										}
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
				})
			}).catch(function(error){
				console.error(error);
			});
		} else {
			tableFullReportDialog.close();
			swal("Oops...", "You must be an admin to do that!", "error");
		}
	}).catch(function(error){
		console.error(error);
	});	
}

function resetReport() {
	database.ref('admins/' + user.uid).once('value').then(function(snapshot){
		if (snapshot.val() != null) {
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
						database.ref('adminReviewedIndices/' + tableFullReportDialog.dataset.reportid).set(null, function(err){
							if (err) {
								console.error(err);
							}
							database.ref('filteredIndices/' + tableFullReportDialog.dataset.reportid).set(null, function(err){
								if (err) {
									console.error(err);
								}
								database.ref('unfilteredIndices/' + tableFullReportDialog.dataset.reportid).set(tableFullReportDialog.dataset.reportid, function(err){
									if (err) {
										console.error(err);
									}
									database.ref('reports/' + tableFullReportDialog.dataset.reportid).once('value').then(function(snapshot){
										var report = snapshot.val();
										database.ref('users/' + report.Categorized_By + '/reportsCategorized').once('value').then(function(snapshot){
											var num = snapshot.val();
											num -= 1;
											database.ref('users/' + report.Categorized_By + '/reportsCategorized').set(num, function(err){
												if (err) {
													console.error(err);
												} else {
													report.Individual_Or_Organization = '';
													report.Location                   = '';
													report.Notable_Contributor        = '';
													report.Categorized_By             = '';
													report.Approved_By                = '';
													addClass(viewReportsTableBody, 'hidden');
													removeClass(viewReportsLoader, 'hidden');
													addClass(approveReportsTableBody, 'hidden');
													removeClass(approveReportsLoader, 'hidden');
													database.ref('reports/' + tableFullReportDialog.dataset.reportid).set(report, function(err){
														if (err) {
															console.error(err);
														} else {
															swal("Success!", "Report has successfully been reset!", "success");
															resyncAllData();
														}
													});
												}
											});
										}).catch(function(error){
											console.error(error);
										});	
									}).catch(function(error){
										console.log(error);
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
					tableFullReportDialog.close();
					swal("Oops...", "Looks like another user is currently reviewing this report!", "error");
				}
			}).catch(function(error){
				console.error(error);
			});
		} else {
			tableFullReportDialog.close();
			swal("Oops...", "You must be an admin to do that!", "error");
		}
	}).catch(function(error){
		console.error(error);
	});
}

/*/
/* Page Hooks
/*/

window.onload = function() {
	hljs.initHighlightingOnLoad();
	
	/*if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
	  addClass(document.querySelector('#event-progress-wrapper'), 'hidden');
	}*/

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
		var snackbarData = {
			message: 'Fetching report...',
			timeout: 2000
		};
		snackbarContainer.MaterialSnackbar.showSnackbar(snackbarData);
	});
	necirLoginButton.addEventListener('click', function() {
		necirLoginDialog.showModal();
	}, false);
	refreshViewReportsButton.addEventListener('click', function(){
		viewReportsTableBody.innerHTML = "";
		addClass(viewReportsTableBody, 'hidden');
		removeClass(viewReportsLoader, 'hidden');
		resyncAllData();
	});
	refreshApproveReportsButton.addEventListener('click', function(){
		approveReportsTableBody.innerHTML = "";
		addClass(approveReportsTableBody, 'hidden');
		removeClass(approveReportsLoader, 'hidden');
		resyncAllData();
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
		database.ref('unfilteredIndices/').once('value').then(function(snapshot){
			resultSection = snapshot.val();
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
			viewReportsHeader.innerHTML = 'Unreviewed Reports';
		}).catch(function(error){
			console.log(error);
		});
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
			viewReportsHeader.innerHTML = 'Reviewed Reports';
			var snackbarData = {
				message: 'Filtered Report Indices Downloaded',
				timeout: 2000
			};
			snackbarContainer.MaterialSnackbar.showSnackbar(snackbarData);
		}).catch(function(error){
			console.log(error);
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
		}).catch(function(error){
			console.log(error);
		});
	});
	approveTableCategorizationButton.addEventListener('click', function(){
		database.ref('admins/' + user.uid).once('value').then(function(snapshot){
			if (snapshot.val() != null) {
				approveReport();
			} else {
				tableFullReportDialog.close();
				swal("Oops...", "You must be an admin to do that!", "error");
			}
		}).catch(function(error){
			console.log(error);
		});
	});
	resetReportButton.addEventListener('click', function(){
		database.ref('admins/' + user.uid).once('value').then(function(snapshot){
			if (snapshot.val() != null) {
				tableFullReportDialog.close();
				resetReport();
			} else {
				tableFullReportDialog.close();
				swal("Oops...", "You must be an admin to do that!", "error");
			}
		}).catch(function(error){
			console.log(error);
		});
	});
	settingsButton.addEventListener('click', function(){
		settingsDialog.querySelector('#settings-display-name').value = '';
		settingsDialog.querySelector('#settings-photo-url').value = '';
		removeClass(settingsDialog.querySelector('#settings-photo-url'), 'is-focused');
		removeClass(settingsDialog.querySelector('#settings-display-name'), 'is-focused');
		removeClass(settingsDialog.querySelector('#settings-photo-url'), 'is-dirty');
		removeClass(settingsDialog.querySelector('#settings-display-name'), 'is-dirty');
		if (isReal(userData.username)) {
			settingsDialog.querySelector('#settings-display-name').value = userData.username;
			addClass(settingsDialog.querySelector('#settings-display-name'), 'is-focused');
			addClass(settingsDialog.querySelector('#settings-display-name'), 'is-dirty');
		}
		if (isReal(userData.photoURL)) {
			settingsDialog.querySelector('#settings-photo-url').value = userData.photoURL;
			addClass(settingsDialog.querySelector('#settings-photo-url'), 'is-focused');
			addClass(settingsDialog.querySelector('#settings-photo-url'), 'is-dirty');
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
		database.ref('users/' + userData.username).set('null', function(err){
			userData.username = name;
			userData.photoURL = pURL;
			database.ref('users/' + userData.username).set(userData, function(err){
				settingsDialog.close();
				firebase.auth().currentUser = user;
				window.localStorage.setItem("user", JSON.stringify(user));
				window.localStorage.setItem("userData", JSON.stringify(userData));
				swal("Success!", "Preferences updated!", "success");
				if (isReal(userData.username)) {
					userNameSpan.innerHTML = userData.username;
				} else if (isReal(user.email)) {
					userNameSpan.innerHTML = user.email;
				}
				if (isReal(userData.photoURL)) {
					profilePicture.src = userData.photoURL;
				} else {
					profilePicture.src = 'images/user.jpg'
				}
			});
		});
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
	resetPasswordDialog.querySelector('#close').addEventListener('click', function(){
		resetPasswordDialog.close();
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
	eventProgress.addEventListener('mdl-componentupgraded', function() {
	  this.MaterialProgress.setProgress(0);
	});
	database.ref('filteredIndices').on('value', function(snapshot){
		if (isReal(snapshot.val())) {
			var filteredLength = Object.keys(snapshot.val()).length;
			database.ref('adminReviewedIndices').on('value', function(snapshot){
				if (isReal(snapshot.val())) {
					console.log('updating bar')
					var approvedLength = Object.keys(snapshot.val()).length;
					var totalLength = filteredLength + approvedLength;
					if (totalLength >= totalReportsNumber) {
						eventProgress.MaterialProgress.setProgress(100);
						weDidIt();
					} else {
						eventProgress.MaterialProgress.setProgress(Math.round((totalLength / totalReportsNumber) * 100));
					}
				}
			});
		}
	});

	for (var i = 0; i < navLinks.length; i++) {
		navLinks[i].addEventListener('click', function(){
			for (var i = 0; i < tabs.length; i++) {
				addClass(tabs[i], "hidden");
			}
			for (var i = 0; i < navLinks.length; i++) {
				removeClass(navLinks[i], 'active');
			}
			var query = this.href.substring(this.href.indexOf("#"));
			currentTab = query;
			window.localStorage.setItem('currentTab', currentTab);
			removeClass(document.querySelector(query), "hidden");
			addClass(this, 'active');
			var num = parseInt(query.substring(query.length - 1));
			if (num === 3) {
				firstResultIndex = 0;
				viewReportsTableBody.innerHTML = "";
				addClass(viewReportsTableBody, 'hidden');
				removeClass(viewReportsLoader, 'hidden');
				removeClass(reportsFilter, 'hidden');
				removeClass(resultsLengthWrapper, 'hidden');
				resyncAllData();
			} else if (num === 4) {
				firstResultIndex = 0;
				approveReportsTableBody.innerHTML = "";
				addClass(approveReportsTableBody, 'hidden');
				removeClass(approveReportsLoader, 'hidden');
				addClass(reportsFilter, 'hidden');
				removeClass(resultsLengthWrapper, 'hidden');
				resyncAllData();
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
	if (isReal(currentTab)) {
		for (var i = 0; i < tabs.length; i++) {
			addClass(tabs[i], "hidden");
		}
		for (var i = 0; i < navLinks.length; i++) {
			removeClass(navLinks[i], 'active');
		}
		removeClass(document.querySelector(currentTab), "hidden");
		addClass(document.querySelector('a[href="' + currentTab + '"]'), 'active');
		var num = parseInt(currentTab.substring(currentTab.length - 1));
		if (num === 3) {
			firstResultIndex = 0;
			viewReportsTableBody.innerHTML = "";
			addClass(viewReportsTableBody, 'hidden');
			removeClass(viewReportsLoader, 'hidden');
			removeClass(reportsFilter, 'hidden');
			removeClass(resultsLengthWrapper, 'hidden');
			resyncAllData();
		} else if (num === 4) {
			firstResultIndex = 0;
			approveReportsTableBody.innerHTML = "";
			addClass(approveReportsTableBody, 'hidden');
			removeClass(approveReportsLoader, 'hidden');
			addClass(reportsFilter, 'hidden');
			removeClass(resultsLengthWrapper, 'hidden');
			resyncAllData();
		} else {
			addClass(reportsFilter, 'hidden');
			addClass(resultsLengthWrapper, 'hidden');
		}
	} else if (repeatUser != null) {
		for (var i = 0; i < tabs.length; i++) {
			addClass(tabs[i], "hidden");
		}
		removeClass(document.querySelector("#tab-2"), "hidden");
	}
	database.ref('unfilteredIndices/').once('value').then(function(snapshot){
		resultSection = snapshot.val();
		var snackbarData = {
			message: 'Unfiltered Report Indices Downloaded',
			timeout: 2000
		};
		snackbarContainer.MaterialSnackbar.showSnackbar(snackbarData);
		viewReportsTableBody.innerHTML = "";
		addClass(viewReportsTableBody, 'hidden');
		removeClass(viewReportsLoader, 'hidden');
		fillViewReports(firstResultIndex);
		removeClass(currentReportLoader, 'hidden');
		getNextReport(0);
		var snackbarData = {
			message: 'Fetching report...',
			timeout: 2000
		};
		snackbarContainer.MaterialSnackbar.showSnackbar(snackbarData);
		
	}).catch(function(error){
		console.log(error);
	});
	if (user != null) {
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
		}).catch(function(error){
			console.log(error);
		});
		landing.style.margin = "-100vh";
		setTimeout(function(){
			addClass(landing, 'hidden');
		}, 500);
		firebase.auth().currentUser = user;
	}
	database.ref('users/' + userData.username).once('value').then(function(snapshot){
		if (snapshot != null) {
			userData = snapshot.val();
				if (isReal(userData.username)) {
				userNameSpan.innerHTML = userData.username;
			} else if (isReal(user.email)) {
				userNameSpan.innerHTML = user.email;
			}
			if (isReal(userData.photoURL)) {
				profilePicture.src = userData.photoURL;
			} else {
				profilePicture.src = 'images/user.jpg'
			}
			if (isReal(userData.reportsCategorized)) {
				if (userData.reportsCategorized === 1) {
					userCounter.innerHTML = '1 Report Categorized';
				} else {
					userCounter.innerHTML = userData.reportsCategorized + ' Reports Categorized';
				}
			}
		}
	}).catch(function(error){
		console.error(error);
	});
	database.ref('users/' + userData.username + '/reportsCategorized').on('value', function(snapshot){
		console.log('report categorized');
		if (snapshot.val() === 1) {
			userCounter.innerHTML = '1 Report Categorized';
		} else {
			userCounter.innerHTML = snapshot.val() + ' Reports Categorized';
		}
	});
}

window.onbeforeunload = function confirmExit() {
	database.ref('currentlyAccessedIndices/' + currentReportID).set(null, function(err){
		if (err) {
			console.error(err);
		}
		return false;
	});
}