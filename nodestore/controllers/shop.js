const fs= require('fs')
const path = require('path')
const Product = require('../models/products')
const Order = require('../models/order')
const User = require('./../models/user')
const PDFDocument  = require('pdfkit')

const stripe = require('stripe')('sk_test_3EUvsjZyWqs4JKCpXfyDfm4b008vuiThI4');


const itemsPerPage = 1


exports.getProducts= (req,res,next)=>{
    const page = +req.query.page || 1
    let totalItems
    Product
    .find()
    .countDocuments().then(numProd=>{
        totalItems = numProd
     return   Product.find().skip((page-1) *itemsPerPage)
    .limit(itemsPerPage)
    })
    .then(products=>{
        res.render('shop/product-list',{products,
             path:"/product-list",
             totalItems,
             currentPage: page,
             hasNextPage:itemsPerPage* page < totalItems,
             hasPreviousPage:page >1,
             nextPage:page + 1,
             previousPage: page -1,
             lastPage:Math.ceil(totalItems/itemsPerPage)

             })
    })
    .catch(err=>{
        const error =  new Error(err)
        error.httpStatusCode = 500
        return next(error)
    })       
}

exports.getIndex = (req,res,next)=>{
    const page = +req.query.page || 1
    let totalItems
    Product
    .find()
    .countDocuments().then(numProd=>{
        totalItems = numProd
     return   Product.find().skip((page-1) *itemsPerPage)
    .limit(itemsPerPage)
    })
    .then(products=>{
        res.render('shop/index',{products,
             path:"/",
             totalItems,
             currentPage: page,
             hasNextPage:itemsPerPage* page < totalItems,
             hasPreviousPage:page >1,
             nextPage:page + 1,
             previousPage: page -1,
             lastPage:Math.ceil(totalItems/itemsPerPage)

             })
    })
    .catch(err=>{
        const error =  new Error(err)
        error.httpStatusCode = 500
        return next(error)
    })     
}

exports.getProduct = (req,res,next)=>{
    const prodId =  req.params.productId
    Product.findById(prodId).then(product=>{
         res.render('shop/product-details', {product,
            path: '/product-list' })
    })
    .catch(err=> {
        const error =  new Error(err)
        error.httpStatusCode = 500
        return next(error)
    })
                  
}

exports.showProducts = (req,res)=>{
    res.render('shop/product-details', 
    {path:'/products'})
}

exports.showCart = (req,res,next)=>{
    req.user.populate('cart.items.productId')
    .execPopulate()
        .then(user =>{
            // console.log(user.cart.items)
            let cartProducts = user.cart.items
            res.render('shop/cart', {path:'/cart', 
            cartProducts})
        })
        .catch(err =>{
            const error =  new Error(err)
        error.httpStatusCode = 500
        return next(error)
        })
}
 
exports.postCart = (req,res,next)=>{
    const prodId =  req.body.productId
    Product.findById(prodId)
        .then(product=>{
            // console.log(product)
            return  req.user.addToCart(product)
        })
        .then(result=>{
            // console.log(result)
                     res.redirect('/cart')

        }).catch(err=>{
            const error =  new Error(err)
        error.httpStatusCode = 500
        return next(error)
        }) 
    }
    
exports.postCartDeleteProduct = (req,res,next)=>{
        const prodId =  req.body.productId
        // console.log(prodId)
       req.user.removeFromCart(prodId)
        .then (result =>{
            res.redirect('/cart')
        })
        .catch(err=>{
            const error =  new Error(err)
        error.httpStatusCode = 500
        return next(error)
        })
                     
}
    
exports.getCheckout = (req,res,next)=>{
    req.user.populate('cart.items.productId')
    .execPopulate()
        .then(user =>{
            // console.log(user.cart.items)
           let cartProducts = user.cart.items
            let total = 0
            cartProducts.forEach(prod=>{
                total += prod.quantity * prod.productId.price
            })
            res.render('shop/checkout',
                        {path:'/checkout', 
                            cartProducts,
                            totalSum:total
                        })
            })
        .catch(err =>{
            const error =  new Error(err)
        error.httpStatusCode = 500
        return next(error)
        })
}

exports.postOrder = (req,res,next)=>{
   
// Token is created using Checkout or Elements!
// Get the payment token ID submitted by the form:
const token = req.body.stripeToken; // Using Express
let totalSum = 0

        req.user.populate('cart.items.productId')
    .execPopulate()
        .then(user =>{
            user.cart.items.forEach(prod=>{
                totalSum += prod.quantity* prod.productId.price
            })
            const products = user.cart.items.map(ele=>{
                return {quantity:ele.quantity, product:{...ele.productId._doc}}
            })
          const order =  new Order({
            user:{
            email : req.user.email,
            userId:req.user},
            products
        })  
        order.save()
        }).then(result=>{
            const charge =  stripe.charges.create({
                amount: totalSum*100,
                currency: 'usd',
                description: 'Demo order',
                source: token,
                metadata:{order_id: result._id.toString()}
              });
          return   req.user.clearCart()
                 
            }).then(()=>{
                res.redirect('/orders')
            })
        .catch(err=>{
            const error =  new Error(err)
        error.httpStatusCode = 500
        return next(error)
        })
                     
}

exports.getOrders= (req,res)=>{
        Order.find({'user.userId': req.user._id})
        .then(orders=>{
            // console.log(orders)
            res.render('shop/orders', {path:'/orders', 
            orders})
        })
        .catch(err=>{
            const error =  new Error(err)
            error.httpStatusCode = 500
            return next(error)
        })
    }
    
exports.getInvoice = (req,res,next)=>{
    const orderId = req.params.orderId
    Order.findById(orderId)
    .then(order=>{
        if (!order){
            return next(new Error('No order found.'))
        }
        if (order.user.userId.toString() !== req.user._id.toString()){
            return next(new Error('Unauthorized'))
        }
        const invoiceName = 'invoice-' + orderId +'.pdf'
        const invoicepath = path.join('data', 'invoices',invoiceName)

        const pdfDoc = new PDFDocument()
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition',
                          'inline;filename="'+ invoiceName +'"')
        pdfDoc.pipe(fs.createWriteStream(invoicepath))
        pdfDoc.pipe(res)
        pdfDoc.fontSize(26).text('Invoice',{underline : true})
        pdfDoc.text('-----------------------')
        let totalPrice = 0 
        order.products.forEach(prod=>{
            totalPrice += prod.quantity * prod.product.price
            pdfDoc.fontSize(14).text(
                prod.product.title +
                ' - ' +
                prod.quantity +
                ' x ' +
                '$' + 
                prod.product.price
            )
        })
        
        pdfDoc.text('To1tal Price: $' + totalPrice)
        pdfDoc.end()
        // fs.readFile(invoicepath,(err,data)=>{
        //     if (err) {
        //        return next(err)
        //     }
        //     res.setHeader('Content-Type', 'application/pdf')
        //     res.setHeader('Content-Disposition', 'inline;filename="'+ invoiceName +'"')
        //     res.send(data)
        // })
        // const file = fs.createReadStream(invoicepath)
       
        // file.pipe(res)
    
    })
    .catch(err=>{
        next(err)
    })
}