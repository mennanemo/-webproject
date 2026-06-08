const express = require('express');
const app = express();
app.use(express.urlencoded({ extended: true }));
const port= 5500;
const mongoose = require('mongoose');
mongoose.connect("mongodb+srv://Moaazmizoahmed2006:Moaz@kroww.r2lqvqp.mongodb.net/?appName=Kroww").listen(port, () => {
    console.log(`Server is running on port ${port}`);
}).catch((err) => {
    console.error("connection failed:", err);
});
const payment = require('./models/payment_schema');

app.use('/payment', require('./Routes/card_data_route'));
app.use('/payment', require('./Routes/payment_route'));