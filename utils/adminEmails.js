const AdminEmail = require('../models/AdminEmail');

const getSeedAdminEmails = () =>
    (process.env.ADMIN_EMAILS || 'admin@mail.com')
        .split(',')
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean);

const seedAdminEmails = async () => {
    const seeds = getSeedAdminEmails();
    await Promise.all(
        seeds.map((email) => AdminEmail.updateOne({ email }, { email }, { upsert: true }))
    );
};

const isAdminEligible = async (email) => {
    const found = await AdminEmail.findOne({ email: email.toLowerCase() });
    return Boolean(found);
};

const addAdminEmail = async (email) => {
    const normalized = email.toLowerCase();
    await AdminEmail.updateOne({ email: normalized }, { email: normalized }, { upsert: true });
    return normalized;
};

module.exports = { seedAdminEmails, isAdminEligible, addAdminEmail };
