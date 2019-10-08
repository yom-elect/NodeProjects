/* eslint-disable no-unused-vars */
const Product = require('../models/products')

exports.getAddProduct = (req,res,next)=>{
    res.render('admin/edit-product',{path:'/admin/add-product', editing:false})
}
exports.updateProduct = (req,res,next)=>{
  req.user
    .getProducts()
  // Product.findAll()
  .then(products=>{
    res.render('admin/list-product', {products,path:'/list-product'})
}).catch(err=>{
       const error =  new Error(err)
        error.httpStatusCode = 500
        return next(error)
})
 
}

exports.postAddProduct = (req,res,next)=>{
  const title = req.body.title;
  const imageUrl = req.body.imageUrl
  const price =  req.body.price
  const description =  req.body.description 
  // create a new model and saved automatically
  req.user.createProduct({
    title,
    price,
     imageUrl,
    description,
  })
  .then(result=>{ 
    console.log(result)
    res.redirect('/admin/products')
  }).catch(err=>{
         const error =  new Error(err)
        error.httpStatusCode = 500
        return next(error)
  })
                 
}

exports.getEditProduct = (req,res,next)=>{
  const editMode = req.query.edit 
  
  if (!editMode){
    return res.redirect('/')
  }
  const prodId = req.params.productId
  // req.user
  // .getAddProduct()
  Product.findByPk(prodId).then(product=>{
    if (!product){
      return res.redirect('/')
    }
    res.render('admin/edit-product',
    {path:'/admin/edit-product', editing: editMode,product})
}).catch(err=> {
       const error =  new Error(err)
        error.httpStatusCode = 500
        return next(error)
})
                
}
exports.postEditProduct = (req,res,next)=>{
  const prodId =  req.body.productId
  const updatedTitle = req.body.title
  const updatedPrice = req.body.price
  const updatedImageUrl =  req.body.imageUrl
  const updatedDesc =  req.body.description
 Product.findByPk(prodId).then(product=>{
   product.title = updatedTitle
   product.price= updatedPrice
   product.imageUrl= updatedImageUrl
   product.description = updatedDesc
   return product.save()  //save here is a sequelize method
 }).then(result=>{console.log("updated product") 
 res.redirect('/admin/products')})
 .catch(err=>console.log(err))
 
}
exports.postDeleteProduct = (req,res,next)=>{
      const deleteId = req.body.prodId
      Product.findByPk(deleteId).then(product=>{
        return product.destroy()
      }).then(result=>{
        console.log('deleted product')
        res.redirect('/admin/products')
      }).catch(err=>{
        const error =  new Error(err)
        error.httpStatusCode = 500
        return next(error)
      })
      
}