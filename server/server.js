var express = require('express');
var bodyParser = require('body-parser');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const router = express.Router();
var MongoStore = require('connect-mongo')(session);
const User = require('./models/User');

const app = express();

// Passport Config
require('./config/passport')(passport);

//DB Config
const db = require('./config/keys').MongoURI;


//Connect to MongoDB
mongoose.connect(db,{useNewUrlParser:true})
.then(()=>console.log('MongoDB connected'))
.catch(err => console.log(err));

//ejs
app.use(expressLayouts);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

//BodyParser
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Express session
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
    store: new MongoStore({
      mongooseConnection: mongoose.connection,
      ttl: 10 * 60})
  })
);


// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

//Checking the user limit
app.use((req,res,next)=>{
  console.log(req.session);
  console.log(req.session.passport);
  if(req.session.passport){
    //console.log(req.session.passport.user);
    var user_id = req.session.passport.user;
    var id = mongoose.Types.ObjectId(user_id);
    console.log(db.users.find({
     "_id" : id }).count())
  }
  next();
});

// Connect flash
app.use(flash());

// Global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

//Routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));


port = 3000
app.listen(port, ()=>{
  console.log('Started on port 3000');
});
