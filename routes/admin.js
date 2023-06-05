const express = require('express');
const { body } = require('express-validator');
const authController = require('./../controllers/admin');
const verifyAdmin = require ('../middleware/IsAdmin')

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

router.put('/updateUser/status/:id',verifyAdmin.isAdmin,authController.acceptUserReq);

router.put('/BlockUser/:id',verifyAdmin.isAdmin,authController.BlockUser);

router.put('/updateOrder/:id',verifyAdmin.isAdmin,authController.UpdateOrderReq);

router.put('/updateOrder/Status/:id',verifyAdmin.isAdmin,authController.UpdateOrderStatus);

router.put('/update/subAdmin/:id',verifyAdmin.isAdmin,authController.GrantSubAdmin)

router.get('/ActiveUsers/:id',verifyAdmin.isAdmin,authController.totalActiveUser);

router.get('/notActiveUsers/:id',verifyAdmin.isAdmin,authController.totalNotActiveUser);

router.put('/BlockedUsers/:id',verifyAdmin.isAdmin,authController.totalBlockedUser);

router.get('/TotalUsers/:id',verifyAdmin.isAdmin,authController.totalUser);

router.get('/MonthlyActiveUsers/:id',verifyAdmin.isAdmin,authController.MonthlyActiveUser);

router.get('/orderByStatus/:id',verifyAdmin.isAdmin,authController.sortOrderByStatus);

router.get('/orderByWeek/:id',verifyAdmin.isAdmin,authController.OrderByWeek);

router.get('/OrderOfLastOneMonth/:id',verifyAdmin.isAdmin,authController.OrderOfLastOneMonth);

router.get('/OrderOfLastThreeMonth/:id',verifyAdmin.isAdmin,authController.OrderOfThreeMonth);

router.get('/OrderOfLastSixMonth/:id',verifyAdmin.isAdmin,authController.OrderOfSixMonth);

router.get('/orderByYear/:id',verifyAdmin.isAdmin,authController.OrderByYear);

router.get('/orderByCostumeDate',verifyAdmin.isAdmin,authController.OrderOfCostumeDate);


module.exports = router;