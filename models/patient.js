const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  frequency: {
    type: Number,
    required: true
  },
  name: {
    type: String
  },
  address: {
    type: String
  },
  lasttime: {
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
  degree: {
    type: Number
  },
  locations: {
    type: [locationSchema]
  }
})

module.exports = mongoose.model('Patient', patientSchema);
