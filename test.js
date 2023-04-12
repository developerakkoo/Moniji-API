const aleaRNGFactory = require("number-generator/lib/aleaRNGFactory");
const { uInt32 } = aleaRNGFactory(2);
const generator1 = uInt32(); 
console.log(generator1)