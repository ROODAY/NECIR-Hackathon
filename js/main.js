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

landing.style.margin = "-100vh";

var snackbarContainer = document.querySelector('#necir-snackbar');
var datalist = document.getElementById('data-list');

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

function firebaseLogin() {
	firebase.auth().signInWithPopup(provider).then(function(result) {
	  var token = result.credential.accessToken;
	  var user = result.user;
	  document.getElementById('user-name').innerHTML = user.displayName;
	  document.getElementById('propic').src = user.photoURL;
	  addClass(login, 'hidden');
	  removeClass(logout, 'hidden');
	  var snackbarData = {
	    message: 'Login Successful',
	    timeout: 2000
	  };
	  snackbarContainer.MaterialSnackbar.showSnackbar(snackbarData);
	  console.log(user);
	}).catch(function(error) {
	  var errorCode = error.code;
	  var errorMessage = error.message;
	  var email = error.email;
	  var credential = error.credential;
	  var snackbarData = {
	    message: 'Login Unsuccessful',
	    timeout: 2000
	  };
	  snackbarContainer.MaterialSnackbar.showSnackbar(snackbarData);
	  console.error(error);
	});
}

function firebaseLogout() {
	firebase.auth().signOut().then(function() {
		document.getElementById('user-name').innerHTML = "Log In";
		document.getElementById('propic').src = "images/user.jpg";
		addClass(logout, 'hidden');
		removeClass(login, 'hidden');
		var snackbarData = {
	    message: 'Logout Successful',
	    timeout: 2000
	  };
	  snackbarContainer.MaterialSnackbar.showSnackbar(snackbarData);
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

login.addEventListener('click', firebaseLogin);
logout.addEventListener('click', firebaseLogout);

landingLogin.addEventListener('click', function() {
	firebase.auth().signInWithPopup(provider).then(function(result) {
	  // This gives you a Google Access Token. You can use it to access the Google API.
	  var token = result.credential.accessToken;
	  // The signed-in user info.
	  var user = result.user;
	  landing.style.margin = "-100vh";
	  setTimeout(function(){
	  	addClass(landing, 'hidden');
	  }, 500);
	  document.getElementById('user-name').innerHTML = user.displayName;
	  document.getElementById('propic').src = user.photoURL;
	  addClass(login, 'hidden');
	  removeClass(logout, 'hidden');
	  var snackbarData = {
	    message: 'Login Successful',
	    timeout: 2000
	  };
	  snackbarContainer.MaterialSnackbar.showSnackbar(snackbarData);
	  console.log(user);
	}).catch(function(error) {
	  // Handle Errors here.
	  var errorCode = error.code;
	  var errorMessage = error.message;
	  // The email of the user's account used.
	  var email = error.email;
	  // The firebase.auth.AuthCredential type that was used.
	  var credential = error.credential;
	  var snackbarData = {
	    message: 'Login Unsuccessful',
	    timeout: 2000
	  };
	  snackbarContainer.MaterialSnackbar.showSnackbar(snackbarData);
	  console.error(error);
	});
}, false);