var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var config = require('./config/database');
var bodyParser = require('body-parser');
var session = require('express-session');
var expressValidator = require('express-validator');
var fileUpload = require('express-fileupload');
var passport = require("passport");
const MongoStore = require('connect-mongo')(session);

// connect to db
mongoose.connect(config.database, {useNewUrlParser:true});

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log("connected to MongoDB");
  // we're connected!
});

// Init App
var app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine','ejs');

// Set public folder
app.use(express.static(path.join(__dirname, 'public')));

// set global error variable
app.locals.errors = null;

// Fet Pages model
var Page = require('./models/page');

// set global pages variable
Page.find({}).sort({sorting: 1}).exec((err, pages)=>{
  if(err){
    console.log(err);
  }
  else{
    app.locals.pages = pages;    
  }
});

// Get Category model
var Category = require('./models/category');

// set global Categories variable
Category.find((err, categories)=>{
  if(err){
    console.log(err);
  }
  else{
    app.locals.categories = categories;    
  }
});


// Expresss fileupload middleware
app.use(fileUpload());


// Body-parser middleware
//
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// Express-validator middleware
app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.'),
            root      = namespace.shift(),
            formParam = root;
 
      while(namespace.length) {
        formParam += '[' + namespace.shift() + ']';
      }
      return {
        param : formParam,
        msg   : msg,
        value : value
      };
    },
    customValidators:{
      isImage:function(value, filename){
        var extension = (path.extname(filename)).toLowerCase();
        console.dir(extension);
        switch (extension) {
          case '.jpg':
            return '.jpg';
          case '.jpeg':
            return '.jpeg';
          case '.png':
            return '.png';
          case '':
            return '.jpg';
          default:
            return false;
        }
      }
    }
  }));

// Express Session middleware
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({ mongooseConnection: mongoose.connection }),
  cookie: { maxAge: 180 * 60 * 1000 }
}));

// Express Messasges middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// passport configuration
require("./config/passport")(passport);
// passport Middleware
app.use(passport.initialize());
app.use(passport.session());


app.get('*', (req, res, next)=>{
  res.locals.totalQty = req.session.cart ? req.session.cart.totalQty : 0;
  res.locals.user = req.user || null;
  //console.dir('*', res.locals.cart.length);
  next();  
});


// Set Routes
var pages = require('./routes/pages');
var products = require('./routes/products');
var cart = require('./routes/cart');
var user = require('./routes/users');

var adminPages = require('./routes/admin_pages');
var adminCategories = require('./routes/admin_categories');
var adminProducts = require('./routes/admin_products');



app.use('/admin/pages', adminPages);
app.use('/admin/categories', adminCategories);
app.use('/admin/products', adminProducts);
app.use('/products', products);
app.use('/cart', cart);
app.use('/user', user);
app.use('/', pages);




// start the server
var port = 3000;
app.listen(port, ()=>{
    console.log('server started on port', 3000);
})