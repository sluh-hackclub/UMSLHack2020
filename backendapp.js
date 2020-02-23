const express = require("express");
const session = require("express-session");
const morgan = require("morgan");
const app = express();
// const admin = require('firebase-admin');
const path = require("path");
// const serviceAccount = require(path.join(__dirname, '/firebase_private_key.json'));
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const applicationURL = "https://umslhack2020.sluhhackclub.com/?token=101a2hb3"; //TODO: set application URL for email links

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAILACCOUNT,
    pass: process.env.EMAILPW
  }
});

async function sendEmail(contactEmail) {
  let info = await transporter.sendMail({
    from: '"EpTracker" <hackclubdemo@gmail.com>', // sender address
    to: contactEmail, // list of receivers
    subject: "Urgent Virus Update", // Subject line
    text: "", // plain text body
    html:
      "You have been listed as a possible contact within the EpTracker system. Please fill out the following questionnaire about your health. <br><a href='" +
      applicationURL +
      "'>Fill Out Virus Questionnaire</a>" // html body
  });
}

const Patient = require("./models/patient.js");

// const newPatient = new Patient({
//   firstname: 'John',
//   lastname: 'Shit',
//   email: 'johnshit@gmail.com',
//   degree: 0 // a degree of seperation of 0 means infected
// });
//
// newPatient.locations.push({latitude: 38.7109553, longitude: -90.3137369, frequency: 8});
//
// newPatient.save();

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: "https://umslhack2020-60fa2.firebaseio.com"
// });

app.use(morgan("dev"));

app.use(express.urlencoded({ extended: false }));
app.use(express.json({ limit: "10mb" }));

app.use(express.static("frontend"));

let mongooseProtocol = "mongodb://";
if (process.env.MONGO_SRV === "true") {
  mongooseProtocol = "mongodb+srv://";
}

let mongooseConnectionString = "";
if (process.env.MONGO_USER && process.env.MONGO_PW) {
  mongooseConnectionString =
    mongooseProtocol +
    process.env.MONGO_USER +
    ":" +
    process.env.MONGO_PW +
    "@" +
    process.env.MONGO_HOST +
    "/" +
    process.env.MONGO_DB +
    "?retryWrites=true";
} else {
  mongooseConnectionString =
    mongooseProtocol +
    process.env.MONGO_HOST +
    "/" +
    process.env.MONGO_DB +
    "?retryWrites=true";
}

mongoose
  .connect(mongooseConnectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log(
      "Mongoose connected to " +
        mongooseProtocol +
        process.env.MONGO_HOST +
        "/" +
        process.env.MONGO_DB
    );
  })
  .catch(err => {
    console.error("Mongoose connection error:");
    console.error(err);
    process.exit(1);
  });

const db = mongoose.connection;

const sess = {
  secret: "fkdsjfksjdiof7aw98nf9nDS*F(SDNUFOIVOIUDFD*&FBDJcdsfs7df8b)",
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 86400000 // 86400000 ms = 1 day (1 * 24 * 60 * 60 * 1000)
  }
};
if (app.get("env") === "production") {
  app.set("trust proxy", 1);
  sess.cookie.secure = true;
}
app.use(session(sess));

// Send CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") {
    // amend with all allowed HTTP methods
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
    return res.status(200).json({});
  }
  next();
});

app.get("/", (req, res, next) => {
  if (!req.session.loggedIn) {
    res.sendFile(path.join(__dirname, "/frontend/partials/login.html"));
  } else {
    if (req.session.userType === "doctor") {
      res.redirect("/doctor");
    } else {
      res.redirect("/questionnaire");
    }
  }
});

app.get("/login", (req, res, next) => {
  res.sendFile(path.join(__dirname, "/frontend/partials/login.html"));
});

app.get("/api/v1/locations", (req, res, next) => {
  const email = "patient@umslhack.io";
  const finalResponse = {};
  Patient.findOne({ email: email }).then(doc => {
    console.log(doc.locations);
    res.status(200).json({ locations: doc.locations });
  });
});

app.post("/api/v1/importgooglejson", (req, res, next) => {
  const email = "patient@umslhack.io";
  Patient.findOne({ email: email }).then(doc => {
    // console.log(req.body.timelineObjects.length);
    for (let i = 0; i < req.body.timelineObjects.length; i++) {
      if (req.body.timelineObjects[i].hasOwnProperty("placeVisit")) {
        // console.log(req.body.timelineObjects[i].placeVisit);
        const latitude =
          req.body.timelineObjects[i].placeVisit.location.latitudeE7 * 1e-7;
        const longitude =
          req.body.timelineObjects[i].placeVisit.location.longitudeE7 * 1e-7;
        const name = req.body.timelineObjects[
          i
        ].placeVisit.location.name.replace(/\n/g, " ");
        const address = req.body.timelineObjects[
          i
        ].placeVisit.location.address.replace(/\n/g, " ");
        const endtime =
          req.body.timelineObjects[i].placeVisit.duration.endTimestampMs;
        // console.log(latitude + ", " + longitude + " " + name + " " + address);
        console.log(doc.locations);
        let duplicate = false;
        for (let i = 0; i < doc.locations.length; i++) {
          if (
            latitude === doc.locations[i].latitude &&
            longitude === doc.locations[i].longitude
          ) {
            duplicate = true;
            doc.locations[i].frequency++;
            if (
              typeof doc.locations[i].lasttime !== "number" ||
              endtime > doc.locations[i].lasttime
            ) {
              doc.locations[i].lasttime = endtime;
            }
          }
        }
        if (!duplicate) {
          doc.locations.push({
            latitude: latitude,
            longitude: longitude,
            name: name,
            address: address,
            frequency: 1,
            lasttime: endtime
          });
        }
      }
    }
    doc.save();
  });
});

app.post("/api/v1/sendEmail", (req, res, next) => {
  //edit this
  var contactEmail = req.body.email;

  sendEmail(contactEmail).catch(console.error);
});

app.post("/api/v1/auth", (req, res, next) => {
  // if already logged in, redirect to dashboard
  if (req.session.loggedIn) {
    if (req.session.userType === "questionnaire") {
      res.status(200).json({
        success: true,
        loggedIn: true,
        userType: "questionnaire",
        redirectTo: "/questionnaire"
      });
    } else if (req.session.userType === "doctor") {
      res.status(200).json({
        success: true,
        loggedIn: true,
        userType: "doctor",
        redirectTo: "/doctor"
      });
    } else {
      // unknown user_type
      req.session.loggedIn = false;
      res.status(200).json({
        success: true,
        loggedIn: false,
        redirectTo: "/login"
      });
    }
  } else {
    if (req.body.email) {
      if (req.body.email === "doctor@umslhack.io") {
        req.session.loggedIn = true;
        req.session.userType = "doctor";
        req.session.email = "doctor@umslhack.io";
        res.status(200).json({
          success: true,
          loggedIn: true,
          redirectTo: "/doctor"
        });
      } else if (req.body.email === "patient@umslhack.io") {
        req.session.loggedIn = true;
        req.session.userType = "questionnaire";
        req.session.email = "patient@umslhack.io";
        res.status(200).json({
          success: true,
          loggedIn: true,
          redirectTo: "/questionnaire"
        });
      }
    } else {
      // correct body not supplied
      res.status(400).json({
        success: false,
        loggedIn: false,
        error: "Correct body not supplied",
        redirectTo: "/login"
      });
    }
  }
});

app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  if (error.status === 404) {
    res.send("Error 404");
  } else {
    res.send("Error 500");
  }
});

module.exports = app;
