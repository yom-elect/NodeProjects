const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const fs = require('fs')

// seting special header responses
const helmet = require('helmet')
// compressing assets
const compression = require('compression')
//setting up request logging
const morgan = require('morgan')

const multer = require('multer')

const session = require('express-session')
const MongoDbStore = require('connect-mongodb-session')(session)
const csrf = require('csurf')
const flash  = require('connect-flash')

const isAuth = require('./middleware/is-auth')

const shopController =require('./controllers/shop');

const MONGODB_URI='mongodb+srv://Shopping:kTOIKkxDfcylsg8x@cluster0-eg00j.mongodb.net/Shop?retryWrites=true&w=majority'

const app = express()

const store = new MongoDbStore({ 
    uri: MONGODB_URI, 
    collection:'session'
})

const csrfProtection = csrf()

const fileStorage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null, 'images')
    },
    filename : (req,file,cb)=>{
        cb(null, new Date().toISOString + '-' + file.originalname)
    }
})

const fileFilter = (req,file,cb)=>{
    if (file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg'    ){
            cb(null, true)
        }else {
            cb(null, false)
        }
}


const adminRoutes = require('./routes/admin')
const shopRoutes =  require('./routes/shop')
const authRoutes = require('./routes/auth')
// const mongoConnect = require('./util/database').mongoConnect
const mongooseConnect = require('./util/database').mongooseConnect
// const sequelize = require('./util/database')
const Product = require('./models/products')

const User = require('./models/user')

// const Cart = require('./models/cart')
// const CartItem = require('./models/cart-item')
// const Order = require('./models/order')
// const OrderItem = require('./models/order-item')

//error controller
const errorPage = require('./controllers/error')

//Middelwares
app.set('view engine', 'ejs');
app.set('views', 'views')

const accessLogStream = fs.createWriteStream(path.join(__dirname,'access.log'),
        {flag:'a'}                                     
)

app.use(helmet())
app.use(compression())
app.use(morgan('combined', {stream:accessLogStream}))

app.use(bodyParser.urlencoded({extended:false}))
app.use(multer({storage : fileStorage ,fileFilter: fileFilter}).single('image'))
app.use(express.static(path.join(__dirname,'public')))
app.use('/images', express.static(path.join(__dirname,'images')))
app.use(
    session({secret:'my_secret',
    resave:false,
    saveUninitialized:false,
    store
}))
app.use(csrfProtection)
app.use(flash())

app.use((req,res,next)=>{ 
    if (!req.session.user){
        return next()
    }
    User.findById(req.session.user._id)
    .then(user =>{
        req.user = user
        next();
    })
    .catch(err=> {
        const error =  new Error(err)
        error.httpStatusCode = 500
        return next(error)
    })
})
app.use((req,res,next)=>{
    res.locals.isAuthenticated = req.session.isLoggedIn
    res.locals.csrfToken = req.csrfToken()
    next()
})



app.use('/admin',adminRoutes);
app.use(shopRoutes);
app.use(authRoutes)


app.use('/500' ,errorPage.get500)
app.use(errorPage.serverError)




//relating Databases
// Product.belongsTo(User,{constraints: true, onDelete:'CASCADE'})
// User.hasMany(Product)
// User.hasOne(Cart)
// Cart.belongsTo(User)
// Cart.belongsToMany(Product, {through: CartItem})
// Product.belongsToMany(Cart, {through: CartItem})
// Order.belongsTo(User)
// User.hasMany(Order)
// Order.belongsToMany(Product,{through: OrderItem})

// // creating models table with possible relation
// sequelize
// // .sync({ force: true })
// .sync()
// .then(result=>{ //force so as to overide the existing product table
//     // console.log(result)
//    return User.findByPk(1)
// }).then(user=>{
//     if (!user){
//      return  User.create({name:'Alex', email:'test@gtest.com'}) 
//     }
//     return user
// }).then(user=>{
//     // console.log(user.id)
//     return user.createCart();
   
// }).then(cart =>{
//     console.log("serialze connected")
// })
// .catch(err=>console.log(err))

app.use((error,req,res,next)=>{
    console.log(error)
    res.status(500).render('500', {
        pageTitle: 'Error!',
        path: '/500',
        isAuthenticated: req.session.isLoggedIn
})
})

mongooseConnect(()=>{
    
 app.listen(process.env.PORT||3003,()=>{
    console.log("our game begins")
}) 
})
  