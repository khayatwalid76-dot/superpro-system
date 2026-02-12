// SUPER_PRO SYSTEM - الملف الموحد للجافاسكريبت
// ================================================

// ===== إعدادات Firebase =====
const firebaseConfig = {
    apiKey: "AIzaSyClOXATkxQ8XLrorz80JhkUdxXjbcySr2E",
    authDomain: "superpro-system-8871f.firebaseapp.com",
    projectId: "superpro-system-8871f",
    storageBucket: "superpro-system-8871f.firebasestorage.app",
    messagingSenderId: "318335312258",
    appId: "1:318335312258:web:42879aaee5fc8b9a126f9b",
    measurementId: "G-X4RJQYCS7N",
    databaseURL: "https://superpro-system-8871f-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

// ===== التخزين السحابي =====
class CloudStorage {
    constructor() {
        this.isConfigured = false;
        this.db = null;
    }

    async initialize(config) {
        try {
            this.db = firebase.database();
            this.isConfigured = true;
            return true;
        } catch (error) {
            console.error('فشل تهيئة التخزين السحابي:', error);
            return false;
        }
    }

    async saveData(data) {
        if (!this.isConfigured) return false;
        
        try {
            await this.db.ref('data').set({
                ...data,
                lastUpdated: new Date().toISOString()
            });
            return true;
        } catch (error) {
            console.error('فشل حفظ البيانات:', error);
            return false;
        }
    }

    async loadData() {
        if (!this.isConfigured) return null;
        
        try {
            const snapshot = await this.db.ref('data').once('value');
            return snapshot.val();
        } catch (error) {
            console.error('فشل تحميل البيانات:', error);
            return null;
        }
    }
}

// ===== المتغيرات العامة =====
let employees = [];
let clients = [];
let contracts = [];
let attendance = [];
let services = [];
let settings = {};
let tasks = [];
let events = [];
let dailyWork = [];
let dailyIncome = [];
let dailyExpenses = [];
let financialTransactions = [];
let salaryAdvances = [];

// ===== دوال التخزين المحلي =====
function saveData() {
    sessionStorage.setItem('superpro_employees', JSON.stringify(employees));
    sessionStorage.setItem('superpro_clients', JSON.stringify(clients));
    sessionStorage.setItem('superpro_contracts', JSON.stringify(contracts));
    sessionStorage.setItem('superpro_attendance', JSON.stringify(attendance));
    sessionStorage.setItem('superpro_services', JSON.stringify(services));
    sessionStorage.setItem('superpro_settings', JSON.stringify(settings));
    sessionStorage.setItem('superpro_tasks', JSON.stringify(tasks));
    sessionStorage.setItem('superpro_events', JSON.stringify(events));
    sessionStorage.setItem('superpro_dailyWork', JSON.stringify(dailyWork));
    sessionStorage.setItem('superpro_dailyIncome', JSON.stringify(dailyIncome));
    sessionStorage.setItem('superpro_dailyExpenses', JSON.stringify(dailyExpenses));
    sessionStorage.setItem('superpro_financialTransactions', JSON.stringify(financialTransactions));
    sessionStorage.setItem('superpro_salaryAdvances', JSON.stringify(salaryAdvances));
}

function loadData() {
    const savedEmployees = sessionStorage.getItem('superpro_employees');
    const savedClients = sessionStorage.getItem('superpro_clients');
    const savedContracts = sessionStorage.getItem('superpro_contracts');
    const savedAttendance = sessionStorage.getItem('superpro_attendance');
    const savedServices = sessionStorage.getItem('superpro_services');
    const savedSettings = sessionStorage.getItem('superpro_settings');
    const savedTasks = sessionStorage.getItem('superpro_tasks');
    const savedEvents = sessionStorage.getItem('superpro_events');
    const savedDailyWork = sessionStorage.getItem('superpro_dailyWork');
    const savedDailyIncome = sessionStorage.getItem('superpro_dailyIncome');
    const savedDailyExpenses = sessionStorage.getItem('superpro_dailyExpenses');
    const savedFinancialTransactions = sessionStorage.getItem('superpro_financialTransactions');
    const savedSalaryAdvances = sessionStorage.getItem('superpro_salaryAdvances');

    if (savedEmployees) employees = JSON.parse(savedEmployees);
    if (savedClients) clients = JSON.parse(savedClients);
    if (savedContracts) contracts = JSON.parse(savedContracts);
    if (savedAttendance) attendance = JSON.parse(savedAttendance);
    if (savedServices) services = JSON.parse(savedServices);
    if (savedSettings) settings = JSON.parse(savedSettings);
    if (savedTasks) tasks = JSON.parse(savedTasks);
    if (savedEvents) events = JSON.parse(savedEvents);
    if (savedDailyWork) dailyWork = JSON.parse(savedDailyWork);
    if (savedDailyIncome) dailyIncome = JSON.parse(savedDailyIncome);
    if (savedDailyExpenses) dailyExpenses = JSON.parse(savedDailyExpenses);
    if (savedFinancialTransactions) financialTransactions = JSON.parse(savedFinancialTransactions);
    if (savedSalaryAdvances) salaryAdvances = JSON.parse(savedSalaryAdvances);
}

// ===== نظام المزامنة التلقائية =====
class AutoSync {
    constructor() {
        this.cloudStorage = new CloudStorage();
        this.syncInterval = null;
    }

    async initialize() {
        await this.cloudStorage.initialize(firebaseConfig);
        this.setupAutoSync();
        this.loadFromCloud();
    }

    setupAutoSync() {
        // حفظ تلقائي كل 5 دقائق
        this.syncInterval = setInterval(() => {
            this.saveToCloud();
        }, 300000);

        // حفظ عند إغلاق الصفحة
        window.addEventListener('beforeunload', () => {
            this.saveToCloud();
        });
    }

    async saveToCloud() {
        const allData = {
            employees, clients, contracts, attendance, services, settings,
            tasks, events, dailyWork, dailyIncome, dailyExpenses,
            financialTransactions, salaryAdvances
        };

        const success = await this.cloudStorage.saveData(allData);
        if (success) {
            console.log('✅ تم حفظ البيانات في السحابة');
        }
    }

    async loadFromCloud() {
        try {
            const data = await this.cloudStorage.loadData();
            if (data) {
                Object.assign(window, data);
                saveData();
                console.log('✅ تم تحميل البيانات من السحابة');
                return true;
            }
        } catch (error) {
            console.log('📭 لا توجد بيانات في السحابة');
        }
        return false;
    }
}

// ===== الإشعارات الذكية =====
class NotificationManager {
    constructor() {
        this.notifications = [];
        this.unreadCount = 0;
    }

    addNotification(notif) {
        const id = Date.now() + Math.random();
        const exists = this.notifications.some(n => n.message === notif.message && 
            new Date(n.time) > new Date(Date.now() - 86400000));
        
        if (exists) return;
        
        this.notifications.unshift({
            id,
            ...notif,
            time: new Date().toISOString(),
            read: false
        });

        if (this.notifications.length > 50) this.notifications.pop();
        
        this.unreadCount = this.notifications.filter(n => !n.read).length;
        this.updateBadge();
        this.updateList();
    }

    updateBadge() {
        const badge = document.getElementById('notificationBadge');
        if (badge) {
            badge.textContent = this.unreadCount;
            badge.style.display = this.unreadCount > 0 ? 'flex' : 'none';
        }
    }

    updateList() {
        const list = document.getElementById('notificationList');
        if (!list) return;

        if (this.notifications.length === 0) {
            list.innerHTML = '<div class="p-3 text-center text-muted">لا توجد إشعارات</div>';
            return;
        }

        let html = '';
        this.notifications.slice(0, 20).forEach(notif => {
            const timeAgo = this.getTimeAgo(new Date(notif.time));
            const unreadClass = notif.read ? '' : 'unread';
            const iconClass = notif.type === 'danger' ? 'exclamation-triangle' : 
                             notif.type === 'warning' ? 'clock' : 'info-circle';
            
            html += `
                <div class="notification-item ${unreadClass}" data-id="${notif.id}">
                    <div class="notification-icon">
                        <i class="fas fa-${iconClass}"></i>
                    </div>
                    <div class="notification-content">
                        <div class="notification-title">${notif.title}</div>
                        <div class="notification-message small">${notif.message}</div>
                        <div class="notification-time">${timeAgo}</div>
                    </div>
                    <div class="notification-actions">
                        <button class="mark-read-btn" onclick="notificationManager.markRead('${notif.id}')" title="تحديد كمقروء">
                            <i class="fas fa-check-circle"></i>
                        </button>
                    </div>
                </div>
            `;
        });
        
        list.innerHTML = html;
    }

    markRead(id) {
        const notif = this.notifications.find(n => n.id == id);
        if (notif) {
            notif.read = true;
            this.unreadCount = this.notifications.filter(n => !n.read).length;
            this.updateBadge();
            this.updateList();
        }
    }

    markAllRead() {
        this.notifications.forEach(n => n.read = true);
        this.unreadCount = 0;
        this.updateBadge();
        this.updateList();
    }

    getTimeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        if (seconds < 60) return 'الآن';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `منذ ${minutes} دقيقة`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `منذ ${hours} ساعة`;
        const days = Math.floor(hours / 24);
        return `منذ ${days} يوم`;
    }

    generateAlerts() {
        const today = new Date();
        
        // التحقق من العقود
        contracts.forEach(c => {
            if (c.endDate) {
                const end = new Date(c.endDate);
                const daysLeft = Math.ceil((end - today) / (1000*60*60*24));
                if (daysLeft <= 7 && daysLeft >= 0) {
                    this.addNotification({
                        title: 'عقد على وشك الانتهاء',
                        message: `العقد رقم ${c.number} مع ${c.client} ينتهي بعد ${daysLeft} يوم`,
                        type: 'warning',
                        link: 'contracts'
                    });
                }
            }
        });

        // التحقق من الإقامات
        employees.forEach(e => {
            if (e.residencyExpiry) {
                const exp = new Date(e.residencyExpiry);
                const daysLeft = Math.ceil((exp - today) / (1000*60*60*24));
                if (daysLeft <= 30 && daysLeft >= 0) {
                    this.addNotification({
                        title: 'إقامة على وشك الانتهاء',
                        message: `إقامة ${e.name} تنتهي بعد ${daysLeft} يوم`,
                        type: 'danger',
                        link: 'employees'
                    });
                }
            }
        });

        // التحقق من المدفوعات المتأخرة
        dailyWork.forEach(w => {
            if (w.paymentStatus === 'غير مدفوع' && w.date < today.toISOString().split('T')[0]) {
                this.addNotification({
                    title: 'دفعة متأخرة',
                    message: `عمل يومي للعميل ${w.client} بقيمة ${w.amount} ر.ق غير مسدد`,
                    type: 'danger',
                    link: 'dailyWork'
                });
            }
        });
    }
}

// ===== البحث الفوري =====
class GlobalSearch {
    constructor() {
        this.searchInput = document.getElementById('globalSearchInput');
        this.resultsDiv = document.getElementById('globalSearchResults');
        this.setupEvents();
    }

    setupEvents() {
        if (!this.searchInput) return;
        
        this.searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim().toLowerCase();
            if (query.length < 2) {
                this.resultsDiv.classList.remove('show');
                return;
            }
            
            this.performSearch(query);
        });

        document.addEventListener('click', (e) => {
            if (!this.searchInput.contains(e.target) && !this.resultsDiv.contains(e.target)) {
                this.resultsDiv.classList.remove('show');
            }
        });
    }

    performSearch(query) {
        const results = [];
        
        // البحث في الموظفين
        employees.forEach(emp => {
            if ((emp.name && emp.name.toLowerCase().includes(query)) ||
                (emp.job && emp.job.toLowerCase().includes(query)) ||
                (emp.nationality && emp.nationality.toLowerCase().includes(query))) {
                results.push({
                    type: 'employee',
                    title: emp.name,
                    subtitle: emp.job + ' - ' + emp.nationality,
                    icon: 'fas fa-user',
                    module: 'employees'
                });
            }
        });

        // البحث في العملاء
        clients.forEach(cl => {
            if ((cl.name && cl.name.toLowerCase().includes(query)) ||
                (cl.phone && cl.phone.includes(query))) {
                results.push({
                    type: 'client',
                    title: cl.name,
                    subtitle: cl.phone + ' - ' + (cl.area || ''),
                    icon: 'fas fa-user-tie',
                    module: 'clients'
                });
            }
        });

        // البحث في العقود
        contracts.forEach(ct => {
            if ((ct.number && ct.number.toLowerCase().includes(query)) ||
                (ct.client && ct.client.toLowerCase().includes(query)) ||
                (ct.employee && ct.employee.toLowerCase().includes(query))) {
                results.push({
                    type: 'contract',
                    title: 'عقد ' + (ct.number || ''),
                    subtitle: ct.client + ' - ' + ct.employee,
                    icon: 'fas fa-file-contract',
                    module: 'contracts'
                });
            }
        });

        this.displayResults(results, query);
    }

    displayResults(results, query) {
        if (results.length === 0) {
            this.resultsDiv.innerHTML = '<div class="p-3 text-muted">لا توجد نتائج</div>';
            this.resultsDiv.classList.add('show');
            return;
        }

        let html = '';
        results.slice(0, 10).forEach(res => {
            html += `
                <div class="search-result-item" data-module="${res.module}" data-search-term="${res.title}">
                    <div class="search-result-icon">
                        <i class="${res.icon}"></i>
                    </div>
                    <div class="search-result-info">
                        <div class="search-result-title">${res.title}</div>
                        <div class="search-result-subtitle">${res.subtitle}</div>
                    </div>
                    <span class="search-result-type">${res.type}</span>
                </div>
            `;
        });

        this.resultsDiv.innerHTML = html;
        this.resultsDiv.classList.add('show');

        this.resultsDiv.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', () => {
                const module = item.dataset.module;
                const moduleLink = document.querySelector(`.nav-link[data-module="${module}"]`);
                if (moduleLink) {
                    moduleLink.click();
                }
                this.searchInput.value = '';
                this.resultsDiv.classList.remove('show');
            });
        });
    }
}

// ===== تهيئة النظام =====
let autoSync;
let notificationManager;
let globalSearch;

// تهيئة Firebase
firebase.initializeApp(firebaseConfig);

window.addEventListener('DOMContentLoaded', function() {
    // تحميل البيانات المحلية
    loadData();
    
    // تحميل إعدادات الوصولية
    loadAccessibilitySettings();
    
    // تهيئة الأنظمة
    autoSync = new AutoSync();
    notificationManager = new NotificationManager();
    globalSearch = new GlobalSearch();
    
    // بدء المزامنة
    autoSync.initialize();
    
    // توليد الإشعارات
    notificationManager.generateAlerts();
    setInterval(() => notificationManager.generateAlerts(), 300000);
    
    // إعداد أحديث الإشعارات
    const notificationBell = document.getElementById('notificationBell');
    const notificationPanel = document.getElementById('notificationPanel');
    const closeNotificationPanel = document.getElementById('closeNotificationPanel');
    const markAllReadBtn = document.getElementById('markAllReadBtn');
    
    if (notificationBell) {
        notificationBell.addEventListener('click', () => {
            notificationPanel.classList.toggle('show');
            if (notificationPanel.classList.contains('show')) {
                notificationManager.updateList();
            }
        });
    }
    
    if (closeNotificationPanel) {
        closeNotificationPanel.addEventListener('click', () => {
            notificationPanel.classList.remove('show');
        });
    }
    
    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', () => {
            notificationManager.markAllRead();
        });
    }
    
    console.log('✅ تم تهيئة النظام بنجاح');
});

// ===== دوال عالمية =====
window.saveToCloud = async function() {
    if (autoSync) {
        await autoSync.saveToCloud();
        showToast('تم حفظ البيانات في السحابة', 'success');
    }
};

window.loadFromCloud = async function() {
    if (autoSync) {
        const success = await autoSync.loadFromCloud();
        if (success) {
            showToast('تم تحميل البيانات من السحابة', 'success');
            location.reload();
        }
    }
};

window.showToast = function(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    toast.style.cssText = 'top: 20px; left: 20px; z-index: 9999; min-width: 300px;';
    toast.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        if (document.body.contains(toast)) {
            document.body.removeChild(toast);
        }
    }, 5000);
};

// ===== دوال الوصولية =====
window.toggleHighContrast = function() {
    document.body.classList.toggle('high-contrast');
    const isHighContrast = document.body.classList.contains('high-contrast');
    localStorage.setItem('highContrast', isHighContrast);
    showToast(isHighContrast ? 'تم تفعيل التباين العالي' : 'تم إلغاء التباين العالي');
};

window.toggleLargeText = function() {
    document.body.classList.toggle('large-text');
    const isLargeText = document.body.classList.contains('large-text');
    localStorage.setItem('largeText', isLargeText);
    showToast(isLargeText ? 'تم تكبير النص' : 'تم إعادة النص للحجم الطبيعي');
};

window.toggleDarkMode = function() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
    
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        const icon = darkModeToggle.querySelector('i');
        icon.className = isDarkMode ? 'fas fa-sun' : 'fas fa-moon';
    }
    
    showToast(isDarkMode ? 'تم تفعيل الوضع الليلي' : 'تم إلغاء الوضع الليلي');
};

// تحميل إعدادات الوصولية
function loadAccessibilitySettings() {
    const highContrast = localStorage.getItem('highContrast') === 'true';
    const largeText = localStorage.getItem('largeText') === 'true';
    const darkMode = localStorage.getItem('darkMode') === 'true';
    
    if (highContrast) document.body.classList.add('high-contrast');
    if (largeText) document.body.classList.add('large-text');
    if (darkMode) {
        document.body.classList.add('dark-mode');
        const darkModeToggle = document.getElementById('darkModeToggle');
        if (darkModeToggle) {
            const icon = darkModeToggle.querySelector('i');
            icon.className = 'fas fa-sun';
        }
    }
}

// تحسينات لوحة المفاتيح
document.addEventListener('keydown', function(e) {
    // ESC لإغلاق النوافذ المنبثقة
    if (e.key === 'Escape') {
        const modals = document.querySelectorAll('.modal.show');
        modals.forEach(modal => {
            const modalInstance = bootstrap.Modal.getInstance(modal);
            if (modalInstance) modalInstance.hide();
        });
        
        // إغلاق لوحة الإشعارات
        const notificationPanel = document.getElementById('notificationPanel');
        if (notificationPanel && notificationPanel.classList.contains('show')) {
            notificationPanel.classList.remove('show');
        }
    }
    
    // Alt + A للتركيز على البحث
    if (e.altKey && e.key === 'a') {
        e.preventDefault();
        const searchInput = document.getElementById('globalSearchInput');
        if (searchInput) searchInput.focus();
    }
    
    // Alt + M للقائمة الرئيسية
    if (e.altKey && e.key === 'm') {
        e.preventDefault();
        const firstNavLink = document.querySelector('.nav-link');
        if (firstNavLink) firstNavLink.focus();
    }
});

console.log('🚀 تم تحميل SUPER_PRO SYSTEM بنجاح');
