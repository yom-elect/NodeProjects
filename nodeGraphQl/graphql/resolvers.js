const User = require('./../model/user')
const bcrypt = require('bcryptjs')
const validator = require('validator')

module.exports = {
    createUser: async({userInput},req)=> {
        // const email = args.userInput.email
        // const name = args.userInput.name
        // const password = args.userInput.password
        const errors = []
        if( !validator.isEmail(userInput.email)){
            errors.push({message :'Email is Invalid'})
        }
        if (validator.isEmpty(userInput.password) || 
            !validator.isLength(userInput.password,{min :5}))
        {
                errors.push({message: 'Password too short'})
        }
        if (errors.length > 0){
            const error = new Error('Invalid Input')
            error.data = errors
            error.code = 422
            throw error            
        }
        const existing = await User.findOne({email: userInput.email})
        if (existing){
            const error = new Error('User exists already!')
            throw error
        }
        const hashedPw = await bcrypt.hash(userInput.password ,12)
        const user =  new User({
            email: userInput.email,
            name:userInput.name,
            password: hashedPw
        })
        const createdUser =  await user.save()
        return {...createdUser, _id: createdUser._id.toString()}
    }
}