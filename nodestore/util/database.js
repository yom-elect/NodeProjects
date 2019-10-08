const mongoose = require('mongoose')
const uri = 'mongodb+srv://Shopping:kTOIKkxDfcylsg8x@cluster0-eg00j.mongodb.net/Shop?retryWrites=true&w=majority'
const User = require('./../models/user')

const mongooseConnect= ((cb)=>{
   mongoose.connect(uri,{ useNewUrlParser: true })
   .then(result=>{
       console.log('Connected')
    //    User.findOne().then(output=>{
    //        if (!output){
    //            const user = new User({
    //        name :'Elect',
    //        email:'yomi@test.com',
    //        cart:{
    //            items:[]
    //        }
    //    })
    //    user.save()
    //        }
    //    })
       cb()
   })
   .catch(err=>console.log(err))
})




exports.mongooseConnect = mongooseConnect;





// const mongodb = require('mongodb')
// const MongoClient =  mongodb.MongoClient
// let _db

// const mongoConnect = (callback)=>{
//   MongoClient.connect(uri,{ useNewUrlParser: true }).then(client=>{
//      _db =  client.db('Shop')
//     callback()
// })
// .catch(err=>console.log(err +"something broke here "))  
// }

// const getDb = ()=>{
//     if(_db){
//         return _db
//     }
//     throw 'No database here'
// }

// exports.mongoConnect= mongoConnect;
// exports.getDb = getDb;
