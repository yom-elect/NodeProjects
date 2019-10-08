const getDb = require('./../util/database').getDb
const mongodb = require('mongodb')

class Cart {
    constructor (title,quantity,id){
        this.title = title;
        this.quantity = quantity;
        this._id = new mongodb.ObjectId(id);
    }
    
}

