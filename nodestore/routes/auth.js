// const path = require('path')
const express = require('express')
const router = express.Router()
const authController = require('./../controllers/auth')
const {check,body} = require('express-validator')

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.get('/reset', authController.getReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/reset', authController.postReset)

router.post('/login',[check('email')
                      .isEmail()
                      .withMessage('Please enter a valid email')
                      .normalizeEmail(),
                        body('password',
                        'Invalid Username/password')
                        .isLength({min:5})
                        .isAlphanumeric().trim()
                    ],
             authController.postLogin);

router.post('/signup', [check('email')
                        .isEmail()
                        .withMessage('please enter a valid email')
                        .normalizeEmail(),
                        body('password',
                        'Please enter a password with only numbers and text and at least 5 characters.')
                        .isLength({min:5})
                        .isAlphanumeric()
                        .trim(),
                        body('confirmPassword')
                        .custom((value,{req})=>{
                        if (value !== req.body.password){
                        throw  new Error('Passwords have to match!')    
                        }
                        return true
                        }).trim()],
                        authController.postSignup);

router.post('/logout', authController.postLogout);

router.post('/new-password', authController.postNewPassword);



module.exports =router;

