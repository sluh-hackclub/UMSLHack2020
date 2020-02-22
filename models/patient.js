const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  latitude: {
    type: Number
  },
  longitude: {
    type: Number
  },
  frequency: {
    type: Number
  }
});

const patientSchema = new mongoose.Schema({
  firstname: {
    type: String
  },
  lastname: {
    type: String
  },
  email: {
    type: String
  },
  infected: {
    type: Boolean
  },
  locations: {
    type: [locationSchema]
  }
})

module.exports = mongoose.model('Patient', patientSchema);
