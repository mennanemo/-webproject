const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const validatePassword = (password) =>
    /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])[A-Za-z\d^\-_~!@#$%*&(){}[\]:;<>,.?/\\|+]{8,}$/.test(password);

const validateName = (name) => Boolean(name && name.trim().length >= 2);

const validatePhone = (phone) => /^01[0125][0-9]{8}$/.test(String(phone).trim());

const VALID_ROLES = ['client', 'freelancer', 'admin'];

module.exports = { validateEmail, validatePassword, validateName, validatePhone, VALID_ROLES };
