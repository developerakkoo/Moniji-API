const Admin = require('../models/admin');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');




exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    let loadedUser;


    Admin.findOne({ email: email})
    .then(admin => {
        if(!admin){
            const error = new Error('Admin not found');
            error.status = 404;
            next(error);
        }

        loadedUser = admin;

        bcrypt.compare(password, admin.password)
        .then(doMatch => {
            if(!doMatch){
               const error = new Error('Password do not match');
               error.status = 401;
               next(error);
            }

            const token = jwt.sign({
                email: loadedUser.email,
                userId: loadedUser._id.toString(),
            },"!23ThisisaSecretFor@#$%^%^^&&allthebest", {expiresIn: '3h'})

            res.status(200).json({
                message: 'Sign In Successfull',
                token: token,
                userId: loadedUser._id.toString()
            })
        });
    }).catch(err =>{
        res.status(400).json({message: error.message, status:'error'});
    })
}


exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    Admin.findOne({ email: email})
    .then(admin => {
        if(admin){
           res.status(400).json({
               status: false,
               message: 'User with email Already Exists'
           })
        }

        bcrypt.hash(password, 12)
        .then((hashedPasswords) => {
            const admin = new Admin({
                email: email,
                password: hashedPasswords
            })
    
            return admin.save();
        }).then((result) => {
            res.status(201).json({message: 'Admin Created Successfully!', status: '201', userId: result._id});
        })
    })
    
   .catch(err =>{
    res.status(400).json({message: error.message, status:'error'});
    })

   

}


