const express = require("express");
const app = express();
const mongoose = require("mongoose")
require("./DBconnection/dbConnection");
const userRouter = require("./routes/route");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


//User Route
app.use("/app/v1/user", userRouter);



app.listen(8000, () => {
    console.log("Server is Running on 8000............................");
  });


  