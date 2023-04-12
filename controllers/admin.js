const Admin = require('../models/admin');
const User = require('../models/user');
const Order = require("./../models/order");

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');




const postLogin = (req, res, next) => {
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


const postSignup = (req, res, next) => {
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
    
   .catch(error =>{
    res.status(400).json({message: error.message, status:'error'});
    })

   

}


async function acceptUserReq(req, res, next){
    const savedAdmin =  await Admin.findOne({_id:req.params.id});
    if (!savedAdmin){
        res.status(400).json({message: 'User dose not have admin access!'});
    }
    const savedUser = await User.findOne({_id:req.body.id});
    if(!savedUser){
        res.status(400).json({message: 'User dose not exist !'});
    }
    savedUser.isActive = req.body.isActive ? req.body.isActive :savedUser.isActive

    const UpdatedUser = await savedUser.save();
    const postResponse={
        userId:UpdatedUser._id,
        isActive:UpdatedUser.isActive
    }
    res.status(200).json({message: 'User updated Successfully!',postResponse});
}

async function UpdateOrderReq(req, res, next){
    const savedAdmin =  await Admin.findOne({_id:req.params.id});
    if (!savedAdmin){
        res.status(400).json({message: 'User dose not have admin access!'});
    }
    const savedOrder = await Order.findOne({_id:req.body.id});
    if(!savedOrder){
        res.status(400).json({message: 'Order dose not exist !'});
    }
    savedOrder.isAccepted = req.body.isAccepted ? req.body.isAccepted :savedOrder.isAccepted
    
    const updateOrder = await savedOrder.save();
const  postResponse={
    isAccepted:updateOrder.isAccepted

}
    res.status(200).json({message: 'Order updated Successfully!',postResponse});
}



async function UpdateOrderStatus(req, res, next){
    const savedAdmin =  await Admin.findOne({_id:req.params.id});
    if (!savedAdmin){
        res.status(400).json({message: 'User dose not have admin access!'});
    }
    const savedOrder = await Order.findOne({_id:req.body.id});
    if(!savedOrder){
        res.status(400).json({message: 'Order dose not exist !'});
    }
    savedOrder.status = req.body.status ? req.body.status :savedOrder.status
    savedOrder.message = req.body.message ? req.body.message :savedOrder.message
    if(req.body.status==3){
        savedOrder.isAccepted = false
    }
    const updateOrder = await savedOrder.save();
const  postResponse={
    status:updateOrder.status,
    message:updateOrder.message,
    isAccepted:updateOrder.isAccepted

}
    res.status(200).json({message: 'Order updated Successfully!',postResponse});
}

module.exports={
    acceptUserReq,
    postLogin,
    postSignup,
    UpdateOrderReq,
    UpdateOrderStatus}
