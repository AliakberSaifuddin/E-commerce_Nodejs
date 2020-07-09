var express = require('express');
var router = express.Router();
var mkdirp = require('mkdirp');
var fs = require('fs-extra');
var resizeImg = require('resize-img');
var auth = require("../config/auth");
var isAdmin = auth.isAdmin;


// Get Product Model
var Product = require('../models/product');
// Get Category Model
var Category = require('../models/category');


/*
* Get products Index
*/
router.get('/', isAdmin, function(req, res){
    var count = 0;

    Product.count((err, c)=>{
        count = c;
    })

    Product.find((err, products)=>{
        res.render('admin/products',{
            products : products,
            count:count
        });
    });
});

/*
* Get add Product
*/
router.get('/add-product', isAdmin, function(req, res){
    var title = "";
    var price = "";
    var desc = "";
    
    Category.find((err, categories)=>{
        res.render('admin/add_product', {
            title : title,
            price : price,
            desc : desc,
            categories : categories
        });
    });
});

/*
* Post add Product
*/
router.post('/add-product', function(req, res){
    //console.dir(req.files);
    var imageFile = "";
    if(req.files != null){
        imageFile = req.files.image.name;
      //  console.dir(req.files.image);
    }
    req.checkBody('title', 'Title must have a value').notEmpty();
    req.checkBody('desc', 'Description must have a value').notEmpty();
    req.checkBody('price', 'Price must have a value').isDecimal();
    req.checkBody('image', 'You must upload an image').isImage(imageFile);
    
    var title = req.body.title;
    var slug = title.split(' ').join('-').toLowerCase();
    var desc = req.body.desc;
    var price = req.body.price;
    var category = req.body.category;

    var errors = req.validationErrors();

    if(errors)
    {
        Category.find((err, categories)=>{
            res.render('admin/add_product', {
                errors: errors,
                title : title,
                price : price,
                desc : desc,
                categories : categories
            });
        });
    }
    else{
        console.log('success');
        Product.findOne({slug:slug}, function(err, product){
            
            if(product){
                req.flash('danger', 'Product title exists, choose another.');
                Category.find((err, categories)=>{
                    res.render('admin/add_product', {
                        title : title,
                        price : price,
                        desc : desc,
                        categories : categories
                    });
                });
            }
            else{
                var price2 = parseFloat(price).toFixed(2);
                var product = new Product({
                    title : title,
                    slug : slug,
                    price : price2,
                    desc : desc,
                    category : category,
                    image : imageFile                    
                });

                product.save(function(err){
                    if(err){
                        return console.log(err);
                    }

                    // mkdirp("public/product_images/" + product._id, function(err){
                    //     return console.log(err);
                    // });

                    // mkdirp("public/product_images/" + product._id + "/gallery", function(err){
                    //     return console.log(err);
                    // });

                    // mkdirp("public/product_images/" + product._id + "/gallery/thumbs", function(err){
                    //     return console.log(err);
                    // });

                    // make this all process cleaner
                   
                    mkdirp("public/product_images/" + product._id).then((made)=>{
                        console.log(`first mkdirp call ${made}`);
                        mkdirp("public/product_images/" + product._id + "/gallery").then((made)=>{
                            console.log(`third mkdirp call ${made}`);
                            mkdirp("public/product_images/" + product._id + "/gallery/thumbs").then((made)=>{
                                console.log(`second mkdirp call ${made}`);
                                if(imageFile != ""){
                                    var productImage = req.files.image;
                                    var path = "public/product_images/" + product._id + "/" + imageFile;
            
                                    productImage.mv(path, function(err){
                                        return console.log(err);
                                    })
                                }

                                req.flash('success', 'Product Added!')
                                res.redirect('/admin/products');

                            });
                        });
                    });
             
                    

                    
                });
                
            }
        })
    }

    
});

/*
* Get edit Product
*/
router.get('/edit-product/:id', isAdmin, function(req, res){
    var errors;
    if(req.session.errors) errors = req.session.errors;
    req.session.errors = null;
    var id = req.params.id;
    Category.find((err, categories)=>{

        Product.findById(req.params.id, function(err, p){
            if(err){
                console.log(err);
                res.redirect("/admin/products");
            }
            else{
                var galleryDir = "public/product_images/" + p._id + '/gallery';
                var galleryImages = null;

                fs.readdir(galleryDir, function(err, files){
                    if(err){
                        console.log(err);
                    }else{
                        galleryImages = files;
                        
                        res.render('admin/edit_product', {
                            errors : errors,
                            id : id,
                            title : p.title,
                            price : p.price,
                            desc : p.desc,
                            categories : categories,
                            category : p.category.split(' ').join('-').toLowerCase(),
                            image : p.image,
                            galleryImages : galleryImages
                        });
                    }         
                });
            }
        });

        
    });
    
});

/*
* Post edit Product
*/
router.post('/edit-product/:id', function(req, res){

    console.log('api hit');

    var imageFile = "";
    if(req.files != null){
        imageFile = req.files.image.name;
      //  console.dir(req.files.image);
    }

    req.checkBody('title', 'Title must have a value').notEmpty();
    req.checkBody('desc', 'Description must have a value').notEmpty();
    req.checkBody('price', 'Price must have a value').isDecimal();
    req.checkBody('image', 'You must upload an image').isImage(imageFile);
    
    var title = req.body.title;
    var slug = title.split(' ').join('-').toLowerCase()
    var desc = req.body.desc;
    var price = req.body.price;
    var category = req.body.category;
    var pimage = req.body.pimage;
    var id = req.params.id;

    var errors = req.validationErrors();

    if(errors){
        req.session.errors = errors;
        res.redirect("/admin/products/edit-product/" + id);
    }
    else{
        Product.findOne({slug: slug, _id:{$ne : id}}, (err, p)=>{
            if(err)
                return console.log(err);
            if(p){
                req.flash("danger", "Product title exits, choose another");
                res.redirect("/admin/products/edit-product/" + id);
            }
            else{
                Product.findById(id, (err, p)=>{
                    p.title = title;
                    p.slug = slug;
                    p.desc = desc;
                    p.price = parseFloat(price).toFixed(2);
                    p.category = category;
                    if(imageFile != ""){
                        p.image = imageFile;
                    } 
                    
                    p.save((err)=>{
                        if(err)
                            console.log(err);

                        if(imageFile != ""){
                            if(pimage != ""){
                                fs.remove("public/product_images/" + id + "/" + pimage,(err)=>{
                                    if(err)
                                        console.log(err);
                                });            
                            }
                            
                            var productImage = req.files.image;
                            var path = "public/product_images/" + id + "/" + imageFile;
    
                            productImage.mv(path, function(err){
                                return console.log(err);
                            });                            
                        }
                        req.flash('success', 'Product Edited!')
                        res.redirect("/admin/products/edit-product/" + id);    
                    });
                });
            }
        })
    }
    
});

/*
* Post Products Gallery
*/
router.post('/product-gallery/:id', function(req, res){
    
    var productImage = req.files.file;
    var id = req.params.id;
    var path = "public/product_images/" + id + "/gallery/" + req.files.file.name;
    var thumbsPath = "public/product_images/" + id + "/gallery/thumbs/" + req.files.file.name;
    
    productImage.mv(path).then((err)=>{
        if(err)
            console.log(err);   
        resizeImg(fs.readFileSync(path), {width:100, height:100}).then((buf)=>{
            fs.writeFileSync(thumbsPath, buf);
        });           
    });

    

    res.sendStatus(200);

});

/*
* Get Image delete
*/
router.get('/delete-image/:image', isAdmin, function(req, res){

    var path = "public/product_images/" + req.query.id + "/gallery/" + req.params.image;
    var thumbPath = "public/product_images/" + req.query.id + "/gallery/thumbs/" + req.params.image;

    fs.remove(path, (err)=>{
        if(err){
            console.log(err);
        }
        else{
            fs.remove(thumbPath, (err)=>{
                if(err){
                    console.log(err);
                }
                else{
                    req.flash('success', 'Image deleted!')
                    res.redirect("/admin/products/edit-product/" + req.query.id);
                }
            });
        }
    });
});




/*
* Get Delete Product
*/
router.get('/delete-product/:id', isAdmin, function(req, res){

    var path = "public/product_images/" + req.params.id;

    fs.remove(path, (err)=>{
        if(err){
            console.log(err);
        }
        else{
            Product.findByIdAndRemove(req.params.id, function(err){
                if(err){
                    return console.log(err);
                }
                req.flash('success', 'Product Deleted!')
                res.redirect('/admin/products');
            });
        }
    });
    
});


module.exports = router;