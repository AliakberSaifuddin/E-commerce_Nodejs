var express = require('express');
var router = express.Router();
var csrf  = require('csurf')
var csrfProtection = csrf();

router.use(csrfProtection);

// set Product model
var Product = require('../models/product');

// set Cart model
var Cart = require('../models/cart');


/*
    Get Add product to cart
*/

router.get('/add/:product', function(req, res){

    var slug = req.params.product;

    Product.findOne({slug:slug}, (err, p)=>{
        if(err){
            console.log(err);
        }
        // if(typeof req.session.cart === "undefined"){
            var cart = new Cart(req.session.cart ? req.session.cart : {});
      //      console.log(cart);
            cart.add(p, p._id);
            req.session.cart = cart;
            // req.session.cart[slug] = {
            //                             title : slug,
            //                             price : parseFloat(p.price).toFixed(2), 
            //                             qty : 1, 
            //                             image : "/product_images/" + p._id + "/" + p.image
            //                         }
//        }
        // else{
        //     if(typeof req.session.cart[slug] === "undefined"){
        //         req.session.cart[slug] = {
        //             title : slug,
        //             price : parseFloat(p.price).toFixed(2), 
        //             qty : 1, 
        //             image : "/product_images/" + p._id + "/" + p.image
        //         } 
        //     }
        //     else{
        //         console.log("acheived")
        //         req.session.cart[slug].qty += 1;
        //     }
        // }
        //  console.dir(req.session.cart.length);
        //  console.log(Object.keys(req.session.cart).length);
        req.flash("success", "Product added to cart!");
        res.redirect("back");
    
    });
});


/*
    Get Checkout Page 
*/

router.get('/checkout', function(req, res){
    // console.dir("checkout function");
    // console.log(req.session.cart);

    var cart = undefined;
    if(req.session.cart){
        cart = new Cart(req.session.cart);
 //       console.log(cart.generateArray());
    }

    console.log(cart ? true : false);
    res.render('checkout',{
        title: 'checkout',
        cart : cart ? cart.generateArray() : cart,
        totalPrice : cart ? cart.totalPrice : null
    });
});

/*
    Get Update Cart 
*/

router.get('/update/:id', function(req, res){
    var id = req.params.id;
    var action = req.query.action;
    var cart = req.session.cart;
    var item = req.session.cart.items[id];
//    console.log(item);
  //  console.log('slug',slug);
    switch (action) {
        case "add":
            item.qty += 1;
            item.price += item.item.price;
            cart.totalQty += 1;
            cart.totalPrice += item.item.price;
            break;
        case "remove":
            item.qty -= 1;
            item.price -= item.item.price;
            cart.totalQty -= 1;
            cart.totalPrice -= item.item.price;
            if(item.qty > 0)
            break;
        case "clear":
            cart.totalQty -= item.qty;
            cart.totalPrice -= item.price;
            delete req.session.cart.items[id];            
            if(cart.totalQty == 0){
                delete req.session.cart;
            }
            break;    
        default:
            console.log('update problem');
            break;
    }
    req.flash("success", "Cart updated!");
    res.redirect("/cart/checkout");

});


/*
    Get Clear cart 
*/

router.get('/clear', function(req, res){

    delete req.session.cart;
    req.flash("success", "Cart cleared");
    res.redirect("/cart/checkout");
});



/*
    Get buy now 
*/

router.get('/buynow', function(req, res){

    delete req.session.cart;

    res.sendStatus(200);
});

/*
    Get Strip Checkout page
*/

router.get('/stripeCheckOut', function(req, res){

    // console.dir("checkout function");
    // console.log(req.session.cart);

    var cart = undefined;
    if(req.session.cart){
        cart = new Cart(req.session.cart);
//        console.log(cart.generateArray());
    }

  //  console.log(cart ? true : false);
    var errMsg = req.flash("error")[0];
    res.render('stripe_checkout',{
        title: 'stripecheckout',
        cart : cart ? cart.generateArray() : cart,
        totalPrice : cart ? cart.totalPrice : null,
        errMsg : errMsg,
        noError : !errMsg,
        csrfToken : req.csrfToken()
    });
});



/*
    POST Strip Checkout page
*/

router.post('/stripeCheckOut', function(req, res){

    if(!req.session.cart){
       return res.redirect("/checkout");
    }

    var cart = new Cart(req.session.cart);
    
    const stripe = require('stripe')('sk_test_kUnAJNfvfgs39c0jaJUWdGX100X7dVRCWK');

    stripe.charges.create(
        {
          amount: cart.totalPrice*100,
          currency: 'usd',
          source: req.body.stripeToken,
          description: 'My First Test Charge (created for API docs)',
        },
        function(err, charge) {
            if(err){
                req.flash("error", err.message);
                return res.redirect("/checkout");
            }

            req.flash("success","Successfully bought product!");
            req.session.cart = null;
            res.redirect("/");
          // asynchronously called
        }
      );
});


module.exports = router;