const express = require('express')  
const router = express.Router()
const User = require('../model/user')
const {body}= require('express-validator')
const authController = require('../controllers/auth')
const isAuth = require('../middleware/is-auth')

router.put('/signup',[
    body('email').isEmail().withMessage('Please enter a valid email.')
    .custom((value, {req})=>{
        return User.findOne({email:value})
        .then(userDoc =>{
            if (userDoc){
                return Promise.reject('Email address already exists')
            }
        })
    }).normalizeEmail(),
    body('password').trim().isLength({min:5}),
    body('name').trim().not().isEmpty()
],authController.signup)

router.post('/login',authController.login)
router.get('/status',isAuth,authController.status)


module.exports = router