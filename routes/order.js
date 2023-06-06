const express = require("express");
const order = require("../controllers/order");
const router = express.Router();
///get 
router.get('/order', order.getAllOrder);

router.get('/order/:id', order.getOrderById);

router.get('/order/user/:userid', order.getOrderByUserId);
//post
router.post('/order', order.postOrder);
//put
router.put('/order/:id', order.updateOrder);
//delete
router.delete('/order/:id', order.deleteOrder);



module.exports = router;