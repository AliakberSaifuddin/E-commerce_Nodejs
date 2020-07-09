var LocalStrategy = require('passport-local').Strategy;
var User = require("../models/user");
var bcrypt = require("bcryptjs");

module.exports = function(passport){


    // if we have different name for "username and password"
    /* 
        passport.use(new LocalStrategy({
            username : yourname,
            password : yourpassword
        },function(username, password, done){
    */
    passport.use(new LocalStrategy(function(username, password, done){
        User.findOne({username: username}, (err, user)=>{
            if(err){
                console.log(err)
            }
            if(!user){
                return done(null, false, {message : "No user found"});
            }

            bcrypt.compare(password, user.password, function(err, isMatch){
                if(err){
                    console.log(err)
                }
                if(isMatch){
                    return done(null, user);
                }else{
                    return done(null, false, {message : "Wrond password"});
                }
            });
        });
    }));

    passport.serializeUser(function(user, done){
        return done(null, user.id);
    });

    passport.deserializeUser(function(id, done){
        User.findById(id,(err, user)=>{
            done(err, user);
        });
    });
}