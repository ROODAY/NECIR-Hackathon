var config = {
	apiKey: "AIzaSyBbzmALixt_f1-i0qP41JBi_X74bp-ly68",
	authDomain: "necir-hackathon.firebaseapp.com",
	databaseURL: "https://necir-hackathon.firebaseio.com",
	storageBucket: "",
};
firebase.initializeApp(config);

var provider = new firebase.auth.GoogleAuthProvider();
var database = firebase.database();

var landing = document.getElementById('landing');
var landingLogin = document.getElementById('landing-login');
var logout = document.getElementById('logout');
var login = document.getElementById('login');
var snackbarContainer = document.querySelector('#necir-snackbar');
var datalist = document.getElementById('data-list');
var editButtons;

var dialog = document.querySelector('#dialog');
if (! dialog.showModal) {
  dialogPolyfill.registerDialog(dialog);
}
var dialogName = document.getElementById('entry-name');
var dialogCharacter = document.getElementById('entry-character');
var dialogDescription = document.getElementById('entry-description');
var dialogSave = document.getElementById('save-entry');

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
	  reloadList();
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

function firebaseLogin() {
	firebase.auth().signInWithPopup(provider).then(function(result) {
	  // This gives you a Google Access Token. You can use it to access the Google API.
	  var token = result.credential.accessToken;
	  // The signed-in user info.
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
	  reloadList();
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

function editEntry() {
	var path = this.getAttribute("data-path");
	firebase.database().ref(path).once('value').then(function(snapshot) {
	  var actor = snapshot.val();
	  dialogName.innerHTML = actor.name;
	  dialogName.setAttribute("data-path", path);
	  dialogCharacter.innerHTML = actor.character;
	  dialogDescription.innerHTML = actor.description;
	  dialog.showModal();
    });
}

function saveEntry(path, entryName, entryCharacter, entryDescription) {
  firebase.database().ref(path).set({
    name: entryName,
    character: entryCharacter,
    description: entryDescription
  });

  var snackbarData = {
    message: 'Changes Submitted',
    timeout: 2000
  };
  snackbarContainer.MaterialSnackbar.showSnackbar(snackbarData);

  dialog.close();
  reloadList();
}

function reloadList() {
	datalist.innerHTML = "";
	firebase.database().ref('/test/actors').once('value').then(function(snapshot) {
	var actors = snapshot.val();
	  for (var i = 0; i < actors.length; i++) {
		var li = document.createElement("li");
		li.setAttribute("class", "mdl-list__item mdl-list__item--three-line");
		li.innerHTML = '<span class="mdl-list__item-primary-content"><span>' + actors[i].name + ' AKA ' + actors[i].character + '</span><span class="mdl-list__item-text-body">' + actors[i].description + '</span></span><span class="mdl-list__item-secondary-content"><a data-path="/test/actors/' + i + '" class="mdl-list__item-secondary-action data-edit-btn" href="#"><i class="material-icons">mode_edit</i></a></span>';
		datalist.appendChild(li);
	  }
	  editButtons = document.getElementsByClassName("data-edit-btn");
      for (var i = 0; i < editButtons.length; i++) {
  	    editButtons[i].addEventListener('click', editEntry, false);
      }
    });
}

login.addEventListener('click', firebaseLogin);
logout.addEventListener('click', firebaseLogout);
dialogSave.addEventListener('click', function() {
	saveEntry(dialogName.getAttribute("data-path"), dialogName.textContent, dialogCharacter.textContent, dialogDescription.textContent);
}, false);