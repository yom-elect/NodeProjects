// const getDb =require('./../util/database').getDb;
// const mongodb = require('mongodb')
const mongoose = require('mongoose')
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
const Schema = mongoose.Schema

const productSchema = new Schema({
    title:{
        type:String,
        required: true
    },price:{
        type: String,
        required:true 
    },
    description:{
        type:String,
        required: true 
    },
    imageUrl:{
        type:String,
        required:true 
    },
    userId:{
        type: Schema.Types.ObjectId,
        ref:'User'
    }

})

module.exports= mongoose.model('Product',productSchema);
// class Product {
//     constructor(title, imageUrl, description, price,id,userId) {
//     //   this.id = id;
//       this.title = title;
//       this.imageUrl = imageUrl;
//       this.description = description;
//       this.price = price;
//       this._id = id ?new mongodb.ObjectId(id):null;
//       this.userId= userId;
//     }

// save() {
//     const db = getDb()
//    return  db.collection('products')
//         .insertOne(this)
//         .then(result=>{
//             // console.log(result)
//         })
//         .catch(err=> console.log(err))
// }
// static fetchAll(){
//     const db = getDb()
//     return db.collection('products')
//     .find()
//     .toArray()
//     .then(result=>{
//         // console.log(result)
//         return result
//     })
//     .catch(err=>console.log(err))
// }

// static findById(prodId){
//     const db = getDb()
//     return db.collection('products')
//     .find({_id :new mongodb.ObjectId(prodId) })
//     .next()
//     .then(product=>{
//         // console.log(product)
//         return product
//     }).catch(err=>console.log(err))
// }
// static deleteProd(prodId){
//     const db =  getDb()
//     return db.collection('products').deleteOne({_id: new mongodb.ObjectId(prodId)})
//     .then(result=>{
//         // console.log(result)
//         return result
//     })
//     .catch(err=>console.log(err))
// }

// updateProd(prodId){
//     const db= getDb()
//     return db.collection('products')
//     .updateOne({_id: new mongodb.ObjectId(prodId)},
//     {$set:{title : this.title,imageUrl : this.imageUrl,
//         description: this.description,price: this.price}})
//     .then(update=>{
//         // console.log(update)
//         return update
//     }).catch(err=>console.log(err))
// }
// }

// module.exports = Product;