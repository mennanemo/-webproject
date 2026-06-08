const User = require('../models/UserAuth');
const { signToken } = require('../middleware/authMid');
const { validateEmail, validatePassword, validateName, validatePhone } = require('../utils/validation');

exports.signup = async (req, res) => {
    try {
        const { firstName, lastName, email, phone, password } = req.body;

        if (!validateName(firstName)) {
            return res.status(400).json({ message: 'First name must be at least 2 characters' });
        }
        if (!validateName(lastName)) {
            return res.status(400).json({ message: 'Last name must be at least 2 characters' });
        }
        if (!validateEmail(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }
        if (!validatePhone(phone)) {
            return res.status(400).json({ message: 'Invalid phone format' });
        }
        if (!validatePassword(password)) {
            return res.status(400).json({
                message: 'Password must be at least 8 characters with uppercase, number, and special character'
            });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({ message: 'Email already registered' });
        }

        const user = await User.create({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.toLowerCase(),
            phone: phone.trim(),
            password
        });

        res.status(201).json({
            token: signToken(user._id),
            user: user.toPublicJSON()
        });
    } catch (error) {
        res.status(500).json({ message: 'Signup failed' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!validateEmail(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }
        if (!password) {
            return res.status(400).json({ message: 'Password is required' });
        }

        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
        if (!user) {
            return res.status(401).json({ message: 'Email not found' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect password' });
        }

        const token = signToken(user._id);

        if (!user.role) {
            return res.json({
                token,
                user: user.toPublicJSON(),
                needsRoleSelection: true
            });
        }

        res.json({ token, user: user.toPublicJSON() });
    } catch (error) {
        res.status(500).json({ message: 'Login failed' });
    }
};

exports.getMe = (req, res) => {
    res.json({ user: req.user.toPublicJSON() });
};

exports.logout = (_req, res) => {
    res.json({ message: 'Logged out successfully' });
};
