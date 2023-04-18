const express = require('express');
const router = express.Router();
const SubAdminController = require('../controllers/subAdmin');

router.get('/subadmin', SubAdminController.getAllSubAdmin);

router.post('/SubAdmin/login',SubAdminController.postLogin);

router.post('/SubAdmin/signup',SubAdminController.postSignup);

router.put('/SubAdmin/updateUser/status/:id',SubAdminController.subAcceptUserReq)

router.put('/SubAdmin/updateOrder/:id',SubAdminController.subUpdateOrderReq);

router.put('/SubAdmin/updateOrder/Status/:id',SubAdminController.subUpdateOrderStatus)

router.delete('/SubAdmin/deleteOrder/:id',SubAdminController.SubAdminDeleteOrder)


module.exports = router;
