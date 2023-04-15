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

router.put('/updateUser/status/:id',authController.acceptUserReq);

router.put('/updateOrder/:id',authController.UpdateOrderReq);

router.put('/updateOrder/Status/:id',authController.UpdateOrderStatus);




module.exports = router;