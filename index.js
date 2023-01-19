
require("dotenv").config();


const express = require('express');
const app = express();

const cors = require('cors')
const mongoose = require('mongoose')
const morgan = require('morgan')
app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
        allowedHeaders: "*",
        credentials: true,
    })
);


mongoose.set('strictQuery', false)
mongoose.connect(
    process.env.mongoURI,

    () => {
        console.log("Connected to mongoDB...");
    }
);




// middleware
app.use(morgan("dev"));



const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

app.use(express.json({ extended: false })); // to get body data similar to body parser

const authRoutes = require("./routes/auth")
const postRoues = require('./routes/post')
const functionroute = require('./routes/api');
app.use("/api/authenticate", authRoutes);
app.use('/api/posts', postRoues);
app.use('/api', functionroute)





app.get('/', (req, res) => {
    res.send('Hello, World!');
});
