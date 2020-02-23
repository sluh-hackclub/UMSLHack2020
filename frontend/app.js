const app = angular.module("virusTracker", ["ngRoute"]);
const questionnairePages = {
  infopage: "infopage.html",
  howlong: "howlong.html",
  beenDiagnosed: "beenDiagnosed.html",
  showingsymptoms: "showingsymptoms.html",
  whatsymptoms: "whatsymptoms.html",
  entercontacts: "entercontacts.html"
};
const apiBase = "/api/v1/";
var accessingUser = "";

//remove the below list before final app
var samplePatients = [
  {
    id: 1,
    lastname: "Smith",
    firstname: "John",
    country: "England",
    degofsep: 0
  }
];

app.config(function($routeProvider, $locationProvider) {
  $routeProvider
    .when("/dashboard", {
      templateUrl: "partials/dashboard.html",
      controller: "DashboardController"
    })
    .when("/mapcontacts", {
      templateUrl: "partials/addcontactsfrommap.html",
      controller: "AddContactsFromMapController"
    })
    .when("/locationhistory", {
      //TODO:change this to the actual index not the location page
      templateUrl: "partials/locationhistory.html",
      controller: "LocationHistoryPageController"
    })
    .when("/questionnaire", {
      //lets hope changing it to /questionnaire did not screw anything up ... praying
      templateUrl: "partials/questionnaire.html",
      controller: "QuestionnaireController"
    })
    .when("/", {
      templateUrl: "partials/home.html",
      controller: "HomeController"
    })
    .when("/patient/:patientId", {
      templateUrl: "partials/patient.html",
      controller: "PatientController"
    })
    .when("/completed", {
      templateUrl: "partials/completed.html",
      controller: ""
    })
    .otherwise({ redirectTo: "/" });
  $locationProvider.html5Mode(true);
});

app.controller("HomeController", function($scope, $location) {
  if ($location.search().token) {
    $location.path("/questionnaire");
    accessingUser = "Micah See";
  }
  $scope.goToQuestionnaire = function() {
    $location.path("/questionnaire");
  };
  $scope.goToDashboard = function() {
    $location.path("/dashboard");
  };
});

function DashboardController($scope, $location) {
  //TODO: add code to retrieve patients

  $scope.patients = samplePatients;

  $scope.viewPatient = function(patientId) {
    $location.path("/patient/" + patientId); //TODO: make sure patientId is a string or is converted to one
  };
}

app.controller("DashboardController", DashboardController);

function PatientController($routeParams) {
  var patientId = $routeParams.patientId;

  //TODO: add code to retrieve patient data using patientId and to load it into the patients page
}

app.controller("PatientController", PatientController);

// app.factory("locations", function($http) {
//   this.get = function() {
//     return
//   };
//   return this;
// });

// app.factory("sendEmail", function($http) {
//   // TODO: edit this code to use as a serivce to retrieve patient data
//   this.post = function(email) {
//     $http
//       .post(
//         apiBase + "sendEmail",
//         { email: email },
//         {
//           headers: { "Content-Type": "application/json" }
//         }
//       )
//       .then(
//         function() {
//           console.log("email successfully sent"); //debugging
//         },
//         function() {
//           console.log("there was an error sending the email"); //debugging
//         }
//       );
//   };
//   return this;
// });

function LeafletJSFactory($window) {
  if (!window.L) {
    console.log("leaflet failed to load");
  }

  return $window.L;
}

LeafletJSFactory.$inject = ["$window"];

app.factory("L", LeafletJSFactory);

app.factory("passLocation", function() {
  var location;

  var setLocation = function(locationObject) {
    location = locationObject;
    return;
  };

  var getLocation = function() {
    if (location) {
      return location;
    } else {
      console.log("location has not yet been set");
      return { lat: "0", lng: "0" };
    }
  };

  return {
    setLocation: setLocation,
    getLocation: getLocation
  };
});

function LocationHistoryPageController(
  $scope,
  L,
  passLocation,
  $location,
  $http
) {
  $scope.showMap = true;

  var mymap = L.map("mapid").setView([38.947871, -89.599644], 5);

  function onMarkerClick(e) {
    // setTimeout(function() {
    //   $scope.showMap = false;
    // }, 3000);
    passLocation.setLocation(e.latlng);
    console.log("redirecting...");
    $location.path("/mapcontacts").replace();
    $scope.$apply();
  }

  L.tileLayer(
    "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw",
    {
      maxZoom: 18,
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
        '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      id: "mapbox/streets-v11",
      tileSize: 512,
      zoomOffset: -1
    }
  ).addTo(mymap);

  $http
    .get(apiBase + "locations", { responseType: "json" })
    .then(function(response) {
      console.log(response.data);
      response.data.locations.forEach(element => {
        console.log(element);
        L.marker([element.latitude, element.longitude])
          .addTo(mymap)
          .on("click", onMarkerClick)
          .bindPopup(element.name);
      });
    });

  // console.log(locationData);
  // locationData = locationData.locations;
  // locationData.forEach(element => {
  //   L.marker(element["latitude"], element["longitude"])
  //     .addTo(mymap)
  //     .on("click", onMarkerClick)
  //     .bindPopup(element["name"]);
  // });

  //when demonstrating, do not click on a marker, click right next to one
  // mymap.on("click", onMapClick); // include in loop?
}

LocationHistoryPageController.$inject = [
  "$scope",
  "L",
  "passLocation",
  "$location",
  "$http"
];

app.controller("LocationHistoryPageController", LocationHistoryPageController);

app.controller("QuestionnaireController", function($scope, $location) {
  if (!$scope.page) {
    $scope.page = "partials/" + questionnairePages["infopage"];
  }

  if (accessingUser) {
    $scope.accessingUser = accessingUser;
  }

  $scope.formObject = {};

  $scope.toLocationHistory = function() {
    $location.path("/locationhistory");
  };

  $scope.nextPage = function(pageId) {
    $scope.page = "partials/" + questionnairePages[pageId];
  };

  $scope.submit = function(formId, formData) {
    $scope.formObject = angular.copy(formData);
    $scope.formObject.formid = formId;

    //TODO:additional code for submitting to the API -- using objectPusher service
  };
});

app.service("objectPusher", function($http) {
  this.newObject = { pushType: null };
  this.push = function() {
    $http
      .post(pushObjectURL, this.newPushObject, {
        headers: { "Content-Type": "app3lication/json" }
      })
      .then(
        function() {
          console.log("object successfully pushed"); //debugging
        },
        function() {
          console.log("there was an error adding the item"); //debugging
        }
      );
  };
});

app.controller("AddContactsFromMapController", function(
  $scope,
  passLocation,
  $sce,
  $http,
  $location
) {
  $scope.trustUrl = function(path) {
    return $sce.trustAsResourceUrl(path);
  };
  var location = passLocation.getLocation();
  var apiKey = "AIzaSyA60Sq7IJTVHhW2-zoV4WfTaCn9sDLl_zo";

  var panoURL = `https://www.google.com/maps/embed/v1/streetview?key=${apiKey}&location=${location.lat},${location.lng}&heading=210&pitch=10&fov=35`;

  console.log(panoURL);

  $scope.panoPath = panoURL;

  $scope.update = function(emailAddress) {
    $http
      .post(
        apiBase + "sendEmail",
        { email: emailAddress },
        {
          headers: { "Content-Type": "application/json" }
        }
      )
      .then(
        function() {
          console.log("email successfully sent"); //debugging
        },
        function() {
          console.log("there was an error sending the email"); //debugging
        }
      );
    $location.path("/completed");
  };
});
