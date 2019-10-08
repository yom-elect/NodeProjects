const { validationResult} = require('express-validator')
const User = require('./../model/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

exports.signup = async (req,res,next)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
       const error = new Error('Validation failed,entered data is incorrect ')
       error.statusCode = 422;
       error.data =erroys.array()
       throw error;
    }
    const email = req.body.email
    const password = req.body.password
    const name =  req.body.name
    try {
        const hashedPw = await bcrypt.hash(password,12)
            const user =  new User(
                {email,
                    password:hashedPw,
                    name}
            )
        const result = await user.save()
            res.status(201).json({
                message:`User ${name} was succesfully added`,
                userId: result._id
            })
        }
    catch(err){
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err)
            }
}

exports.login = (req,res,next)=>{
    
    const email = req.body.email
    const password = req.body.password
    let loadedUser
    User.findOne({email})
    .then(user=>{
        if (!user){
            const error = new Error('No user found with this email')
            err.statusCode = 401
            throw error
        }
        loadedUser = user
        return bcrypt.compare(password, user.password)
    })
    .then(isEqual=>{
        if(!isEqual){
            const error = new Error('Wrong Password')
            err.statusCode = 401
            throw error
        }
        const token = jwt.sign({
           email:loadedUser.email,
           userId:loadedUser._id.toString() 
        }, 'securingalluserswiththissecretkey',{expiresIn:'1h'})
        
        res.status(200).json({
            token,
            userId:loadedUser._id.toString()
        })
    })
    .catch(err=>{
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err)
    })
}

exports.status = (req,res,next)=>{
    User.findById(req.userId)
    .then(user=>{
        if (!user){
            const error = new Error('Could not find user.')
            err.statusCode = 422
            throw error
        }
        res.status(200).json({
            message:'User status loaded',
            status : user.status
        })
    }).catch(err=>{
        if(!err.statusCode){
            err.statusCode = 422 ||500;
        }
        next(err)
    })
}