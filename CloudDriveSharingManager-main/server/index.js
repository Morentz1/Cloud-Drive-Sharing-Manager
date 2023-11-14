// Dependencies
const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')

// Make server
dotenv.config()
const PORT = process.env.PORT || 4000;
const app = express()

// Middleware
app.use(express.urlencoded({ limit: '50mb', extended: true }))
app.use(cors({
    origin: ["http://localhost:3000"],
    credentials: true
}))
app.use(express.json({ limit: '100mb' }))

// Routers
const router = require('./routes/router')
app.use('/api', router);

// Init DB
const db = require('./db')
db.on('error', console.error.bind(console, 'MongoDB connection error:'))

// Put server on listen to port
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
