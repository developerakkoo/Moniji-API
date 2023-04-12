const express = require('express');
const { body } = require('express-validator');
const authController = require('./../controllers/admin');

const router = express.Router();


router.post('/login',  authController.postLogin);

router.post('/signup', 
    [
        body('email').isEmail().withMessage('Please enter a valid email!'),
        body('password').trim().isLength({ min: 5 })
    ],
    authController.postSignup);




module.exports = router;