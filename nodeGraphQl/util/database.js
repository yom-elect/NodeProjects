const mongoose = require('mongoose')

const uri = 'mongodb+srv://Shopping:kTOIKkxDfcylsg8x@cluster0-eg00j.mongodb.net/Blog?retryWrites=true&w=majority'


const mongooseConnect= ((cb)=>{
    mongoose.connect(uri,{ useNewUrlParser: true,useFindAndModify: false })
    .then(result=>{
        console.log('Connected')
        cb()
    })
    .catch(err=>console.log(err))
 })


exports.mongooseConnect= mongooseConnect;