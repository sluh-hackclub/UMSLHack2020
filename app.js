const express = require('express');
const app = express();

app.get('/', (req, res, next) => {
  res.send('Hello');
});

app.use((req, res, next) => {
  const error = new Error('Not found');
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  if (error.status === 404) {
    res.send('Error 404');
  } else {
    res.send('Error 500');
  }
});

module.exports = app;
