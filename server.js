// Backend (Node.js with Express)
require('dotenv').config()
const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
const cors = require("cors");
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
// const { generateZoomToken } = require('./src/components/ZoomUtils');
// const axios = require('axios');
const Razorpay = require('razorpay');
// const { createPilgrim } = require('./src/controller/pilgrim');
const userRouter = require('./src/routes/userRouter');
const pilgrimRouter =  require('./src/routes/pilgrimRouter')

const app = express();
app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(bodyParser.urlencoded({ extended: true})) //Form values 
app.use(cookieParser())
app.use(express.json())
app.use(express.json({ limit: '10mb' }));

app.use(session({
  key: 'user_sid',
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie:{
    expires:600000
  }
}));



app.get("/",cors(),(req,res)=>{

})

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-Requested-With, Content-Type, Authorization'
  );
  next();
})

var sessionChecker = (req,res,next) => {
  if(req.session.user && req.cookies.user_sid){
    res.redirect('/')
  }
  else{
  next()
}
}

app.get('/',sessionChecker,(req,res) => {
  res.redirect('/login')
})

// // Middleware to check if user is authenticated
// function isAuthenticated(req, res, next) {
//   if (req.session.user) {
//     next(); // User is authenticated, proceed to the next middleware
//   } else {
//     res.status(401).json({ message: "Unauthorized" });
//   }
// }

// // Protected route that requires authentication
// app.get("/protected-route", isAuthenticated, (req, res) => {
//   res.json({ message: "You are logged in." });
// });


// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
.then(() => {
    //listen for requests
    app.listen(process.env.PORT, () =>{
    console.log('connected to db and listening on port ',process.env.PORT)
})
})
.catch((error) => {
    console.log(error)
})


// Define a schema for the form data
const formDataSchema = new mongoose.Schema({
  name:{
    type:String,
    required:true
  } ,
  email:{
    type:String,
    required:true,
    validate: {
      validator: (value) => {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(value).toLowerCase());
      },
      message: 'Please enter a valid email address'
    }
  } ,
  phoneNumber: {
    type: String,
    required: true
  },
  meetingDate: {
    type: Date,
    required: true
  },
  meetingTime: {
    type: String,
    required: true
  },
  meetingId : {
    type: String,
    required: true
  },
  guide : {
    type: String,
    required: true
  },
  guideEmail: { // New field for guide email
    type: String,
    // required: true
  }
  // Add more fields as needed
});
const FormData = mongoose.model('FormData', formDataSchema);

const RevDataSchema = new mongoose.Schema({
  fullname: {
    type:String,
    required:true
  },
  phonenumber: {
    type:String,
    required:true
  },
  email: {
    type:String,
    required:true
  },
  message:{
    type:String,
    required:true
  }
})
const RevData = mongoose.model('RevData',RevDataSchema)

const newSchema=new mongoose.Schema({
  email:{
      type:String,
      required:true
  },
  password:{
      type:String,
      required:true
  }
})

const collection = mongoose.model("collection",newSchema)


app.post("/login",sessionChecker,async(req,res)=>{
  const{email,password}=req.body

  try{
      const check=await collection.findOne({email:email})
      const check2 = await collection.findOne({password:password})

      if(check && check2){
          req.session.user = email;     // Store user email in session
          res.json("exist")
      }
      else{
          res.json("notexist")
      }

  }
  catch(e){
      res.json("fail")
  }

})



app.post("/signup",sessionChecker,async(req,res)=>{
  const{email,password}=req.body

  const data={
      email:email,
      password:password
  }

  try{
      const check=await collection.findOne({email:email})

      if(check){
          res.json("exist")
      }
      else{
           // Store user's email in the session
          req.session.user = email;
          res.json("notexist")
          await collection.insertMany([data])
      }

  }
  catch(e){
      res.json("fail")
  }

})

app.post('/submit-review',async(req,res) => {
  const {fullname, phonenumber, email, message} = req.body;
  const revData = new RevData({fullname, phonenumber, email, message});
  await revData.save();
  
  res.status(200).json({ message: 'Reviews received successfully' });
});

// Route to handle form submission
app.post('/submit-meeting-form', async (req, res) => {
  const { name, email, phoneNumber, meetingDate, meetingTime, meetingId ,guide } = req.body;

  //  // Check if the selected date and guide are available
  // const existingMeeting = await FormData.findOne({ meetingDate:meetingDate });
  // const existingMeeting2 = await FormData.findOne({guide:guide});

  // if (existingMeeting && existingMeeting2) {
  //   // Meeting already exists for the selected date and guide
  //   return res.status(400).json({ message : 'Guide not available for the selected date' });
  // }


  // Save the form data to MongoDB
  const formData = new FormData({ name, email, phoneNumber, meetingDate, meetingTime, meetingId, guide });
  await formData.save();
  

  // Generate a meeting ID
  const meetingId2 = uuidv4();

  // const zoomToken = generateZoomToken();

  // try {
  //   const response = await axios.post(
  //     'https://api.zoom.us/v2/users/me/meetings',
  //     {
  //       topic: 'Testing',
  //       start_time: meetingTime,
  //       token: zoomToken
  //     },
  //     {
  //       headers: {
  //         'Content-Type': 'application/json',
  //         Authorization: `Bearer ${zoomToken}`
  //       }
  //     }
  //   );
  //   console.log(response.data);
  //   res.status(200).json({ message: 'Meeting scheduled successfully' });
  // } catch (error) {
  //   console.error(error.response.data);
  //   res.status(500).json({ message: 'Failed to schedule meeting' });
  // }

  let guideEmail = '';
  if (guide === 'Savinay') {
    guideEmail = 'guide1@example.com';
  } else if (guide === 'Gautam') {
    guideEmail = 'guide2@example.com';
  } else if (guide === 'Pratik') {
    guideEmail = 'pranavpatil191@apsit.edu.in';
  }


  // Send an email with the meeting ID
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.mail,
      pass: process.env.pass
    }
  });

  const mailOptions = {
    from: process.env.mail,
    to: email,
    subject: 'Meeting ID',
    text: `Your meeting ID is scheduled with ${guide} , He will contact you shortly`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });



  const guidemailOptions = {
    from: process.env.mail,
    to: guideEmail,
    subject: 'A meeting has been scheduled',
    text: `A meeting has been scheduled with SIR.${name}  
    Please contact him through ${phoneNumber},
    Meeting date :- ${meetingDate}
    Meeting Time :- ${meetingTime}
    Meeting ID :- ${meetingId}
    Please Proceed with the needful`
  };

  transporter.sendMail(guidemailOptions, (error, info) => {
    if (error) {
      console.error(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });

  res.status(200).json({ message: 'Meeting Scheduled successfully' });
});

// app.listen(process.env.PORT, () => {
//   console.log('Server running on port 4000');
// });
// app.post('/pilgrim' , auth ,createPilgrim);

app.get('/get-registered-dates', async (req, res) => {
  try {
    // Fetch registered dates from the database
    const registeredDates = await FormData.find({}, 'meetingDate guide');

    res.status(200).json(registeredDates);
  } catch (error) {
    console.error('Error fetching registered dates:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/get-registered-guide', async (req, res) => {
  try {
    // Fetch registered guides from the database
    const registeredGuide = await FormData.distinct('guide');

    res.status(200).json(registeredGuide);
  } catch (error) {
    console.error('Error fetching registered dates:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Route to fetch registered dates and guides
app.get('/registered-dates', async (req, res) => {
  try {
    // Query the database to fetch registered dates and guides
    const registeredDates = await FormData.find({}, 'date guide');

    // Send the registered dates and guides as a response
    res.json(registeredDates);
  } catch (error) {
    console.error('Error fetching registered dates:', error);
    res.status(500).json({ message: 'Error fetching registered dates' });
  }
});


app.use('/user' , userRouter)
app.use('/pilgrim', pilgrimRouter)


app.post('/donate' , async(req,res) => {
try{
    const instance = new Razorpay({
      key_id: "rzp_test_wW80r76Ae0rTbO",
      key_secret: "w8oFKU5YtUPsmSq5NPvwE88W"
    })

    const {order_id , amount , currency , payment_capture} = req.body;

    const options = {
      amount:amount,
      currency:currency,
      receipt:order_id,
      payment_capture:payment_capture,
    };

    const donate = await instance.orders.create(options);
    if(!donate) return res.status(500).send("somenthing went wrong");

}catch(err){
  console.log(err)
}
})


app.post("/card-detail" , async (req,res,next) => {
  try{
    const instance = new Razorpay({
      key_id: "rzp_test_wW80r76Ae0rTbO",
      key_secret: "w8oFKU5YtUPsmSq5NPvwE88W"
  });
  const { id } = req.body;
  const order = await instance.payments.fetch(id);
  if(!order) return res.status(500).send("something occured");

  res.status(200).json({ success: true,data: order })
}
catch(err){
    console.log(err)
  }
})


// const razorpay = new Razorpay({
//   key_id: 'rzp_test_wW80r76Ae0rTbO',
//   key_secret: 'w8oFKU5YtUPsmSq5NPvwE88W',
// });

// app.post('/api/razorpay', async (req, res) => {
//   const { amount } = req.body;
//   const options = {
//     amount: amount * 100,
//     currency: 'INR',
//     receipt: 'receipt_order_74394',
//   };
//   try {
//     const response = await razorpay.orders.create(options);
//     res.json(response);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send('Failed to create Razorpay order');
//   }
// });
