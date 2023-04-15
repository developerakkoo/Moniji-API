const User = require("./../models/user");
const IO = require('../socket')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const io = require('../socket');
require('dotenv').config();


async function loginUser(req, res, next)  {

    let loadedUser;
    const user = await User.findOne({ email: req.body.email })
            if (!user) {
                return res.status(200).json({ message: 'User not found', status: 'error' });
            }
            if(user.isActive==false){
                return res.status(200).json({ message: 'Not verified', status: 'error' });
            }
            let passwordIValid = bcrypt.compareSync(
                req.body.password,
                user.password
            );
            if(!passwordIValid){
                return res.status(401).send({message:"Invalid Password or user name !"})
            }
            let token = jwt.sign({ userName: user.name }, process.env.SECRET_KEY, {
                expiresIn: 86400 // 24 hours
            });
            const postResponse={
                name :user.name,
                email:user.email,
                Id:user._id,
                isActive:user.isActive,
                token:token
            }
        
                    res.status(200).json({message: 'Sign In Successful',postResponse})
                    IO.getIO.emit('loginUser',postResponse);
                
}

async function postSignup (req, res, next) {
    const userObj={
        password : bcrypt.hashSync(req.body.password, 8),
        email : req.body.email,
        name : req.body.name,
        mobileno : req.body.mobileno,
        address : req.body.address,
        city : req.body.city,
        gst : req.body.gst,
        company : req.body.company
    }
    try{
        const SavedUser = await User.findOne({email:req.body.email})
        if (SavedUser){
        return res.status(400).json({message: 'User with email Already Exists'});
        }
        const userCreated = await User.create(userObj);
        const postResponse = {
            name: userCreated.name,
            userId: userCreated._id,
            email: userCreated.email,
            isActive: userCreated.isActive
        }
        res.status(201).send({message:`User created successfully `,postResponse})
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