
const express = require("express");
const user = require("../controllers/user")
const router = express.Router();

router.get('/user', user.getAllUser);

router.get('/user/:id', user.getUserById);

router.post('/user/login', user.loginUser);

router.post('/user/signup', user.postSignup);

router.put('/user/:id',user.updateUserById);

router.get('/App/api/v1/user-forgot-password',(req,res,next)=>{
    res.render('user-forgot-password');
});
router.post('/App/api/v1/User-forgot-password',user.UserForgotPassword);

router.get('/rest-password-user/:id/:token',user.getUserResetPassword);

router.post('/rest-password-user/:id/:token',user.ResetUserPassword);

module.exports = router;