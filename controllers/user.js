const User = require("./../models/user");
const IO = require('../socket')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const io = require('../socket');


exports.loginUser = async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    let loadedUser;
    User.findOne({ email: email })
        .then(user => {
            if (!user) {
                res.status(200).json({ message: 'User not found', status: 'error' });
            }
            if(user.isActive==false){
                res.status(200).json({ message: 'Not verified', status: 'error' });
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
                    }, "!23ThisisaSecretFor@#$%^%^^&&allthebest",{ expiresIn: '3h' })
                    const postResponse={
                        token: token,
                        userId: loadedUser._id.toString(),
                        expiresIn: '3h'
                    }
                    res.status(200).json({message: 'Sign In Successful',postResponse})
                    IO.getIO.emit('loginUser',postResponse);
                });
        }).catch(err => {
            return res.status(500).json({ err: err.message, message: 'Something went wrong!' })
            
        })
}

exports.postSignup = (req, res, next) => {

    const password = bcrypt.hashSync(req.body.password, 8);
    const email = req.body.email;
    const name = req.body.name;
    const mobileno = req.body.mobileno;
    const address = req.body.address;
    const city = req.body.city;
    const gst = req.body.gst;
    const company = req.body.company;
    
    const newuser = new User({
        email,
        name,
        password,
        mobileno,
        address,
        city,
        gst,
        company
    })
    newuser.save().then((result) => {
        res.status(201).json({ message: 'User Created Successfully!', status: '201', userId: result._id, });
        IO.getIO.emit('postSignup',result);
    })
        .catch(err => {
            res.status(500).json({ error: err.message, message: 'Something went wrong!' })
        })
}

exports.getAllUser = async (req, res, next) =>{
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
        res.status(500).json({ error: err.message, message: 'Something went wrong!' })
    }
}

exports.getUserById = async (req, res, next) =>{
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
        res.status(500).json({ error: err.message, message: 'Something went wrong!' })
    }
}