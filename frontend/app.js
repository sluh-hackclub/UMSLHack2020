const app = angular.module("virusTracker", ["ngRoute"]);
const questionnairePages = {
  infopage: "infopage.html",
  howlong: "howlong.html"
  //add all the questionnaire pages in here
};

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
    .when("/", {
      templateUrl: "partials/questionnaire.html",
      controller: "QuestionnaireController"
    })
    .when("/patient/:patientId", {
      templateUrl: "partials/patient.html",
      controller: "PatientController"
    })
    .otherwise({ redirectTo: "/" });
  $locationProvider.html5Mode(true);
});

function DashboardController() {}

function PatientController() {}

// app.service("loadCategories", function($http) {
//   this.load = function(parentId) {
//     return $http
//       .get(categoryUrl + parentId, { responseType: "json" })
//       .then(function(response) {
//         return response.data;
//       });
//   };
// });

app.directive("addContactsFromMap", function() {
  return {
    templateUrl: "partials/addcontactsfrommap.html",
    scope: {
      location: "=location"
    }
  };
});

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

function LocationHistoryPageController($scope, L, passLocation, $location) {
  var mymap = L.map("mapid").setView([51.505, -0.09], 13);

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

  L.marker([51.5, -0.09])
    .addTo(mymap)
    .bindPopup("<b>Hello world!</b><br />I am a popup.")
    .openPopup();

  L.circle([51.508, -0.11], 500, {
    color: "red",
    fillColor: "#f03",
    fillOpacity: 0.5
  })
    .addTo(mymap)
    .bindPopup("I am a circle.");

  L.polygon([
    [51.509, -0.08],
    [51.503, -0.06],
    [51.51, -0.047]
  ])
    .addTo(mymap)
    .bindPopup("I am a polygon.");

  var popup = L.popup();

  function onMapClick(e) {
    popup
      .setLatLng(e.latlng)
      .setContent("Opening page to add new contacts...")
      .openOn(mymap);

    setTimeout(function() {
      passLocation.setLocation(e.latlng);
      console.log("redirecting");
      $location.path("/mapcontacts").replace();
      $scope.$apply();
    }, 2000);
  }

  mymap.on("click", onMapClick);
}

LocationHistoryPageController.$inject = [
  "$scope",
  "L",
  "passLocation",
  "$location"
];

app.controller("LocationHistoryPageController", LocationHistoryPageController);

app.controller("QuestionnaireController", function($scope) {
  console.log($scope.page);

  if (!$scope.page) {
    $scope.page = "partials/" + questionnairePages["infopage"];
  }

  console.log($scope.page);

  $scope.formObject = {};

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
  $sce
) {
  $scope.trustUrl = function(path) {
    return $sce.trustAsResourceUrl(path);
  };
  var location = passLocation.getLocation();
  var apiKey = "AIzaSyA60Sq7IJTVHhW2-zoV4WfTaCn9sDLl_zo";

  var panoURL = `https://www.google.com/maps/embed/v1/streetview?key=${apiKey}&location=${location.lat},${location.lng}&heading=210&pitch=10&fov=35`;

  console.log(panoURL);

  $scope.panoPath = panoURL;
});
