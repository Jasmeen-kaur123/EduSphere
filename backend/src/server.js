const express = require("express");
require("dotenv").config();
const path = require("path");

const app = express();
const port = process.env.PORT || 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve the public folder which is located one level up from src
app.use(express.static(path.join(__dirname, "..", "public")));

const courses = [
{
id:1,
title:"Web Development",
instructor:"John Doe"
},
{
id:2,
title:"Java Programming",
instructor:"Jane Smith"
},
{
id:3,
title:"Data Structures",
instructor:"Alex"
}
];

const users = [
  {
    name: "Manjot",
    email: "manjot@gmail.com",
    password: "1234"
  }
];

app.post("/api/signup",(req,res)=>{

const {name,email,password} = req.body

const user = {name,email,password}

users.push(user)

res.json({
success:true,
user
})

})

app.get("/api/courses",(req,res)=>{
res.json(courses);
});

app.post("/api/login",(req,res)=>{

const {email,password} = req.body;

const user = users.find(
u => u.email === email && u.password === password
);

if(user){

res.json({
success:true,
user
});

}else{

res.json({
success:false,
message:"Invalid email or password"
});

}

});

app.get("/",(req,res)=>{
  // send the dashboard from the public folder (up one level from src)
  res.sendFile(path.join(__dirname, "..", "public", "pages", "dashboard.html"));
});

app.listen(port,()=>{
console.log(`Server running on port ${port}`);
});