const express = require('express')
const path = require ('path')
const bodyParser = require('body-parser')
const multer = require('multer')
const graphqlHttp = require('express-graphql')

const graphqlSchema = require('./graphql/schema')
const graphqlResolvers = require('./graphql/resolvers')

const app = express()
const mongooseConnect = require('./util/database').mongooseConnect

const fileStorage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null, 'images')
    },
    filename: (req, file ,cb)=>{
        cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname)
    }
})

const fileFilter = (req,file,cb)=>{
   if (
       file.mimetype === 'image/png' ||
       file.mimetype === 'image/jpg' ||
       file.mimetype === 'image/jpeg' 
   ) {
       cb(null,true)
   }else{
       cb(null , false)
   }
}

app.use(bodyParser.json()) //application/json
app.use(multer(multer({storage: fileStorage, fileFilter:fileFilter})).single('image'))

app.use('/images', express.static(path.join(__dirname,'images')))


app.use((req,res,next)=>{
    res.setHeader('Access-Control-Allow-origin','*')
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE')
    res.setHeader('Access-Control-Allow-Headers','Content-Type,Authorization')
    next()
})

app.use('/graphql',graphqlHttp({
    schema:graphqlSchema,
    rootValue:graphqlResolvers,
    graphiql: true,
    formatError(err){
        if (!err.originalError){
            return err
        }
        const data = err.originalError.data
        const message = err.message || 'An error occured.'
        const code =  err.originalError.code || 500
        return  {message, status:code , data}
    }
}))

app.use((error,req,res,next)=>{
    console.log(error)
    const status=  error.statusCode || 500
    const message = error.message
    const data = error.data;
    res.status(status).json({meessage:message , data})
})

mongooseConnect(()=>{
   app.listen(8080,()=>{
        console.log('GraphQlServer Reached')
    });
})


//cors error
// cross-orgin resource sharing