var express = require('express');
var router = express.Router();
var fs = require('fs-extra');
var auth = require("../config/auth");
var isUser = auth.isUser;

// set Product model
var Product = require('../models/product');

// set Product model
var Category = require('../models/category');

/*
    Get All Products
*/

router.get('/', function(req, res){
//router.get('/', isUser, function(req, res){

    console.log('hit');
    Product.find((err, products)=>{
        if(err){
            console.log(err);
        }
        else{
 //           console.dir(products);
            res.render('all_products',{
                title: 'All Products',
                products: products
            });
        }
    });
});

/*
    Get a Products by Category
 */
router.get('/:category', function(req, res){
    
    var categorySlug = req.params.category;

    Category.findOne({slug: categorySlug}, (err, category)=>{
        if(err){
            console.log(err);
        }
        else{
            Product.find({category: categorySlug},(err, products)=>{
                if(err){
                    console.log(err);
                }
                else{
                    res.render('cat_products',{
                        title: category.title,
                        products: products
                    });
                }
            });
        }
    })
});

/*
    Get a product details
 */
router.get('/:category/:product', function(req, res){
    
    var galleryImages = null;
    var loggedIn = req.isAuthenticated() ? true : false;

    Product.findOne({slug: req.params.product},(err, product)=>{
        if(err){
            console.log(err);
        }
        else{
            var galleryDir = `public/product_images/${product._id}/gallery`;

            fs.readdir(galleryDir, (err, files)=>{
                if(err){
                    console.log(err);
                }
                else{
                    galleryImages = files;
                    
                    res.render('product',{
                        title: product.title,
                        p : product,
                        galleryImages : galleryImages,
                        loggedIn : loggedIn
                    });
                }
            })

            
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