// //SEND-GRID
// const nodemailer = require('nodemailer')
// const sendgridTransport= require('nodemailer-sendgrid-transport')
// const User = require('./../models/user.js')

// const transporter = nodemailer.createTransport(sendgridTransport({
//     auth:{
//         api_key:'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'
//     }
// }))

// const emailer = ((cb)=>{
//     req.user.findOne()
//     .then(user=>{
//     transporter.sendMail({
//     to:user.email,
//     from:'shop@node-complete.com',
//     subject:'Signup Succedded!',
//     html:'<h1>You have successfully signed up!!</h1>'
// }).then(feed=>{
//     console.log('conected')
//     cb()
// }).catch(err=>console.log('this'+ err)) 
//     })
   
    
// })

// exports.emailer = emailer;