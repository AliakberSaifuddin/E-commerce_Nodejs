var express = require('express');
var router = express.Router();
var csrf  = require('csurf')
var csrfProtection = csrf()

router.use(csrfProtection);
//var csrfProtection = csrf({ cookie: true })

// set Pages model
var Page = require('../models/page');

/*
    Get home page
*/

router.get('/', function(req, res){

    

   // res.cookie("cookie teste", "myfirst cookie");

    Page.findOne({slug:'home'}, (err, page)=>{
        if(err){  
            console.log(err);
        }
        else{
            res.render('index',{
                title: page.title,
                content: page.content
            });
        }
    });
});

/*
    Get a page
 */
router.get('/:slug', function(req, res){
    
    var slug = req.params.slug;

    Page.findOne({slug:slug}, (err, page)=>{
        if(err){
            console.log(err);
        }
        if(!page){
            res.redirect('/');
        }
        else{
            res.render('index',{
                title: page.title,
                content: page.content
            });
        }
    });
});


module.exports = router;