// واجهة برمجية REST API كاملة مع Swagger
// Complete REST API with Swagger Documentation

class RestAPISystem {
    constructor() {
        this.baseURL = window.location.origin + '/api';
        this.version = 'v1';
        this.endpoints = {
            auth: '/auth',
            users: '/users',
            employees: '/employees',
            clients: '/clients',
            contracts: '/contracts',
            attendance: '/attendance',
            financial: '/financial',
            reports: '/reports',
            notifications: '/notifications',
            audit: '/audit',
            system: '/system'
        };
        
        this.rateLimits = {
            default: { requests: 1000, window: 3600000 }, // 1000 requests per hour
            premium: { requests: 5000, window: 3600000 }, // 5000 requests per hour
            enterprise: { requests: 10000, window: 3600000 } // 10000 requests per hour
        };
        
        this.apiKeys = new Map();
        this.swaggerSpec = null;
        this.init();
    }

    init() {
        this.setupAPIRoutes();
        this.generateSwaggerSpec();
        this.setupMiddleware();
        this.setupCORS();
        this.setupRateLimiting();
        this.setupAPIKeySystem();
    }

    // إعداد مسارات API
    setupAPIRoutes() {
        // في التطبيق الحقيقي، هذه المسارات ستكون على الخادم
        // هنا محاكاة للعميل
        this.setupClientAPI();
    }

    // إعداد API للعميل
    setupClientAPI() {
        window.SuperProAPI = {
            // المصادقة
            auth: {
                login: (credentials) => this.apiRequest('POST', '/auth/login', credentials),
                logout: () => this.apiRequest('POST', '/auth/logout'),
                refresh: (token) => this.apiRequest('POST', '/auth/refresh', { token }),
                register: (userData) => this.apiRequest('POST', '/auth/register', userData),
                forgotPassword: (email) => this.apiRequest('POST', '/auth/forgot-password', { email }),
                resetPassword: (data) => this.apiRequest('POST', '/auth/reset-password', data)
            },
            
            // المستخدمين
            users: {
                getAll: (params = {}) => this.apiRequest('GET', '/users', null, params),
                getById: (id) => this.apiRequest('GET', `/users/${id}`),
                create: (userData) => this.apiRequest('POST', '/users', userData),
                update: (id, userData) => this.apiRequest('PUT', `/users/${id}`, userData),
                delete: (id) => this.apiRequest('DELETE', `/users/${id}`),
                changePassword: (id, passwords) => this.apiRequest('POST', `/users/${id}/change-password`, passwords),
                updateRole: (id, role) => this.apiRequest('PUT', `/users/${id}/role`, { role })
            },
            
            // الموظفين
            employees: {
                getAll: (params = {}) => this.apiRequest('GET', '/employees', null, params),
                getById: (id) => this.apiRequest('GET', `/employees/${id}`),
                create: (employeeData) => this.apiRequest('POST', '/employees', employeeData),
                update: (id, employeeData) => this.apiRequest('PUT', `/employees/${id}`, employeeData),
                delete: (id) => this.apiRequest('DELETE', `/employees/${id}`),
                bulkImport: (data) => this.apiRequest('POST', '/employees/bulk', { data }),
                bulkExport: (params) => this.apiRequest('GET', '/employees/export', null, params),
                search: (query) => this.apiRequest('GET', '/employees/search', null, { q: query })
            },
            
            // العملاء
            clients: {
                getAll: (params = {}) => this.apiRequest('GET', '/clients', null, params),
                getById: (id) => this.apiRequest('GET', `/clients/${id}`),
                create: (clientData) => this.apiRequest('POST', '/clients', clientData),
                update: (id, clientData) => this.apiRequest('PUT', `/clients/${id}`, clientData),
                delete: (id) => this.apiRequest('DELETE', `/clients/${id}`),
                getContracts: (id) => this.apiRequest('GET', `/clients/${id}/contracts`),
                addContract: (id, contractData) => this.apiRequest('POST', `/clients/${id}/contracts`, contractData)
            },
            
            // العقود
            contracts: {
                getAll: (params = {}) => this.apiRequest('GET', '/contracts', null, params),
                getById: (id) => this.apiRequest('GET', `/contracts/${id}`),
                create: (contractData) => this.apiRequest('POST', '/contracts', contractData),
                update: (id, contractData) => this.apiRequest('PUT', `/contracts/${id}`, contractData),
                delete: (id) => this.apiRequest('DELETE', `/contracts/${id}`),
                renew: (id, renewalData) => this.apiRequest('POST', `/contracts/${id}/renew`, renewalData),
                terminate: (id, terminationData) => this.apiRequest('POST', `/contracts/${id}/terminate`, terminationData)
            },
            
            // الحضور
            attendance: {
                getAll: (params = {}) => this.apiRequest('GET', '/attendance', null, params),
                getById: (id) => this.apiRequest('GET', `/attendance/${id}`),
                checkIn: (data) => this.apiRequest('POST', '/attendance/checkin', data),
                checkOut: (data) => this.apiRequest('POST', '/attendance/checkout', data),
                bulkImport: (data) => this.apiRequest('POST', '/attendance/bulk', { data }),
                getReport: (params) => this.apiRequest('GET', '/attendance/report', null, params)
            },
            
            // المالية
            financial: {
                getTransactions: (params = {}) => this.apiRequest('GET', '/financial/transactions', null, params),
                getIncome: (params = {}) => this.apiRequest('GET', '/financial/income', null, params),
                getExpenses: (params = {}) => this.apiRequest('GET', '/financial/expenses', null, params),
                addTransaction: (data) => this.apiRequest('POST', '/financial/transactions', data),
                addIncome: (data) => this.apiRequest('POST', '/financial/income', data),
                addExpense: (data) => this.apiRequest('POST', '/financial/expenses', data),
                getBalance: () => this.apiRequest('GET', '/financial/balance'),
                getReport: (params) => this.apiRequest('GET', '/financial/report', null, params)
            },
            
            // التقارير
            reports: {
                generate: (reportConfig) => this.apiRequest('POST', '/reports/generate', reportConfig),
                getHistory: () => this.apiRequest('GET', '/reports/history'),
                getById: (id) => this.apiRequest('GET', `/reports/${id}`),
                download: (id, format) => this.apiRequest('GET', `/reports/${id}/download`, null, { format }),
                schedule: (scheduleConfig) => this.apiRequest('POST', '/reports/schedule', scheduleConfig)
            },
            
            // الإشعارات
            notifications: {
                send: (notificationData) => this.apiRequest('POST', '/notifications/send', notificationData),
                getHistory: (params = {}) => this.apiRequest('GET', '/notifications/history', null, params),
                markAsRead: (id) => this.apiRequest('PUT', `/notifications/${id}/read`),
                getPreferences: (userId) => this.apiRequest('GET', `/notifications/preferences/${userId}`),
                updatePreferences: (userId, preferences) => this.apiRequest('PUT', `/notifications/preferences/${userId}`, preferences)
            },
            
            // سجلات التدقيق
            audit: {
                getLogs: (params = {}) => this.apiRequest('GET', '/audit/logs', null, params),
                getById: (id) => this.apiRequest('GET', `/audit/logs/${id}`),
                export: (params) => this.apiRequest('GET', '/audit/export', null, params),
                search: (query) => this.apiRequest('GET', '/audit/search', null, { q: query })
            },
            
            // النظام
            system: {
                getHealth: () => this.apiRequest('GET', '/system/health'),
                getMetrics: () => this.apiRequest('GET', '/system/metrics'),
                getStats: () => this.apiRequest('GET', '/system/stats'),
                getConfiguration: () => this.apiRequest('GET', '/system/config'),
                updateConfiguration: (config) => this.apiRequest('PUT', '/system/config', config),
                backup: () => this.apiRequest('POST', '/system/backup'),
                restore: (backupId) => this.apiRequest('POST', '/system/restore', { backupId })
            }
        };
    }

    // طلب API عام
    async apiRequest(method, endpoint, data = null, params = {}) {
        const url = new URL(endpoint, this.baseURL);
        
        // إضافة معلمات الاستعلام
        Object.keys(params).forEach(key => {
            if (params[key] !== null && params[key] !== undefined) {
                url.searchParams.set(key, params[key]);
            }
        });

        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-API-Version': this.version
            }
        };

        // إضافة التوكن للمصادقة
        const token = localStorage.getItem('authToken');
        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        // إضافة مفتاح API
        const apiKey = this.getAPIKey();
        if (apiKey) {
            options.headers['X-API-Key'] = apiKey;
        }

        // إضافة البيانات
        if (data && (method === 'POST' || method === 'PUT')) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url.toString(), options);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const responseData = await response.json();
            
            return {
                success: true,
                data: responseData,
                status: response.status,
                headers: response.headers
            };
        } catch (error) {
            console.error('API Request Error:', error);
            return {
                success: false,
                error: error.message,
                status: 0
            };
        }
    }

    // توليد مواصفات Swagger
    generateSwaggerSpec() {
        this.swaggerSpec = {
            openapi: '3.0.0',
            info: {
                title: 'SUPER_PRO SYSTEM API',
                description: 'نظام إدارة الشركة المتكامل - واجهة برمجية REST',
                version: this.version,
                contact: {
                    name: 'SUPER_PRO Support',
                    email: 'support@superpro.com',
                    url: 'https://superpro.com/support'
                },
                license: {
                    name: 'MIT',
                    url: 'https://opensource.org/licenses/MIT'
                }
            },
            servers: [
                {
                    url: this.baseURL,
                    description: 'خادم الإنتاج'
                },
                {
                    url: 'https://api-staging.superpro.com',
                    description: 'خادم التطوير'
                }
            ],
            security: [
                {
                    bearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT'
                    }
                },
                {
                    apiKeyAuth: {
                        type: 'apiKey',
                        in: 'header',
                        name: 'X-API-Key'
                    }
                }
            ],
            paths: {
                '/auth/login': {
                    post: {
                        summary: 'تسجيل الدخول',
                        description: 'مصادقة المستخدم والحصول على توكن JWT',
                        tags: ['المصادقة'],
                        requestBody: {
                            required: true,
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        required: ['email', 'password'],
                                        properties: {
                                            email: {
                                                type: 'string',
                                                format: 'email',
                                                description: 'البريد الإلكتروني'
                                            },
                                            password: {
                                                type: 'string',
                                                format: 'password',
                                                description: 'كلمة المرور'
                                            },
                                            rememberMe: {
                                                type: 'boolean',
                                                description: 'تذكرني'
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        responses: {
                            '200': {
                                description: 'تم تسجيل الدخول بنجاح',
                                content: {
                                    'application/json': {
                                        schema: {
                                            type: 'object',
                                            properties: {
                                                success: { type: 'boolean' },
                                                token: { type: 'string' },
                                                user: { $ref: '#/components/schemas/User' },
                                                expiresIn: { type: 'number' }
                                            }
                                        }
                                    }
                                }
                            },
                            '401': {
                                description: 'بيانات الاعتماد غير صحيحة'
                            }
                        }
                    }
                },
                '/employees': {
                    get: {
                        summary: 'الحصول على قائمة الموظفين',
                        description: 'استرجاع قائمة جميع الموظفين مع إمكانية التصفية',
                        tags: ['الموظفين'],
                        parameters: [
                            {
                                name: 'page',
                                in: 'query',
                                description: 'رقم الصفحة',
                                schema: { type: 'integer' }
                            },
                            {
                                name: 'limit',
                                in: 'query',
                                description: 'عدد النتائج في الصفحة',
                                schema: { type: 'integer' }
                            },
                            {
                                name: 'department',
                                in: 'query',
                                description: 'القسم',
                                schema: { type: 'string' }
                            },
                            {
                                name: 'status',
                                in: 'query',
                                description: 'حالة الموظف',
                                schema: { type: 'string', enum: ['active', 'inactive', 'on_leave'] }
                            }
                        ],
                        responses: {
                            '200': {
                                description: 'قائمة الموظفين',
                                content: {
                                    'application/json': {
                                        schema: {
                                            type: 'object',
                                            properties: {
                                                data: {
                                                    type: 'array',
                                                    items: { $ref: '#/components/schemas/Employee' }
                                                },
                                                pagination: { $ref: '#/components/schemas/Pagination' }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    post: {
                        summary: 'إضافة موظف جديد',
                        description: 'إنشاء موظف جديد في النظام',
                        tags: ['الموظفين'],
                        requestBody: {
                            required: true,
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/EmployeeInput' }
                                }
                            }
                        },
                        responses: {
                            '201': {
                                description: 'تم إنشاء الموظف بنجاح',
                                content: {
                                    'application/json': {
                                        schema: { $ref: '#/components/schemas/Employee' }
                                    }
                                }
                            },
                            '400': {
                                description: 'بيانات غير صالحة'
                            }
                        }
                    }
                },
                '/contracts': {
                    get: {
                        summary: 'الحصول على قائمة العقود',
                        description: 'استرجاع قائمة جميع العقود',
                        tags: ['العقود'],
                        parameters: [
                            {
                                name: 'status',
                                in: 'query',
                                description: 'حالة العقد',
                                schema: { type: 'string', enum: ['active', 'expired', 'terminated'] }
                            },
                            {
                                name: 'clientId',
                                in: 'query',
                                description: 'معرف العميل',
                                schema: { type: 'string' }
                            }
                        ],
                        responses: {
                            '200': {
                                description: 'قائمة العقود',
                                content: {
                                    'application/json': {
                                        schema: {
                                            type: 'object',
                                            properties: {
                                                data: {
                                                    type: 'array',
                                                    items: { $ref: '#/components/schemas/Contract' }
                                                },
                                                pagination: { $ref: '#/components/schemas/Pagination' }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                '/financial/balance': {
                    get: {
                        summary: 'الحصول على الرصيد المالي',
                        description: 'استرجاع الرصيد الحالي للنظام',
                        tags: ['المالية'],
                        responses: {
                            '200': {
                                description: 'الرصيد المالي',
                                content: {
                                    'application/json': {
                                        schema: {
                                            type: 'object',
                                            properties: {
                                                totalIncome: { type: 'number', description: 'إجمالي الإيرادات' },
                                                totalExpenses: { type: 'number', description: 'إجمالي المصروفات' },
                                                netBalance: { type: 'number', description: 'الرصيد الصافي' },
                                                currency: { type: 'string', description: 'العملة' },
                                                lastUpdated: { type: 'string', description: 'آخر تحديث' }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            components: {
                schemas: {
                    User: {
                        type: 'object',
                        properties: {
                            id: { type: 'string', description: 'معرف المستخدم' },
                            email: { type: 'string', format: 'email', description: 'البريد الإلكتروني' },
                            name: { type: 'string', description: 'الاسم الكامل' },
                            role: { type: 'string', enum: ['admin', 'manager', 'hr', 'accountant', 'employee'], description: 'دور المستخدم' },
                            department: { type: 'string', description: 'القسم' },
                            status: { type: 'string', enum: ['active', 'inactive'], description: 'حالة المستخدم' },
                            createdAt: { type: 'string', format: 'date-time', description: 'تاريخ الإنشاء' },
                            lastLogin: { type: 'string', format: 'date-time', description: 'آخر تسجيل دخول' }
                        }
                    },
                    Employee: {
                        type: 'object',
                        properties: {
                            id: { type: 'string', description: 'معرف الموظف' },
                            name: { type: 'string', description: 'اسم الموظف' },
                            email: { type: 'string', format: 'email', description: 'البريد الإلكتروني' },
                            phone: { type: 'string', description: 'رقم الهاتف' },
                            job: { type: 'string', description: 'الوظيفة' },
                            department: { type: 'string', description: 'القسم' },
                            salary: { type: 'number', description: 'الراتب' },
                            nationality: { type: 'string', description: 'الجنسية' },
                            status: { type: 'string', enum: ['active', 'inactive', 'on_leave'], description: 'الحالة' },
                            hireDate: { type: 'string', format: 'date', description: 'تاريخ التوظيف' },
                            residencyExpiry: { type: 'string', format: 'date', description: 'تاريخ انتهاء الإقامة' }
                        }
                    },
                    EmployeeInput: {
                        type: 'object',
                        required: ['name', 'email', 'job', 'salary'],
                        properties: {
                            name: { type: 'string', description: 'اسم الموظف' },
                            email: { type: 'string', format: 'email', description: 'البريد الإلكتروني' },
                            phone: { type: 'string', description: 'رقم الهاتف' },
                            job: { type: 'string', description: 'الوظيفة' },
                            department: { type: 'string', description: 'القسم' },
                            salary: { type: 'number', description: 'الراتب' },
                            nationality: { type: 'string', description: 'الجنسية' },
                            address: { type: 'string', description: 'العنوان' }
                        }
                    },
                    Contract: {
                        type: 'object',
                        properties: {
                            id: { type: 'string', description: 'معرف العقد' },
                            number: { type: 'string', description: 'رقم العقد' },
                            clientId: { type: 'string', description: 'معرف العميل' },
                            employeeId: { type: 'string', description: 'معرف الموظف' },
                            startDate: { type: 'string', format: 'date', description: 'تاريخ البدء' },
                            endDate: { type: 'string', format: 'date', description: 'تاريخ الانتهاء' },
                            amount: { type: 'number', description: 'المبلغ' },
                            status: { type: 'string', enum: ['active', 'expired', 'terminated'], description: 'حالة العقد' },
                            terms: { type: 'string', description: 'شروط العقد' }
                        }
                    },
                    Pagination: {
                        type: 'object',
                        properties: {
                            currentPage: { type: 'integer', description: 'الصفحة الحالية' },
                            totalPages: { type: 'integer', description: 'إجمالي الصفحات' },
                            totalItems: { type: 'integer', description: 'إجمالي العناصر' },
                            itemsPerPage: { type: 'integer', description: 'العناصر في كل صفحة' }
                        }
                    }
                },
                securitySchemes: {
                    bearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT'
                    },
                    apiKeyAuth: {
                        type: 'apiKey',
                        in: 'header',
                        name: 'X-API-Key'
                    }
                }
            },
            tags: [
                {
                    name: 'المصادقة',
                    description: 'عمليات المصادقة وإدارة الجلسات'
                },
                {
                    name: 'الموظفين',
                    description: 'إدارة بيانات الموظفين'
                },
                {
                    name: 'العملاء',
                    description: 'إدارة بيانات العملاء'
                },
                {
                    name: 'العقود',
                    description: 'إدارة العقود والاتفاقيات'
                },
                {
                    name: 'المالية',
                    description: 'الحسابات المالية والتقارير'
                },
                {
                    name: 'التقارير',
                    description: 'توليد وإدارة التقارير'
                }
            ]
        };

        // حفظ مواصفات Swagger
        localStorage.setItem('swaggerSpec', JSON.stringify(this.swaggerSpec, null, 2));
    }

    // إعداد الوسائط
    setupMiddleware() {
        // التحقق من التوكن
        this.setupTokenValidation();
        
        // تسجيل الطلبات
        this.setupRequestLogging();
        
        // معالجة الأخطاء
        this.setupErrorHandling();
        
        // ضغط الاستجابة
        this.setupResponseCompression();
    }

    // التحقق من صلاحية التوكن
    setupTokenValidation() {
        // سيتم تنفيذها على الخادم
        console.log('Token validation middleware setup');
    }

    // تسجيل الطلبات
    setupRequestLogging() {
        // سيتم تنفيذها على الخادم
        console.log('Request logging middleware setup');
    }

    // معالجة الأخطاء
    setupErrorHandling() {
        // سيتم تنفيذها على الخادم
        console.log('Error handling middleware setup');
    }

    // ضغط الاستجابة
    setupResponseCompression() {
        // سيتم تنفيذها على الخادم
        console.log('Response compression middleware setup');
    }

    // إعداد CORS
    setupCORS() {
        // سيتم تنفيذها على الخادم
        console.log('CORS middleware setup');
    }

    // إعداد تحديد معدل الطلبات
    setupRateLimiting() {
        // سيتم تنفيذها على الخادم
        console.log('Rate limiting middleware setup');
    }

    // إعداد نظام مفاتيح API
    setupAPIKeySystem() {
        // في التطبيق الحقيقي، سيتم إدارة مفاتيح API في قاعدة البيانات
        console.log('API Key system setup');
    }

    // الحصول على مفتاح API
    getAPIKey() {
        return localStorage.getItem('apiKey') || null;
    }

    // تعيين مفتاح API
    setAPIKey(apiKey) {
        localStorage.setItem('apiKey', apiKey);
    }

    // عرض واجهة Swagger UI
    showSwaggerUI() {
        const swaggerWindow = window.open('', '_blank', 'width=1200,height=800');
        
        const swaggerHTML = `
            <!DOCTYPE html>
            <html lang="ar" dir="rtl">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>SUPER PRO API Documentation</title>
                <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.css" />
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; }
                    .swagger-ui .topbar { display: none; }
                    .info .title { color: #2c3e50; }
                </style>
            </head>
            <body>
                <div id="swagger-ui"></div>
                <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js"></script>
                <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-standalone-preset.js"></script>
                <script>
                    window.onload = function() {
                        const ui = SwaggerUIBundle({
                            url: location.origin + '/swagger.json',
                            dom_id: '#swagger-ui',
                            deepLinking: true,
                            presets: [
                                SwaggerUIBundle.presets.apis,
                                SwaggerUIStandalonePreset
                            ],
                            plugins: [
                                SwaggerUIBundle.plugins.DownloadUrl
                            ],
                            layout: "StandaloneLayout",
                            defaultModelsExpandDepth: 1,
                            defaultModelExpandDepth: 1
                        });
                    }
                </script>
            </body>
            </html>
        `;

        swaggerWindow.document.write(swaggerHTML);
        swaggerWindow.document.close();
    }

    // تصدير مواصفات API
    exportAPISpec() {
        const blob = new Blob([JSON.stringify(this.swaggerSpec, null, 2)], { 
            type: 'application/json' 
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'superpro-api-spec.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // اختبار API
    async testAPI(endpoint, method = 'GET', data = null) {
        const result = await this.apiRequest(method, endpoint, data);
        
        if (result.success) {
            console.log('API Test Result:', result);
            alert('✅ نجاح الاختبار');
        } else {
            console.error('API Test Error:', result);
            alert('❌ فشل الاختبار: ' + result.error);
        }
    }

    // الحصول على إحصائيات API
    getAPIStats() {
        return {
            totalEndpoints: Object.keys(this.swaggerSpec.paths).length,
            totalSchemas: Object.keys(this.swaggerSpec.components.schemas).length,
            version: this.swaggerSpec.info.version,
            lastUpdated: new Date().toISOString()
        };
    }
}

// تهيئة نظام REST API
let restAPI;

window.addEventListener('DOMContentLoaded', () => {
    restAPI = new RestAPISystem();
    console.log('🔌 REST API System initialized');
});

console.log('🔌 REST API System loaded');
