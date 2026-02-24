// error-handler.js - نظام مركزي لإدارة الأخطاء
// ================================================

class ErrorHandler {
    constructor() {
        this.errors = [];
        this.maxErrors = 100;
        this.retryAttempts = 3;
        this.isOnline = navigator.onLine;
        
        // الاستماع لأحداث الاتصال
        window.addEventListener('online', () => this.isOnline = true);
        window.addEventListener('offline', () => this.isOnline = false);
    }

    // تسجيل الخطأ
    log(error, context = '', severity = 'error') {
        const errorObj = {
            id: Date.now() + Math.random(),
            message: error.message || error,
            stack: error.stack || '',
            context,
            severity,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            online: this.isOnline
        };

        this.errors.push(errorObj);
        
        // الحفاظ على الحد الأقصى للأخطاء
        if (this.errors.length > this.maxErrors) {
            this.errors.shift();
        }

        // طباعة الخطأ في الكونسول
        this.printError(errorObj);
        
        // إرسال الخطأ للسحابة (إذا كان متصلاً)
        if (this.isOnline && severity === 'error') {
            this.reportError(errorObj);
        }

        // إظهار إشعار للمستخدم
        this.showUserNotification(errorObj);
    }

    // طباعة الخطأ في الكونسول
    printError(errorObj) {
        const emoji = errorObj.severity === 'error' ? '🔴' : '🟡';
        console.group(`${emoji} ${errorObj.severity.toUpperCase()}: ${errorObj.message}`);
        console.log('السياق:', errorObj.context);
        console.log('الوقت:', errorObj.timestamp);
        console.log('الرابط:', errorObj.url);
        if (errorObj.stack) {
            console.log('Stack Trace:', errorObj.stack);
        }
        console.groupEnd();
    }

    // إرسال الخطأ للسحابة
    async reportError(errorObj) {
        try {
            if (window.firebase && window.firebase.database) {
                await firebase.database().ref('errors').push(errorObj);
            }
        } catch (e) {
            console.warn('فشل إرسال الخطأ للسحابة:', e);
        }
    }

    // إظهار إشعار للمستخدم
    showUserNotification(errorObj) {
        if (errorObj.severity === 'error') {
            this.showNotification('حدث خطأ في النظام', 'error');
        } else if (errorObj.severity === 'warning') {
            this.showNotification('تنبيه: ' + errorObj.message, 'warning');
        }
    }

    // إظهار إشعار
    showNotification(message, type = 'info') {
        // إنشاء عنصر الإشعار
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        notification.style.cssText = `
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 9999;
            min-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        notification.innerHTML = `
            <i class="fas fa-${type === 'error' ? 'exclamation-triangle' : 'info-circle'}"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        document.body.appendChild(notification);

        // إزالة الإشعار تلقائياً
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    // محاولة إعادة التنفيذ
    async retry(fn, context = '') {
        let lastError;
        
        for (let i = 0; i < this.retryAttempts; i++) {
            try {
                return await fn();
            } catch (error) {
                lastError = error;
                this.log(error, `${context} (محاولة ${i + 1}/${this.retryAttempts})`, 'warning');
                
                // انتظار قبل المحاولة التالية
                await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
            }
        }
        
        this.log(lastError, `${context} (فشل بعد ${this.retryAttempts} محاولات)`, 'error');
        throw lastError;
    }

    // الحصول على تقرير الأخطاء
    getErrorReport() {
        return {
            total: this.errors.length,
            errors: this.errors.filter(e => e.severity === 'error'),
            warnings: this.errors.filter(e => e.severity === 'warning'),
            recent: this.errors.slice(-10),
            summary: this.generateSummary()
        };
    }

    // إنشاء ملخص الأخطاء
    generateSummary() {
        const errorCounts = {};
        this.errors.forEach(error => {
            const key = error.message.split(':')[0] || 'غير معروف';
            errorCounts[key] = (errorCounts[key] || 0) + 1;
        });
        
        return errorCounts;
    }

    // مسح الأخطاء
    clear() {
        this.errors = [];
    }

    // تصدير الأخطاء
    export() {
        const data = JSON.stringify(this.getErrorReport(), null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `error-report-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
    }
}

// إنشاء نسخة واحدة من مدير الأخطاء
const errorHandler = new ErrorHandler();

// تصدير للإستخدام العام
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ErrorHandler;
} else {
    window.ErrorHandler = ErrorHandler;
    window.errorHandler = errorHandler;
}

// التقاط الأخطاء العامة
window.addEventListener('error', (event) => {
    errorHandler.log(event.error, 'خطأ عام في الصفحة', 'error');
});

window.addEventListener('unhandledrejection', (event) => {
    errorHandler.log(event.reason, 'خطأ في Promise', 'error');
});
