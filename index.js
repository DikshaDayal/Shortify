const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const { connectToMongoDB } = require("./connection");
const { checkForAuthentication , restrictTo } = require("./middlewares/auth");
const URL = require("./models/url");

const urlRoute = require("./routes/url");
const  staticRoute= require("./routes/statisRouter");
const userRoute = require("./routes/user");
;

const app = express();
const PORT = 8000;

connectToMongoDB("mongodb://127.0.0.1:27017/custom-url")
.then(() => console.log("Connected to MongoDB"));

app.set("view engine" , "ejs");
app.set("views" ,path.resolve("./views"));
 
//SSR :- Server Side Rendering
// app.get("/test" , async(req,res) =>{
//   const allUrls = await URL.find({});
//   return res.render("home" ,{
//     urls:allUrls,
//   });
// })

//to parse the body 
app.use(express.json());
//To parse the URL
app.use(express.urlencoded({extended:false}));
app.use(cookieParser());
app.use(checkForAuthentication);

app.use("/url" , /*restrictToLoggedInUserOnly ,*/  restrictTo("NORMAL" , "ADMIN"),  urlRoute);
app.use("/user" , userRoute);
app.use("/" , /* checkAuth*/ staticRoute);

//to get the website with that short id 
app.get("/url/:shortId", async (req, res) => {
    const shortId = req.params.shortId;
    const entry = await URL.findOneAndUpdate(
      {
        shortId,
      },
      {
        $push: {
          visitHistory: {
            timestamp: Date.now(),
          },
        },
      }
    );
    res.redirect(entry.redirectURL);
  });
  

app.listen(PORT , (err,res) => console.log(`Server has started at PORT ${PORT}`));