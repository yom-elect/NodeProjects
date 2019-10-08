/* eslint-disable no-unused-vars */
const Product = require('../models/products')
const fileHelper = require('./../util/file')
const {validationResult}= require('express-validator')

exports.getAddProduct = (req,res,next)=>{
    res.render('admin/edit-product',
    {path:'/admin/add-product',
    hasError:false,
      editing:false,
      errorMessage : null,
      validationErrors:[]
    })
}

exports.postAddProduct = (req,res,next)=>{
    const title = req.body.title;
    // const imageUrl = req.body.imageUrl
    const image = req.file
    const price =  req.body.price
    const description =  req.body.description 
  if (!image){
    return res.status(422).render(
      'admin/edit-product',
    {path:'/admin/add-product',
     editing:false,
     hasError:true,
     product:{
       title, price,description
     },
     errorMessage : 'Attached file is not an image',
     validationErrors:[]
    })
  }

    const errors = validationResult(req)
    if (!errors.isEmpty()){
     return res.status(422).render(
        'admin/edit-product',
      {path:'/admin/add-product',
       editing:false,
       hasError:true,
       product:{
         title,image, price,description
       },
       errorMessage : errors.array()[0].msg,
       validationErrors:[]
      })
    }
    
    const imageUrl = image.path

    let product = new Product({title,
      imageUrl,description,price,userId: req.user }) //,null,req.user._id)
    // create a new model and saved automatically
    // req.user.createProduct({
    //   title,
    //   price,
    //    imageUrl,
    //   description,
    // })
    
     product.save().then(result=>{ 
      res.redirect('/admin/products')
    }).catch(err=>{
      const error =  new Error(err)
        error.httpStatusCode = 500
        return next(error)
    })
                   
  }

  exports.updateProduct = (req,res,next)=>{
    // req.user
    //   .getProducts()
    Product.find({userId:req.user._id})
    .then(products=>{
      res.render('admin/list-product',
       {products,path:'/list-product'})
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
    // console.log(prodId)
    // req.user
    // .getAddProduct()
    Product.findById(prodId).then(product=>{
      if (!product){
        return res.redirect('/')
      }
      res.render('admin/edit-product',
      {path:'/admin/edit-product',
       editing: editMode,
       hasError:false,
       errorMessage : null,
       product})
  }).catch(err=> {
    const error =  new Error(err)
        error.httpStatusCode = 500
        return next(error)
  })                
  }
  //findByIdAndRemove
  exports.deleteProduct = (req,res,next)=>{
    const deleteId = req.params.prodId
    console.log(deleteId)
    Product.findById(deleteId)
    .then(prod=>{
      if(!prod){
        return next(new Error('Product not found.'))
      }
      fileHelper.deleteFile(prod.imageUrl)
      return Product.deleteOne({_id:deleteId, userId: req.user._id})
    })
    .then(product=>{
      return product
    }).then(result=>{
      console.log('deleted product: ')
      // res.redirect('/admin/products')
      res.status(200).json({
        message:'Success!!'
      })
    }).catch(err=>{
      res.status(500).json({message:'Deleting product failed'})
    })
}
  

exports.postEditProduct = (req,res,next)=>{
    const prodId =  req.body.productId
    const updatedTitle = req.body.title
    const updatedPrice = req.body.price
    const image =  req.file
    const updatedDesc =  req.body.description

    const errors = validationResult(req)
  console.log(errors)
    if (!errors.isEmpty()){
     return res.status(422).render(
        'admin/edit-product',
      {path:'/admin/edit-product',
       editing:true,
       hasError:true,
       product:{
         updatedTitle, updatedPrice,updatedDesc,
         _id:prodId
       },
       errorMessage : errors.array()[0].msg,
      })
    }
    Product.findById(prodId).then(product=>{
      if (product.userId.toString() !== req.user._id.toString()){
        return res.redirect('/')
      }
      product.title = updatedTitle;
      product.price = updatedPrice
      product.description = updatedDesc
      if(image){
        fileHelper.deleteFile(product.imageUrl)
        product.imageUrl = image.path
      }
      
      return product.save().then(result=>{console.log("updated product") 
      res.redirect('/admin/products')})
    })
   .catch(err=>{
    const error =  new Error(err)
    error.httpStatusCode = 500
    return next(error)
   })
                
  } 