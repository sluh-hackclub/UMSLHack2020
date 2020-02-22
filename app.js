const express = require('express');
const session = require('express-session');
const morgan = require('morgan');
const app = express();

const sess = {
  secret: 'fkdsjfksjdiof7aw98nf9nDS*F(SDNUFOIVOIUDFD*&FBDJcdsfs7df8b)',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 86400000 // 86400000 ms = 1 day (1 * 24 * 60 * 60 * 1000)
  }
};
if (app.get('env') === 'production') {
  app.set('trust proxy', 1);
  sess.cookie.secure = true;
}
app.use(session(sess));

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

app.post('/api/v1/auth', (req, res, next) => {
  // if already logged in, redirect to dashboard
  if (req.session.loggedIn) {
    if (req.session.userType === 'student') {
      res.status(200).json({
        success: true,
        loggedIn: true,
        userType: 'student',
        redirectTo: studentLoginSuccessRedirect
      });
    } else if (req.session.userType === 'admin') {
      res.status(200).json({
        success: true,
        loggedIn: true,
        userType: 'admin',
        redirectTo: '/admin'
      });
    } else {
      // unknown user_type
      req.session.loggedIn = false;
      res.status(200).json({
        success: true,
        loggedIn: false,
        redirectTo: '/login'
      });
    }
  } else {
    if (req.body.email && req.body.password) {
      User.find({
        email: req.body.email
      }).then(doc => {
        if (doc.length > 0 && doc[0].password && doc[0].user_type && userTypes.indexOf(doc[0].user_type) !== -1) {
          bcrypt.compare(req.body.password, doc[0].password, (err, result) => {
            if (result) {
              req.session.email = doc[0].email;
              req.session.userType = doc[0].user_type;
              req.session.firstName = doc[0].first_name;
              req.session.lastName = doc[0].last_name;
              req.session.loggedIn = true;
              // console.log(doc[0]);
              if (doc[0].user_type === 'student') {
                res.status(200).json({
                  success: true,
                  loggedIn: true,
                  userType: 'student',
                  redirectTo: studentLoginSuccessRedirect
                });
              } else if (doc[0].user_type === 'admin') {
                res.status(200).json({
                  success: true,
                  loggedIn: true,
                  userType: 'admin',
                  redirectTo: '/admin'
                });
              }
            } else {
              // Login fail due to incorrect password
              req.session.loggedIn = false;
              res.status(200).json({
                success: true,
                loggedIn: false,
                message: 'Login unsuccessful: unknown email or password',
                redirectTo: '/login'
              });
            }
            if (err) {
              console.error(err);
              req.session.loggedIn = false;
              res.status(500).json({
                success: false,
                loggedIn: false,
                error: 'Internal server error',
                redirectTo: '/login'
              });
            }
          });
        } else {
          // No user
          req.session.loggedIn = false;
          res.status(200).json({
            success: true,
            loggedIn: false,
            message: 'Login unsuccessful: unknown email or password',
            redirectTo: '/login'
          });
        }
      });
    } else {
      // correct body not supplied
      res.status(400).json({
        success: false,
        loggedIn: false,
        error: 'Correct body not supplied',
        redirectTo: '/login'
      });
    }
  }
});

module.exports = app;
