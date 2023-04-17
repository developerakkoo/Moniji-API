const User = require("./../models/user");
const IO = require('../socket')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const io = require('../socket');
require('dotenv').config();


async function loginUser(req, res, next)  {

    const email = req.body.email;
    const password = req.body.password;

    let loadedUser;

    User.findOne({ email: email })
        .then(user => {
            if (!user) {
                res.status(400).json({ message: 'User not found', status: 'error' })
            }

            loadedUser = user;

            bcrypt.compare(password, user.password)
                .then(doMatch => {
                    if (!doMatch) {
                        res.status(400).json({ message: 'Password do not match', status: 'error' })

                    }

                    //const online= ()=>{
                    const token = jwt.sign({
                        email: loadedUser.email,
                        userId: loadedUser._id.toString(),
                    }, "!23ThisisaSecretFor@#$%^%^^&&allthebest", { expiresIn: '3h' })



                    res.status(200).json({
                        message: 'Sign In Successfull',
                        token: token,
                        userId: loadedUser._id.toString(),
                        expiresIn: '3h',
                        //isOnline:User.isOnline
                    })
                    // }
                });
        }).catch(err => {
            return res.status(500).json({ err: err.message, message: 'Something went wrong!' })

        })
                
}

async function postSignup (req, res, next) {
    
    try{
        
        const SavedUser = await User.findOne({email:req.body.email})
        if (SavedUser){
        return res.status(400).json({message: 'User with email Already Exists'});
        }

        bcrypt.hash(req.body.password, 12)
        .then((hashedPassword) =>{
            const user = new User({
                password : hashedPassword,
            email : req.body.email,
            name : req.body.name,
            mobileno : req.body.mobileno,
            address : req.body.address,
            city : req.body.city,
            gst : req.body.gst,
            company : req.body.company
            })

            return user.save();
        }).then((user) =>{
            
            res.status(201).send({message:`User registered successfully `,user})
        })
        
    }    catch(error){
        res.status(500).send({message:`Error while creating User ${error.message}`})
    }

}

async function getAllUser (req, res, next){
    try {
            const user = await User.find({});
            if(user){
                res.status(200).json({
                    user,
                    message: "All user Found!"
                })
            }
            IO.getIO.emit('getAllUser',user);
    } catch (error) {
        res.status(500).json({ error: error.message, message: 'Something went wrong!' })
    }
}

async function getUserById  (req, res, next){
    try {
            let id = req.params.id;
            const user = await User.findById(id);
            if(user){
                res.status(200).json({
                    user,
                    message: "user Found!"
                })
            }
            IO.getIO.emit('getUserById',user);
    } catch (error) {
        res.status(500).json({ error: error.message, message: 'Something went wrong!' })
    }
}


module.exports={
    loginUser,
    postSignup,
    getAllUser,
    getUserById
}