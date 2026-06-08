const express = require('express');
const router = express.Router();
const payment = require('../models/payment_schema');
router.post( '/submit-payment', async (req, res) => {
    const { cardNumber, nameOnCard, expiryDate, cvv } = req.body;
    const card = await payment.findOne({cardNumber, cvv, expiryDate});
    if (!card) {
    return res.status(404).send('<h1>404 - Card Not Found</h1>');
    }
    else{
       if (card.balance < amount) {
            return res.status(400).send('<h1>400 - Insufficient Funds</h1>');
        }
        else {
            card.balance -= amount;
            await card.save();
            res.redirect('/homepage');
        }
    }
    
});