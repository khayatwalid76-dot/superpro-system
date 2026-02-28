// core.js - الملف الأساسي للنظام
// ================================================

// استيراد الإعدادات
if (typeof window.SuperProConfig !== 'undefined') {
    const { firebaseConfig, appConfig } = window.SuperProConfig;
}

// المتغيرات العامة
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

// حالة النظام
const systemState = {
    isOnline: navigator.onLine,
    currentUser: null,
    currentLanguage: 'ar',
    theme: 'light',
    lastSync: null,
    isLoading: false,
    notifications: []
};

// تهيئة النظام
async function initializeSystem() {
    try {
        showLoading(true);
        
        // تهيئة Firebase
        await initializeFirebase();
        
        // تحميل البيانات المحلية
        loadLocalData();
        
        // تهيئة الواجهة
        initializeUI();
        
        // بدء المزامنة التلقائية
        startAutoSync();
        
        // إعداد المستمعين للأحداث
        setupEventListeners();
        
        showLoading(false);
        showNotification('تم تهيئة النظام بنجاح', 'success');
        
    } catch (error) {
        errorHandler.log(error, 'تهيئة النظام', 'error');
        showLoading(false);
        showNotification('فشل تهيئة النظام', 'error');
    }
}

// تهيئة Firebase
async function initializeFirebase() {
    // if (typeof firebase !== 'undefined' && firebaseConfig) {
    //     try {
    //         firebase.initializeApp(firebaseConfig);
    //         const database = firebase.database();
    //         systemState.firebaseDB = database;
    //         return true;
    //     } catch (error) {
    //         errorHandler.log(error, 'تهيئة Firebase', 'warning');
    //         return false;
    //     }
    // }
    return false;
}

// تحميل البيانات المحلية
function loadLocalData() {
    try {
        employees = JSON.parse(sessionStorage.getItem('superpro_employees') || '[]');
        clients = JSON.parse(sessionStorage.getItem('superpro_clients') || '[]');
        contracts = JSON.parse(sessionStorage.getItem('superpro_contracts') || '[]');
        attendance = JSON.parse(sessionStorage.getItem('superpro_attendance') || '[]');
        services = JSON.parse(sessionStorage.getItem('superpro_services') || '[]');
        settings = JSON.parse(sessionStorage.getItem('superpro_settings') || '{}');
        tasks = JSON.parse(sessionStorage.getItem('superpro_tasks') || '[]');
        events = JSON.parse(sessionStorage.getItem('superpro_events') || '[]');
        dailyWork = JSON.parse(sessionStorage.getItem('superpro_dailyWork') || '[]');
        dailyIncome = JSON.parse(sessionStorage.getItem('superpro_dailyIncome') || '[]');
        dailyExpenses = JSON.parse(sessionStorage.getItem('superpro_dailyExpenses') || '[]');
        financialTransactions = JSON.parse(sessionStorage.getItem('superpro_financialTransactions') || '[]');
        salaryAdvances = JSON.parse(sessionStorage.getItem('superpro_salaryAdvances') || '[]');
    } catch (error) {
        errorHandler.log(error, 'تحميل البيانات المحلية', 'warning');
    }
}

// حفظ البيانات المحلية
function saveLocalData() {
    try {
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
    } catch (error) {
        errorHandler.log(error, 'حفظ البيانات المحلية', 'error');
    }
}

// تهيئة الواجهة
function initializeUI() {
    // إعداد الوضع الليلي
    const savedTheme = localStorage.getItem('superpro_theme') || 'light';
    setTheme(savedTheme);
    
    // إعداد اللغة
    const savedLanguage = localStorage.getItem('superpro_language') || 'ar';
    setLanguage(savedLanguage);
    
    // تحديث الإحصائيات
    updateDashboard();
}

// إعداد المستمعين للأحداث
function setupEventListeners() {
    // مستمع الاتصال بالإنترنت
    window.addEventListener('online', () => {
        systemState.isOnline = true;
        showNotification('تم استعادة الاتصال بالإنترنت', 'success');
        syncWithCloud();
    });
    
    window.addEventListener('offline', () => {
        systemState.isOnline = false;
        showNotification('انقطع الاتصال بالإنترنت', 'warning');
    });
    
    // مستمع إغلاق الصفحة
    window.addEventListener('beforeunload', () => {
        saveLocalData();
        syncWithCloud();
    });
    
    // مستمع تغيير الحجم
    window.addEventListener('resize', debounce(() => {
        adjustLayoutForScreenSize();
    }, 250));
}

// دوال مساعدة
function showLoading(show) {
    systemState.isLoading = show;
    const loader = document.getElementById('mainLoader');
    if (loader) {
        loader.style.display = show ? 'flex' : 'none';
    }
}

function showNotification(message, type = 'info') {
    if (typeof errorHandler !== 'undefined') {
        errorHandler.showNotification(message, type);
    } else {
        console.log(`[${type.toUpperCase()}] ${message}`);
    }
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// تصدير الدوال الأساسية
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        systemState,
        initializeSystem,
        loadLocalData,
        saveLocalData
    };
}
