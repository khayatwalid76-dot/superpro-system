// tests.js - اختبارات آلية للنظام
// ================================================

class TestSuite {
    constructor() {
        this.tests = [];
        this.results = {
            passed: 0,
            failed: 0,
            total: 0,
            details: []
        };
    }

    // إضافة اختبار
    addTest(name, testFn, category = 'general') {
        this.tests.push({
            name,
            testFn,
            category,
            timeout: 5000
        });
    }

    // تشغيل جميع الاختبارات
    async runAllTests() {
        console.log('🧪 بدء تشغيل الاختبارات...');
        this.results = { passed: 0, failed: 0, total: 0, details: [] };
        
        for (const test of this.tests) {
            try {
                const result = await this.runSingleTest(test);
                this.results.details.push(result);
                
                if (result.passed) {
                    this.results.passed++;
                    console.log(`✅ ${test.name}`);
                } else {
                    this.results.failed++;
                    console.log(`❌ ${test.name}: ${result.error}`);
                }
            } catch (error) {
                this.results.failed++;
                this.results.details.push({
                    name: test.name,
                    category: test.category,
                    passed: false,
                    error: error.message,
                    duration: 0
                });
                console.log(`❌ ${test.name}: ${error.message}`);
            }
            
            this.results.total++;
        }
        
        console.log(`📊 نتائج الاختبارات: ${this.results.passed}/${this.results.total} passed`);
        return this.results;
    }

    // تشغيل اختبار واحد
    async runSingleTest(test) {
        const startTime = Date.now();
        
        try {
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('انتهى وقت الاختبار')), test.timeout);
            });
            
            const testPromise = Promise.resolve(test.testFn());
            await Promise.race([testPromise, timeoutPromise]);
            
            return {
                name: test.name,
                category: test.category,
                passed: true,
                duration: Date.now() - startTime
            };
        } catch (error) {
            return {
                name: test.name,
                category: test.category,
                passed: false,
                error: error.message,
                duration: Date.now() - startTime
            };
        }
    }

    // الحصول على تقرير الاختبارات
    getReport() {
        const passRate = this.results.total > 0 ? (this.results.passed / this.results.total * 100).toFixed(2) : 0;
        
        return {
            summary: {
                total: this.results.total,
                passed: this.results.passed,
                failed: this.results.failed,
                passRate: `${passRate}%`
            },
            details: this.results.details,
            categories: this.getCategoryResults()
        };
    }

    // الحصول على نتائج حسب الفئة
    getCategoryResults() {
        const categories = {};
        
        this.results.details.forEach(result => {
            if (!categories[result.category]) {
                categories[result.category] = { passed: 0, failed: 0, total: 0 };
            }
            
            categories[result.category].total++;
            if (result.passed) {
                categories[result.category].passed++;
            } else {
                categories[result.category].failed++;
            }
        });
        
        return categories;
    }
}

// إنشاء مجموعة اختبارات
const testSuite = new TestSuite();

// اختبارات التحقق من صحة البيانات
testSuite.addTest('التحقق من صحة بيانات الموظف', () => {
    const validEmployee = {
        name: 'أحمد محمد',
        email: 'ahmed@example.com',
        phone: '+966501234567',
        position: 'مطور',
        salary: 5000,
        idNumber: '1234567890',
        residenceExpiry: '2025-12-31'
    };
    
    const result = validateEmployee(validEmployee);
    if (!result.isValid) {
        throw new Error(`فشل التحقق: ${JSON.stringify(result.errors)}`);
    }
    
    return true;
}, 'validation');

testSuite.addTest('رفض بيانات الموظف غير الصحيحة', () => {
    const invalidEmployee = {
        name: '',
        email: 'invalid-email',
        phone: '123',
        salary: -1000
    };
    
    const result = validateEmployee(invalidEmployee);
    if (result.isValid) {
        throw new Error('يجب أن يفشل التحقق للبيانات غير الصحيحة');
    }
    
    return true;
}, 'validation');

// اختبارات التخزين
testSuite.addTest('حفظ واسترجاع البيانات المحلية', () => {
    const testData = { test: 'value', number: 123 };
    
    sessionStorage.setItem('testItem', JSON.stringify(testData));
    const retrieved = JSON.parse(sessionStorage.getItem('testItem'));
    
    if (retrieved.test !== testData.test || retrieved.number !== testData.number) {
        throw new Error('فشل حفظ أو استرجاع البيانات');
    }
    
    sessionStorage.removeItem('testItem');
    return true;
}, 'storage');

// اختبارات النسخ الاحتياطي
testSuite.addTest('إنشاء نسخة احتياطية', async () => {
    if (!backupSystem) {
        throw new Error('نظام النسخ الاحتياطي غير متاح');
    }
    
    const backup = await backupSystem.createFullBackup('session');
    
    if (!backup || !backup.id || !backup.data) {
        throw new Error('فشل إنشاء النسخة الاحتياطية');
    }
    
    return true;
}, 'backup');

// اختبارات الواجهة المتجاوبة
testSuite.addTest('التحقق من نقاط التوقف', () => {
    if (!responsiveUI) {
        throw new Error('نظام الواجهة المتجاوبة غير متاح');
    }
    
    const screenInfo = responsiveUI.getScreenInfo();
    
    if (!screenInfo.breakpoint || !screenInfo.width || !screenInfo.height) {
        throw new Error('معلومات الشاشة غير مكتملة');
    }
    
    return true;
}, 'ui');

// اختبارات أداء النظام
testSuite.addTest('قياس سرعة تحميل البيانات', () => {
    const startTime = performance.now();
    
    // محاكاة تحميل البيانات
    const largeArray = new Array(1000).fill(0).map((_, i) => ({
        id: i,
        name: `عنصر ${i}`,
        value: Math.random() * 100
    }));
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    if (duration > 100) { // يجب أن يكون أسرع من 100ms
        throw new Error(`تحميل البيانات بطيء: ${duration}ms`);
    }
    
    return true;
}, 'performance');

// اختبارات إدارة الأخطاء
testSuite.addTest('تسجيل الخطأ', () => {
    if (!errorHandler) {
        throw new Error('نظام إدارة الأخطاء غير متاح');
    }
    
    const initialCount = errorHandler.errors.length;
    errorHandler.log(new Error('اختبار خطأ'), 'اختبار', 'error');
    
    if (errorHandler.errors.length !== initialCount + 1) {
        throw new Error('فشل تسجيل الخطأ');
    }
    
    return true;
}, 'error-handling');

// اختبارات Firebase
testSuite.addTest('التحقق من إعدادات Firebase', () => {
    if (typeof firebase === 'undefined') {
        throw new Error('Firebase غير متاح');
    }
    
    if (!window.SuperProConfig || !window.SuperProConfig.firebaseConfig) {
        throw new Error('إعدادات Firebase غير متاحة');
    }
    
    const config = window.SuperProConfig.firebaseConfig;
    const requiredFields = ['apiKey', 'authDomain', 'projectId', 'appId'];
    
    for (const field of requiredFields) {
        if (!config[field]) {
            throw new Error(`حقل Firebase مفقود: ${field}`);
        }
    }
    
    return true;
}, 'firebase');

// اختبارات التحقق من النماذج
testSuite.addTest('التحقق من صحة رقم الهاتف السعودي', () => {
    const validPhones = [
        '+966501234567',
        '0501234567',
        '00966501234567',
        '966501234567'
    ];
    
    const invalidPhones = [
        '123456',
        '05012345678',
        'abc123',
        ''
    ];
    
    for (const phone of validPhones) {
        if (!validateSaudiPhone(phone)) {
            throw new Error(`رقم الهاتف الصحيح تم رفضه: ${phone}`);
        }
    }
    
    for (const phone of invalidPhones) {
        if (validateSaudiPhone(phone)) {
            throw new Error(`رقم الهاتف غير الصحيح تم قبوله: ${phone}`);
        }
    }
    
    return true;
}, 'validation');

// اختبارات التواريخ
testSuite.addTest('التحقق من تواريخ العقود', () => {
    const validDates = {
        startDate: '2024-01-01',
        endDate: '2024-12-31'
    };
    
    const invalidDates = {
        startDate: '2024-12-31',
        endDate: '2024-01-01'
    };
    
    const validResult = validateContractDates(validDates.startDate, validDates.endDate);
    if (!validResult.valid) {
        throw new Error('تواريخ صحيحة تم رفضها');
    }
    
    const invalidResult = validateContractDates(invalidDates.startDate, invalidDates.endDate);
    if (invalidResult.valid) {
        throw new Error('تواريخ غير صحيحة تم قبولها');
    }
    
    return true;
}, 'validation');

// اختبارات الأمان
testSuite.addTest('التحقق من سلامة البيانات', () => {
    const testData = { sensitive: 'password123', id: 1 };
    
    // التحقق من أن البيانات الحساسة لا تظهر في السجل
    const originalLog = console.log;
    let loggedData = '';
    
    console.log = function(...args) {
        loggedData += args.join(' ');
    };
    
    // محاكاة عملية تسجيل
    console.log('Data:', JSON.stringify(testData));
    
    console.log = originalLog;
    
    if (loggedData.includes('password123')) {
        throw new Error('البيانات الحساسة ظهرت في السجل');
    }
    
    return true;
}, 'security');

// دالة تشغيل الاختبارات من الواجهة
async function runTestsFromUI() {
    const resultsDiv = document.getElementById('testResults');
    if (!resultsDiv) {
        console.error('لم يتم العثور على عنصر عرض النتائج');
        return;
    }
    
    resultsDiv.innerHTML = '<div class="text-center"><i class="fas fa-spinner fa-spin"></i> جاري تشغيل الاختبارات...</div>';
    
    try {
        const results = await testSuite.runAllTests();
        const report = testSuite.getReport();
        
        displayTestResults(resultsDiv, report);
    } catch (error) {
        resultsDiv.innerHTML = `<div class="alert alert-danger">فشل تشغيل الاختبارات: ${error.message}</div>`;
    }
}

// عرض نتائج الاختبارات
function displayTestResults(container, report) {
    const passRate = parseFloat(report.summary.passRate);
    const alertClass = passRate >= 80 ? 'success' : passRate >= 60 ? 'warning' : 'danger';
    
    let html = `
        <div class="alert alert-${alertClass}">
            <h4>نتائج الاختبارات</h4>
            <p>المجموع: ${report.summary.total} | نجح: ${report.summary.passed} | فشل: ${report.summary.failed}</p>
            <p>نسبة النجاح: ${report.summary.passRate}</p>
        </div>
        
        <div class="row">
            <div class="col-md-6">
                <h5>النتائج حسب الفئة</h5>
                <div class="list-group">
    `;
    
    for (const [category, results] of Object.entries(report.categories)) {
        const categoryPassRate = (results.passed / results.total * 100).toFixed(1);
        html += `
            <div class="list-group-item">
                <strong>${category}</strong>
                <span class="badge bg-${categoryPassRate >= 80 ? 'success' : 'warning'} ms-2">
                    ${results.passed}/${results.total} (${categoryPassRate}%)
                </span>
            </div>
        `;
    }
    
    html += `
                </div>
            </div>
            <div class="col-md-6">
                <h5>تفاصيل الاختبارات</h5>
                <div class="list-group" style="max-height: 400px; overflow-y: auto;">
    `;
    
    report.details.forEach(test => {
        const icon = test.passed ? 'check-circle' : 'times-circle';
        const color = test.passed ? 'success' : 'danger';
        html += `
            <div class="list-group-item">
                <i class="fas fa-${icon} text-${color}"></i>
                ${test.name}
                <small class="text-muted d-block">${test.category} - ${test.duration}ms</small>
                ${test.error ? `<small class="text-danger d-block">${test.error}</small>` : ''}
            </div>
        `;
    });
    
    html += `
                </div>
            </div>
        </div>
        
        <div class="mt-3">
            <button class="btn btn-primary" onclick="runTestsFromUI()">
                <i class="fas fa-redo"></i> إعادة تشغيل الاختبارات
            </button>
            <button class="btn btn-secondary" onclick="exportTestResults()">
                <i class="fas fa-download"></i> تصدير النتائج
            </button>
        </div>
    `;
    
    container.innerHTML = html;
}

// تصدير نتائج الاختبارات
function exportTestResults() {
    const report = testSuite.getReport();
    const data = JSON.stringify(report, null, 2);
    
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `test-results-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
}

// تصدير للاستخدام العام
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TestSuite, testSuite, runTestsFromUI };
} else {
    window.TestSuite = TestSuite;
    window.testSuite = testSuite;
    window.runTestsFromUI = runTestsFromUI;
    window.exportTestResults = exportTestResults;
}
