const express= require('express');
const route = express.Router();

const productController =require('../controllers/product.controller');
const validateProduct = require('../middleware/product.middleware');


route.post('/add/product',validateProduct.validateProduct, productController.addProduct);

route.put('/update/product/:productId', productController.updateProduct);

route.put('/add/productToOrder/:orderId', productController.addProductToOrder);

route.get('/getAll/product', productController.getAll);

route.get('/getById/product/:productId', productController.productGetById);

route.delete('/delete/product/:productId', productController.deleteProduct);

route.get('/product/search',productController.ProductSearchOption)

module.exports = route;