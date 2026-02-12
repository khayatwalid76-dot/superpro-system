// نظام متعدد الشركات (Multi-tenant SaaS)
// Multi-tenant SaaS System

class MultiTenantSystem {
    constructor() {
        this.currentTenant = null;
        this.tenants = JSON.parse(localStorage.getItem('tenants') || '[]');
        this.tenantConfig = {
            default: {
                name: 'Default',
                domain: 'app.superpro.com',
                database: 'superpro_default',
                maxUsers: 10,
                features: ['employees', 'clients', 'contracts', 'reports'],
                theme: 'light',
                language: 'ar',
                timezone: 'Asia/Riyadh',
                currency: 'QAR',
                dateFormat: 'DD/MM/YYYY',
                company: {
                    name: 'شركة افتراضية',
                    logo: null,
                    address: '',
                    phone: '',
                    email: 'info@superpro.com'
                },
                billing: {
                    plan: 'free',
                    subscriptionId: null,
                    trialEndsAt: null,
                    maxStorage: 100, // MB
                    maxAPIRequests: 1000 // per month
                },
                security: {
                    require2FA: false,
                    sessionTimeout: 30, // minutes
                    passwordPolicy: {
                        minLength: 8,
                        requireUppercase: true,
                        requireLowercase: true,
                        requireNumbers: true,
                        requireSpecialChars: false
                    }
                },
                integrations: {
                    email: false,
                    sms: false,
                    backup: false,
                    analytics: false
                },
                customization: {
                    primaryColor: '#3498db',
                    secondaryColor: '#2c3e50',
                    logo: null,
                    favicon: null,
                    customCSS: null
                }
            }
        };
        
        this.init();
    }

    init() {
        this.setupTenantUI();
        this.detectCurrentTenant();
        this.setupTenantRouting();
        this.setupTenantIsolation();
        this.setupBillingSystem();
    }

    // الكشف عن المستأجر الحالي
    detectCurrentTenant() {
        const hostname = window.location.hostname;
        
        // البحث عن المستأجر بناءً على النطاق
        for (const tenant of this.tenants) {
            if (hostname === tenant.domain || hostname.includes(`${tenant.subdomain}.`)) {
                this.currentTenant = tenant;
                this.applyTenantConfiguration(tenant);
                console.log(`🏢 Current tenant detected: ${tenant.name}`);
                return;
            }
        }
        
        // إذا لم يتم العثور على مستأجر، استخدم الإعدادات الافتراضية
        this.currentTenant = { ...this.tenantConfig.default, id: 'default' };
        this.applyTenantConfiguration(this.currentTenant);
    }

    // تطبيق إعدادات المستأجر
    applyTenantConfiguration(tenant) {
        // تطبيق الثيم
        if (tenant.customization) {
            this.applyTheme(tenant.customization);
        }
        
        // تطبيق اللغة والتوقيت
        if (tenant.language) {
            document.documentElement.lang = tenant.language;
        }
        
        if (tenant.timezone) {
            // تطبيق التوقيت في التطبيق
            console.log(`Timezone set to: ${tenant.timezone}`);
        }
        
        // تطبيق العملة
        if (tenant.currency) {
            window.currency = tenant.currency;
        }
        
        // تطبيق سياساس الأمان
        this.applySecuritySettings(tenant.security);
        
        // تطبيق قيود الميزات
        this.applyFeatureRestrictions(tenant.features);
        
        // حفظ المستأجر الحالي
        localStorage.setItem('currentTenant', JSON.stringify(tenant));
    }

    // تطبيق الثيم
    applyTheme(customization) {
        const root = document.documentElement;
        
        if (customization.primaryColor) {
            root.style.setProperty('--primary', customization.primaryColor);
        }
        
        if (customization.secondaryColor) {
            root.style.setProperty('--secondary', customization.secondaryColor);
        }
        
        if (customization.customCSS) {
            const style = document.createElement('style');
            style.textContent = customization.customCSS;
            document.head.appendChild(style);
        }
        
        if (customization.favicon) {
            const favicon = document.querySelector('link[rel="icon"]');
            if (favicon) {
                favicon.href = customization.favicon;
            }
        }
    }

    // تطبيق إعدادات الأمان
    applySecuritySettings(security) {
        // تطبيق سياسة كلمات المرور
        if (security.passwordPolicy) {
            window.passwordPolicy = security.passwordPolicy;
        }
        
        // تطبيق مهلة الجلسة
        if (security.sessionTimeout) {
            window.sessionTimeout = security.sessionTimeout * 60 * 1000; // تحويل إلى مللي ثانية
        }
        
        // تطبيق المصادقة الثنائية
        if (security.require2FA) {
            window.require2FA = true;
        }
    }

    // تطبيق قيود الميزات
    applyFeatureRestrictions(features) {
        window.tenantFeatures = features;
        
        // إخفاء الوحدود غير المسموح بها
        this.restrictUIFeatures(features);
    }

    // تقييد واجهة المستخدم حسب الميزات
    restrictUIFeatures(features) {
        document.querySelectorAll('[data-feature]').forEach(element => {
            const feature = element.dataset.feature;
            if (!features.includes(feature)) {
                element.style.display = 'none';
                element.disabled = true;
            } else {
                element.style.display = '';
                element.disabled = false;
            }
        });
    }

    // إعداد توجيه المستأجرين
    setupTenantRouting() {
        // إضافة مسار فرعي للمستأجرين
        const pathParts = window.location.pathname.split('/');
        
        if (pathParts.length > 1 && pathParts[0]) {
            const subdomain = pathParts[0];
            const tenant = this.tenants.find(t => t.subdomain === subdomain);
            
            if (tenant) {
                this.currentTenant = tenant;
                this.applyTenantConfiguration(tenant);
            }
        }
    }

    // إعداد عزل المستأجرين
    setupTenantIsolation() {
        // عزل البيانات حسب المستأجر
        this.setupDataIsolation();
        this.setupStorageIsolation();
        this.setupCacheIsolation();
    }

    // عزل البيانات
    setupDataIsolation() {
        // في التطبيق الحقيقي، سيتم استخدام قواعد بيانات منفصلة لكل مستأجر
        console.log('Data isolation setup for multi-tenant');
    }

    // عزل التخزين
    setupStorageIsolation() {
        // استخدام مفاتاحات مختلفة لكل مستأجر
        const tenantPrefix = this.currentTenant?.id || 'default';
        
        // تجاوز دوال التخزين
        const originalSetItem = localStorage.setItem.bind(localStorage);
        const originalGetItem = localStorage.getItem.bind(localStorage);
        const originalRemoveItem = localStorage.removeItem.bind(localStorage);
        
        localStorage.setItem = (key, value) => {
            originalSetItem(`${tenantPrefix}_${key}`, value);
        };
        
        localStorage.getItem = (key) => {
            return originalGetItem(`${tenantPrefix}_${key}`);
        };
        
        localStorage.removeItem = (key) => {
            originalRemoveItem(`${tenantPrefix}_${key}`);
        };
        
        // حفظ الدوال الأصلية للاستخدامها
        localStorage.originalSetItem = originalSetItem;
        localStorage.originalGetItem = originalGetItem;
        localStorage.originalRemoveItem = originalRemoveItem;
    }

    // عزل التخزين المؤقت
    setupCacheIsolation() {
        // استخدام مفاتيح مؤقتة مختلفة لكل مستأجر
        const tenantPrefix = this.currentTenant?.id || 'default';
        
        // تجاوز دوال sessionStorage
        const originalSetItem = sessionStorage.setItem.bind(sessionStorage);
        const originalGetItem = sessionStorage.getItem.bind(sessionStorage);
        const originalRemoveItem = sessionStorage.removeItem.bind(sessionStorage);
        
        sessionStorage.setItem = (key, value) => {
            originalSetItem(`${tenantPrefix}_${key}`, value);
        };
        
        sessionStorage.getItem = (key) => {
            return originalGetItem(`${tenantPrefix}_${key}`);
        };
        
        sessionStorage.removeItem = (key) => {
            originalRemoveItem(`${tenantPrefix}_${key}`);
        };
    }

    // إعداد واجهة المستأجرين
    setupTenantUI() {
        const settingsSection = document.querySelector('.settings-section');
        if (!settingsSection) return;

        const tenantUI = `
            <div class="mb-4">
                <h5><i class="fas fa-building me-2"></i>نظام متعدد الشركات (Multi-tenant)</h5>
                
                <!-- معلومات المستأجر الحالي -->
                <div class="card mb-3">
                    <div class="card-header">
                        <h6 class="mb-0">المستأجر الحالي</h6>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-6">
                                <label class="form-label">اسم المستأجر</label>
                                <input type="text" class="form-control" id="tenantName" readonly value="${this.currentTenant?.name || 'Default'}">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">النطاق</label>
                                <input type="text" class="form-control" id="tenantDomain" readonly value="${this.currentTenant?.domain || 'app.superpro.com'}">
                            </div>
                        </div>
                        <div class="row mt-2">
                            <div class="col-md-6">
                                <label class="form-label">الخطة</label>
                                <input type="text" class="form-control" id="tenantPlan" readonly value="${this.currentTenant?.billing?.plan || 'free'}">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">المستخدمون</label>
                                <input type="text" class="form-control" id="tenantUsers" readonly value="${this.getUserCount()} / ${this.currentTenant?.maxUsers || 10}">
                            </div>
                        </div>
                        <div class="row mt-2">
                            <div class="col-12">
                                <div class="progress">
                                    <div class="progress-bar" style="width: ${this.getStorageUsagePercentage()}%">
                                        ${this.getStorageUsagePercentage()}%} مساحة مستخدمة
                                    </div>
                                </div>
                                <small class="text-muted">${this.getStorageUsage()}/${this.currentTenant?.billing?.maxStorage || 100} MB</small>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- إدارة المستأجرين -->
                <div class="card mb-3">
                    <div class="card-header">
                        <h6 class="mb-0">إدارة المستأجرين</h6>
                    </div>
                    <div class="card-body">
                        <div class="row mb-3">
                            <div class="col-md-8">
                                <label class="form-label">إنشاء مستأجر جديد</label>
                                <div class="input-group">
                                    <input type="text" class="form-control" id="newTenantName" placeholder="اسم المستأجر">
                                    <span class="input-group-text">.superpro.com</span>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <label class="form-label">&nbsp;</label>
                                <button class="btn btn-primary w-100" onclick="multiTenantSystem.createTenant()">
                                    <i class="fas fa-plus me-2"></i>إنشاء
                                </button>
                            </div>
                        </div>
                        
                        <!-- قائمة المستأجرين -->
                        <div class="table-responsive">
                            <table class="table table-sm">
                                <thead>
                                    <tr>
                                        <th>الاسم</th>
                                        <th>النطاق</th>
                                        <th>الخطة</th>
                                        <th>المستخدمون</th>
                                        <th>الحالة</th>
                                        <th>الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody id="tenantsList">
                                    ${this.renderTenantsList()}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- إعدادات المستأجر -->
                <div class="card mb-3">
                    <div class="card-header">
                        <h6 class="mb-0">إعدادات المستأجر</h6>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-6">
                                <label class="form-label">اسم الشركة</label>
                                <input type="text" class="form-control" id="companyName" value="${this.currentTenant?.company?.name || ''}" placeholder="اسم الشركة">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">البريد الإلكتروني</label>
                                <input type="email" class="form-control" id="companyEmail" value="${this.currentTenant?.company?.email || ''}" placeholder="info@company.com">
                            </div>
                        </div>
                        <div class="row mt-2">
                            <div class="col-md-6">
                                <label class="form-label">هاتف الشركة</label>
                                <input type="tel" class="form-control" id="companyPhone" value="${this.currentTenant?.company?.phone || ''}" placeholder="+9665000000">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">العنوان</label>
                                <input type="text" class="form-control" id="companyAddress" value="${this.currentTenant?.company?.address || ''}" placeholder="العنوان">
                            </div>
                        </div>
                        <div class="row mt-2">
                            <div class="col-md-6">
                                <label class="form-label">اللغة الافتراضية</label>
                                <select class="form-select" id="defaultLanguage">
                                    <option value="ar" ${this.currentTenant?.language === 'ar' ? 'selected' : ''}>العربية</option>
                                    <option value="en" ${this.currentTenant?.language === 'en' ? 'selected' : ''}>English</option>
                                    <option value="fr" ${this.currentTenant?.language === 'fr' ? 'selected' : ''}>Français</option>
                                </select>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">العملة الافتراضية</label>
                                <select class="form-select" id="defaultCurrency">
                                    <option value="QAR" ${this.currentTenant?.currency === 'QAR' ? 'selected' : ''}>ريال قطري</option>
                                    <option value="SAR" ${this.currentTenant?.currency === 'SAR' ? 'selected' : ''}>ريال سعودي</option>
                                    <option value="AED" ${this.currentTenant?.currency === 'AED' ? 'selected' : ''}>درهم إماراتي</option>
                                    <option value="USD" ${this.currentTenant?.currency === 'USD' ? 'selected' : ''}>دولار أمريكي</option>
                                </select>
                            </div>
                        </div>
                        <div class="row mt-3">
                            <div class="col-12">
                                <button class="btn btn-success" onclick="multiTenantSystem.saveTenantSettings()">
                                    <i class="fas fa-save me-2"></i>حفظ الإعدادات
                                </button>
                                <button class="btn btn-info" onclick="multiTenantSystem.exportTenantData()">
                                    <i class="fas fa-download me-2"></i>تصدير البيانات
                                </button>
                                <button class="btn btn-warning" onclick="multiTenantSystem.switchTenant()">
                                    <i class="fas fa-exchange-alt me-2"></i>تبديل المستأجر
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- الفوترة التجريبية -->
                <div class="card mb-3">
                    <div class="card-header">
                        <h6 class="mb-0">الفترة التجريبية</h6>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-6">
                                <label class="form-label">تاريخ انتهاء الفترة</label>
                                <input type="date" class="form-control" id="trialEndDate" value="${this.currentTenant?.billing?.trialEndsAt || ''}" readonly>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">الأيام المتبقية</label>
                                <input type="text" class="form-control" id="trialDaysLeft" value="${this.getTrialDaysLeft()}" readonly>
                            </div>
                        </div>
                        <div class="row mt-2">
                            <div class="col-12">
                                <button class="btn btn-primary" onclick="multiTenantSystem.upgradePlan()">
                                    <i class="fas fa-rocket me-2"></i>ترقية الخطة
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        settingsSection.insertAdjacentHTML('afterbegin', tenantUI);
    }

    // عرض قائمة المستأجرين
    renderTenantsList() {
        let html = '';
        
        this.tenants.forEach(tenant => {
            const statusColor = tenant.status === 'active' ? 'success' : 
                                 tenant.status === 'trial' ? 'warning' : 'secondary';
            
            html += `
                <tr>
                    <td>${tenant.name}</td>
                    <td>${tenant.domain}</td>
                    <td><span class="badge bg-info">${tenant.billing?.plan || 'free'}</span></td>
                    <td>${this.getUserCount(tenant.id)} / ${tenant.maxUsers}</td>
                    <td><span class="badge bg-${statusColor}">${tenant.status}</span></td>
                    <td>
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-sm btn-outline-primary" onclick="multiTenantSystem.editTenant('${tenant.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-info" onclick="multiTenantSystem.viewTenantStats('${tenant.id}')">
                                <i class="fas fa-chart-bar"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="multiTenantSystem.deleteTenant('${tenant.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });

        if (html === '') {
            html = '<tr><td colspan="6" class="text-center text-muted">لا توجد مستأجرين</td></tr>';
        }

        return html;
    }

    // الحصول على عدد المستخدمين
    getUserCount(tenantId = null) {
        if (tenantId) {
            const tenant = this.tenants.find(t => t.id === tenantId);
            return tenant ? Object.keys(localStorage).filter(key => key.startsWith(`${tenantId}_user_`)).length : 0;
        }
        return Object.keys(localStorage).filter(key => key.startsWith('user_')).length;
    }

    // الحصول على استخدام التخزين
    getStorageUsage(tenantId = null) {
        if (tenantId) {
            const tenant = this.tenants.find(t => t.id === tenantId);
            if (tenant) {
                const usage = this.calculateStorageUsage(tenantId);
                return usage;
            }
        }
        return this.calculateStorageUsage();
    }

    // حساب استخدام التخزين
    calculateStorageUsage(tenantId = null) {
        const prefix = tenantId ? `${tenantId}_` : '';
        let totalSize = 0;
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(prefix)) {
                totalSize += localStorage.getItem(key).length;
            }
        }
        
        return Math.round(totalSize / (1024 * 1024)); // Convert to MB
    }

    // الحصول على نسبة استخدام التخزين
    getStorageUsagePercentage(tenantId = null) {
        const maxStorage = this.currentTenant?.billing?.maxStorage || 100;
        const usage = this.getStorageUsage(tenantId);
        return Math.min(Math.round((usage / maxStorage) * 100), 100);
    }

    // الحصول على الأيام المتبقية للفترة التجريبية
    getTrialDaysLeft() {
        if (!this.currentTenant?.billing?.trialEndsAt) {
            return 'N/A';
        }
        
        const trialEnd = new Date(this.currentTenant.billing.trialEndsAt);
        const today = new Date();
        const diffTime = trialEnd - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays > 0 ? diffDays : 0;
    }

    // إنشاء مستأجر جديد
    createTenant() {
        const name = document.getElementById('newTenantName').value.trim();
        if (!name) {
            alert('الرجاء إدخال اسم المستأجر');
            return;
        }

        const subdomain = name.toLowerCase().replace(/[^a-z0-9]/g, '');
        const domain = `${subdomain}.superpro.com`;
        
        const newTenant = {
            id: this.generateId(),
            name: name,
            subdomain: subdomain,
            domain: domain,
            status: 'trial',
            billing: {
                plan: 'trial',
                trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days trial
                maxStorage: 50,
                maxAPIRequests: 500
            },
            createdAt: new Date().toISOString(),
            ...this.tenantConfig.default
        };

        this.tenants.push(newTenant);
        this.saveTenants();
        
        alert(`✅ تم إنشاء المستأجر "${name}" بنجاح`);
        alert(`النطاق: ${domain}`);
        alert(`المدة التجريبية: 14 يوم`);
    }

    // تعديل المستأجر
    editTenant(tenantId) {
        const tenant = this.tenants.find(t => t.id === tenantId);
        if (!tenant) return;

        const newName = prompt('تعديل اسم المستأجر:', tenant.name);
        if (newName && newName !== tenant.name) {
            tenant.name = newName;
            this.saveTenants();
            alert('✅ تم تعديل المستأجر بنجاح');
        }
    }

    // عرض إحصائيات المستأجر
    viewTenantStats(tenantId) {
        const tenant = this.tenants.find(t => t.id === tenantId);
        if (!tenant) return;

        const stats = {
            name: tenant.name,
            users: this.getUserCount(tenantId),
            storage: this.getStorageUsage(tenantId),
            storagePercentage: this.getStorageUsagePercentage(tenantId),
            apiRequests: this.getAPIRequestCount(tenantId),
            status: tenant.status,
            plan: tenant.billing?.plan,
            trialDaysLeft: this.getTrialDaysLeft()
        };

        alert(`إحصائيات المستأجر "${tenant.name}":\n\n${JSON.stringify(stats, null, 2)}`);
    }

    // حذف المستأجر
    deleteTenant(tenantId) {
        if (!confirm('هل أنت متأكد من حذف هذا المستأجر؟ سيتم حذف جميع بياناته.')) {
            return;
        }

        this.tenants = this.tenants.filter(t => t.id !== tenantId);
        this.saveTenants();
        
        // حذف بيانات المستأجر
        this.deleteTenantData(tenantId);
        
        alert('✅ تم حذف المستأجر بنجاح');
    }

    // حذف بيانات المستأجر
    deleteTenantData(tenantId) {
        const keysToDelete = [];
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(`${tenantId}_`)) {
                keysToDelete.push(key);
            }
        }
        
        keysToDelete.forEach(key => localStorage.removeItem(key));
    }

    // حفظ المستأجرين
    saveTenants() {
        localStorage.setItem('tenants', JSON.stringify(this.tenants));
    }

    // حفظ إعدادات المستأجر
    saveTenantSettings() {
        const tenant = this.currentTenant;
        if (!tenant || tenant.id === 'default') {
            alert('لا يمكن تعديل إعدادات المستأجر الافتراضي');
            return;
        }

        const tenantIndex = this.tenants.findIndex(t => t.id === tenant.id);
        if (tenantIndex === -1) return;

        // تحديث بيانات المستأجر
        this.tenants[tenantIndex] = {
            ...this.tenants[tenantIndex],
            company: {
                ...this.tenants[tenantIndex].company,
                name: document.getElementById('companyName').value,
                email: document.getElementById('companyEmail').value,
                phone: document.getElementById('companyPhone').value,
                address: document.getElementById('companyAddress').value
            },
            customization: {
                ...this.tenants[tenantIndex].customization,
                language: document.getElementById('defaultLanguage').value,
                currency: document.getElementById('defaultCurrency').value
            }
        };

        this.saveTenants();
        this.currentTenant = this.tenants[tenantIndex];
        this.applyTenantConfiguration(this.currentTenant);
        
        alert('✅ تم حفظ إعدادات المستأجر بنجاح');
    }

    // تصدير بيانات المستأجر
    exportTenantData() {
        const tenantData = {
            tenant: this.currentTenant,
            users: this.exportTenantUsers(),
            settings: this.exportTenantSettings(),
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(tenantData, null, 2)], { 
            type: 'application/json' 
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tenant_data_${this.currentTenant.name}_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // تصدير مستخدمي المستأجر
    exportTenantUsers() {
        const users = [];
        const prefix = `${this.currentTenant.id}_user_`;
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(prefix)) {
                const userId = key.replace(prefix, '');
                const userData = JSON.parse(localStorage.getItem(key));
                users.push({ id: userId, ...userData });
            }
        }
        
        return users;
    }

    // تصدير إعدادات المستأجر
    exportTenantSettings() {
        const settings = {};
        const prefix = `${this.currentTenant.id}_setting_`;
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(prefix)) {
                const settingKey = key.replace(prefix, '');
                settings[settingKey] = localStorage.getItem(key);
            }
        }
        
        return settings;
    }

    // تبديل المستأجر
    switchTenant() {
        const tenantList = this.tenants.map(t => ({
            value: t.id,
            label: `${t.name} (${t.domain})`
        }));

        const selected = prompt('اختر المستأجر للتبديل إليه:\n\n' + 
            tenantList.map((t, i) => `${i + 1}. ${t.label}`).join('\n'));

        if (selected) {
            const tenantIndex = parseInt(selected) - 1;
            const tenant = this.tenants[tenantIndex];
            
            if (tenant) {
                this.currentTenant = tenant;
                this.applyTenantConfiguration(tenant);
                
                // إعادة التوجيه إلى نطاق المستأجر
                if (tenant.domain !== window.location.hostname) {
                    window.location.href = `https://${tenant.domain}`;
                }
            }
        }
    }

    // ترقية الخطة
    upgradePlan() {
        alert('سيتم توجيهك إلى صفحة ترقية الخطة...');
        // في التطبيق الحقيقي: window.location.href = '/billing/upgrade';
    }

    // الحصول على عدد طلبات API
    getAPIRequestCount(tenantId = null) {
        // في التطبيق الحقيقي، سيتم تتبع الطلبات في قاعدة البيانات
        return Math.floor(Math.random() * 100); // محاكاة
    }

    // دوال مساعدة
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
}

// تهيئة نظام متعدد الشركات
let multiTenantSystem;

window.addEventListener('DOMContentLoaded', () => {
    multiTenantSystem = new MultiTenantSystem();
    console.log('🏢 Multi-tenant System initialized');
});

console.log('🏢 Multi-tenant System loaded');
