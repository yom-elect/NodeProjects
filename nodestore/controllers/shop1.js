const Product = require('../models/products')



exports.getProducts= (req,res,next)=>{
    Product.findAll().then(products=>{
    res.render( 'shop/product-list',{products, path:"/product-list"})
    })
    .catch(err=>{
        console.log(err)
    })       
}

exports.getIndex = (req,res)=>{
    Product.findAll().then(products=>{
        res.render('shop/index',{products, path:"/"})
    })
    .catch(err=>{
        console.log(err)
    })     
}

// sequelize findbypk  or finfAll method used
exports.getProduct = (req,res,next)=>{
    const prodId =  req.params.productId
    Product.findByPk(prodId).then(product=>{
         res.render('shop/product-details', {product,
            path: '/product-list'  })
    })
    .catch(err=> console.log(err))
}

exports.postCart = (req,res,next)=>{
   const prodId =  req.body.productId
   let fetchedCart
   let newQuantity = 1
   req.user
    .getCart()
    .then(cart =>{
        fetchedCart = cart
        return cart.getProducts({where :{id:prodId}})
    })
    .then(products =>{
        let product;
        if (products.length >0){
            product = products[0]
        }
      
        if (product){
            const oldQuantity = product.cartItem.quantity
            newQuantity += oldQuantity
            return product
        }
        return Product.findByPk(prodId)
    }).then(product =>{
        return fetchedCart.addProduct(product, 
                {through: {quantity: newQuantity}
            })

    }).then(()=>{
        res.redirect('/cart')
    })
   .catch(err => console.log(err))
}

exports.showCart = (req,res,next)=>{
    req.user
        .getCart()
        .then(cart =>{
            return cart.getProducts()
        }).then(products =>{
            cartProducts = products
            res.render('shop/cart', {path:'/cart', cartProducts})
        })
        .catch(err =>{
            console.log(err)
        })
}
exports.postCartDeleteProduct = (req,res,next)=>{
    const prodId =  req.body.productId
    req.user.getCart()
    .then(cart=>{
        return cart.getProducts({where:{id:prodId}})
    })
    .then(products=>{
        const product = products[0]
        return product.cartItem.destroy()
    }).then (result =>{
        res.redirect('/cart')
    })
    .catch(err=>console.log(err))
}
exports.showProducts = (req,res)=>{
    res.render('shop/product-details', {path:'/products'})
}

exports.postOrder = (req,res,next)=>{
    let fetchedCart
    req.user.getCart()
    .then(cart=>{
        fetchedCart= cart
        return cart.getProducts()
    })
    .then(products=>{
        req.user.createOrder()
        .then(order=>{
            order.addProduct(products.map(product=>{
                product.orderItem = {quantity: product.cartItem.quantity}
                return product
            }))
        }).catch(err=>console.log(err))
        .then(result=>{
            return fetchedCart.setProducts(null)
        })
        .then(result=>{
             res.redirect('/orders')
        })
    })
    .catch(err=>console.log(err))
}
exports.getOrders= (req,res)=>{
    req.user
    .getOrders({include : ['products']})
    .then(orders=>{
        // console.log(orders)
        res.render('shop/orders', {path:'/orders', orders})
    })
    .catch(err=>console.log(err))
    
}