const express = require('express');
const router = express.Router();
const payment = require('../models/payment_schema');

// POST - save card to MongoDB
router.post('/submit-card-data', async (req, res) => {
    const { cardNumber, nameOnCard, expiryDate, cvv, addAnother } = req.body;

    const newcardData = new payment({
        cardNumber: cardNumber,
        nameOnCard: nameOnCard,
        expiryDate: expiryDate,
        cvv: cvv
    });

    await newcardData.save();

    if (addAnother === 'true') {
        res.redirect('/card-data');
    } else {
        res.redirect('/homepage');
    }
});

module.exports = router;