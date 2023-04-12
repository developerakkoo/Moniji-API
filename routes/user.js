const express = require("express");

const user = require("../controllers/user")


const router = express.Router();

router.get('/user', user.getAllUser);
router.get('/user:id', user.getUserById);
router.post('/user/login', user.loginUser);
router.post('/user/signup', user.postSignup);

module.exports = router;