const paymentForm = document.getElementById('paymentForm');
const cardNumberInput = document.getElementById('cardNumber');
const nameOnCardInput = document.getElementById('nameOnCard');
const expiryDateInput = document.getElementById('expiryDate');
const cvvInput = document.getElementById('cvv');

paymentForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const cardNumber = cardNumberInput.value; 
    const nameOnCard = nameOnCardInput.value;
    const expiryDate = expiryDateInput.value;
    const cvv = cvvInput.value;

    
    if (cardNumber.length !== 16 || isNaN(cardNumber)) {
        alert("Invalid card number. Please enter 16 digits.");
        return;
    }

    
    if (nameOnCard.trim() === '') {
        alert("Please enter name on card.");
        return;
    }

    
    if (expiryDate === '') {
        alert("Please enter expiry date.");
        return;
    }

    
    if (cvv.length < 3 || cvv.length > 4 || isNaN(cvv)) {
        alert("Invalid CVV. Please enter 3 or 4 digits.");
        return;
    }

    
    paymentForm.submit();
});

const addAnotherBtn = document.getElementById('addAnotherBtn');

addAnotherBtn.addEventListener('click', function() {
    document.getElementById('addAnother').value = 'true';
    paymentForm.submit();
});