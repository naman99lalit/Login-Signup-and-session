const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const mongoose = require('mongoose');
// Load User model
const User = require('../models/User');
const { forwardAuthenticated } = require('../config/auth');

const session = require('express-session');
var MongoStore = require('connect-mongo')(session);
const app = express();

const db = require('../config/keys').MongoURI;

// Login Page
router.get('/login', forwardAuthenticated, (req, res) => res.render('login'));

// Register Page
router.get('/register', forwardAuthenticated, (req, res) => res.render('register'));

// Register
router.post('/register', (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  if (!name || !email || !password || !password2) {
    errors.push({ msg: 'Please enter all fields' });
  }

  if (password != password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }

  if (errors.length > 0) {
    res.render('register', {
      errors,
      name,
      email,
      password,
      password2
    });
  } else {
    User.findOne({ email: email }).then(user => {
      if (user) {
        errors.push({ msg: 'Email already exists' });
        res.render('register', {
          errors,
          name,
          email,
          password,
          password2
        });
      } else {
        const newUser = new User({
          name,
          email,
          password
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => {
                req.flash(
                  'success_msg',
                  'You are now registered and can log in'
                );
                res.redirect('/users/login');
              })
              .catch(err => console.log(err));
          });
        });
      }
    });
  }
});


// Login

router.post('/login',
  passport.authenticate('local'),
  function(req,res){
    if(req.session){
      console.log(req.session)
      var user_id = req.session.passport.user;
      var _id = mongoose.Types.ObjectId(user_id);
      User.find({ _id : _id }).then(user=>{
        if(user){
          console.log(user)
        }
      })
      query_str = '"user":"' + user_id + '"'
      //console.log(db)
      //console.log(db.listCollections())
      res.redirect('/dashboard')
    }
    else{
      res.redirect('/users/login')
    }
  });
// router.post('/login', (req, res, next) => {

//   // passport.authenticate('local', {
//   //   successRedirect: '/dashboard',
//   //   failureRedirect: '/users/login',
//   //   failureFlash: true
//   // })
//   console.log(req.session);
//   console.log(req.session.passport);
//   if(req.session.passport){
//     //console.log(req.session.passport.user);
//     var user_id = req.session.passport.user;
//     var id = mongoose.Types.ObjectId(user_id);
//     console.log(id)
//     User.find({"_id":id}).count()
//   }(req, res, next)
// });

// Logout
router.get('/logout', (req, res) => {
  if (req.session) {
    // delete session object
    req.session.destroy(function(err) {
      if(err) {
        return res.send(err);
      }else{
        req.logout();
        return res.redirect('/users/login');
      }
    });
  }
});

module.exports = router;
