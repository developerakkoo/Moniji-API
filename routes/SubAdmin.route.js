const express = require('express');
const router = express.Router();
const SubAdminController = require('../controllers/subAdmin');

router.get('/subAdmin', SubAdminController.getAllSubAdmin);

router.post('/SubAdmin/login',SubAdminController.postLogin);

router.post('/SubAdmin/signup',SubAdminController.postSignup);

router.put('/SubAdmin/updateUser/status/:id',SubAdminController.subAcceptUserReq)

router.put('/SubAdmin/updateOrder/:id',SubAdminController.subUpdateOrderReq);

router.put('/SubAdmin/updateOrder/Status/:id',SubAdminController.subUpdateOrderStatus)

router.delete('/SubAdmin/deleteOrder/:id',SubAdminController.SubAdminDeleteOrder)

router.get('/App/api/v1/SubAdmin-forgot-password',(req,res,next)=>{
    res.render('subAdmin-forgot-password');
});
router.post('/App/api/v1/SubAdmin-forgot-password',SubAdminController.SubAdminForgotPassword);

router.get('/rest-password-SubAdmin/:id/:token',SubAdminController.getSubAdminResetPassword);

router.post('/rest-password-SubAdmin/:id/:token',SubAdminController.ResetSubAdminPassword);

module.exports = router;
