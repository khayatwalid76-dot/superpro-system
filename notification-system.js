// نظام الإشعارات المتقدم (Email + SMS + Push)
// Advanced Notification System

class NotificationSystem {
    constructor() {
        this.providers = {
            email: {
                enabled: true,
                config: {
                    smtp: {
                        host: localStorage.getItem('smtp_host') || 'smtp.gmail.com',
                        port: parseInt(localStorage.getItem('smtp_port')) || 587,
                        secure: localStorage.getItem('smtp_secure') === 'true',
                        auth: {
                            user: localStorage.getItem('smtp_user') || '',
                            pass: localStorage.getItem('smtp_pass') || ''
                        }
                    },
                    from: localStorage.getItem('email_from') || 'noreply@superpro.com'
                }
            },
            sms: {
                enabled: false,
                config: {
                    provider: localStorage.getItem('sms_provider') || 'twilio',
                    apiKey: localStorage.getItem('sms_api_key') || '',
                    from: localStorage.getItem('sms_from') || ''
                }
            },
            push: {
                enabled: true,
                config: {
                    vapidPublicKey: localStorage.getItem('vapid_public_key') || '',
                    vapidPrivateKey: localStorage.getItem('vapid_private_key') || ''
                }
            }
        };
        
        this.templates = {
            welcome: {
                subject: 'مرحباً بك في SUPER_PRO SYSTEM',
                email: this.getEmailTemplate('welcome'),
                sms: 'مرحباً بك في نظام SUPER_PRO. بيانات الدخول: {loginInfo}'
            },
            contractExpiry: {
                subject: 'تنبيه انتهاء العقد',
                email: this.getEmailTemplate('contractExpiry'),
                sms: 'عقد رقم {contractNumber} سينتهي خلال {daysLeft} يوم'
            },
            residencyExpiry: {
                subject: 'تنبيه انتهاء الإقامة',
                email: this.getEmailTemplate('residencyExpiry'),
                sms: 'إقامة {employeeName} تنتهي خلال {daysLeft} يوم'
            },
            paymentReminder: {
                subject: 'تذكير بالدفع',
                email: this.getEmailTemplate('paymentReminder'),
                sms: 'تذكير: دفعة مستحقة بقيمة {amount} للعميل {clientName}'
            },
            systemAlert: {
                subject: 'تنبيه نظام',
                email: this.getEmailTemplate('systemAlert'),
                sms: 'تنبيه: {message}'
            }
        };
        
        this.queue = JSON.parse(localStorage.getItem('notificationQueue') || '[]');
        this.history = JSON.parse(localStorage.getItem('notificationHistory') || '[]');
        this.preferences = JSON.parse(localStorage.getItem('notificationPreferences') || '{}');
        
        this.init();
    }

    init() {
        this.setupNotificationUI();
        this.initializePushNotifications();
        this.processQueue();
        this.startQueueProcessor();
        this.setupServiceWorker();
    }

    // إعداد واجهة الإشعارات
    setupNotificationUI() {
        const settingsSection = document.querySelector('.settings-section');
        if (!settingsSection) return;

        const notificationUI = `
            <div class="mb-4">
                <h5><i class="fas fa-bell me-2"></i>نظام الإشعارات المتقدم</h5>
                
                <!-- إعدادات البريد الإلكتروني -->
                <div class="card mb-3">
                    <div class="card-header">
                        <h6 class="mb-0">
                            <i class="fas fa-envelope me-2"></i>
                            البريد الإلكتروني
                            <div class="form-check form-switch float-start">
                                <input class="form-check-input" type="checkbox" id="emailEnabled" ${this.providers.email.enabled ? 'checked' : ''}>
                                <label class="form-check-label" for="emailEnabled"></label>
                            </div>
                        </h6>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-6">
                                <label class="form-label">خادم SMTP</label>
                                <input type="text" class="form-control" id="smtpHost" value="${this.providers.email.config.smtp.host}" placeholder="smtp.gmail.com">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">المنفذ</label>
                                <input type="number" class="form-control" id="smtpPort" value="${this.providers.email.config.smtp.port}" placeholder="587">
                            </div>
                        </div>
                        <div class="row mt-2">
                            <div class="col-md-6">
                                <label class="form-label">اسم المستخدم</label>
                                <input type="email" class="form-control" id="smtpUser" value="${this.providers.email.config.smtp.auth.user}" placeholder="email@example.com">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">كلمة المرور</label>
                                <input type="password" class="form-control" id="smtpPass" value="${this.providers.email.config.smtp.auth.pass}" placeholder="password">
                            </div>
                        </div>
                        <div class="row mt-2">
                            <div class="col-md-6">
                                <label class="form-label">البريد المرسل</label>
                                <input type="email" class="form-control" id="emailFrom" value="${this.providers.email.config.from}" placeholder="noreply@superpro.com">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">&nbsp;</label>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="smtpSecure" ${this.providers.email.config.smtp.secure ? 'checked' : ''}>
                                    <label class="form-check-label" for="smtpSecure">استخدام SSL/TLS</label>
                                </div>
                            </div>
                        </div>
                        <div class="row mt-3">
                            <div class="col-12">
                                <button class="btn btn-primary" onclick="notificationSystem.testEmail()">
                                    <i class="fas fa-paper-plane me-2"></i>اختبار الإعدادات
                                </button>
                                <button class="btn btn-success" onclick="notificationSystem.saveEmailConfig()">
                                    <i class="fas fa-save me-2"></i>حفظ الإعدادات
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- إعدادات الرسائل النصية -->
                <div class="card mb-3">
                    <div class="card-header">
                        <h6 class="mb-0">
                            <i class="fas fa-sms me-2"></i>
                            الرسائل النصية (SMS)
                            <div class="form-check form-switch float-start">
                                <input class="form-check-input" type="checkbox" id="smsEnabled" ${this.providers.sms.enabled ? 'checked' : ''}>
                                <label class="form-check-label" for="smsEnabled"></label>
                            </div>
                        </h6>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-4">
                                <label class="form-label">المزود</label>
                                <select class="form-select" id="smsProvider">
                                    <option value="twilio">Twilio</option>
                                    <option value="nexmo">Nexmo</option>
                                    <option value="messagebird">MessageBird</option>
                                </select>
                            </div>
                            <div class="col-md-4">
                                <label class="form-label">مفتاح API</label>
                                <input type="text" class="form-control" id="smsApiKey" value="${this.providers.sms.config.apiKey}" placeholder="API Key">
                            </div>
                            <div class="col-md-4">
                                <label class="form-label">الرقم المرسل</label>
                                <input type="text" class="form-control" id="smsFrom" value="${this.providers.sms.config.from}" placeholder="+1234567890">
                            </div>
                        </div>
                        <div class="row mt-3">
                            <div class="col-12">
                                <button class="btn btn-primary" onclick="notificationSystem.testSMS()">
                                    <i class="fas fa-paper-plane me-2"></i>اختبار الإعدادات
                                </button>
                                <button class="btn btn-success" onclick="notificationSystem.saveSMSConfig()">
                                    <i class="fas fa-save me-2"></i>حفظ الإعدادات
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- قوالب الإشعارات -->
                <div class="card mb-3">
                    <div class="card-header">
                        <h6 class="mb-0">
                            <i class="fas fa-file-alt me-2"></i>
                            قوالب الإشعارات
                        </h6>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-6">
                                <label class="form-label">نوع الإشعار</label>
                                <select class="form-select" id="templateType">
                                    <option value="">اختر القالب</option>
                                    ${Object.keys(this.templates).map(key => 
                                        `<option value="${key}">${this.templates[key].subject}</option>`
                                    ).join('')}
                                </select>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">الإجراء</label>
                                <div class="btn-group w-100">
                                    <button class="btn btn-outline-primary" onclick="notificationSystem.editTemplate()">
                                        <i class="fas fa-edit me-2"></i>تعديل
                                    </button>
                                    <button class="btn btn-outline-success" onclick="notificationSystem.previewTemplate()">
                                        <i class="fas fa-eye me-2"></i>معاينة
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div class="row mt-2">
                            <div class="col-12">
                                <label class="form-label">محتوى القالب (HTML للبريد)</label>
                                <textarea class="form-control" id="templateContent" rows="6" placeholder="محتوى القالب..."></textarea>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- تفضيلات المستخدمين -->
                <div class="card mb-3">
                    <div class="card-header">
                        <h6 class="mb-0">
                            <i class="fas fa-user-cog me-2"></i>
                            تفضيلات الإشعارات
                        </h6>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-4">
                                <label class="form-label">الإشعارات عبر البريد</label>
                                <select class="form-select" id="emailNotifications">
                                    <option value="all">جميع الإشعارات</option>
                                    <option value="important">مهمة فقط</option>
                                    <option value="none">معطلة</option>
                                </select>
                            </div>
                            <div class="col-md-4">
                                <label class="form-label">الإشعارات عبر SMS</label>
                                <select class="form-select" id="smsNotifications">
                                    <option value="critical">حرجة فقط</option>
                                    <option value="important">مهمة فقط</option>
                                    <option value="none">معطلة</option>
                                </select>
                            </div>
                            <div class="col-md-4">
                                <label class="form-label">الإشعارات Push</label>
                                <select class="form-select" id="pushNotifications">
                                    <option value="all">جميع الإشعارات</option>
                                    <option value="important">مهمة فقط</option>
                                    <option value="none">معطلة</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- سجل الإشعارات -->
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h6 class="mb-0">سجل الإشعارات</h6>
                        <div>
                            <button class="btn btn-sm btn-outline-primary" onclick="notificationSystem.refreshHistory()">
                                <i class="fas fa-sync"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-success" onclick="notificationSystem.exportHistory()">
                                <i class="fas fa-download"></i>
                            </button>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-sm">
                                <thead>
                                    <tr>
                                        <th>التوقيت</th>
                                        <th>النوع</th>
                                        <th>المستلم</th>
                                        <th>الحالة</th>
                                        <th>الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody id="notificationHistoryBody">
                                    <tr>
                                        <td colspan="5" class="text-center text-muted">
                                            <i class="fas fa-spinner fa-spin me-2"></i>
                                            جاري التحميل...
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;

        settingsSection.insertAdjacentHTML('afterbegin', notificationUI);
        this.setupEventListeners();
        this.displayNotificationHistory();
    }

    // إعداد مستمعي الأحداث
    setupEventListeners() {
        document.getElementById('templateType')?.addEventListener('change', (e) => {
            const template = this.templates[e.target.value];
            if (template) {
                document.getElementById('templateContent').value = template.email || template.sms;
            }
        });
    }

    // تهيئة الإشعارات Push
    async initializePushNotifications() {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            console.log('Push notifications not supported');
            return;
        }

        try {
            const registration = await navigator.serviceWorker.ready();
            const subscription = await registration.pushManager.getSubscription();

            if (!subscription) {
                // طلب الإذن للإشعارات
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    await this.subscribeToPush(registration);
                }
            } else {
                console.log('Already subscribed to push notifications');
            }
        } catch (error) {
            console.error('Error initializing push notifications:', error);
        }
    }

    // الاشتراك في الإشعارات Push
    async subscribeToPush(registration) {
        try {
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.providers.push.config.vapidPublicKey
            });

            // حفظ الاشتراك
            localStorage.setItem('pushSubscription', JSON.stringify(subscription));
            console.log('Subscribed to push notifications');
        } catch (error) {
            console.error('Error subscribing to push notifications:', error);
        }
    }

    // إعداد Service Worker
    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', (event) => {
                if (event.data.type === 'PUSH_NOTIFICATION') {
                    this.handlePushNotification(event.data.payload);
                }
            });
        }
    }

    // معالجة الإشعار Push
    handlePushNotification(payload) {
        // عرض الإشعار
        if ('Notification' in window && Notification.permission === 'granted') {
            const notification = new Notification(payload.title, {
                body: payload.body,
                icon: '/icon-192x192.png',
                badge: '/badge-72x72.png',
                tag: payload.tag,
                data: payload.data
            });

            notification.onclick = () => {
                // فتح التطبيق عند النقر
                window.focus();
                notification.close();
            };
        }

        // حفظ في السجل
        this.addToHistory({
            type: 'push',
            recipient: 'current_user',
            subject: payload.title,
            content: payload.body,
            status: 'delivered',
            timestamp: new Date().toISOString()
        });
    }

    // إرسال بريد إلكتروني
    async sendEmail(to, template, data = {}) {
        if (!this.providers.email.enabled) {
            throw new Error('Email notifications are disabled');
        }

        try {
            const emailContent = this.processTemplate(template, data);
            
            // في التطبيق الحقيقي استخدم مكتبة مثل nodemailer
            // هنا محاكاة للإرسال
            const emailData = {
                to: to,
                from: this.providers.email.config.from,
                subject: emailContent.subject,
                html: emailContent.html,
                text: emailContent.text
            };

            // محاكاة الإرسال
            console.log('Sending email:', emailData);
            
            // حفظ في السجل
            this.addToHistory({
                type: 'email',
                recipient: to,
                subject: emailContent.subject,
                content: emailContent.html,
                status: 'sent',
                timestamp: new Date().toISOString()
            });

            return { success: true };
        } catch (error) {
            console.error('Error sending email:', error);
            return { success: false, error: error.message };
        }
    }

    // إرسال رسالة نصية
    async sendSMS(to, template, data = {}) {
        if (!this.providers.sms.enabled) {
            throw new Error('SMS notifications are disabled');
        }

        try {
            const smsContent = this.processTemplate(template, data);
            
            // في التطبيق الحقيقي استخدم مكتبة المزود (Twilio, etc.)
            const smsData = {
                to: to,
                from: this.providers.sms.config.from,
                body: smsContent.sms || smsContent.text
            };

            console.log('Sending SMS:', smsData);
            
            // حفظ في السجل
            this.addToHistory({
                type: 'sms',
                recipient: to,
                subject: 'SMS',
                content: smsData.body,
                status: 'sent',
                timestamp: new Date().toISOString()
            });

            return { success: true };
        } catch (error) {
            console.error('Error sending SMS:', error);
            return { success: false, error: error.message };
        }
    }

    // إرسال إشعار Push
    async sendPushNotification(title, body, data = {}, targetUsers = []) {
        try {
            // في التطبيق الحقيقي أرسل للخادم الذي يوزع الإشعارات
            const pushData = {
                title,
                body,
                data,
                tag: data.tag || 'general',
                targetUsers
            };

            console.log('Sending push notification:', pushData);
            
            // حفظ في السجل
            this.addToHistory({
                type: 'push',
                recipient: targetUsers.join(', '),
                subject: title,
                content: body,
                status: 'sent',
                timestamp: new Date().toISOString()
            });

            return { success: true };
        } catch (error) {
            console.error('Error sending push notification:', error);
            return { success: false, error: error.message };
        }
    }

    // معالجة القالب
    processTemplate(templateName, data) {
        const template = this.templates[templateName];
        if (!template) {
            throw new Error(`Template ${templateName} not found`);
        }

        let content = { subject: template.subject, html: template.email, text: template.sms };
        
        // استبدال المتغيرات
        Object.keys(data).forEach(key => {
            const placeholder = `{${key}}`;
            const value = data[key];
            
            if (content.subject) {
                content.subject = content.subject.replace(new RegExp(placeholder, 'g'), value);
            }
            if (content.html) {
                content.html = content.html.replace(new RegExp(placeholder, 'g'), value);
            }
            if (content.text) {
                content.text = content.text.replace(new RegExp(placeholder, 'g'), value);
            }
        });

        return content;
    }

    // إرسال إشعار متعدد القنوات
    async sendMultiChannelNotification(recipient, template, data = {}, channels = ['email', 'push']) {
        const results = {};
        
        for (const channel of channels) {
            switch (channel) {
                case 'email':
                    if (recipient.email) {
                        results.email = await this.sendEmail(recipient.email, template, data);
                    }
                    break;
                case 'sms':
                    if (recipient.phone) {
                        results.sms = await this.sendSMS(recipient.phone, template, data);
                    }
                    break;
                case 'push':
                    results.push = await this.sendPushNotification(
                        this.processTemplate(template, data).subject,
                        this.processTemplate(template, data).text,
                        data,
                        [recipient.id]
                    );
                    break;
            }
        }

        return results;
    }

    // إضافة إلى قائمة الانتظار
    addToQueue(notification) {
        notification.id = this.generateId();
        notification.timestamp = new Date().toISOString();
        notification.status = 'pending';
        notification.retries = 0;
        notification.maxRetries = 3;
        
        this.queue.push(notification);
        this.saveQueue();
    }

    // معالجة قائمة الانتظار
    processQueue() {
        const pendingNotifications = this.queue.filter(n => n.status === 'pending');
        
        pendingNotifications.forEach(async notification => {
            try {
                let result;
                
                switch (notification.type) {
                    case 'email':
                        result = await this.sendEmail(notification.recipient, notification.template, notification.data);
                        break;
                    case 'sms':
                        result = await this.sendSMS(notification.recipient, notification.template, notification.data);
                        break;
                    case 'push':
                        result = await this.sendPushNotification(
                            notification.subject,
                            notification.content,
                            notification.data,
                            notification.targetUsers
                        );
                        break;
                }

                if (result.success) {
                    notification.status = 'sent';
                    notification.sentAt = new Date().toISOString();
                } else {
                    notification.status = 'failed';
                    notification.error = result.error;
                    notification.retries++;
                }
                
                this.saveQueue();
            } catch (error) {
                notification.status = 'failed';
                notification.error = error.message;
                notification.retries++;
                this.saveQueue();
            }
        });
    }

    // بدء معالج قائمة الانتظار
    startQueueProcessor() {
        setInterval(() => {
            this.processQueue();
        }, 30000); // كل 30 ثانية

        // معالجة فورية للإشعارات الحرجة
        setInterval(() => {
            const criticalNotifications = this.queue.filter(n => 
                n.status === 'pending' && n.priority === 'critical'
            );
            
            if (criticalNotifications.length > 0) {
                this.processQueue();
            }
        }, 5000); // كل 5 ثوانٍ
    }

    // حفظ قائمة الانتظار
    saveQueue() {
        localStorage.setItem('notificationQueue', JSON.stringify(this.queue));
    }

    // إضافة إلى السجل
    addToHistory(notification) {
        notification.id = this.generateId();
        this.history.unshift(notification);
        
        // الاحتفاظ بآخر 1000 إشعار
        if (this.history.length > 1000) {
            this.history = this.history.slice(0, 1000);
        }
        
        localStorage.setItem('notificationHistory', JSON.stringify(this.history));
        this.displayNotificationHistory();
    }

    // عرض سجل الإشعارات
    displayNotificationHistory() {
        const tbody = document.getElementById('notificationHistoryBody');
        if (!tbody) return;

        let html = '';
        this.history.slice(0, 50).forEach(notification => {
            const statusColor = {
                sent: 'success',
                failed: 'danger',
                pending: 'warning',
                delivered: 'info'
            }[notification.status] || 'secondary';

            html += `
                <tr>
                    <td>${this.formatDateTime(notification.timestamp)}</td>
                    <td>
                        <span class="badge bg-${this.getTypeColor(notification.type)}">${notification.type}</span>
                    </td>
                    <td>${notification.recipient}</td>
                    <td>
                        <span class="badge bg-${statusColor}">${notification.status}</span>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-outline-info" onclick="notificationSystem.showNotificationDetails('${notification.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        if (this.history.length === 0) {
            html = '<tr><td colspan="5" class="text-center text-muted">لا توجد إشعارات</td></tr>';
        }

        tbody.innerHTML = html;
    }

    // الحصول على لون نوع الإشعار
    getTypeColor(type) {
        const colors = {
            email: 'primary',
            sms: 'success',
            push: 'info',
            system: 'warning'
        };
        return colors[type] || 'secondary';
    }

    // الحصول على قالب البريد الإلكتروني
    getEmailTemplate(type) {
        const templates = {
            welcome: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
                        <h1 style="color: white; margin: 0;">مرحباً بك في SUPER_PRO SYSTEM</h1>
                    </div>
                    <div style="padding: 20px; background: #f9f9f9;">
                        <p>أهلاً بك {userName}،</p>
                        <p>تم إنشاء حسابك بنجاح في نظام SUPER_PRO لإدارة الشركة.</p>
                        <p>بيانات الدخول:</p>
                        <ul>
                            <li>البريد الإلكتروني: {email}</li>
                            <li>كلمة المرور: {password}</li>
                        </ul>
                        <p>يمكنك تسجيل الدخول من <a href="{loginUrl}" style="color: #007bff;">هنا</a></p>
                    </div>
                    <div style="background: #f8f9fa; padding: 10px; text-align: center; font-size: 12px; color: #666;">
                        <p>© 2026 SUPER_PRO SYSTEM. جميع الحقوق محفوظة.</p>
                    </div>
                </div>
            `,
            contractExpiry: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: #dc3545; color: white; padding: 20px; text-align: center;">
                        <h2 style="margin: 0;">⚠️ تنبيه انتهاء العقد</h2>
                    </div>
                    <div style="padding: 20px; background: #f9f9f9;">
                        <p>السيد/السيدة {clientName}،</p>
                        <p>نود إعلامك بأن العقد رقم <strong>{contractNumber}</strong> مع الموظف <strong>{employeeName}</strong> سينتهي خلال <strong>{daysLeft}</strong> يوم.</p>
                        <p>تاريخ الانتهاء: {expiryDate}</p>
                        <p>يرجى تجديد العقد قبل انتهاء صلاحيته.</p>
                    </div>
                </div>
            `,
            residencyExpiry: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: #ffc107; color: black; padding: 20px; text-align: center;">
                        <h2 style="margin: 0;">📅 تنبيه انتهاء الإقامة</h2>
                    </div>
                    <div style="padding: 20px; background: #f9f9f9;">
                        <p>السيد/السيدة {employeeName}،</p>
                        <p>نود إعلامك بأن إقامتك ستنتهي خلال <strong>{daysLeft}</strong> يوم.</p>
                        <p>تاريخ الانتهاء: {expiryDate}</p>
                        <p>يرجى تجديد الإقامة قبل انتهاء صلاحيتها لتجنب أي مشاكل.</p>
                    </div>
                </div>
            `,
            paymentReminder: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: #17a2b8; color: white; padding: 20px; text-align: center;">
                        <h2 style="margin: 0;">💰 تذكير بالدفع</h2>
                    </div>
                    <div style="padding: 20px; background: #f9f9f9;">
                        <p>السيد/السيدة {clientName}،</p>
                        <p>هذا تذكير بوجود دفعة مستحقة:</p>
                        <ul>
                            <li>المبلغ: <strong>{amount} ر.ق</strong></li>
                            <li>تاريخ الاستحقاق: {dueDate}</li>
                            <li>رقم العمل: {workNumber}</li>
                        </ul>
                        <p>يرجى سداد المبلغ في أقرب وقت ممكن.</p>
                    </div>
                </div>
            `,
            systemAlert: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: #6f42c1; color: white; padding: 20px; text-align: center;">
                        <h2 style="margin: 0;">🚨 تنبيه نظام</h2>
                    </div>
                    <div style="padding: 20px; background: #f9f9f9;">
                        <p>{message}</p>
                        <p>التوقيت: {timestamp}</p>
                        <p>النظام: SUPER_PRO SYSTEM</p>
                    </div>
                </div>
            `
        };
        
        return templates[type] || '';
    }

    // دوال الاختبار
    async testEmail() {
        const testEmail = prompt('أدخل بريد إلكتروني للاختبار:');
        if (!testEmail) return;

        const result = await this.sendEmail(testEmail, 'welcome', {
            userName: 'مستخدم تجريبي',
            email: testEmail,
            password: '****',
            loginUrl: window.location.origin
        });

        if (result.success) {
            alert('✅ تم إرسال البريد الإلكتروني التجريبي بنجاح');
        } else {
            alert('❌ فشل إرسال البريد: ' + result.error);
        }
    }

    async testSMS() {
        const testPhone = prompt('أدخل رقم هاتف للاختبار:');
        if (!testPhone) return;

        const result = await this.sendSMS(testPhone, 'systemAlert', {
            message: 'هذه رسالة تجريبية من نظام SUPER_PRO',
            timestamp: new Date().toLocaleString('ar-SA')
        });

        if (result.success) {
            alert('✅ تم إرسال الرسالة التجريبية بنجاح');
        } else {
            alert('❌ فشل إرسال الرسالة: ' + result.error);
        }
    }

    // حفظ إعدادات البريد
    saveEmailConfig() {
        this.providers.email.config.smtp.host = document.getElementById('smtpHost').value;
        this.providers.email.config.smtp.port = parseInt(document.getElementById('smtpPort').value);
        this.providers.email.config.smtp.secure = document.getElementById('smtpSecure').checked;
        this.providers.email.config.smtp.auth.user = document.getElementById('smtpUser').value;
        this.providers.email.config.smtp.auth.pass = document.getElementById('smtpPass').value;
        this.providers.email.config.from = document.getElementById('emailFrom').value;
        this.providers.email.enabled = document.getElementById('emailEnabled').checked;

        localStorage.setItem('smtp_host', this.providers.email.config.smtp.host);
        localStorage.setItem('smtp_port', this.providers.email.config.smtp.port);
        localStorage.setItem('smtp_secure', this.providers.email.config.smtp.secure);
        localStorage.setItem('smtp_user', this.providers.email.config.smtp.auth.user);
        localStorage.setItem('smtp_pass', this.providers.email.config.smtp.auth.pass);
        localStorage.setItem('email_from', this.providers.email.config.from);

        alert('✅ تم حفظ إعدادات البريد الإلكتروني');
    }

    // حفظ إعدادات الرسائل
    saveSMSConfig() {
        this.providers.sms.config.provider = document.getElementById('smsProvider').value;
        this.providers.sms.config.apiKey = document.getElementById('smsApiKey').value;
        this.providers.sms.config.from = document.getElementById('smsFrom').value;
        this.providers.sms.enabled = document.getElementById('smsEnabled').checked;

        localStorage.setItem('sms_provider', this.providers.sms.config.provider);
        localStorage.setItem('sms_api_key', this.providers.sms.config.apiKey);
        localStorage.setItem('sms_from', this.providers.sms.config.from);

        alert('✅ تم حفظ إعدادات الرسائل النصية');
    }

    // تعديل القالب
    editTemplate() {
        const templateType = document.getElementById('templateType').value;
        const template = this.templates[templateType];
        
        if (template) {
            document.getElementById('templateContent').value = template.email || template.sms;
            alert('يمكنك تعديل القالب الآن. انقر على "حفظ" عند الانتهاء.');
        }
    }

    // معاينة القالب
    previewTemplate() {
        const templateType = document.getElementById('templateType').value;
        const content = document.getElementById('templateContent').value;
        
        if (!templateType || !content) {
            alert('الرجاء اختيار القالب وإدخال المحتوى');
            return;
        }

        const previewWindow = window.open('', '_blank', 'width=600,height=400');
        previewWindow.document.write(`
            <html dir="rtl">
            <head>
                <title>معاينة القالب</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                </style>
            </head>
            <body>
                <h2>معاينة: ${this.templates[templateType].subject}</h2>
                <hr>
                <div>${content}</div>
            </body>
            </html>
        `);
        previewWindow.document.close();
    }

    // تحديث السجل
    refreshHistory() {
        this.displayNotificationHistory();
    }

    // تصدير السجل
    exportHistory() {
        const blob = new Blob([JSON.stringify(this.history, null, 2)], { 
            type: 'application/json' 
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `notification_history_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // عرض تفاصيل الإشعار
    showNotificationDetails(notificationId) {
        const notification = this.history.find(n => n.id === notificationId);
        if (!notification) return;

        alert(`تفاصيل الإشعار:\n\n${JSON.stringify(notification, null, 2)}`);
    }

    // دوال مساعدة
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    formatDateTime(timestamp) {
        return new Date(timestamp).toLocaleString('ar-SA');
    }
}

// تهيئة نظام الإشعارات
let notificationSystem;

window.addEventListener('DOMContentLoaded', () => {
    notificationSystem = new NotificationSystem();
    console.log('🔔 Notification System initialized');
});

console.log('🔔 Notification System loaded');
