var express = require('express');
var router = express.Router();
var auth = require("../config/auth");
var isAdmin = auth.isAdmin;

/*
    Get Category Schema
*/
var Category = require('../models/category');

/*
* Get Category Index
*/
router.get('/', isAdmin, function(req, res){
    Category.find((err, categories)=>{
        res.render('admin/categories',{
            categories:categories
        });
    });
});

/*
* Get add Category
*/
router.get('/add-category', isAdmin, function(req, res){
    var title = "";

    res.render('admin/add_category', {
        title : title,
    });
});

/*
* Post add Category
*/
router.post('/add-category', function(req, res){
    req.checkBody('title', 'Title must have a value').notEmpty();
    
    var title = req.body.title;
    var slug = title.split(' ').join('-').toLowerCase();
    console.log(slug)
    var errors = req.validationErrors();

    if(errors)
    {
        console.log('errors', errors);
        res.render('admin/add_category', {
            errors : errors,
            title : title
        });
    }
    else{
        console.log('success');
        Category.findOne({slug:slug}, function(err, category){
            
            if(category){
                req.flash('danger', 'Category slug exists, choose another.');
                res.render('admin/add_category', {
                    title : title
                });
            }
            else{
                var category = new Category({
                    title:title,
                    slug:slug
                });

                category.save(function(err){
                    if(err){
                        return console.log(err);
                    }

                    Category.find((err, categories)=>{
                        if(err){
                            console.log(err);
                        }
                        else{
                            req.app.locals.categories = categories;    
                        }
                    });

                    req.flash('success', 'Category Added!')
                    res.redirect('/admin/categories');
                })
                
            }
        })
    }

    
});


/*
* Get edit Category
*/
router.get('/edit-category/:id', isAdmin, function(req, res){
    
    Category.findOne({_id:req.params.id}, function(err, category){
        if(err){
            console.log(err)
        }
        else{
            res.render('admin/edit_category', {
                title : category.title,
                id : category._id
            });
        }
        
    });
    
});

/*
* Post edit Category
*/
router.post('/edit-category/:id', function(req, res){
    req.checkBody('title', 'Title must have a value').notEmpty();
    
    var title = req.body.title;
    var slug = title.split(' ').join('-').toLowerCase();

    var id = req.params.id;

    var errors = req.validationErrors();

    if(errors)
    {
        console.log('errors', errors);
        res.render('admin/edit_category', {
            errors : errors,
            title : title,
            id : id
        });
    }
    else{
        console.log('success');
        Category.findOne({slug : slug, _id : {$ne : id}}, function(err, category){
            
            if(category){
                req.flash('danger', 'Category title exists, choose another.');
                res.render('admin/edit_category', {
                    title : title,
                    id : id
                });
            }
            else{
                Category.findById(id, function(err, category){
                    if(err){
                        return console.log(err);
                    }
                    
                    category.title = title;
                    category.slug = slug;

                    category.save(function(err){
                        if(err){
                            return console.log(err);
                        }
                        Category.find((err, categories)=>{
                            if(err){
                                console.log(err);
                            }
                            else{
                                req.app.locals.categories = categories;    
                            }
                        });
                        req.flash('success', 'Category Added!')
                        res.redirect('/admin/categories/edit-category/' + category._id);
                    })

                });                
            }
        })
    }

    
});

/*
* Get Delete Category
*/
router.get('/delete-category/:id', isAdmin, function(req, res){
    Category.findByIdAndRemove(req.params.id, function(err){
        if(err){
            return console.log(err);
        }
        Category.find((err, categories)=>{
            if(err){
                console.log(err);
            }
            else{
                req.app.locals.categories = categories;    
            }
        });
        req.flash('success', 'Category Deleted!')
        res.redirect('/admin/categories');
    });
});


module.exports = router;