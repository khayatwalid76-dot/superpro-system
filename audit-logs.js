// نظام سجلات التدقيق المتقدم
// Advanced Audit Logs System

class AuditLogsSystem {
    constructor() {
        this.logs = JSON.parse(localStorage.getItem('auditLogs') || '[]');
        this.maxLogs = 10000; // الاحتفاظ بـ 10,000 سجل
        this.logLevels = {
            INFO: { color: '#17a2b8', icon: 'fas fa-info-circle' },
            SUCCESS: { color: '#28a745', icon: 'fas fa-check-circle' },
            WARNING: { color: '#ffc107', icon: 'fas fa-exclamation-triangle' },
            ERROR: { color: '#dc3545', icon: 'fas fa-times-circle' },
            CRITICAL: { color: '#6f42c1', icon: 'fas fa-bomb' }
        };
        this.categories = {
            AUTH: 'المصادقة',
            USER: 'المستخدمين',
            EMPLOYEE: 'الموظفين',
            CLIENT: 'العملاء',
            CONTRACT: 'العقود',
            FINANCIAL: 'المالية',
            ATTENDANCE: 'الحضور',
            REPORT: 'التقارير',
            SYSTEM: 'النظام',
            DATA: 'البيانات',
            SECURITY: 'الأمان'
        };
        this.init();
    }

    init() {
        this.setupAuditUI();
        this.startRealTimeLogging();
        this.cleanupOldLogs();
    }

    // تسجيل حدث جديد
    log(level, category, action, details = {}, userId = null) {
        const logEntry = {
            id: this.generateId(),
            timestamp: new Date().toISOString(),
            level: level,
            category: category,
            action: action,
            details: details,
            userId: userId || this.getCurrentUserId(),
            sessionId: this.getSessionId(),
            ipAddress: this.getClientIP(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            referrer: document.referrer,
            duration: 0,
            stackTrace: level === 'ERROR' || level === 'CRITICAL' ? this.getStackTrace() : null
        };

        this.logs.unshift(logEntry);
        
        // الاحتفاظ بالحد الأقصى من السجلات
        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(0, this.maxLogs);
        }

        // حفظ في localStorage
        this.saveLogs();
        
        // إرسال للخادم (إذا كان متصلاً)
        this.sendLogToServer(logEntry);
        
        // عرض الإشعارات للأحداث الحرجة
        if (level === 'CRITICAL' || level === 'ERROR') {
            this.showCriticalNotification(logEntry);
        }
    }

    // بدء تسجيل العملية
    startOperation(operation, category, details = {}) {
        const operationId = this.generateId();
        const startTime = Date.now();
        
        const logEntry = {
            id: operationId,
            timestamp: new Date().toISOString(),
            level: 'INFO',
            category: category,
            action: `START_${operation}`,
            details: { ...details, startTime, operationId },
            userId: this.getCurrentUserId(),
            sessionId: this.getSessionId(),
            type: 'OPERATION_START'
        };

        this.logs.unshift(logEntry);
        this.saveLogs();
        
        return {
            operationId,
            startTime,
            end: (result, error = null) => {
                this.endOperation(operationId, operation, result, error);
            }
        };
    }

    // إنهاء تسجيل العملية
    endOperation(operationId, operation, result, error = null) {
        const logIndex = this.logs.findIndex(log => log.id === operationId);
        if (logIndex === -1) return;

        const startLog = this.logs[logIndex];
        const duration = Date.now() - new Date(startLog.details.startTime).getTime();
        
        const endLogEntry = {
            id: this.generateId(),
            timestamp: new Date().toISOString(),
            level: error ? 'ERROR' : 'SUCCESS',
            category: startLog.category,
            action: `END_${operation}`,
            details: {
                operationId,
                result,
                error,
                duration,
                startTime: startLog.details.startTime,
                endTime: new Date().toISOString()
            },
            userId: this.getCurrentUserId(),
            sessionId: this.getSessionId(),
            type: 'OPERATION_END'
        };

        this.logs.unshift(endLogEntry);
        this.saveLogs();
    }

    // تسجيل حدث أمان
    logSecurityEvent(event, details = {}) {
        this.log('WARNING', 'SECURITY', event, {
            ...details,
            severity: 'HIGH',
            requiresInvestigation: true
        });
    }

    // تسجيل تغيير البيانات
    logDataChange(entity, entityId, oldData, newData, action = 'UPDATE') {
        this.log('INFO', 'DATA', `${action}_${entity}`, {
            entityType: entity,
            entityId: entityId,
            oldData: this.sanitizeData(oldData),
            newData: this.sanitizeData(newData),
            changes: this.detectChanges(oldData, newData),
            action: action
        });
    }

    // تسجيل وصول غير مصرح به
    logUnauthorizedAccess(resource, details = {}) {
        this.logSecurityEvent('UNAUTHORIZED_ACCESS', {
            resource,
            attemptedAction: details.action,
            method: details.method,
            userAgent: navigator.userAgent,
            ipAddress: this.getClientIP()
        });
    }

    // تسجيل محاولة اختراق
    loginAttempt(email, success, details = {}) {
        const level = success ? 'INFO' : 'WARNING';
        const action = success ? 'LOGIN_SUCCESS' : 'LOGIN_FAILED';
        
        this.log(level, 'AUTH', action, {
            email,
            success,
            ipAddress: this.getClientIP(),
            userAgent: navigator.userAgent,
            ...details
        });
    }

    // إعداد واجهة سجلات التدقيق
    setupAuditUI() {
        const settingsSection = document.querySelector('.settings-section');
        if (!settingsSection) return;

        const auditUI = `
            <div class="mb-4">
                <h5><i class="fas fa-shield-alt me-2"></i>سجلات التدقيق</h5>
                
                <!-- إحصائيات سريعة -->
                <div class="row mb-3">
                    <div class="col-md-3">
                        <div class="card text-center">
                            <div class="card-body">
                                <h4 class="text-primary" id="totalLogs">0</h4>
                                <p class="mb-0">إجمالي السجلات</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card text-center">
                            <div class="card-body">
                                <h4 class="text-danger" id="errorLogs">0</h4>
                                <p class="mb-0">الأخطاء</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card text-center">
                            <div class="card-body">
                                <h4 class="text-warning" id="warningLogs">0</h4>
                                <p class="mb-0">التحذيرات</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card text-center">
                            <div class="card-body">
                                <h4 class="text-success" id="successLogs">0</h4>
                                <p class="mb-0">النجاح</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- الفلاتر -->
                <div class="row mb-3">
                    <div class="col-md-3">
                        <label class="form-label">المستوى</label>
                        <select class="form-select" id="logLevelFilter">
                            <option value="">جميع المستويات</option>
                            <option value="CRITICAL">حرج</option>
                            <option value="ERROR">خطأ</option>
                            <option value="WARNING">تحذير</option>
                            <option value="INFO">معلومات</option>
                            <option value="SUCCESS">نجاح</option>
                        </select>
                    </div>
                    <div class="col-md-3">
                        <label class="form-label">الفئة</label>
                        <select class="form-select" id="logCategoryFilter">
                            <option value="">جميع الفئات</option>
                            ${Object.entries(this.categories).map(([key, value]) => 
                                `<option value="${key}">${value}</option>`
                            ).join('')}
                        </select>
                    </div>
                    <div class="col-md-3">
                        <label class="form-label">من تاريخ</label>
                        <input type="datetime-local" class="form-control" id="logDateFrom">
                    </div>
                    <div class="col-md-3">
                        <label class="form-label">إلى تاريخ</label>
                        <input type="datetime-local" class="form-control" id="logDateTo">
                    </div>
                </div>

                <!-- البحث -->
                <div class="row mb-3">
                    <div class="col-12">
                        <div class="input-group">
                            <input type="text" class="form-control" id="logSearch" placeholder="البحث في السجلات...">
                            <button class="btn btn-outline-secondary" type="button" onclick="auditLogsSystem.searchLogs()">
                                <i class="fas fa-search"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- الأزرار -->
                <div class="row mb-3">
                    <div class="col-12">
                        <div class="btn-group">
                            <button class="btn btn-primary" onclick="auditLogsSystem.refreshLogs()">
                                <i class="fas fa-sync me-2"></i>تحديث
                            </button>
                            <button class="btn btn-success" onclick="auditLogsSystem.exportLogs()">
                                <i class="fas fa-download me-2"></i>تصدير
                            </button>
                            <button class="btn btn-warning" onclick="auditLogsSystem.clearLogs()">
                                <i class="fas fa-trash me-2"></i>مسح القديمة
                            </button>
                            <button class="btn btn-info" onclick="auditLogsSystem.realTimeMonitor()">
                                <i class="fas fa-eye me-2"></i>مراقبة مباشرة
                            </button>
                        </div>
                    </div>
                </div>

                <!-- جدول السجلات -->
                <div class="card">
                    <div class="card-header">
                        <h6 class="mb-0">سجلات التدقيق</h6>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-sm table-striped" id="auditLogsTable">
                                <thead class="table-dark">
                                    <tr>
                                        <th>التوقيت</th>
                                        <th>المستوى</th>
                                        <th>الفئة</th>
                                        <th>الإجراء</th>
                                        <th>المستخدم</th>
                                        <th>التفاصيل</th>
                                        <th>الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody id="auditLogsTableBody">
                                    <tr>
                                        <td colspan="7" class="text-center text-muted">
                                            <i class="fas fa-spinner fa-spin me-2"></i>
                                            جاري التحميل...
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        
                        <!-- التصفح -->
                        <nav class="mt-3">
                            <ul class="pagination pagination-sm justify-content-center" id="logsPagination">
                                <!-- سيتم ملؤها ديناميكياً -->
                            </ul>
                        </nav>
                    </div>
                </div>
            </div>
        `;

        settingsSection.insertAdjacentHTML('afterbegin', auditUI);
        this.setupEventListeners();
        this.updateStatistics();
        this.displayLogs();
    }

    // إعداد مستمعي الأحداث
    setupEventListeners() {
        document.getElementById('logLevelFilter')?.addEventListener('change', () => this.displayLogs());
        document.getElementById('logCategoryFilter')?.addEventListener('change', () => this.displayLogs());
        document.getElementById('logDateFrom')?.addEventListener('change', () => this.displayLogs());
        document.getElementById('logDateTo')?.addEventListener('change', () => this.displayLogs());
        document.getElementById('logSearch')?.addEventListener('input', () => this.displayLogs());
    }

    // بدء التسجيل الفوري
    startRealTimeLogging() {
        // اعتراض أحداث DOM
        this.observeDOMChanges();
        
        // اعتراض أحداث الشبكة
        this.interceptNetworkRequests();
        
        // اعتراض أحداث الأخطاء
        this.interceptErrors();
        
        // اعتراض أحداث التصفح
        this.interceptNavigation();
    }

    // مراقبة تغييرات DOM
    observeDOMChanges() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            this.checkElementForAudit(node);
                        }
                    });
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // التحقق من العنصر للتدقيق
    checkElementForAudit(element) {
        // التحقق من نماذج البيانات الحساسة
        if (element.tagName === 'FORM' && element.querySelector('input[type="password"]')) {
            this.logSecurityEvent('SENSITIVE_FORM_ACCESS', {
                formAction: element.action,
                formId: element.id
            });
        }

        // التحقق من روابط خارجية
        if (element.tagName === 'A' && element.href && element.hostname !== window.location.hostname) {
            this.log('INFO', 'SECURITY', 'EXTERNAL_LINK_CLICKED', {
                url: element.href,
                text: element.textContent
            });
        }
    }

    // اعتراض طلبات الشبكة
    interceptNetworkRequests() {
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            const startTime = Date.now();
            const url = args[0];
            const options = args[1] || {};
            
            try {
                const response = await originalFetch(...args);
                const duration = Date.now() - startTime;
                
                this.log('INFO', 'SYSTEM', 'API_CALL', {
                    url,
                    method: options.method || 'GET',
                    status: response.status,
                    duration,
                    success: response.ok
                });
                
                return response;
            } catch (error) {
                const duration = Date.now() - startTime;
                
                this.log('ERROR', 'SYSTEM', 'API_CALL_FAILED', {
                    url,
                    method: options.method || 'GET',
                    error: error.message,
                    duration
                });
                
                throw error;
            }
        };
    }

    // اعتراض الأخطاء
    interceptErrors() {
        window.addEventListener('error', (event) => {
            this.log('ERROR', 'SYSTEM', 'JAVASCRIPT_ERROR', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error?.stack
            });
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.log('ERROR', 'SYSTEM', 'PROMISE_REJECTION', {
                reason: event.reason,
                stack: event.reason?.stack
            });
        });
    }

    // اعتراض أحداث التصفح
    interceptNavigation() {
        let navigationStartTime = Date.now();
        
        window.addEventListener('beforeunload', () => {
            const duration = Date.now() - navigationStartTime;
            
            this.log('INFO', 'USER', 'PAGE_LEAVE', {
                url: window.location.href,
                duration,
                timeOnPage: duration
            });
        });

        window.addEventListener('load', () => {
            this.log('INFO', 'USER', 'PAGE_LOAD', {
                url: window.location.href,
                loadTime: performance.now(),
                referrer: document.referrer
            });
            
            navigationStartTime = Date.now();
        });
    }

    // عرض السجلات
    displayLogs(page = 1) {
        const tbody = document.getElementById('auditLogsTableBody');
        if (!tbody) return;

        const filteredLogs = this.getFilteredLogs();
        const pageSize = 50;
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const pageLogs = filteredLogs.slice(startIndex, endIndex);

        let html = '';
        pageLogs.forEach(log => {
            const levelInfo = this.logLevels[log.level];
            const category = this.categories[log.category] || log.category;
            
            html += `
                <tr>
                    <td>${this.formatDateTime(log.timestamp)}</td>
                    <td>
                        <span class="badge" style="background-color: ${levelInfo.color}; color: white;">
                            <i class="${levelInfo.icon} me-1"></i>
                            ${log.level}
                        </span>
                    </td>
                    <td>${category}</td>
                    <td>${log.action}</td>
                    <td>${log.userId || 'N/A'}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-info" onclick="auditLogsSystem.showLogDetails('${log.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                    <td>
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-sm btn-outline-primary" onclick="auditLogsSystem.exportLog('${log.id}')">
                                <i class="fas fa-download"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-warning" onclick="auditLogsSystem.investigateLog('${log.id}')">
                                <i class="fas fa-search"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });

        if (pageLogs.length === 0) {
            html = '<tr><td colspan="7" class="text-center text-muted">لا توجد سجلات مطابقة</td></tr>';
        }

        tbody.innerHTML = html;
        this.updatePagination(filteredLogs.length, page, pageSize);
    }

    // الحصول على السجلات المفلترة
    getFilteredLogs() {
        let filtered = [...this.logs];

        // فلترة حسب المستوى
        const levelFilter = document.getElementById('logLevelFilter')?.value;
        if (levelFilter) {
            filtered = filtered.filter(log => log.level === levelFilter);
        }

        // فلترة حسب الفئة
        const categoryFilter = document.getElementById('logCategoryFilter')?.value;
        if (categoryFilter) {
            filtered = filtered.filter(log => log.category === categoryFilter);
        }

        // فلترة حسب التاريخ
        const dateFrom = document.getElementById('logDateFrom')?.value;
        const dateTo = document.getElementById('logDateTo')?.value;
        if (dateFrom) {
            filtered = filtered.filter(log => new Date(log.timestamp) >= new Date(dateFrom));
        }
        if (dateTo) {
            filtered = filtered.filter(log => new Date(log.timestamp) <= new Date(dateTo));
        }

        // فلترة حسب البحث
        const searchTerm = document.getElementById('logSearch')?.value.toLowerCase();
        if (searchTerm) {
            filtered = filtered.filter(log => 
                log.action.toLowerCase().includes(searchTerm) ||
                log.details?.toString().toLowerCase().includes(searchTerm) ||
                log.userId?.toLowerCase().includes(searchTerm)
            );
        }

        return filtered;
    }

    // تحديث الإحصائيات
    updateStatistics() {
        const stats = {
            total: this.logs.length,
            error: this.logs.filter(log => log.level === 'ERROR').length,
            warning: this.logs.filter(log => log.level === 'WARNING').length,
            success: this.logs.filter(log => log.level === 'SUCCESS').length
        };

        document.getElementById('totalLogs').textContent = stats.total.toLocaleString();
        document.getElementById('errorLogs').textContent = stats.error.toLocaleString();
        document.getElementById('warningLogs').textContent = stats.warning.toLocaleString();
        document.getElementById('successLogs').textContent = stats.success.toLocaleString();
    }

    // تحديث التصفح
    updatePagination(totalItems, currentPage, pageSize) {
        const totalPages = Math.ceil(totalItems / pageSize);
        const pagination = document.getElementById('logsPagination');
        
        if (!pagination) return;

        let html = '';
        
        // السابق
        html += `
            <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="auditLogsSystem.displayLogs(${currentPage - 1})">
                    السابق
                </a>
            </li>
        `;

        // أرقام الصفحات
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
                html += `
                    <li class="page-item ${i === currentPage ? 'active' : ''}">
                        <a class="page-link" href="#" onclick="auditLogsSystem.displayLogs(${i})">${i}</a>
                    </li>
                `;
            }
        }

        // التالي
        html += `
            <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="auditLogsSystem.displayLogs(${currentPage + 1})">
                    التالي
                </a>
            </li>
        `;

        pagination.innerHTML = html;
    }

    // عرض تفاصيل السجل
    showLogDetails(logId) {
        const log = this.logs.find(l => l.id === logId);
        if (!log) return;

        const details = `
            <div class="modal fade" id="logDetailsModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">تفاصيل السجل</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <pre>${JSON.stringify(log, null, 2)}</pre>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', details);
        const modal = new bootstrap.Modal(document.getElementById('logDetailsModal'));
        modal.show();
    }

    // تصدير السجلات
    exportLogs() {
        const filteredLogs = this.getFilteredLogs();
        const blob = new Blob([JSON.stringify(filteredLogs, null, 2)], { 
            type: 'application/json' 
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // البحث في السجلات
    searchLogs() {
        this.displayLogs();
    }

    // تحديث السجلات
    refreshLogs() {
        this.updateStatistics();
        this.displayLogs();
    }

    // مسح السجلات القديمة
    clearLogs() {
        if (!confirm('هل أنت متأكد من مسح السجلات القديمة؟')) return;

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        this.logs = this.logs.filter(log => new Date(log.timestamp) > thirtyDaysAgo);
        this.saveLogs();
        this.updateStatistics();
        this.displayLogs();
    }

    // المراقبة المباشرة
    realTimeMonitor() {
        const monitorWindow = window.open('', '_blank', 'width=800,height=600');
        
        const monitorHTML = `
            <!DOCTYPE html>
            <html dir="rtl" lang="ar">
            <head>
                <meta charset="UTF-8">
                <title>مراقبة سجلات التدقيق المباشرة</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
                <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
            </head>
            <body>
                <div class="container-fluid">
                    <h2>مراقبة سجلات التدقيق المباشرة</h2>
                    <div id="realTimeLogs"></div>
                </div>
                <script>
                    let logs = [];
                    setInterval(() => {
                        // جلب السجلات الجديدة من النافذة الرئيسية
                        window.opener.auditLogsSystem.getNewLogs().then(newLogs => {
                            newLogs.forEach(log => {
                                logs.unshift(log);
                                const logDiv = document.createElement('div');
                                logDiv.className = 'alert alert-' + getLogLevelClass(log.level);
                                logDiv.innerHTML = \`
                                    <strong>\${log.timestamp}</strong> - 
                                    \${log.level} - 
                                    \${log.action}
                                \`;
                                document.getElementById('realTimeLogs').prepend(logDiv);
                            });
                            
                            // الاحتفاظ بآخر 100 سجل في العرض
                            if (logs.length > 100) {
                                logs = logs.slice(0, 100);
                                const allLogs = document.getElementById('realTimeLogs').children;
                                for (let i = 100; i < allLogs.length; i++) {
                                    allLogs[i].remove();
                                }
                            }
                        });
                    }, 1000);
                    
                    function getLogLevelClass(level) {
                        const classes = {
                            'CRITICAL': 'danger',
                            'ERROR': 'danger',
                            'WARNING': 'warning',
                            'INFO': 'info',
                            'SUCCESS': 'success'
                        };
                        return classes[level] || 'secondary';
                    }
                </script>
            </body>
            </html>
        `;

        monitorWindow.document.write(monitorHTML);
        monitorWindow.document.close();
    }

    // الحصول على سجلات جديدة
    async getNewLogs() {
        return new Promise(resolve => {
            resolve(this.logs.slice(0, 10));
        });
    }

    // تنظيف السجلات القديمة
    cleanupOldLogs() {
        // تنظيف تلقائي كل 24 ساعة
        setInterval(() => {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const beforeCount = this.logs.length;
            this.logs = this.logs.filter(log => new Date(log.timestamp) > thirtyDaysAgo);
            const afterCount = this.logs.length;

            if (beforeCount !== afterCount) {
                this.saveLogs();
                console.log(`🧹 Cleaned up ${beforeCount - afterCount} old audit logs`);
            }
        }, 24 * 60 * 60 * 1000);
    }

    // دوال مساعدة
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    getCurrentUserId() {
        return window.authSystem?.currentUser?.id || 'anonymous';
    }

    getSessionId() {
        return sessionStorage.getItem('sessionId') || this.generateId();
    }

    getClientIP() {
        // في التطبيق الحقيقي احصل من IP من الخادم
        return 'client-ip';
    }

    getStackTrace() {
        return new Error().stack;
    }

    sanitizeData(data) {
        if (!data) return null;
        
        // إزالة الحقول الحساسة
        const sanitized = { ...data };
        delete sanitized.password;
        delete sanitized.token;
        delete sanitized.secret;
        
        return sanitized;
    }

    detectChanges(oldData, newData) {
        if (!oldData || !newData) return null;
        
        const changes = {};
        Object.keys(newData).forEach(key => {
            if (oldData[key] !== newData[key]) {
                changes[key] = {
                    old: oldData[key],
                    new: newData[key]
                };
            }
        });
        
        return Object.keys(changes).length > 0 ? changes : null;
    }

    formatDateTime(timestamp) {
        return new Date(timestamp).toLocaleString('ar-SA');
    }

    saveLogs() {
        localStorage.setItem('auditLogs', JSON.stringify(this.logs));
    }

    sendLogToServer(logEntry) {
        // إرسال للخادم (إذا كان متصلاً)
        if (navigator.onLine) {
            // في التطبيق الحقيقي أرسل للخادم
            console.log('Sending log to server:', logEntry);
        }
    }

    showCriticalNotification(logEntry) {
        if (typeof showToast === 'function') {
            showToast(`🚨 ${logEntry.action}: ${logEntry.details.message || 'حدث حرج يتطلب الانتباه'}`, 'error');
        }
    }

    exportLog(logId) {
        const log = this.logs.find(l => l.id === logId);
        if (!log) return;

        const blob = new Blob([JSON.stringify(log, null, 2)], { 
            type: 'application/json' 
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit_log_${logId}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    investigateLog(logId) {
        const log = this.logs.find(l => l.id === logId);
        if (!log) return;

        // فتح نافذة تحقيق
        const investigationWindow = window.open('', '_blank', 'width=600,height=400');
        investigationWindow.document.write(`
            <h2>تحقيق السجل: ${logId}</h2>
            <pre>${JSON.stringify(log, null, 2)}</pre>
        `);
    }
}

// تهيئة نظام سجلات التدقيق
let auditLogsSystem;

window.addEventListener('DOMContentLoaded', () => {
    auditLogsSystem = new AuditLogsSystem();
    console.log('🔍 Audit Logs System initialized');
});

console.log('🔍 Audit Logs System loaded');
