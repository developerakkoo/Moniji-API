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

router.get('/App/api/v1/Admin-forgot-password',(req,res,next)=>{
        res.render('forgot-password-admin');
    });
router.post('/App/api/v1/Admin-forgot-password',authController.forgotPassword);

router.get('/rest-password-admin/:id/:token',authController.getResetPassword);

router.post('/rest-password-admin/:id/:token',authController.ResetPassword);

router.put('/updateUser/status/:id',authController.acceptUserReq);

router.put('/BlockUser/:id',authController.BlockUser);

router.put('/updateOrder/:id',authController.UpdateOrderReq);

router.put('/updateOrder/Status/:id',authController.UpdateOrderStatus);

router.put('/update/subAdmin/:id',authController.GrantSubAdmin)

router.get('/ActiveUsers/:id',authController.totalActiveUser);

router.get('/notActiveUsers/:id',authController.totalNotActiveUser);

router.put('/BlockedUsers/:id',authController.totalBlockedUser);

router.get('/TotalUsers/:id',authController.totalUser);

router.get('/MonthlyActiveUsers/:id',authController.MonthlyActiveUser);

router.get('/orderByStatus/:id',authController.sortOrderByStatus);

router.get('/orderByWeek/:id',authController.OrderByWeek);

router.get('/OrderOfLastOneMonth/:id',authController.OrderOfLastOneMonth);

router.get('/OrderOfLastThreeMonth/:id',authController.OrderOfThreeMonth);

router.get('/OrderOfLastSixMonth/:id',authController.OrderOfSixMonth);

router.get('/orderByYear/:id',authController.OrderByYear);

router.get('/orderByCostumeDate',authController.OrderOfCostumeDate);


module.exports = router;