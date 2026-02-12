// نظام المصادقة والأدوار المتقدمة
// Advanced Authentication & Authorization System

class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.users = JSON.parse(localStorage.getItem('users') || '[]');
        this.roles = {
            admin: {
                name: 'مدير النظام',
                permissions: ['*'], // كل الصلاحيات
                color: '#dc3545'
            },
            manager: {
                name: 'مدير',
                permissions: [
                    'employees.read', 'employees.write',
                    'clients.read', 'clients.write',
                    'contracts.read', 'contracts.write',
                    'reports.read', 'reports.export',
                    'attendance.read', 'attendance.write'
                ],
                color: '#fd7e14'
            },
            hr: {
                name: 'موارد بشرية',
                permissions: [
                    'employees.read', 'employees.write',
                    'attendance.read', 'attendance.write',
                    'payroll.read', 'payroll.write'
                ],
                color: '#20c997'
            },
            accountant: {
                name: 'محاسب',
                permissions: [
                    'finance.read', 'finance.write',
                    'reports.read', 'reports.export',
                    'contracts.read'
                ],
                color: '#0d6efd'
            },
            employee: {
                name: 'موظف',
                permissions: [
                    'profile.read', 'profile.write',
                    'attendance.read',
                    'tasks.read', 'tasks.write'
                ],
                color: '#6c757d'
            }
        };
        this.init();
    }

    init() {
        this.setupAuthPages();
        this.checkAuthStatus();
        this.setupSessionTimeout();
        this.addAuthUI();
    }

    // إعداد صفحات المصادقة
    setupAuthPages() {
        const path = window.location.pathname;
        const isLoginPage = path.includes('login') || path.includes('auth');
        
        if (isLoginPage && !this.isLoggedIn()) {
            this.showLoginPage();
        } else if (!this.isLoggedIn() && !isLoginPage) {
            this.redirectToLogin();
        } else if (this.isLoggedIn()) {
            this.setupUserInterface();
        }
    }

    // التحقق من حالة المصادقة
    checkAuthStatus() {
        const token = localStorage.getItem('authToken');
        const user = localStorage.getItem('currentUser');
        
        if (token && user) {
            try {
                this.currentUser = JSON.parse(user);
                if (this.isTokenValid(token)) {
                    this.startSessionTimer();
                } else {
                    this.logout();
                }
            } catch (error) {
                this.logout();
            }
        }
    }

    // التحقق من صلاحية التوكن
    isTokenValid(token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp > Date.now() / 1000;
        } catch (error) {
            return false;
        }
    }

    // إنشاء توكن JWT (بسيط - استخدم مكتبة حقيقية في الإنتاج)
    generateToken(user) {
        const header = { alg: 'HS256', typ: 'JWT' };
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 ساعة
            iat: Math.floor(Date.now() / 1000)
        };
        
        // في التطبيق الحقيقي استخدم مكتبة JWT
        return btoa(JSON.stringify(header)) + '.' + 
               btoa(JSON.stringify(payload)) + '.' + 
               btoa('signature');
    }

    // تسجيل الدخول
    async login(email, password, rememberMe = false) {
        try {
            // البحث عن المستخدم
            const user = this.users.find(u => u.email === email);
            
            if (!user) {
                throw new Error('المستخدم غير موجود');
            }
            
            // التحقق من كلمة المرور
            const isPasswordValid = await this.verifyPassword(password, user.password);
            
            if (!isPasswordValid) {
                throw new Error('كلمة المرور غير صحيحة');
            }
            
            // التحقق من حالة المستخدم
            if (user.status !== 'active') {
                throw new Error('الحساب غير نشط');
            }
            
            // إنشاء توكن
            const token = this.generateToken(user);
            
            // حفظ الجلسة
            localStorage.setItem('authToken', token);
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            if (rememberMe) {
                localStorage.setItem('rememberMe', 'true');
            }
            
            this.currentUser = user;
            this.startSessionTimer();
            
            // تسجيل الدخول
            this.logAuthEvent('login', user.id);
            
            // توجيه حسب الدور
            this.redirectUserByRole();
            
            return { success: true, user: this.sanitizeUser(user) };
            
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message };
        }
    }

    // تسجيل الخروج
    logout() {
        const userId = this.currentUser?.id;
        
        // مسح الجلسة
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('rememberMe');
        
        // تسجيل الخروج
        if (userId) {
            this.logAuthEvent('logout', userId);
        }
        
        this.currentUser = null;
        
        // إيقاف المؤقت
        if (this.sessionTimer) {
            clearTimeout(this.sessionTimer);
        }
        
        // توجيه لصفحة الدخول
        this.redirectToLogin();
    }

    // تسجيل مستخدم جديد
    async register(userData) {
        try {
            // التحقق من وجود البريد الإلكتروني
            const existingUser = this.users.find(u => u.email === userData.email);
            if (existingUser) {
                throw new Error('البريد الإلكتروني مسجل بالفعل');
            }
            
            // تشفير كلمة المرور
            const hashedPassword = await this.hashPassword(userData.password);
            
            // إنشاء مستخدم جديد
            const newUser = {
                id: this.generateId(),
                email: userData.email,
                password: hashedPassword,
                name: userData.name,
                role: userData.role || 'employee',
                department: userData.department || '',
                phone: userData.phone || '',
                status: 'active',
                createdAt: new Date().toISOString(),
                lastLogin: null,
                preferences: {
                    language: 'ar',
                    theme: 'light',
                    notifications: true
                }
            };
            
            this.users.push(newUser);
            localStorage.setItem('users', JSON.stringify(this.users));
            
            // تسجيل التسجيل
            this.logAuthEvent('register', newUser.id);
            
            return { success: true, user: this.sanitizeUser(newUser) };
            
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, error: error.message };
        }
    }

    // تعديل كلمة المرور
    async changePassword(oldPassword, newPassword) {
        try {
            if (!this.currentUser) {
                throw new Error('المستخدم غير مسجل الدخول');
            }
            
            // التحقق من كلمة المرور القديمة
            const user = this.users.find(u => u.id === this.currentUser.id);
            const isOldPasswordValid = await this.verifyPassword(oldPassword, user.password);
            
            if (!isOldPasswordValid) {
                throw new Error('كلمة المرور القديمة غير صحيحة');
            }
            
            // تشفير وتحديث كلمة المرور الجديدة
            user.password = await this.hashPassword(newPassword);
            user.passwordChangedAt = new Date().toISOString();
            
            // تحديث المستخدمين
            const index = this.users.findIndex(u => u.id === user.id);
            this.users[index] = user;
            localStorage.setItem('users', JSON.stringify(this.users));
            
            // تسجيل التغيير
            this.logAuthEvent('password_change', user.id);
            
            return { success: true };
            
        } catch (error) {
            console.error('Password change error:', error);
            return { success: false, error: error.message };
        }
    }

    // التحقق من الصلاحيات
    hasPermission(permission) {
        if (!this.currentUser) return false;
        
        const userRole = this.roles[this.currentUser.role];
        if (!userRole) return false;
        
        // المدير لديه كل الصلاحيات
        if (userRole.permissions.includes('*')) return true;
        
        return userRole.permissions.includes(permission);
    }

    // التحقق من الدور
    hasRole(role) {
        return this.currentUser?.role === role;
    }

    // الحصول على المستخدمين (للمدير فقط)
    getUsers() {
        if (!this.hasPermission('users.read')) {
            throw new Error('ليس لديك صلاحية لعرض المستخدمين');
        }
        
        return this.users.map(user => this.sanitizeUser(user));
    }

    // تعديل المستخدم
    async updateUser(userId, userData) {
        if (!this.hasPermission('users.write')) {
            throw new Error('ليس لديك صلاحية لتعديل المستخدمين');
        }
        
        const userIndex = this.users.findIndex(u => u.id === userId);
        if (userIndex === -1) {
            throw new Error('المستخدم غير موجود');
        }
        
        // لا يمكن تعديل الدور إلا للمدير
        if (userData.role && !this.hasRole('admin')) {
            delete userData.role;
        }
        
        // لا يمكن تعديل كلمة المرور بهذه الطريقة
        delete userData.password;
        
        const updatedUser = { ...this.users[userIndex], ...userData };
        this.users[userIndex] = updatedUser;
        localStorage.setItem('users', JSON.stringify(this.users));
        
        // تسجيل التعديل
        this.logAuthEvent('user_update', userId);
        
        return this.sanitizeUser(updatedUser);
    }

    // حذف المستخدم
    async deleteUser(userId) {
        if (!this.hasPermission('users.delete')) {
            throw new Error('ليس لديك صلاحية لحذف المستخدمين');
        }
        
        if (userId === this.currentUser.id) {
            throw new Error('لا يمكن حذف حسابك الحالي');
        }
        
        const userIndex = this.users.findIndex(u => u.id === userId);
        if (userIndex === -1) {
            throw new Error('المستخدم غير موجود');
        }
        
        this.users.splice(userIndex, 1);
        localStorage.setItem('users', JSON.stringify(this.users));
        
        // تسجيل الحذف
        this.logAuthEvent('user_delete', userId);
        
        return { success: true };
    }

    // تشفير كلمة المرور
    async hashPassword(password) {
        // في التطبيق الحقيقي استخدم bcrypt أو Argon2
        const encoder = new TextEncoder();
        const data = encoder.encode(password + 'superpro-salt');
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        return btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));
    }

    // التحقق من كلمة المرور
    async verifyPassword(password, hashedPassword) {
        const inputHash = await this.hashPassword(password);
        return inputHash === hashedPassword;
    }

    // تنظيف بيانات المستخدم
    sanitizeUser(user) {
        const { password, ...sanitizedUser } = user;
        return sanitizedUser;
    }

    // إنشاء ID فريد
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // بدء مؤقت الجلسة
    startSessionTimer() {
        const sessionDuration = 8 * 60 * 60 * 1000; // 8 ساعات
        
        this.sessionTimer = setTimeout(() => {
            this.showSessionExpiryWarning();
        }, sessionDuration);
    }

    // إعداد انتهاء الجلسة
    setupSessionTimeout() {
        // تحذير قبل 5 دقائق من الانتهاء
        setInterval(() => {
            if (this.isLoggedIn() && this.isSessionExpiringSoon()) {
                this.showSessionExpiryWarning();
            }
        }, 60000); // كل دقيقة
    }

    // التحقق من قرب انتهاء الجلسة
    isSessionExpiringSoon() {
        const token = localStorage.getItem('authToken');
        if (!token) return false;
        
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const timeUntilExpiry = payload.exp * 1000 - Date.now();
            return timeUntilExpiry < 5 * 60 * 1000; // أقل من 5 دقائق
        } catch (error) {
            return false;
        }
    }

    // عرض تحذير انتهاء الجلسة
    showSessionExpiryWarning() {
        const warning = confirm('⚠️ ستنتهي جلستك خلال 5 دقائق. هل تريد تمديدها؟');
        
        if (warning) {
            this.extendSession();
        } else {
            this.logout();
        }
    }

    // تمديد الجلسة
    extendSession() {
        const token = this.generateToken(this.currentUser);
        localStorage.setItem('authToken', token);
        this.startSessionTimer();
        
        if (typeof showToast === 'function') {
            showToast('تم تمديد الجلسة', 'success');
        }
    }

    // تسجيل أحداث المصادقة
    logAuthEvent(event, userId) {
        const logs = JSON.parse(localStorage.getItem('authLogs') || '[]');
        
        logs.push({
            event,
            userId,
            timestamp: new Date().toISOString(),
            ip: 'client', // في الخادم الحقيقي احصل من IP
            userAgent: navigator.userAgent
        });
        
        // الاحتفاظ بآخر 1000 سجل
        if (logs.length > 1000) {
            logs.splice(0, logs.length - 1000);
        }
        
        localStorage.setItem('authLogs', JSON.stringify(logs));
    }

    // عرض صفحة الدخول
    showLoginPage() {
        const loginHTML = `
            <!DOCTYPE html>
            <html lang="ar" dir="rtl">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>تسجيل الدخول - SUPER_PRO SYSTEM</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
                <style>
                    body {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        min-height: 100vh;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
                    }
                    .login-container {
                        background: white;
                        border-radius: 20px;
                        box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                        padding: 40px;
                        width: 100%;
                        max-width: 400px;
                    }
                    .login-header {
                        text-align: center;
                        margin-bottom: 30px;
                    }
                    .login-header h2 {
                        color: #2c3e50;
                        margin-bottom: 10px;
                    }
                    .login-header p {
                        color: #6c757d;
                        margin: 0;
                    }
                    .form-floating {
                        margin-bottom: 20px;
                    }
                    .btn-login {
                        background: linear-gradient(45deg, #3498db, #2c3e50);
                        border: none;
                        padding: 12px;
                        font-weight: 600;
                        border-radius: 10px;
                    }
                    .btn-login:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 5px 15px rgba(52, 152, 219, 0.3);
                    }
                    .register-link {
                        text-align: center;
                        margin-top: 20px;
                    }
                    .register-link a {
                        color: #3498db;
                        text-decoration: none;
                        font-weight: 600;
                    }
                    .register-link a:hover {
                        text-decoration: underline;
                    }
                </style>
            </head>
            <body>
                <div class="login-container">
                    <div class="login-header">
                        <i class="fas fa-building fa-3x mb-3" style="color: #3498db;"></i>
                        <h2>SUPER PRO SYSTEM</h2>
                        <p>نظام إدارة الشركة المتكامل</p>
                    </div>
                    
                    <form id="loginForm">
                        <div class="form-floating">
                            <input type="email" class="form-control" id="email" placeholder="name@example.com" required>
                            <label for="email">البريد الإلكتروني</label>
                        </div>
                        
                        <div class="form-floating">
                            <input type="password" class="form-control" id="password" placeholder="كلمة المرور" required>
                            <label for="password">كلمة المرور</label>
                        </div>
                        
                        <div class="form-check mb-3">
                            <input class="form-check-input" type="checkbox" id="rememberMe">
                            <label class="form-check-label" for="rememberMe">
                                تذكرني
                            </label>
                        </div>
                        
                        <button type="submit" class="btn btn-primary btn-login w-100">
                            <i class="fas fa-sign-in-alt me-2"></i>
                            تسجيل الدخول
                        </button>
                    </form>
                    
                    <div class="register-link">
                        <p>ليس لديك حساب؟ <a href="#" onclick="authSystem.showRegisterPage()">سجل الآن</a></p>
                    </div>
                </div>
                
                <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
                <script>
                    document.getElementById('loginForm').addEventListener('submit', async (e) => {
                        e.preventDefault();
                        
                        const email = document.getElementById('email').value;
                        const password = document.getElementById('password').value;
                        const rememberMe = document.getElementById('rememberMe').checked;
                        
                        const result = await parent.authSystem.login(email, password, rememberMe);
                        
                        if (result.success) {
                            window.location.href = '/';
                        } else {
                            alert('خطأ: ' + result.error);
                        }
                    });
                </script>
            </body>
            </html>
        `;
        
        document.documentElement.innerHTML = loginHTML;
    }

    // عرض صفحة التسجيل
    showRegisterPage() {
        // يمكن تنفيذ صفحة التسجيل بشكل مشابه
        alert('صفحة التسجيل قيد التطوير');
    }

    // توجيه المستخدم حسب الدور
    redirectUserByRole() {
        const role = this.currentUser.role;
        const redirects = {
            admin: '/?module=settings',
            manager: '/?module=dashboard',
            hr: '/?module=employees',
            accountant: '/?module=finance',
            employee: '/?module=dashboard'
        };
        
        window.location.href = redirects[role] || '/';
    }

    // التوجيه لصفحة الدخول
    redirectToLogin() {
        window.location.href = '/login.html';
    }

    // إعداد واجهة المستخدم
    setupUserInterface() {
        this.addUserInfo();
        this.setupRoleBasedUI();
        this.addLogoutButton();
    }

    // إضافة معلومات المستخدم
    addUserInfo() {
        const userInfo = document.createElement('div');
        userInfo.className = 'dropdown me-2';
        userInfo.innerHTML = `
            <button class="btn btn-outline-light btn-sm dropdown-toggle" type="button" id="userDropdown" data-bs-toggle="dropdown">
                <i class="fas fa-user me-2"></i>
                ${this.currentUser.name}
                <span class="badge ms-2" style="background: ${this.roles[this.currentUser.role].color}">
                    ${this.roles[this.currentUser.role].name}
                </span>
            </button>
            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                <li><h6 class="dropdown-header">${this.currentUser.email}</h6></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item" href="#" onclick="authSystem.showProfile()">
                    <i class="fas fa-user me-2"></i>الملف الشخصي
                </a></li>
                <li><a class="dropdown-item" href="#" onclick="authSystem.showChangePassword()">
                    <i class="fas fa-key me-2"></i>تغيير كلمة المرور
                </a></li>
                <li><a class="dropdown-item" href="#" onclick="authSystem.showPreferences()">
                    <i class="fas fa-cog me-2"></i>التفضيلات
                </a></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item" href="#" onclick="authSystem.logout()">
                    <i class="fas fa-sign-out-alt me-2"></i>تسجيل الخروج
                </a></li>
            </ul>
        `;
        
        const navbar = document.querySelector('.navbar .d-flex.align-items-center');
        if (navbar) {
            navbar.appendChild(userInfo);
        }
    }

    // إعداد الواجهة حسب الدور
    setupRoleBasedUI() {
        // إخفاء العناصر غير المسموحة
        document.querySelectorAll('[data-permission]').forEach(element => {
            const permission = element.dataset.permission;
            if (!this.hasPermission(permission)) {
                element.style.display = 'none';
            }
        });
        
        // تعطيل الأزرار غير المسموحة
        document.querySelectorAll('[data-permission-action]').forEach(element => {
            const permission = element.dataset.permissionAction;
            if (!this.hasPermission(permission)) {
                element.disabled = true;
                element.title = 'ليس لديك صلاحية لهذا الإجراء';
            }
        });
    }

    // إضافة زر تسجيل الخروج
    addLogoutButton() {
        // تمت إضافته في القائمة المنسدلة للمستخدم
    }

    // عرض الملف الشخصي
    showProfile() {
        alert('الملف الشخصي قيد التطوير');
    }

    // عرض تغيير كلمة المرور
    showChangePassword() {
        const oldPassword = prompt('كلمة المرور القديمة:');
        const newPassword = prompt('كلمة المرور الجديدة:');
        const confirmPassword = prompt('تأكيد كلمة المرور الجديدة:');
        
        if (oldPassword && newPassword && confirmPassword) {
            if (newPassword !== confirmPassword) {
                alert('كلمات المرور الجديدة غير متطابقة');
                return;
            }
            
            this.changePassword(oldPassword, newPassword).then(result => {
                if (result.success) {
                    alert('تم تغيير كلمة المرور بنجاح');
                } else {
                    alert('خطأ: ' + result.error);
                }
            });
        }
    }

    // عرض التفضيلات
    showPreferences() {
        alert('التفضيلات قيد التطوير');
    }

    // التحقق من تسجيل الدخول
    isLoggedIn() {
        return this.currentUser !== null;
    }

    // الحصول على المستخدم الحالي
    getCurrentUser() {
        return this.sanitizeUser(this.currentUser);
    }

    // الحصول على دور المستخدم الحالي
    getCurrentRole() {
        return this.currentUser?.role;
    }
}

// تهيئة نظام المصادقة
let authSystem;

window.addEventListener('DOMContentLoaded', () => {
    authSystem = new AuthSystem();
    console.log('🔐 Auth System initialized');
});

console.log('🔐 Auth System loaded');
