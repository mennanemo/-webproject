const form = document.querySelector('form');
const cardNumberInput = document.querySelector('.card-number');
const nameInput = document.querySelector('.name');
const expiryDateInput = document.querySelector('.expiry-date');
const cvvInput = document.querySelector('.cvv');

form.addEventListener('submit', function(e) {
    
    
    let cardnumber = cardNumberInput.value;
    let name = nameInput.value;
    let expiryDate = expiryDateInput.value;
    let cvv = cvvInput.value;
    
    
    if(cardnumber.length !== 16 || isNaN(cardnumber)) {
        alert("Invalid card number. Please enter 16 digits.");
        return;
    }
    
    
    if(name.trim() === '') {
        alert("Please enter name on card.");
        return;
    }
    
    
    if(expiryDate === '') {
        alert("Please select expiry date.");
        return;
    }
    
    
    if(cvv.length < 3 || cvv.length > 4 || isNaN(cvv)) {
        alert("Invalid CVV. Please enter 3 or 4 digits.");
        return;
    }
    
    
    alert("Payment processed successfully!");
});
