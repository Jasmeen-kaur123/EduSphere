const express = require("express");
require("dotenv").config();


const port = process.env.PORT || 8000;
const app = express();





app.listen(port, ()=>{
  console.log(`server is running on port : ${port}`);
})