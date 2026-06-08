const express = require('express');
const CardData = require('../models/CardData');
const { protect } = require('../middleware/authMid');

const router = express.Router();

router.post('/', protect, async (req, res) => {
    try {
        const { cardNumber, nameOnCard, expiryDate, cvv } = req.body;
        const normalizedCardNumber = String(cardNumber || '').replace(/\s/g, '');

        if (!/^\d{16}$/.test(normalizedCardNumber)) {
            return res.status(400).json({ message: 'Invalid card number. Please enter 16 digits.' });
        }

        if (!nameOnCard || !nameOnCard.trim()) {
            return res.status(400).json({ message: 'Please enter name on card.' });
        }

        if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(String(expiryDate || ''))) {
            return res.status(400).json({ message: 'Expiry date must use MM/YY format.' });
        }

        if (!/^\d{3,4}$/.test(String(cvv || ''))) {
            return res.status(400).json({ message: 'Invalid CVV. Please enter 3 or 4 digits.' });
        }

        const card = await CardData.create({
            user: req.user._id,
            cardNumber: normalizedCardNumber,
            nameOnCard: nameOnCard.trim(),
            expiryDate,
            cvv
        });

        res.status(201).json({
            message: 'Card data saved successfully',
            card: { id: card._id.toString(), balance: card.balance }
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to save card data' });
    }
});

module.exports = router;
