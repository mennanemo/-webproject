class AuthSystem {
    static ADMIN_EMAILS = ['admin@gmail.com'];

    constructor() {
        this.currentUser = null;
        this.users = this.loadUsers();
        this.init();
    }

    init() {
        this.attachEventListeners();
        this.checkSession();
    }

    // ==================== Storage Management ====================

    loadUsers() {
        const users = localStorage.getItem('users');
        return users ? JSON.parse(users) : [];
    }

    saveUsers() {
        localStorage.setItem('users', JSON.stringify(this.users));
    }

    loadSession() {
        const session = sessionStorage.getItem('current_user');
        return session ? JSON.parse(session) : null;
    }

    saveSession(user) {
        sessionStorage.setItem('current_user', JSON.stringify(user));
    }

    clearSession() {
        sessionStorage.removeItem('current_user');
    }

    // ==================== Validation ====================

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validatePassword(password) {
        // Minimum 8 characters, at least one uppercase, one number, one special character
        // Made more flexible: lowercase is optional if other requirements are strong
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])[A-Za-z\d^\-_~!@#$%*&(){}[\]:;<>,.?/\\|+]{8,}$/;
        return passwordRegex.test(password);
    }

    validateName(name) {
        return name && name.trim().length >= 5;
    }

    validatePhone(phone) {
        // Basic phone validation - allows common formats
        const phoneRegex =  /^01[0125][0-9]{8}$/;
        return phoneRegex.test(phone.trim());
    }

    checkPasswordStrength(password) {
        // weak, fair, good, strong
        if (!password) return 'weak';
        
        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++; // Any special character

        if (strength <= 1) return 'weak';
        if (strength <= 2) return 'fair';
        if (strength <= 3) return 'good';
        return 'strong';
    }

    // ==================== Auth Operations ====================

    signup(name, email, phone, password, confirmPassword) {
        // Clear previous errors
        this.clearErrors(['nameError', 'emailError', 'phoneError', 'passwordError', 'confirmError']);

        let hasError = false;

        // Validate name
        if (!this.validateName(name)) {
            this.showError('nameError', 'Name must be at least 5 characters');
            hasError = true;
        }

        // Validate email
        if (!this.validateEmail(email)) {
            this.showError('emailError', 'Invalid email format');
            hasError = true;
        }

        // Check if email already exists
        if (this.users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
            this.showError('emailError', 'Email already registered');
            hasError = true;
        }

        // Validate phone
        if (!this.validatePhone(phone)) {
            this.showError('phoneError', 'Invalid phone format');
            hasError = true;
        }

        // Validate password
        if (!this.validatePassword(password)) {
            this.showError('passwordError', 
                'Password must be at least 8 characters with uppercase, number, and special character (e.g., !@#$%^&*#-_)');
            hasError = true;
        }

        // Check password confirmation
        if (password !== confirmPassword) {
            this.showError('confirmError', 'Passwords do not match');
            hasError = true;
        }

        if (hasError) return false;

        try {
            // Create new user
            const newUser = {
                id: Date.now(),
                name: name.trim(),
                email: email.toLowerCase(),
                phone: phone.trim(),
                password: password,
                role: AuthSystem.ADMIN_EMAILS.includes(email.toLowerCase()) ? 'admin' : 'user',
                createdAt: new Date().toISOString()
            };

            this.users.push(newUser);
            this.saveUsers();

            // Set as current user and go to dashboard
            this.currentUser = { ...newUser, password: undefined };
            this.saveSession(this.currentUser);

            this.showMessage('Account created! Welcome to dashboard.', 'success');
            this.navigateToDashboard();
            return true;
        } catch (error) {
            this.showMessage('Signup failed: ' + error.message, 'error');
            return false;
        }
    }

    login(email, password) {
        // Clear previous errors
        this.clearErrors(['loginEmailError', 'loginPasswordError']);

        let hasError = false;

        // Validate inputs
        if (!this.validateEmail(email)) {
            this.showError('loginEmailError', 'Invalid email format');
            hasError = true;
        }

        if (!password) {
            this.showError('loginPasswordError', 'Password is required');
            hasError = true;
        }

        if (hasError) return false;

        try {
            // Find user
            const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());

            if (!user) {
                this.showError('loginEmailError', 'Email not found');
                return false;
            }

            // Verify password
            if (password !== user.password) {
                this.showError('loginPasswordError', 'Incorrect password');
                return false;
            }

            // User has role assigned, go to dashboard
            this.currentUser = { ...user, password: undefined };
            this.saveSession(this.currentUser);
            this.showMessage('Login successful!', 'success');
            this.navigateToDashboard();
            return true;
        } catch (error) {
            this.showMessage('Login failed: ' + error.message, 'error');
            return false;
        }
    }

    logout() {
        this.currentUser = null;
        this.clearSession();
        this.navigateToSignup();
        this.showMessage('Logged out successfully', 'success');
    }

    // ==================== Navigation ====================

    navigateToSignup() {
        this.hidePage('loginPage');
        this.hidePage('dashboardPage');
        this.showPage('signupPage');
        this.resetForm('signupForm');
    }

    navigateToLogin() {
        this.hidePage('signupPage');
        this.hidePage('dashboardPage');
        this.showPage('loginPage');
        this.resetForm('loginForm');
    }

    navigateToDashboard() {
        this.hidePage('signupPage');
        this.hidePage('loginPage');
        this.showPage('dashboardPage');
        this.updateDashboard();
        this.updateNavBar();
    }

    showPage(pageId) {
        const page = document.getElementById(pageId);
        if (page) page.style.display = 'block';
    }

    hidePage(pageId) {
        const page = document.getElementById(pageId);
        if (page) page.style.display = 'none';
    }

    // ==================== Dashboard ====================

    updateDashboard() {
        if (!this.currentUser) return;

        // Show user details
        document.getElementById('dashboardName').textContent = this.currentUser.name;
        document.getElementById('dashboardEmail').textContent = this.currentUser.email;
        document.getElementById('dashboardPhone').textContent = this.currentUser.phone;
        document.getElementById('dashboardRole').textContent = 
            this.currentUser.role.charAt(0).toUpperCase() + this.currentUser.role.slice(1);

        // Show admin panel only for admins
        const adminPanel = document.getElementById('adminPanel');
        if (this.currentUser.role === 'admin') {
            adminPanel.style.display = 'block';
        } else {
            adminPanel.style.display = 'none';
            document.getElementById('usersListContainer').style.display = 'none';
        }
    }

    displayAllUsers() {
        const tableBody = document.getElementById('usersTableBody');
        tableBody.innerHTML = '';

        this.users.forEach(
            user => {            if (user.role === 'admin') return;
             const row = tableBody.insertRow();
            row.innerHTML = `
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.phone}</td>
                <td>${user.role || 'N/A'}</td>
                <td><button class="btn btn-delete" onclick="authSystem.deleteUser(${user.id})">Delete</button></td>
            `;
        });

        document.getElementById('usersListContainer').style.display = 'block';
    }

    deleteUser(userId) {
        if (!confirm('Are you sure you want to delete this user?')) {
            return;
        }

        // Find and remove user from array
        const userIndex = this.users.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
            const deletedUser = this.users[userIndex];
            this.users.splice(userIndex, 1);
            this.saveUsers();
            this.displayAllUsers();
            this.showMessage(`User ${deletedUser.name} has been deleted.`, 'success');
        }
    }

    // ==================== UI Updates ====================

    updateNavBar() {
        const navRight = document.getElementById('navRight');
        const logoutBtn = document.getElementById('logoutBtn');
        const userInfo = document.getElementById('userInfo');

        if (this.currentUser) {
            logoutBtn.style.display = 'block';
            userInfo.style.display = 'block';
            userInfo.textContent = `${this.currentUser.name} (${this.currentUser.role})`;
        } else {
            logoutBtn.style.display = 'none';
            userInfo.style.display = 'none';
        }
    }

    showMessage(message, type = 'success') {
        const messageEl = type === 'success' ? 
            document.getElementById('successMessage') : 
            document.getElementById('errorMessage');
        
        const textEl = type === 'success' ? 
            document.getElementById('messageText') : 
            document.getElementById('errorText');

        textEl.textContent = message;
        messageEl.classList.add('show');

        setTimeout(() => {
            messageEl.classList.remove('show');
        }, 4000);
    }

    showError(fieldId, message) {
        const errorEl = document.getElementById(fieldId);
        if (errorEl) {
            errorEl.textContent = message;
        }
    }

    clearErrors(fieldIds) {
        fieldIds.forEach(fieldId => {
            const errorEl = document.getElementById(fieldId);
            if (errorEl) {
                errorEl.textContent = '';
            }
        });
    }

    resetForm(formId) {
        const form = document.getElementById(formId);
        if (form) form.reset();
        const strengthEl = document.getElementById('passwordStrength');
        if (strengthEl) {
            strengthEl.textContent = '';
            strengthEl.className = 'password-strength-label';
        }
    }

    // ==================== Event Listeners ====================

    attachEventListeners() {
        // Navigation
        document.getElementById('toLogin').addEventListener('click', (e) => {
            e.preventDefault();
            this.navigateToLogin();
        });

        document.getElementById('toSignup').addEventListener('click', (e) => {
            e.preventDefault();
            this.navigateToSignup();
        });

        // Forms
        document.getElementById('signupForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('signupName').value;
            const email = document.getElementById('signupEmail').value;
            const phone = document.getElementById('signupPhone').value;
            const password = document.getElementById('signupPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            this.signup(name, email, phone, password, confirmPassword);
        });

        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            this.login(email, password);
        });

        // Password strength indicator
        const passwordInput = document.getElementById('signupPassword');
        passwordInput.addEventListener('input', () => {
            const strength = this.checkPasswordStrength(passwordInput.value);
            const strengthEl = document.getElementById('passwordStrength');
            
            // Map strength to label text
            const strengthLabels = {
                'weak': 'Weak',
                'fair': 'Fair',
                'good': 'Good',
                'strong': 'Strong'
            };
            
            strengthEl.textContent = strengthLabels[strength] || '';
            strengthEl.className = `password-strength-label ${strength}`;
        });

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
        document.getElementById('logoutDashboardBtn').addEventListener('click', () => this.logout());

        // Admin - View Users
        document.getElementById('viewUsersBtn').addEventListener('click', () => {
            this.displayAllUsers();
        });

        // Password toggle visibility
        document.querySelectorAll('.toggle-password').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = btn.getAttribute('data-target');
                const input = document.getElementById(targetId);
                
                if (input.type === 'password') {
                    input.type = 'text';
                    btn.textContent = '👁️‍🗨️';
                } else {
                    input.type = 'password';
                    btn.textContent = '👁️';
                }
            });
        });
    }

    // ==================== Session Check ====================

    checkSession() {
        const sessionUser = this.loadSession();

        if (sessionUser) {
            this.currentUser = sessionUser;
            this.navigateToDashboard();
            this.updateNavBar();
        } else {
            this.navigateToSignup();
            this.updateNavBar();
        }
    }
}

// ==================== Initialize ====================

let authSystem;

document.addEventListener('DOMContentLoaded', () => {
    authSystem = new AuthSystem();
});

// ==================== Utility Functions ====================

function closeMessage() {
    document.getElementById('successMessage').classList.remove('show');
    document.getElementById('errorMessage').classList.remove('show');
}
