/* eslint-disable no-unused-vars */
const crypto = require('crypto')

const {validationResult} = require('express-validator')
const bcrypt = require('bcryptjs')
const User = require('./../models/user')
const nodemailer = require('nodemailer')
const sendgridTransport= require('nodemailer-sendgrid-transport')
// const emailer = require('./../services/mailing').emailer

const transporter = nodemailer.createTransport(sendgridTransport({
    auth:{
        api_key:'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'
    }
}))
// let salt =  bcrypt.genSaltSync(12)

exports.getLogin = (req,res,next)=>{
    // const isLoggedIn = req.get('Cookie').split(';')[2]
    // .trim()
    // .split('=')[1] ==="true"
    let message = req.flash('error')
    if (message.length > 0 ){
        message = message[0]
    }else{
        message = null
    }
    res.render('auth/login',{path:'/login',
            errorMessage: message,
            oldInput:{
                email: '',
                password:''
            },
            validationErrors:[]
        })
}

exports.getSignup = (req, res, next) => {
    let message = req.flash('error')
    if (message.length > 0 ){
        message = message[0]
    }else{
        message = null
    }
    res.render('auth/signup', {
      path: '/signup',errorMessage: message,
      oldInput:{
          email:'',
          password:'',
          checkPassword: ''
      },
      validationErrors:[]
    });
  };

exports.postSignup = (req, res, next) => {
    let email = req.body.email
    let password = req.body.password
    const errors = validationResult(req)
    if (!errors.isEmpty()){
        let err= errors.array()[0].msg
        return res.status(422).render('auth/signup', {
            path: '/signup',errorMessage: err,
            oldInput:{email, 
                      password, 
                      confirmPassword:req.body.confirmPassword},
            validationErrors : errors.array()
          })
    }
    User.findOne({email})
    .then(userDoc=>{
        if(userDoc){
            req.flash('error','There is a user with this Email!')
            return res.redirect('/signup')
        }
        return bcrypt.hash(password,12)
        .then(hashedPassword=>{
        const user = new User({
            email,
            password :hashedPassword,
            cart :{items:[]}
        })
        return user.save()
        .then(result=>{
            res.redirect('/login')
            return transporter.sendMail({
            to:email,
            from:'shop@node-complete.com',
            subject:'Signup Succedded!',
            html:'<h1>You have successfully signed up!!</h1>'
        })
            }).catch(err=>console.log(err))
        })
       .catch(err=>{
        const error =  new Error(err)
        error.httpStatusCode = 500
        return next(error)
       }) 
    })
    
};

exports.postLogin = (req,res,next)=>{
    const email = req.body.email
    const password =  req.body.password
    // res.setHeader('set-Cookie','loggedIn=true; Max-Age=100')
    const errors = validationResult(req)
    if (!errors.isEmpty()){
        let err= errors.array()[0].msg
        return res.status(422).render('auth/login', {
            path: '/login',
            errorMessage: err,
            oldInput:{email, 
                      password},
            validationErrors : []
          })
    }
    User.findOne({email})
    .then(user=>{
        // console.log(user)
        if(!user){
            req.flash('error','Invalid email or password.')
            return res.redirect('/login')
        }
        bcrypt.compare(password,user.password) 
        .then(isMatch=>{
            if (isMatch){
               req.session.isLoggedIn = true
                req.session.user = user
               return req.session.save(err=>{
                console.log(err)
                 res.redirect('/')
                }) 
            }
            req.flash('error','Invalid email or password.')
            res.redirect('/login')
        }).catch(err=>{
            console.log(err)
            res.redirect('/login')
        })
    })
    .catch(err=>{
        const error =  new Error(err)
        error.httpStatusCode = 500
        return next(error)
    })
}

exports.postLogout= (req,res,next)=>{
    req.session.destroy((err)=>{
        console.log(err)
        res.redirect('/')
    })
}

exports.getReset = (req,res,next)=>{
    let message = req.flash('error')
    if (message.length > 0 ){
        message = message[0]
    }else{
        message = null
    }
    res.render('auth/reset',
    {path:'/reset',
    errorMessage: message
})
}

exports.postReset = (req,res,next)=>{
    crypto.randomBytes(32,(err,buffer)=>{
        if(err){
            console.log(err)
            return res.redirect('/reset')
        }
        const token = buffer.toString('hex')
        User.findOne({email:req.body.email})
        .then(user=>{
            if(!user){
                req.flash('error','No account with that email found.')
                return res.redirect('/reset')
            }
            user.resetToken = token
            user.resetTokenExpiration = Date.now() + 360000
            return user.save()
        }).then(result=>{
            res.redirect('/')
            transporter.sendMail({
                to:req.body.email,
                from:'shop@node-complete.com',
                subject:'Password reset',
                html:`
                    <p>You requested a password reset</p>
                    <p>Click this <a href="http://localhost:3003/reset/${token}">Link</a> to set password</p>
                        `
            })
        })
        .catch(err=>{
            const error =  new Error(err)
            error.httpStatusCode = 500
            return next(error)
        })
    })
}
exports.getNewPassword = (req,res,next)=>{
    const token = req.params.token
    User.findOne({ resetToken:token,
            resetTokenExpiration : {$gt: Date.now()}   })
        .then(user=>{
        let message = req.flash('error')
        if (message.length > 0 ){
            message = message[0]
        }else{
            message = null
        }
            res.render('auth/new-password',{
                path:'/new-password',
                errorMessage: message,
                userId:user._id.toString(),
                passwordToken:token
        })
    })
    .catch(err=>{
        const error =  new Error(err)
        error.httpStatusCode = 500
        return next(error)})
}

exports.postNewPassword = (req,res,next)=>{
    const newPassword = req.body.password
    const userId = req.body.userId
    const passwordToken = req.body.passwordToken
    let resetUser
    User.findOne({resetToken:passwordToken,
        resetTokenExpiration : {$gt: Date.now()},
    _id : userId })
    .then(user=>{
        resetUser = user
        return bcrypt.hash(newPassword,12)
    }).then(hashedPassword=>{
        resetUser.password = hashedPassword
        resetUser.resetToken = undefined
        resetUser.resetTokenExpiration = undefined
        return resetUser.save()
    }).then(result=>{
        res.redirect('/')
    })
    .catch(err=>{
        const error =  new Error(err)
        error.httpStatusCode = 500
        return next(error)})
}