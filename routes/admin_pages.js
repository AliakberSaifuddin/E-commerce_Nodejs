var express = require('express');
var router = express.Router();
var auth = require("../config/auth");
var isAdmin = auth.isAdmin;

// set Pages model
var Page = require('../models/page');

/*
* Get Pages Index
*/
router.get('/', isAdmin, function(req, res){
    Page.find({}).sort({sorting: 1}).exec((err, pages)=>{
        res.render('admin/pages',{
            pages:pages
        });
    });
});

/*
* Get add page
*/
router.get('/add-page', isAdmin, function(req, res){
    var title = "";
    var slug = "";
    var content = "";
    
    console.log('here')

    res.render('admin/add_page', {
        title : title,
        slug : slug,
        content : content
    });
});

/*
* Post add page
*/
router.post('/add-page', function(req, res){
    req.checkBody('title', 'Title must have a value').notEmpty();
    req.checkBody('content', 'Content must have a value').notEmpty();
    
    var title = req.body.title;
    var slug = req.body.slug.split(' ').join('-').toLowerCase();
    if(slug == "") slug = title.split(' ').join('-').toLowerCase()
    var content = req.body.content;

    var errors = req.validationErrors();

    if(errors)
    {
        console.log('errors', errors);
        res.render('admin/add_page', {
            errors : errors,
            title : title,
            slug : slug,
            content : content
        });
    }
    else{
        console.log('success');
        Page.findOne({slug:slug}, function(err, page){
            
            if(page){
                req.flash('danger', 'Page slug exists, choose another.');
                res.render('admin/add_page', {
                    title : title,
                    slug : slug,
                    content : content
                });
            }
            else{
                var page = new Page({
                    title:title,
                    slug : slug,
                    content : content,
                    sorting : 100
                });

                page.save(function(err){
                    if(err){
                        return console.log(err);
                    }
                    Page.find({}).sort({sorting: 1}).exec((err, pages)=>{
                        if(err){
                          console.log(err);
                        }
                        else{
                          req.app.locals.pages = pages;    
                        }
                    });
                    req.flash('success', 'Page Added!')
                    res.redirect('/admin/pages');
                })
                
            }
        })
    }

    
});

// sort pages function 

function sortPages(ids, callback){

    var counter = 0;

    for(var i=0; i<ids.length; i++){
        var id = ids[i];
        counter++;
        ((counter)=>{
            console.log('counter = ', counter);
            Page.findById(id, (err, page)=>{
                page.sorting = counter;
                
                page.save((err)=>{
                    if(err){
                        console.log(err);
                    }
                    ++counter;
                    console.log("inc = ", counter);
                    if(counter > ids.length)
                        callback();
                });
            });
        })(counter)
        console.log('final = ', counter);
    }
}


/*
* Post Reorder pages
*/
router.post('/reorder-page', function(req, res){
    var ids = req.body['id[]']

    sortPages(ids, function(){
        Page.find({}).sort({sorting: 1}).exec((err, pages)=>{
            if(err){
              console.log(err);
            }
            else{
              req.app.locals.pages = pages;    
            }
        });
    });
});

/*
* Get edit page
*/
router.get('/edit-page/:id', isAdmin, function(req, res){
    
    Page.findById(req.params.id, function(err, page){
        if(err){
            console.log(err)
        }
        else{
            res.render('admin/edit_page', {
                title : page.title,
                slug : page.slug,
                content : page.content,
                id : page._id
            });
        }
        
    })

    
});

/*
* Post edit page
*/
router.post('/edit-page/:id', function(req, res){
    req.checkBody('title', 'Title must have a value').notEmpty();
    req.checkBody('content', 'Content must have a value').notEmpty();
    
    var title = req.body.title;
    var slug = req.body.slug.split(' ').join('-').toLowerCase();
    console.log(slug)
    if(slug == "") slug = title.split(' ').join('-').toLowerCase()
    var content = req.body.content;

    var id = req.params.id;

    var errors = req.validationErrors();

    if(errors)
    {
        console.log('errors', errors);
        res.render('admin/edit_page', {
            errors : errors,
            title : title,
            slug : slug,
            content : content,
            id : id
        });
    }
    else{
        console.log('success');
        Page.findOne({slug : slug, _id : {$ne : id}}, function(err, page){
            
            if(page){
                req.flash('danger', 'Page slug exists, choose another.');
                res.render('admin/edit_page', {
                    title : title,
                    slug : slug,
                    content : content,
                    id : id
                });
            }
            else{
                Page.findById(id, function(err, page){
                    if(err){
                        return console.log(err);
                    }
                    
                    page.title = title;
                    page.slug = slug;
                    page.content = content;

                    page.save(function(err){
                        if(err){
                            return console.log(err);
                        }
                        Page.find({}).sort({sorting: 1}).exec((err, pages)=>{
                            if(err){
                              console.log(err);
                            }
                            else{
                              req.app.locals.pages = pages;    
                            }
                        });
                        req.flash('success', 'Page Added!')
                        res.redirect('/admin/pages/edit-page/' + id);
                    })

                });                
            }
        })
    }

    
});

/*
* Get Delete Page
*/
router.get('/delete-page/:id', isAdmin, function(req, res){
    Page.findByIdAndRemove(req.params.id, function(err){
        if(err){
            return console.log(err);
        }
        Page.find({}).sort({sorting: 1}).exec((err, pages)=>{
            if(err){
              console.log(err);
            }
            else{
              req.app.locals.pages = pages;    
            }
        });
        req.flash('success', 'Page Deleted!')
        res.redirect('/admin/pages');
    });
});


module.exports = router;