var express = require('express');
var router = express.Router();
var passport = require("passport");
var bcrypt = require("bcryptjs");
var csrf  = require('csurf')
var csrfProtection = csrf();

router.use(csrfProtection);

// set User model
var User = require('../models/user');

/*
    Get Register page
*/

router.get("/register", function(req, res){

    
    res.render("register",{
        title: 'register',
        csrfToken : req.csrfToken()
    });

});

/*
    Post Register
 */
router.post('/register', function(req, res){
    
    var name = req.body.name;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.confirmpassword;
    

    req.checkBody("name", "Name is required!").notEmpty();
    req.checkBody("email", "Email is required!").notEmpty();
    req.checkBody("username", "Username is required!").notEmpty();
    req.checkBody("password", "Password is required!").notEmpty();
    req.checkBody("password", "Passwords do not match!").equals(password2);

    var errors = req.validationErrors();

    if(errors){
        res.render("register",{
            errors: errors,
            user : null,
            title: 'register'
        });   
    }else{
        User.findOne({username: username}, (err, user)=>{
            if(err){
                console.log(err);
            }
            if(user){
                req.flash("danger", "Username exists, choose another!");
                res.redirect("/user/register");
            }
            else{
                var user = new User({
                    name : name,
                    email : email,
                    username : username,
                    password : password,
                    admin : 0
                });

                bcrypt.genSalt(10, (err, salt)=>{
                    bcrypt.hash(user.password, salt, (err, hash)=>{
                        if(err){
                              console.log(err);
                        }
                        user.password = hash;
                        
                        user.save((err)=>{
                            if(err){
                                console.log(err);
                            }else{
                                req.flash("success", "You are now Regsitered!");
                                res.redirect("/user/login");
                            }
                        })
                    })
                });
            }
        });
    }
});


/*
    Get Login page
*/

router.get("/login", function(req, res){

    if(res.locals.user) res.redirect('/');
    
    res.render("login",{
        title: 'Log In',
        csrfToken : req.csrfToken()
    });

});


/*
    Post Login page
*/

router.post("/login", passport.authenticate('local',{
        failureRedirect : "/user/login",
        failureFlash: true,
    }), 
    (req, res, next)=>{
    //    res.header("csrfToken", req.csrfToken());
        res.redirect("/");
    }
);
            
/*
    get Logout
*/

router.get("/logout", function(req, res, next){
    req.logOut();
    req.flash("success", "You are logged out!");
    res.redirect("/user/login");
});

module.exports = router;