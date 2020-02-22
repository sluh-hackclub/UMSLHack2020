// const itemUrl = "http://127.0.0.1:5000/new_item";
// const donorUrl = "http://127.0.0.1:5000/get_donors/";
// const categoryUrl = "http://127.0.0.1:5000/get_categories/";
// const taxLetterUrl = "http://127.0.0.1:5000/get_tax_letter_url/";
// const alertsUrl = "http://127.0.0.1:5000/get_alerts";
const app = angular.module("virusTracker", ["ngRoute"]);

app.config(function($routeProvider, $locationProvider) {
  $routeProvider
    .when("/dashboard", {
      templateUrl: "partials/donors.html",
      controller: "donorController"
    })
    .when("/category", {
      templateUrl: "partials/category.html",
      controller: "categoryController"
    })
    .when("/mapcontacts", {
      templateUrl: "partials/addcontactsfrommap.html",
      controller: "AddContactsFromMapController"
    })
    .when("/", {
      templateUrl: "partials/locationhistory.html",
      controller: "LocationHistoryPageController"
    })
    .when("/config", {
      templateUrl: "pages/config.html",
      controller: "configController"
    })
    .when("/donation", {
      templateUrl: "partials/donation.html",
      controller: "donationController"
    })
    .when("/welcome", {
      templateUrl: "partials/welcome.html",
      controller: "welcomeController"
    })
    .when("/stats", {
      templateUrl: "pages/stats.html",
      controller: "statsController"
    })
    .when("/tasks", {
      templateUrl: "pages/tasks.html",
      controller: "tasksController"
    })
    .when("/profile", {
      templateUrl: "pages/profile.html",
      controller: "profileController"
    })
    .otherwise({ redirectTo: "/" });
  $locationProvider.html5Mode(true);
});

// app.controller("donorController", function(
//   $scope,
//   $location,
//   $http,
//   itemCreater,
//   $window
// ) {
//   var searchBar = document.getElement;
//   $scope.donors = [];
//   $scope.donorSearch = function() {
//     if ($scope.donorName) {
//       $http
//         .get(donorUrl + $scope.donorName, { responseType: "json" })
//         .then(function(response) {
//           // console.log('searched'); debug
//           // console.log(response.data.donors); debug
//           $scope.donors = response.data.donors;
//         });
//     } else {
//       $scope.donors = [];
//     }
//   };
//   $scope.donorClick = function(donorId) {
//     popUp = document.getElementsByClassName("modal")[0];
//     popUp.style.display = "initial";
//     $scope.close = function() {
//       popUp.style.display = "none";
//     };
//     $scope.createitem = function() {
//       itemCreater.newItem.donor = donorId;
//       $location.path("/category");
//     };
//     $scope.taxletter = function() {
//       $http
//         .get(taxLetterUrl + donorId, { responseType: "text" })
//         .then(function(response) {
//           $window.location = response.data;
//         });
//     };
//   };
// });

app.service("loadCategories", function($http) {
  this.load = function(parentId) {
    return $http
      .get(categoryUrl + parentId, { responseType: "json" })
      .then(function(response) {
        return response.data;
      });
  };
});

// app.controller("categoryController", function(
//   $scope,
//   loadCategories,
//   $location,
//   itemCreater
// ) {
//   $scope.categoryList = [];
//   loadCategories.load("0").then(function(data) {
//     $scope.categories = data.categories;
//     // console.log($scope.categories);
//   });
//   $scope.categoryClick = function(category) {
//     category.oid = $scope.categoryList.length + 1;
//     $scope.categoryList.push(category);
//     loadCategories.load(category.id).then(function(data) {
//       if (data.categories.length > 0) {
//         $scope.categories = data.categories;
//       } else {
//         console.log($scope.categoryList);
//         itemCreater.newItem.categories = $scope.categoryList;
//         $location.path("/donation");
//       }
//     });
//   };
//   $scope.navigateCategory = function(pid, oid) {
//     console.log(oid, pid);
//     $scope.categoryList = $scope.categoryList.filter(function(i) {
//       return i.oid < oid;
//     });
//     console.log($scope.categoryList);
//     loadCategories.load(pid).then(function(data) {
//       $scope.categories = data.categories;
//     });
//   };
// });

// app.controller("donationController", function($scope, itemCreater, $location) {
//   $scope.submitDonation = function() {
//     itemCreater.newItem.description = $scope.description;
//     itemCreater.newItem.price = $scope.price;
//     itemCreater.newItem.quantity = $scope.quantity;
//     itemCreater.pushItem();
//     $location.path("/donors");
//   };
// });

// app.controller("configController", function($scope) {
//   $scope.chatTemplate = "partials/chat.html";
// });

// app.directive("breadcrumbbar", function() {
//   return {
//     templateUrl: "partials/breadcrumb-bar.html",
//     scope: {
//       breadcrumbData: "=data",
//       navigate: "&"
//     }
//   };
// });

// app.controller("welcomeController", function($scope) {
//   var templates = [
//     "partials/page2.html",
//     "partials/page3.html",
//     "partials/page4.html"
//   ];
//   var options = {};
//   var navNum = 0;
//   $scope.classes = ["active", "inactive", "inactive"];
//   $scope.currentTemplate = "partials/page1.html";

//   $scope.next = function(next, key, value) {
//     $scope.currentTemplate = templates[next];
//     $scope.classes[navNum] = "completed";
//     $scope.classes[navNum + 1] = "active";
//     options[key] = value;
//     navNum++;
//   };

//   $scope.submitDonation = function(key, value) {
//     options[key] = value;
//     $scope.classes[2] = "completed";
//     $scope.currentTemplate = "partials/page5.html";
//     console.log(options);
//   };
// });

//make controller for page with map/location history

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
    console.log(e.latlng);

    setTimeout(function() {
      passLocation.setLocation(e.latlng);
      $location.path("/mapcontacts");
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

// app.directive("locationHistory", function() {
//   return {
//     templateUrl: "partials/locationhistory.html",
//     scope: {
//       locationHistoryObject: "=locationHistoryObject"
//     }
//   };
// });

app.controller("FormController", function($scope) {
  $scope.formObject = {};

  $scope.submit = function(formId, formData) {
    $scope.formObject = angular.copy(formData);
    $scope.formObject.formid = formId;

    //additional code for submitting to the API -- using objectPusher service
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

app.controller("AddContactsFromMapController", function($scope, passLocation) {
  var location = passLocation.getLocation();
  var apiKey = "AIzaSyA60Sq7IJTVHhW2-zoV4WfTaCn9sDLl_zo";
  var imgURL = `https://maps.googleapis.com/maps/api/streetview?location=${location.lat},${location.lng}&size=600x300&key=${apiKey}`;

  console.log(imgURL);

  $scope.imgPath = imgURL;
});
