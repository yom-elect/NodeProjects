// const path = require('path')
const express = require('express')
const isAuth = require('./../middleware/is-auth')
const router = express.Router()
const {body} = require('express-validator')
// const rootDir = require ('../util/path')

//controllers
const productController =  require('../controllers/products')

router.get('/add-product',isAuth,productController.getAddProduct)
router.get('/edit-product/:productId',isAuth,productController.getEditProduct)
router.get('/products',isAuth,productController.updateProduct)
router.post('/add-product',isAuth,[body('title')
                                    .isString()
                                    .isLength({min:3})
                                    .trim(),
                                   body('price').isFloat(),
                                   body('description')
                                   .isLength({min:5,max:400}).trim()
                                ]
            ,productController.postAddProduct)
router.post('/edit-product',isAuth,[body('title')
                                        .isString()
                                        .isLength({min:3})
                                        .trim(),
                                       body('price').isFloat(),
                                        body('description')
                                        .isLength({min:5,max:400}).trim()
                                        ],productController.postEditProduct)
router.delete('/products/:prodId',isAuth,productController.deleteProduct)

module.exports= router;

