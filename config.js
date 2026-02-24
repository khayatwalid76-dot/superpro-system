// config.js - ملف الإعدادات الآمن
// ================================================

// إعدادات Firebase - سيتم جلبها من متغيرات البيئة في الإنتاج
const firebaseConfig = {
    apiKey: getEnvVar('FIREBASE_API_KEY') || 'AIzaSyClOXATkxQ8XLrorz80JhkUdxXjbcySr2E',
    authDomain: getEnvVar('FIREBASE_AUTH_DOMAIN') || 'superpro-system-8871f.firebaseapp.com',
    projectId: getEnvVar('FIREBASE_PROJECT_ID') || 'superpro-system-8871f',
    storageBucket: getEnvVar('FIREBASE_STORAGE_BUCKET') || 'superpro-system-8871f.firebasestorage.app',
    messagingSenderId: getEnvVar('FIREBASE_MESSAGING_SENDER_ID') || '318335312258',
    appId: getEnvVar('FIREBASE_APP_ID') || '1:318335312258:web:42879aaee5fc8b9a126f9b',
    measurementId: getEnvVar('FIREBASE_MEASUREMENT_ID') || 'G-X4RJQYCS7N',
    databaseURL: getEnvVar('FIREBASE_DATABASE_URL') || 'https://superpro-system-8871f-default-rtdb.asia-southeast1.firebasedatabase.app/'
};

// إعدادات التطبيق
const appConfig = {
    name: getEnvVar('APP_NAME') || 'SUPER_PRO_SYSTEM',
    version: getEnvVar('APP_VERSION') || '2.1.0',
    debug: getEnvVar('DEBUG_MODE') === 'true',
    environment: getEnvironment(),
    apiTimeout: 30000,
    retryAttempts: 3,
    cacheExpiration: 3600000, // 1 ساعة
    maxFileSize: 10485760, // 10MB
    supportedLanguages: ['ar', 'en'],
    defaultLanguage: 'ar'
};

// دوال مساعدة
function getEnvVar(name) {
    // في بيئة المتصفح، نتحقق من متغيرات البيئة المحلية
    if (typeof window !== 'undefined' && window.config) {
        return window.config[name];
    }
    
    // في بيئة Node.js
    if (typeof process !== 'undefined' && process.env) {
        return process.env[name];
    }
    
    return null;
}

function getEnvironment() {
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    
    if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
        return 'development';
    } else if (hostname.includes('staging') || hostname.includes('test')) {
        return 'staging';
    } else {
        return 'production';
    }
}

// التحقق من الإعدادات
function validateConfig() {
    const required = ['apiKey', 'authDomain', 'projectId', 'appId'];
    const missing = required.filter(key => !firebaseConfig[key]);
    
    if (missing.length > 0) {
        console.warn('⚠️ إعدادات Firebase ناقصة:', missing);
        return false;
    }
    
    return true;
}

// تصدير الإعدادات
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { firebaseConfig, appConfig, validateConfig };
} else {
    window.SuperProConfig = { firebaseConfig, appConfig, validateConfig };
}
