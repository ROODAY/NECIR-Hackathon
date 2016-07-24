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
var addEntryBtn = document.getElementById('add-entry');
var snackbarContainer = document.querySelector('#necir-snackbar');
var datalist = document.getElementById('data-list');
var editButtons, deleteButtons;

var dialog = document.querySelector('#dialog');
var dialog2 = document.querySelector('#dialog2');

if (! dialog.showModal) {
  dialogPolyfill.registerDialog(dialog);
  dialogPolyfill.registerDialog(dialog2);
}

var dialogName = document.getElementById('entry-name');
var dialogCharacter = document.getElementById('entry-character');
var dialogDescription = document.getElementById('entry-description');
var dialogSave = document.getElementById('save-entry');

var dialog2Name = document.getElementById('entry-name2');
var dialog2Character = document.getElementById('entry-character2');
var dialog2Description = document.getElementById('entry-description2');
var dialog2Save = document.getElementById('save-entry2');

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

function addEntry() {
	dialog2Name.innerHTML = "";
	dialog2Character.innerHTML = "";
	dialog2Description.innerHTML = "";
	dialog2.showModal();
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

function saveNewEntry(entryName, entryCharacter, entryDescription) {
  var newActorKey = firebase.database().ref().child('actors').push().key;
  var newActor = {
    name: entryName,
    character: entryCharacter,
    description: entryDescription,
    key: newActorKey
  };
  
  var updates = {};
  updates['/actors/' + newActorKey] = newActor;
  firebase.database().ref().update(updates);

  var snackbarData = {
    message: 'Changes Submitted',
    timeout: 2000
  };
  snackbarContainer.MaterialSnackbar.showSnackbar(snackbarData);

  dialog2.close();
  reloadList();
}

function deleteEntry() {
	var path = this.getAttribute("data-path");
	firebase.database().ref(path).set(null);
	reloadList();

	var snackbarData = {
	  message: 'Actor Deleted',
	  timeout: 2000
	};
	snackbarContainer.MaterialSnackbar.showSnackbar(snackbarData);
}

function reloadList() {
	datalist.innerHTML = "";
	firebase.database().ref('/actors').once('value').then(function(snapshot) {
	  var actors = snapshot.val();
	  for (var key in actors) {
	  	  if (actors.hasOwnProperty(key)) {
			  var li = document.createElement("li");
			  li.setAttribute("class", "mdl-list__item mdl-list__item--three-line");
			  li.innerHTML = '<span class="mdl-list__item-primary-content"><span>' + actors[key].name + ' AKA ' + actors[key].character + '</span><span class="mdl-list__item-text-body">' + actors[key].description + '</span></span><span class="mdl-list__item-secondary-content"><a id="a' + key + '" data-path="/actors/' + actors[key].key + '" class="mdl-list__item-secondary-action data-edit-btn" href="#"><i class="material-icons">mode_edit</i></a></span><div class="mdl-tooltip mdl-tooltip--top" for="a'+ key + '">Edit</div><a id="b' + key + '" data-path="/actors/' + actors[key].key + '" class="mdl-list__item-secondary-action data-delete-btn" href="#"><i class="material-icons">delete</i></a></span><div class="mdl-tooltip mdl-tooltip--top" for="b'+ key + '">Delete</div>';
			  datalist.appendChild(li);
		  }
	  }
	  editButtons = document.getElementsByClassName("data-edit-btn");
      for (var i = 0; i < editButtons.length; i++) {
  	    editButtons[i].addEventListener('click', editEntry, false);
      }
      deleteButtons = document.getElementsByClassName("data-delete-btn");
      for (var i = 0; i < deleteButtons.length; i++) {
  	    deleteButtons[i].addEventListener('click', deleteEntry, false);
      }
    });
}

login.addEventListener('click', firebaseLogin);
logout.addEventListener('click', firebaseLogout);
addEntryBtn.addEventListener('click', addEntry);
dialogSave.addEventListener('click', function() {
	saveEntry(dialogName.getAttribute("data-path"), dialogName.textContent, dialogCharacter.textContent, dialogDescription.textContent);
}, false);
dialog2Save.addEventListener('click', function() {
	if (dialog2Name.textContent !== "" && dialog2Name.textContent !== "Name" && dialog2Character.textContent !== "" && dialog2Character.textContent !== "Character" && dialog2Description.textContent !== "" && dialog2Description.textContent !== "Description") {
		saveNewEntry(dialog2Name.textContent, dialog2Character.textContent, dialog2Description.textContent);
	} else {
		var snackbarData = {
		  message: 'One of the fields is empty or unchanged!',
		  timeout: 2000
		};
		snackbarContainer.MaterialSnackbar.showSnackbar(snackbarData);
	}
}, false);

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