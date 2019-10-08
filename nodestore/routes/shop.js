const path = require('path')
const express = require('express')
const isAuth = require('./../middleware/is-auth')

const shopController =require('../controllers/shop');
const router = express.Router();
// const rootDir = require ('../util/path')
// const {products} = require('./admin')

router.get('/',shopController.getIndex)
router.get('/product-list',shopController.getProducts)
router.get('/cart',isAuth,shopController.showCart)
router.get('/products',isAuth,shopController.showProducts)
router.get('/products/:productId',shopController.getProduct )
router.get('/checkout',isAuth,shopController.getCheckout)
router.get('/orders',isAuth, shopController.getOrders)
router.get('/orders/:orderId', isAuth,shopController.getInvoice)
router.post('/cart',isAuth,shopController.postCart)
router.post('/cart-delete-item',isAuth,shopController.postCartDeleteProduct)
router.post('/checked-orders',isAuth,shopController.postOrder)

module.exports= router