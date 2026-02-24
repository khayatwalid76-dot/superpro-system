// تحسينات نظام الإشعارات والتخزين السحابي
// Enhanced Notification System & Cloud Storage Fixes

// إصلاح نظام الإشعارات
class EnhancedNotificationManager extends NotificationManager {
    constructor() {
        super();
        this.setupNotificationDropdown();
        this.setupNotificationEvents();
    }

    setupNotificationDropdown() {
        const bell = document.getElementById('notificationBell');
        const dropdown = document.getElementById('notificationDropdown');
        
        if (bell && dropdown) {
            bell.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown.classList.toggle('show');
                bell.setAttribute('aria-expanded', dropdown.classList.contains('show'));
            });

            // إغلاق القائمة عند النقر خارجها
            document.addEventListener('click', (e) => {
                if (!bell.contains(e.target) && !dropdown.contains(e.target)) {
                    dropdown.classList.remove('show');
                    bell.setAttribute('aria-expanded', 'false');
                }
            });
        }
    }

    setupNotificationEvents() {
        // طلب إذن الإشعارات عند التحميل
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }

    addNotification(notif) {
        super.addNotification(notif);
        
        // عرض إشعار المتصفح إذا كان الإذن ممنوحاً
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(notif.title, {
                body: notif.message,
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🔔</text></svg>',
                tag: 'superpro-' + Date.now()
            });
        }
    }

    updateList() {
        super.updateList();
        
        const list = document.getElementById('notificationList');
        if (!list) return;

        if (this.notifications.length === 0) {
            list.innerHTML = `
                <div class="text-center p-3 text-muted">
                    <i class="fas fa-bell-slash fa-2x mb-2"></i>
                    <p>لا توجد إشعارات</p>
                </div>
            `;
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
                    <div class="d-flex align-items-start">
                        <div class="notification-icon me-2">
                            <i class="fas fa-${iconClass} text-${notif.type}"></i>
                        </div>
                        <div class="notification-content flex-grow-1">
                            <div class="notification-title fw-bold">${notif.title}</div>
                            <div class="notification-message small text-muted">${notif.message}</div>
                            <div class="notification-time small text-muted">${timeAgo}</div>
                        </div>
                        <div class="notification-actions">
                            <button class="btn btn-sm btn-outline-secondary mark-read-btn" 
                                    onclick="notificationManager.markRead('${notif.id}')" 
                                    title="تحديد كمقروء">
                                <i class="fas fa-check"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
        
        list.innerHTML = html;
    }
}

// تحسينات التخزين السحابي
class EnhancedCloudStorage extends CloudStorage {
    constructor() {
        super();
        this.lastSyncTime = null;
        this.syncStatus = 'disconnected';
    }

    async saveData(data) {
        const success = await super.saveData(data);
        if (success) {
            this.lastSyncTime = new Date().toISOString();
            this.syncStatus = 'connected';
            this.updateSyncUI();
        }
        return success;
    }

    async loadData() {
        const data = await super.loadData();
        if (data) {
            this.lastSyncTime = new Date().toISOString();
            this.syncStatus = 'connected';
            this.updateSyncUI();
        }
        return data;
    }

    updateSyncUI() {
        const statusElement = document.getElementById('cloudSyncStatus');
        if (statusElement) {
            const statusText = this.syncStatus === 'connected' ? '✅ متصل' : '❌ غير متصل';
            const lastSync = this.lastSyncTime ? new Date(this.lastSyncTime).toLocaleString('ar') : '';
            statusElement.innerHTML = `${statusText}<br><small>آخر مزامنة: ${lastSync}</small>`;
        }
    }

    async testConnection() {
        try {
            await this.db.ref('.info/connected').once('value');
            this.syncStatus = 'connected';
            return true;
        } catch (error) {
            this.syncStatus = 'disconnected';
            return false;
        }
    }
}

// دالة مسح جميع الإشعارات
function clearAllNotifications() {
    if (window.notificationManager) {
        window.notificationManager.markAllRead();
        window.notificationManager.notifications = [];
        window.notificationManager.updateList();
        window.notificationManager.updateBadge();
    }
}

// تحديث نظام المزامنة التلقائية
class AutoSyncManager extends AutoSync {
    constructor() {
        super();
        this.enhancedCloudStorage = new EnhancedCloudStorage();
        this.setupEnhancedSync();
    }

    async initialize() {
        await this.enhancedCloudStorage.initialize(firebaseConfig);
        this.setupEnhancedSync();
        this.loadFromCloud();
        this.testConnectionPeriodically();
    }

    setupEnhancedSync() {
        // حفظ تلقائي كل 5 دقائق
        this.syncInterval = setInterval(() => {
            this.saveToCloud();
        }, 300000);

        // حفظ عند إغلاق الصفحة
        window.addEventListener('beforeunload', () => {
            this.saveToCloud();
        });

        // حفظ عند تغيير البيانات
        const observer = new MutationObserver(() => {
            clearTimeout(this.saveTimeout);
            this.saveTimeout = setTimeout(() => this.saveToCloud(), 5000);
        });
        
        observer.observe(document.body, { 
            childList: true, 
            subtree: true,
            attributes: true,
            attributeFilter: ['value', 'checked']
        });
    }

    async testConnectionPeriodically() {
        setInterval(async () => {
            const isConnected = await this.enhancedCloudStorage.testConnection();
            if (!isConnected) {
                console.warn('فقدان الاتصال بالسحابة');
                notificationManager.addNotification({
                    title: 'انقطاع الاتصال',
                    message: 'فقدان الاتصال بالتخزين السحابي',
                    type: 'warning'
                });
            }
        }, 60000); // كل دقيقة
    }

    async saveToCloud() {
        const allData = {
            employees: window.employees || [],
            clients: window.clients || [],
            contracts: window.contracts || [],
            attendance: window.attendance || [],
            services: window.services || [],
            settings: window.settings || {},
            tasks: window.tasks || [],
            events: window.events || [],
            dailyWork: window.dailyWork || [],
            dailyIncome: window.dailyIncome || [],
            dailyExpenses: window.dailyExpenses || [],
            financialTransactions: window.financialTransactions || [],
            salaryAdvances: window.salaryAdvances || []
        };

        const success = await this.enhancedCloudStorage.saveData(allData);
        if (success) {
            console.log('✅ تم حفظ البيانات في السحابة');
        } else {
            console.error('❌ فشل حفظ البيانات في السحابة');
            notificationManager.addNotification({
                title: 'فشل المزامنة',
                message: 'فشل حفظ البيانات في السحابة',
                type: 'danger'
            });
        }
    }

    async loadFromCloud() {
        try {
            const data = await this.enhancedCloudStorage.loadData();
            if (data) {
                Object.assign(window, data);
                if (typeof saveData === 'function') saveData();
                if (typeof loadDashboard === 'function') loadDashboard();
                console.log('✅ تم تحميل البيانات من السحابة');
                return true;
            }
        } catch (error) {
            console.log('📭 لا توجد بيانات في السحابة');
        }
        return false;
    }
}

// تهيئة الأنظمة المحسنة
document.addEventListener('DOMContentLoaded', () => {
    // تهيئة نظام الإشعارات المحسن
    window.notificationManager = new EnhancedNotificationManager();
    
    // تهيئة نظام المزامنة المحسن
    window.autoSyncManager = new AutoSyncManager();
    window.autoSyncManager.initialize();
    
    // إضافة إشعار ترحيبي
    setTimeout(() => {
        notificationManager.addNotification({
            title: 'مرحباً بك',
            message: 'نظام SUPER_PRO جاهز للعمل. جميع الأنظمة تعمل بشكل صحيح',
            type: 'success'
        });
    }, 1000);
});

// تصدير الدوال للاستخدام العام
window.clearAllNotifications = clearAllNotifications;
