const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");
const axios = require("axios");
const fs = require('fs');


const { v4: uuidv4 } = require("uuid");
// const admin = require("firebase-admin");
const multer = require("multer");
const mongoose = require("mongoose");
const morgan = require("morgan");
require('dotenv').config();
const MONGODB_URI = "mongodb+srv://moniji:moniji@cluster0.ut2u9zs.mongodb.net/moniji";
//const MONGODB_URI ="mongodb://localhost:27017/moniji_App";

//ROUTES

const adminRoute = require("./routes/admin");
const userRoute = require("./routes/user");
const orderRoute = require("./routes/order");
const SubAdminRoute =  require('./routes/SubAdmin.route')


const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.set("view engine", "ejs");
const port = 8080;
const bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: '50mb' }));

app.use(express.static(path.join(__dirname, './public')));

app.use(express.json());
app.use(cors());

app.use(adminRoute);
app.use(userRoute);
app.use(orderRoute);
app.use(SubAdminRoute);
app.get('/Export-to-excel-weeklyOrder', (req, res,next)=>{
  res.status(200).json({
    file:"http://localhost:8000/controllers\public\weeklyOrder.csv",
  })
})
app.get('/Export-to-excel-oneMonthOrder', (req, res,next)=>{
  res.status(200).json({
    file1:"http://localhost:8000/controllers\public\oneMonthOrder.csv"
  })
})
app.get('/Export-to-excel-ThreeMonthOrder', (req, res,next)=>{
  res.status(200).json({
    file1:"http://localhost:8000/controllers\public\ThreeMonthOrder.csv"
  })
})
app.get('/Export-to-excel-sixMonthOrder', (req, res,next)=>{
  res.status(200).json({
    file1:"http://localhost:8000/controllers\public\sixMonthOrder.csv"
  })
})
app.get('/Export-to-excel-YearlyOrder', (req, res,next)=>{
  res.status(200).json({
    file2:"http://localhost:8000/controllers\public\YearlyOrder.csv"
  })
})

app.get('/Export-to-excel-CostumeDateOrder', (req, res,next)=>{
  res.status(200).json({
    file2:"http://localhost:8000/controllers\public\CostumeDateOrder.csv"
  })
})


app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "image");
    },
  
    filename: (req, file, cb) => {
      cb(null, Date.now() + file.originalname.replace(/\\/g, "/"));
    },
  });
  
  const fileFilter = (req, file, cb) => {
    if (
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/png"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  };
  
  app.use(
    multer({ storage: diskStorage, fileFilter: fileFilter }).single("file")
  );
  
  app.use("/image", express.static(path.join(__dirname, "image")));

  app.use((err, req, res, next) => {
    console.log(err);
    const status = err.status || 500;
    const message = err.message;
    const data = err.data;
  
    res.status(status).json({
      message: message,
      data: data,
      error: err,
    });
  });
  
  // app.all("*", (req, res, next) => {
  //   next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
  // });
  
  mongoose
    .connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      
    })
    .then((result) => {
      const server = app.listen(8080);
      console.log("app is running")
      const io = require("./socket").init(server);
  
      io.on("connection", (socket) => {
        console.log("Connected a User");
  
        socket.on("disconnect", () => {
          console.log("User Disconnected");
        });
      });
    })
    .catch((err) => {
      console.log(err);
    });
  