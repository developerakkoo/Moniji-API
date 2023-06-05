const aleaRNGFactory = require("number-generator/lib/aleaRNGFactory");
const { uInt32 } = aleaRNGFactory(2);

const   orderId=uInt32()

console.log(orderId)