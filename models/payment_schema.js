const mongoose=require('mongoose');
const paymentSchema= mongoose.Schema;
const payment = new paymentSchema({
    cardNumber: { type: String, required: true },
    nameOnCard: { type: String, required: true },
    expiryDate: { type: String, required: true },
    cvv:        { type: String, required: true },
    balance:    { type: Number, default: 5000 }  

});
module.exports=mongoose.model("cardData",payment);
