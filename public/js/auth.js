// ==================== Authentication System ====================

class AuthSystem {
    static API_BASE = '/api';

    constructor() {
        this.currentUser = null;
        this.pendingUser = null;
    }

    // ==================== API Helpers ====================

    getToken() {
        return localStorage.getItem('authToken');
    }

    setToken(token) {
        localStorage.setItem('authToken', token);
    }

    clearToken() {
        localStorage.removeItem('authToken');
    }

    async apiRequest(path, { method = 'GET', body, auth = false } = {}) {
        const headers = { 'Content-Type': 'application/json' };

        if (auth) {
            const token = this.getToken();
            if (token) {
                headers.Authorization = `Bearer ${token}`;
            }
        }

        const response = await fetch(`${AuthSystem.API_BASE}${path}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(data.message || 'Request failed');
        }

        return data;
    }

    saveSession(user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
    }

    loadSession() {
        const raw = localStorage.getItem('currentUser');
        return raw ? JSON.parse(raw) : null;
    }

    clearSession() {
        localStorage.removeItem('currentUser');
        this.clearToken();
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
        return name && name.trim().length >= 2;
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

    isCurrentUserAdmin() {
        return this.currentUser && this.currentUser.role === 'admin';
    }

    needsRoleSelection(user) {
        return user && !user.role;
    }

    resumeRoleSelection(user) {
        this.pendingUser = user;
        this.navigateToRoleSelection();
        this.updateNavBar();
    }

    // ==================== Auth Operations ====================

    async signup(firstName, lastName, email, phone, password, confirmPassword) {
        this.clearErrors([
            'firstNameError',
            'lastNameError',
            'emailError',
            'phoneError',
            'passwordError',
            'confirmError'
        ]);

        let hasError = false;

        if (!this.validateName(firstName)) {
            this.showError('firstNameError', 'First name must be at least 2 characters');
            hasError = true;
        }

        if (!this.validateName(lastName)) {
            this.showError('lastNameError', 'Last name must be at least 2 characters');
            hasError = true;
        }

        if (!this.validateEmail(email)) {
            this.showError('emailError', 'Invalid email format');
            hasError = true;
        }

        if (!this.validatePhone(phone)) {
            this.showError('phoneError', 'Invalid phone format');
            hasError = true;
        }

        if (!this.validatePassword(password)) {
            this.showError('passwordError', 'Password must be at least 8 characters with uppercase, number, and special character');
            hasError = true;
        }

        if (password !== confirmPassword) {
            this.showError('confirmError', 'Passwords do not match');
            hasError = true;
        }

        if (hasError) return false;

        try {
            const data = await this.apiRequest('/auth/signup', {
                method: 'POST',
                body: { firstName, lastName, email, phone, password }
            });

            this.setToken(data.token);
            this.pendingUser = data.user;
            this.navigateToRoleSelection();
            return data.user;
        } catch (error) {
            if (error.message === 'Email already registered') {
                this.showError('emailError', error.message);
            } else {
                this.showMessage('Signup failed: ' + error.message, 'error');
            }
            return false;
        }
    }

    async selectRole(role) {
        if (!this.pendingUser) {
            this.showMessage('Error: No pending user found', 'error');
            return;
        }

        try {
            const data = await this.apiRequest(`/users/${this.pendingUser.id}/role`, {
                method: 'POST',
                auth: true,
                body: { role }
            });

            this.currentUser = data.user;
            this.saveSession(this.currentUser);
            this.pendingUser = null;

            const fullName = `${this.currentUser.firstName} ${this.currentUser.lastName}`;
            this.showMessage(`Welcome, ${fullName}!`, 'success');
           window.location.href = 'http://localhost:3000/search.html';
        } catch (error) {
            this.showMessage('Error selecting role: ' + error.message, 'error');
        }
    }

    async login(email, password) {
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
            const data = await this.apiRequest('/auth/login', {
                method: 'POST',
                body: { email, password }
            });

            this.setToken(data.token);

            if (data.needsRoleSelection) {
                this.resumeRoleSelection(data.user);
                this.showMessage('Please complete role selection to continue.', 'success');
                return true;
            }

            this.currentUser = data.user;
            this.saveSession(this.currentUser);
            this.showMessage('Login successful!', 'success');
            window.location.href = '/search.html'; 
            return true;
        } catch (error) {
            if (error.message === 'Email not found') {
                this.showError('loginEmailError', error.message);
            } else if (error.message === 'Incorrect password') {
                this.showError('loginPasswordError', error.message);
            } else {
                this.showMessage('Login failed: ' + error.message, 'error');
            }
            return false;
        }
    }

    logout() {
        this.currentUser = null;
        this.pendingUser = null;
        this.clearSession();
        this.navigateToLogin();
        this.updateNavBar();
        return true;
    }

    // ==================== Navigation ====================

    navigateToSignup() {
        this.hidePage('loginPage');
        this.hidePage('dashboardPage');
        this.hidePage('roleSelectionPage');
        this.showPage('signupPage');
        this.resetForm('signupForm');
        this.clearErrors([
            'firstNameError',
            'lastNameError',
            'emailError',
            'phoneError',
            'passwordError',
            'confirmError'
        ]);
        this.updateNavBar();
    }

    navigateToLogin() {
        this.hidePage('signupPage');
        this.hidePage('dashboardPage');
        this.hidePage('roleSelectionPage');
        this.showPage('loginPage');
        this.resetForm('loginForm');
        this.updateNavBar();
    }

    navigateToRoleSelection() {
        this.hidePage('signupPage');
        this.hidePage('loginPage');
        this.hidePage('dashboardPage');
        this.showPage('roleSelectionPage');
        this.updateNavBar();
    }

    navigateToDashboard() {
     window.location.href = '/search.html';
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
        const fullName = `${this.currentUser.firstName} ${this.currentUser.lastName}`;
        document.getElementById('dashboardName').textContent = fullName;
        document.getElementById('dashboardEmail').textContent = this.currentUser.email;
        document.getElementById('dashboardPhone').textContent = this.currentUser.phone;
        
        // Format role display
        const roleDisplay = this.currentUser.role 
            ? this.currentUser.role.charAt(0).toUpperCase() + this.currentUser.role.slice(1)
            : 'N/A';
        document.getElementById('dashboardRole').textContent = roleDisplay;

        // Show admin panel only for admins (if admin role exists)
        const adminPanel = document.getElementById('adminPanel');
        if (this.currentUser.role === 'admin') {
            adminPanel.style.display = 'block';
        } else {
            adminPanel.style.display = 'none';
            document.getElementById('usersListContainer').style.display = 'none';
        }
    }

    async displayAllUsers() {
        try {
            const data = await this.apiRequest('/users', { auth: true });
            const tableBody = document.getElementById('usersTableBody');
            tableBody.innerHTML = '';

            data.users.forEach((user) => {
                if (user.role === 'admin') return;

                const row = tableBody.insertRow();
                const fullName = `${user.firstName} ${user.lastName}`;

                const nameCell = row.insertCell();
                nameCell.textContent = fullName;

                const emailCell = row.insertCell();
                emailCell.textContent = user.email;

                const phoneCell = row.insertCell();
                phoneCell.textContent = user.phone;

                const roleCell = row.insertCell();
                roleCell.textContent = user.role || 'N/A';

                const actionCell = row.insertCell();
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'btn btn-delete';
                deleteBtn.textContent = 'Delete';
                deleteBtn.addEventListener('click', () => this.deleteUser(user.id));
                actionCell.appendChild(deleteBtn);
            });

            document.getElementById('usersListContainer').style.display = 'block';
        } catch (error) {
            this.showMessage('Failed to load users: ' + error.message, 'error');
        }
    }

    async deleteUser(userId) {
        if (!confirm('Are you sure you want to delete this user?')) {
            return;
        }

        try {
            await this.apiRequest(`/users/${userId}`, {
                method: 'DELETE',
                auth: true
            });
            this.displayAllUsers();
            this.showMessage('User has been deleted.', 'success');
        } catch (error) {
            this.showMessage('Delete failed: ' + error.message, 'error');
        }
    }

    async createAdmin(email) {
        // Validate inputs
        if (!this.validateEmail(email)) {
            throw new Error('Invalid email format');
        }

        try {
            const data = await this.apiRequest('/users/admin/create', {
                method: 'POST',
                auth: true,
                body: { email }
            });

            this.showMessage(data.message, 'success');
            this.resetForm('createAdminForm');
            document.getElementById('newAdminEmailError').textContent = '';
            return true;
        } catch (error) {
            throw error;
        }
    }

    // ==================== UI Updates ====================

    updateNavBar() {
        const navRight = document.getElementById('navRight');
        const logoutBtn = document.getElementById('logoutBtn');
        const userInfo = document.getElementById('userInfo');
        const loginBtn = document.getElementById('loginBtn');
        const signupBtn = document.getElementById('signupBtn');

        // Check which auth page is currently visible
        const signupPageVisible = document.getElementById('signupPage')?.style.display !== 'none';
        const loginPageVisible = document.getElementById('loginPage')?.style.display !== 'none';

        if (this.currentUser) {
            if (logoutBtn) logoutBtn.style.display = 'block';
            if (userInfo) userInfo.style.display = 'block';
            if (loginBtn) loginBtn.style.display = 'none';
            if (signupBtn) signupBtn.style.display = 'none';
            const fullName = `${this.currentUser.firstName} ${this.currentUser.lastName}`;
            if (userInfo) userInfo.textContent = `${fullName} (${this.currentUser.role})`;
        } else {
            if (logoutBtn) logoutBtn.style.display = 'none';
            if (userInfo) userInfo.style.display = 'none';
            // Hide login/signup buttons when on those pages, show them otherwise
            if (signupPageVisible || loginPageVisible) {
                if (loginBtn) loginBtn.style.display = 'none';
                if (signupBtn) signupBtn.style.display = 'none';
            } else {
                if (loginBtn) loginBtn.style.display = 'block';
                if (signupBtn) signupBtn.style.display = 'block';
            }
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

        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.hash = 'login';
                this.navigateToLogin();
            });
        }

        const signupBtn = document.getElementById('signupBtn');
        if (signupBtn) {
            signupBtn.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.hash = 'signup';
                this.navigateToSignup();
            });
        }

        // Forms
        document.getElementById('signupForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const firstName = document.getElementById('signupFirstName').value;
            const lastName = document.getElementById('signupLastName').value;
            const email = document.getElementById('signupEmail').value;
            const phone = document.getElementById('signupPhone').value;
            const password = document.getElementById('signupPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            await this.signup(firstName, lastName, email, phone, password, confirmPassword);
        });

        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            await this.login(email, password);
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

        // Admin - Create Admin
        document.getElementById('createAdminForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                const email = document.getElementById('newAdminEmail').value;
                await this.createAdmin(email);
            } catch (error) {
                this.showError('newAdminEmailError', error.message);
            }
        });

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

    async checkSession() {
        const token = this.getToken();

        if (token) {
            try {
                const data = await this.apiRequest('/auth/me', { auth: true });

                if (this.needsRoleSelection(data.user)) {
                    this.pendingUser = data.user;
                    this.currentUser = null;
                    this.navigateToRoleSelection();
                    this.updateNavBar();
                    return;
                }

                this.currentUser = data.user;
                this.pendingUser = null;
                this.saveSession(this.currentUser);
                this.navigateToDashboard();
                this.updateNavBar();
                return;
            } catch (error) {
                this.clearSession();
            }
        }

        const hash = window.location.hash;
        if (hash === '#login') {
            this.navigateToLogin();
        } else {
            this.navigateToSignup();
        }
        this.updateNavBar();

        window.addEventListener('hashchange', () => {
            if (!this.currentUser) {
                const newHash = window.location.hash;
                if (newHash === '#login') {
                    this.navigateToLogin();
                } else if (newHash === '#signup') {
                    this.navigateToSignup();
                }
            }
        });
    }
}

// ==================== Initialize ====================

let authSystem;

document.addEventListener('DOMContentLoaded', () => {
    authSystem = new AuthSystem();
    authSystem.attachEventListeners();
    authSystem.checkSession();
});

// ==================== Utility Functions ====================

function closeMessage() {
    document.getElementById('successMessage').classList.remove('show');
    document.getElementById('errorMessage').classList.remove('show');
}
