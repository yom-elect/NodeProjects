const fs= require('fs')
const path = require('path')
const io = require('../socket')
const { validationResult} = require('express-validator')
const Post = require('./../model/post')
const User = require('./../model/user')



const clearImage = filePath=>{
    filePath = path.join(__dirname,'..',filePath)
    fs.unlink(filePath, err=> {
        if(err){
            next(err)
        }
    })
}

exports.getPosts = async (req,res,next)=>{
    const currentPage = req.query.page || 1
    const perPage = 2
    try{
        const totalItems = await Post.find().countDocuments()
    const posts= await Post.find()
            .populate('creator')
            .sort({createdAt:-1})
            .skip((currentPage-1)*perPage)
            .limit(perPage)
    
    res.status(200).json({
            message:'fetched posts successfully',
            posts,
            totalItems
        }) 
    }catch(err){
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err)
    }
}

exports.createPost = (req,res,next)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
       const error = new Error('Validation failed,entered data is incorrect ')
       error.statusCode = 422;
       throw error;
    }
    if (!req.file){
        const error = new Error('No image Provided ')
        error.statusCode = 422;
        throw error;
    }
    const imageUrl = req.file.path.replace(/\\/g, "/")
    const title =req.body.title
    const content = req.body.content
    let creator
    const post = new Post({
            title,
            content,
            imageUrl,
            creator: req.userId
    })
    post.save()
    .then(result=>{
        return User.findById(req.userId)
    })
    .then(user=>{
        creator = user
        user.posts.push(post)
        return user.save()
    })
    .then(result=>{
        io.getIO().emit('posts',{action:'create',
                 post : {...post._doc, creator:{
                     _id:req.userId , name:user.name
                 }}})
        res.status(201).json({
            message:'Post created successfully',
            post:post,
            creator:{_id:creator._id, name:creator.name}
        })
    })
    .catch(err=>{
    if(!err.statusCode){
        err.statusCode = 500;
    }
    next(err)
    })
    //create [post in db]
}

exports.getPost= (req,res,next)=>{
    const postId = req.params.postId
    let creator
    User.findById(req.userId)
    .then(user=>{
        if (!user){
            const error = new Error('Could not find user.')
            err.statusCode = 422
            throw error
        }
        creator = user
     return  User.find({}).populate('posts')
    })
    .then(result=>{
      let fpost =   result[0].posts
      console.log(fpost)
      return fpost.filter(ele=>{
          if (ele._id.toString() === postId.toString()){
            console.log(ele)
            return ele
          }
        
      })[0]
    })
    .then(post=>{
        res.status(200).json({
            message: 'Post fetched',
            creator,
            post
        })
        
    })
    .catch(err=>{
        if(!err.statusCode) {
            err.statusCode = 500 || 422
        }
        next(err)
    })
}

exports.updatePost = (req,res,next)=>{
    const errors = validationResult(req)

    if(!errors.isEmpty()){
       const error = new Error('Validation failed,entered data is incorrect ')
       error.statusCode = 422;
       throw error;
    }
    
    const postId = req.params.postId
    const updatedTitle = req.body.title
    const updatedContent = req.body.content
    let updatedImageUrl = req.body.image
    if( req.file){
        updatedImageUrl = req.file.path.replace(/\\/g, "/")
    }
    if(!updatedImageUrl){
        const error = new Error('No file picked')
        err.statusCode = 422
        throw error
    }
    Post.findById(postId)
    .then(post=>{
        if (!post){
            const error = new Error('No post found')
            err.statusCode = 422
            throw error
        }
        if (post.creator.toString() !== req.userId.toString()){
            const error = new Error('Not Authorized')
            err.statusCode = 403
            throw error
        }
        if(updatedImageUrl !== post.imageUrl){
            clearImage(post.imageUrl)
        }
        post.title =updatedTitle
        post.imageUrl = updatedImageUrl
        post.content = updatedContent

        return post.save()
    }).then(result=>{
        res.status(200).json({
            message:'Post succesfully updated',
            post:result
        })
    })
    .catch(err=>{
        if(!err.statusCode) {
        err.statusCode = 500 || 422 ||403
        }
        next(err)
    })
}

exports.deletePost = (req,res,next)=>{
    const postId = req.params.postId
    Post.findById(postId)
    .then(post=>{
        if (!post){
            const error = new Error('No post found')
            err.statusCode = 422
            throw error
        }
        if (post.creator.toString() !== req.userId.toString()){
            const error = new Error('Not Authorized')
            err.statusCode = 403
            throw error
        }
        // check logged in user
        clearImage(post.imageUrl)
        return Post.findByIdAndRemove(postId)
    })
    .then(result=>{
        return User.findById(req.userId)
    })
    .then(user=>{
        user.posts.pull(postId)
        return user.save()
    })
    .then(result=>{
        io.getIO().emit('posts', {
            action:'delete',
            post:postId  
        })
        res.status(200)
        .json({message: 'Post Successfully deleted'})
    })
    .catch(err=>{
        if(!err.statusCode) {
            err.statusCode = 500 || 422 || 403
            }
            next(err)
    })
}