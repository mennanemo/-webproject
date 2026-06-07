const User = require('../models/User');
const { VALID_ROLES, validateEmail } = require('../utils/validation');
const { isAdminEligible, addAdminEmail } = require('../utils/adminEmails');

exports.setRole = async (req, res) => {
    try {
        const { role } = req.body;

        if (!role) {
            return res.status(400).json({ message: 'Role is required' });
        }
        if (!VALID_ROLES.includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }
        if (req.user._id.toString() !== req.params.id) {
            return res.status(403).json({ message: 'You can only set your own role' });
        }
        if (req.user.role) {
            return res.status(400).json({ message: 'Role already assigned' });
        }

        if (role === 'admin') {
            const allowed = await isAdminEligible(req.user.email);
            if (!allowed) {
                return res.status(403).json({ message: 'Your email is not authorized for admin role' });
            }
        }

        req.user.role = role;
        await req.user.save();

        res.json({ user: req.user.toPublicJSON() });
    } catch (error) {
        res.status(500).json({ message: 'Failed to assign role' });
    }
};

exports.getAllUsers = async (_req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        res.json({ users: users.map((user) => user.toPublicJSON()) });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch users' });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const isSelf = req.user._id.toString() === req.params.id;
        const isAdmin = req.user.role === 'admin';

        if (!isSelf && !isAdmin) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ user: user.toPublicJSON() });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch user' });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        if (req.user._id.toString() === req.params.id) {
            return res.status(400).json({ message: 'You cannot delete your own account' });
        }

        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete user' });
    }
};

exports.createAdmin = async (req, res) => {
    try {
        const { email } = req.body;

        if (!validateEmail(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        const normalized = await addAdminEmail(email);

        res.status(201).json({
            message: `${normalized} has been added to admin list`,
            email: normalized
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to add admin email' });
    }
};
