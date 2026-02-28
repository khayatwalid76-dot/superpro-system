// config.js - ملف الإعدادات الآمن
// ================================================


// Use the globally defined firebaseConfig from index.html
const globalFirebaseConfig = window.firebaseConfig || {};

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
    const missing = required.filter(key => !globalFirebaseConfig[key]);
    
    if (missing.length > 0) {
        console.warn('⚠️ إعدادات Firebase ناقصة:', missing);
        return false;
    }
    
    return true;
}

// تصدير الإعدادات
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { firebaseConfig: globalFirebaseConfig, appConfig, validateConfig };
} else {
    window.SuperProConfig = { firebaseConfig: globalFirebaseConfig, appConfig, validateConfig };
}

