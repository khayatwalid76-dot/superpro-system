// ============= نظام الأمان المحسّن =============

class SecuritySystem {
  constructor() {
    this.sessions = [];
    this.loginAttempts = {};
    this.suspiciousActivities = [];
    this.maxLoginAttempts = 5;
    this.lockoutDuration = 15 * 60 * 1000; // 15 دقيقة
  }

  // ===== إدارة جلسات المستخدم =====
  createSession(userId, userAgent) {
    const sessionToken = this.generateSecureToken();
    
    const session = {
      token: sessionToken,
      userId: userId,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), // 8 ساعات
      userAgent: userAgent,
      ipAddress: this.getClientIP(),
      lastActivity: new Date().toISOString(),
      active: true
    };

    this.sessions.push(session);
    localStorage.setItem('superpro_sessionToken', sessionToken);
    return session;
  }

  // التحقق من صحة الجلسة
  validateSession(token) {
    const session = this.sessions.find(s => s.token === token);
    
    if(!session) {
      this.logSuspiciousActivity('invalid_session', `محاولة استخدام جلسة غير صحيحة`);
      return false;
    }

    if(!session.active) {
      this.logSuspiciousActivity('inactive_session', `محاولة استخدام جلسة غير نشطة`);
      return false;
    }

    if(new Date() > new Date(session.expiresAt)) {
      session.active = false;
      this.logSuspiciousActivity('expired_session', `محاولة استخدام جلسة منتهية`);
      return false;
    }

    // تحديث آخر نشاط
    session.lastActivity = new Date().toISOString();
    return true;
  }

  // إنهاء الجلسة
  endSession(token) {
    const session = this.sessions.find(s => s.token === token);
    if(session) {
      session.active = false;
      session.endedAt = new Date().toISOString();
    }

    localStorage.removeItem('superpro_sessionToken');
  }

  // ===== منع هجمات القوة الغاشمة =====
  recordLoginAttempt(username, success) {
    if(!this.loginAttempts[username]) {
      this.loginAttempts[username] = {
        attempts: 0,
        lockedUntil: null,
        lastAttempt: null
      };
    }

    const record = this.loginAttempts[username];

    if(record.lockedUntil && new Date() < new Date(record.lockedUntil)) {
      return { 
        blocked: true, 
        message: 'الحساب مقفل مؤقتاً. يرجى المحاولة لاحقاً'
      };
    }

    if(success) {
      this.loginAttempts[username] = {
        attempts: 0,
        lockedUntil: null,
        lastAttempt: new Date().toISOString()
      };
    } else {
      record.attempts++;
      record.lastAttempt = new Date().toISOString();

      if(record.attempts >= this.maxLoginAttempts) {
        record.lockedUntil = new Date(Date.now() + this.lockoutDuration).toISOString();
        this.logSuspiciousActivity('brute_force_attempt', `محاولات دخول متعددة فاشلة: ${username}`);

        return { 
          blocked: true, 
          message: 'تم قفل الحساب بسبب محاولات إدخال فاشلة متكررة'
        };
      }
    }

    return { blocked: false, attemptsRemaining: this.maxLoginAttempts - record.attempts };
  }

  // ===== تشفير البيانات =====
  encryptPassword(password) {
    // استخدم bcrypt أو مكتبة تشفير قوية في الإنتاج
    // هنا نستخدم base64 كمثال بسيط
    return btoa(password);
  }

  verifyPassword(password, hash) {
    return btoa(password) === hash;
  }

  // ===== المصادقة متعددة الخطوات =====
  initiateTwoFactorAuth(userId) {
    const twoFactorCode = Math.random().toString().slice(2, 8);
    
    localStorage.setItem(`superpro_2fa_${userId}`, JSON.stringify({
      code: twoFactorCode,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      attempts: 0
    }));

    // إرسال الكود (بريد إلكتروني أو SMS في الإنتاج)
    console.log(`📱 كود المصادقة: ${twoFactorCode}`);

    return true;
  }

  verifyTwoFactorCode(userId, code) {
    const data = JSON.parse(localStorage.getItem(`superpro_2fa_${userId}`) || 'null');
    
    if(!data) {
      this.logSuspiciousActivity('2fa_failed', `فشل تحقق 2FA: بيانات غير موجودة`);
      return false;
    }

    if(new Date() > new Date(data.expiresAt)) {
      this.logSuspiciousActivity('2fa_expired', `كود 2FA منتهي الصلاحية`);
      return false;
    }

    if(data.attempts >= 3) {
      this.logSuspiciousActivity('2fa_attempts_exceeded', `تجاوز عدد محاولات 2FA`);
      return false;
    }

    if(data.code === code) {
      localStorage.removeItem(`superpro_2fa_${userId}`);
      return true;
    }

    data.attempts++;
    localStorage.setItem(`superpro_2fa_${userId}`, JSON.stringify(data));
    return false;
  }

  // ===== تسجيل الأنشطة المريبة =====
  logSuspiciousActivity(type, description) {
    const activity = {
      id: Date.now(),
      type: type,
      description: description,
      timestamp: new Date().toISOString(),
      ipAddress: this.getClientIP(),
      userAgent: navigator.userAgent,
      severity: this.calculateSeverity(type)
    };

    this.suspiciousActivities.unshift(activity);
    if(this.suspiciousActivities.length > 500) {
      this.suspiciousActivities.pop();
    }

    // إذا كانت الشدة عالية، أرسل تنبيه
    if(activity.severity === 'critical') {
      this.sendSecurityAlert(activity);
    }

    this.saveSuspiciousActivities();
  }

  calculateSeverity(type) {
    const severityMap = {
      'invalid_session': 'high',
      'brute_force_attempt': 'critical',
      'permission_denied': 'medium',
      'data_tampering': 'critical',
      '2fa_failed': 'medium',
      'expired_session': 'low'
    };

    return severityMap[type] || 'low';
  }

  // ===== التنبيهات الأمنية =====
  sendSecurityAlert(activity) {
    console.warn('⚠️ تنبيه أمني:', activity);
    // في الإنتاج: أرسل بريد إلكتروني أو إشعار فوري
  }

  // ===== التحقق من سلامة البيانات =====
  validateXSS(input) {
    // تنظيف المدخلات من XSS
    const element = document.createElement('div');
    element.textContent = input;
    return element.innerHTML;
  }

  validateCSRF(token) {
    const storedToken = localStorage.getItem('superpro_csrf_token');
    return storedToken === token;
  }

  generateCSRFToken() {
    const token = this.generateSecureToken();
    localStorage.setItem('superpro_csrf_token', token);
    return token;
  }

  // ===== مساعدات =====
  generateSecureToken() {
    return Math.random().toString(36).substr(2) + Date.now().toString(36);
  }

  getClientIP() {
    // في الإنتاج: احصل على IP من السيرفر
    return 'N/A';
  }

  // حفظ واسترجاع
  saveSuspiciousActivities() {
    localStorage.setItem('superpro_suspicious_activities', JSON.stringify(this.suspiciousActivities));
  }

  loadSuspiciousActivities() {
    const stored = localStorage.getItem('superpro_suspicious_activities');
    if(stored) this.suspiciousActivities = JSON.parse(stored);
  }

  // الحصول على تقرير الأمان
  getSecurityReport(startDate, endDate) {
    const activities = this.suspiciousActivities.filter(a => {
      const date = new Date(a.timestamp);
      return date >= new Date(startDate) && date <= new Date(endDate);
    });

    return {
      period: `${startDate} - ${endDate}`,
      totalIncidents: activities.length,
      bySeverity: {
        critical: activities.filter(a => a.severity === 'critical').length,
        high: activities.filter(a => a.severity === 'high').length,
        medium: activities.filter(a => a.severity === 'medium').length,
        low: activities.filter(a => a.severity === 'low').length
      },
      topIncidents: activities.slice(0, 10)
    };
  }
}

// إنشاء instance عام
const securitySystem = new SecuritySystem();
securitySystem.loadSuspiciousActivities();
console.log('✅ تم تحميل نظام الأمان');
