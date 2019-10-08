const Sequelize = require('sequelize');
const sequelize =  require('../util/database')

// defining models name lowercassed as 1st arg, 2nd arg attribute/fields models should have
const Product = sequelize.define('product',{
    id:{
        type: Sequelize.INTEGER,
        autoIncrement:true,
        allowNull: false,
        primaryKey: true
    },
    title: Sequelize.STRING,
    price: {
        type:Sequelize.DOUBLE,
        allowNull:false
    },
    imageUrl:{
        type: Sequelize.STRING,
        allowNull: false
    },
    description: {
        type: Sequelize.STRING,
        allowNull: false
    }
}) ;



module.exports = Product;
