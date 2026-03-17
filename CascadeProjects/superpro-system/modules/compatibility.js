// ============= نظام التوافقية والترجمة =============

class Compatibility {
  constructor() {
    this.browsers = {
      'Chrome': '90+',
      'Firefox': '88+',
      'Safari': '14+',
      'Edge': '90+',
      'Opera': '76+'
    };
    this.features = {};
    this.polyfills = {};
    this.currentLanguage = localStorage.getItem('superpro_language') || 'ar';
    this.translations = {
      'ar': {}, // سيتم تحميله من ملف منفصل
      'en': {},
      'fr': {}
    };
  }

  // ===== فحص توافقية المتصفح =====
  checkBrowserCompatibility() {
    const browser = this.getBrowserInfo();
    const result = {
      browser: browser.name,
      version: browser.version,
      compatible: true,
      warnings: [],
      unsupported: []
    };

    console.log(`🌐 المتصفح: ${browser.name} ${browser.version}`);

    // فحص الميزات
    if(!('localStorage' in window)) {
      result.compatible = false;
      result.unsupported.push('localStorage غير مدعوم');
    }

    if(!('fetch' in window)) {
      result.compatible = false;
      result.unsupported.push('Fetch API غير مدعوم - سيتm استخدام XMLHttpRequest');
    }

    if(!('serviceWorker' in navigator)) {
      result.warnings.push('Service Workers غير مدعومة - لا يمكن العمل بلا إنترنت');
    }

    if(!('indexedDB' in window)) {
      result.warnings.push('IndexedDB غير مدعومة - سيتم استخدام localStorage فقط');
    }

    return result;
  }

  getBrowserInfo() {
    const ua = navigator.userAgent;
    let browser = 'Unknown';
    let version = '0';

    if(ua.indexOf('Chrome') > -1 && ua.indexOf('Chromium') === -1) {
      browser = 'Chrome';
      version = ua.split('Chrome/')[1]?.split(' ')[0] || '0';
    } else if(ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') === -1) {
      browser = 'Safari';
      version = ua.split('Version/')[1]?.split(' ')[0] || '0';
    } else if(ua.indexOf('Firefox') > -1) {
      browser = 'Firefox';
      version = ua.split('Firefox/')[1]?.split(' ')[0] || '0';
    } else if(ua.indexOf('Edge') > -1 || ua.indexOf('Edg/') > -1) {
      browser = 'Edge';
      version = ua.split('Edg/')[1]?.split(' ')[0] || '0';
    } else if(ua.indexOf('OPR') > -1) {
      browser = 'Opera';
      version = ua.split('OPR/')[1]?.split(' ')[0] || '0';
    }

    return { name: browser, version: version };
  }

  // ===== فحص الميزات =====
  checkFeature(feature) {
    const features = {
      'localStorage': typeof(Storage) !== 'undefined',
      'sessionStorage': typeof(sessionStorage) !== 'undefined',
      'fetch': 'fetch' in window,
      'serviceWorker': 'serviceWorker' in navigator,
      'indexedDB': 'indexedDB' in window,
      'fileApi': 'File' in window && 'FileReader' in window,
      'geoLocation': 'geolocation' in navigator,
      'notifications': 'Notification' in window,
      'mediaDevices': 'mediaDevices' in navigator,
      'webGL': !!window.WebGLRenderingContext,
      'webWorkers': typeof(Worker) !== 'undefined'
    };

    return {
      feature: feature,
      supported: features[feature] || false,
      available: true
    };
  }

  // ===== تحميل Polyfills =====
  loadPolyfills() {
    console.log('🔧 تحميل الـ Polyfills للمتصفحات القديمة...');

    // Fetch Polyfill
    if(!('fetch' in window)) {
      window.fetch = this.fetchPolyfill;
    }

    // Promise Polyfill
    if(typeof Promise === 'undefined') {
      console.warn('⚠️ Promises غير مدعومة - استخدم promise-polyfill');
    }

    // Array methods
    if(!Array.prototype.find) {
      Array.prototype.find = function(predicate) {
        for(let i = 0; i < this.length; i++) {
          if(predicate(this[i], i, this)) return this[i];
        }
        return undefined;
      };
    }

    // Object.assign
    if(typeof Object.assign !== 'function') {
      Object.assign = function(target, ...sources) {
        sources.forEach(source => {
          Object.keys(source).forEach(key => {
            target[key] = source[key];
          });
        });
        return target;
      };
    }

    return { status: 'success', message: 'تم تحميل Polyfills' };
  }

  fetchPolyfill(url, options) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(options?.method || 'GET', url);

      xhr.onload = () => {
        resolve({
          ok: xhr.status >= 200 && xhr.status < 300,
          status: xhr.status,
          text: () => Promise.resolve(xhr.responseText),
          json: () => Promise.resolve(JSON.parse(xhr.responseText))
        });
      };

      xhr.onerror = () => reject(new Error('Network error'));
      xhr.send(options?.body);
    });
  }

  // ===== دعم RTL =====
  setLanguageDirection(language) {
    // العربية و الفارسية والعبرية من اليمين لليسار
    const rtlLanguages = ['ar', 'fa', 'he', 'ur'];
    const isRTL = rtlLanguages.includes(language);

    document.documentElement.lang = language;
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.body.dir = isRTL ? 'rtl' : 'ltr';

    return { language: language, direction: isRTL ? 'rtl' : 'ltr' };
  }

  // ===== نظام الترجمة =====
  setLanguage(language) {
    if(!this.translations[language]) {
      console.warn(`⚠️ اللغة ${language} غير مدعومة`);
      return { error: 'Language not supported' };
    }

    this.currentLanguage = language;
    localStorage.setItem('superpro_language', language);
    this.setLanguageDirection(language);

    // إعادة تحميل الصفحة لتطبيق التغييرات
    window.location.reload();

    return { status: 'success', language: language };
  }

  addTranslations(language, translations) {
    Object.assign(this.translations[language], translations);
    localStorage.setItem(`superpro_translations_${language}`, JSON.stringify(this.translations[language]));
  }

  translate(key, defaultValue = key) {
    const translation = this.translations[this.currentLanguage]?.[key];
    return translation || defaultValue;
  }

  getCurrentLanguage() {
    return this.currentLanguage;
  }

  getAvailableLanguages() {
    return Object.keys(this.translations);
  }

  // ===== دعم أنظمة التشغيل المختلفة =====
  getOS() {
    const ua = navigator.userAgent;
    let os = 'Unknown';

    if(ua.indexOf('Win') > -1) os = 'Windows';
    else if(ua.indexOf('Mac') > -1) os = 'MacOS';
    else if(ua.indexOf('Linux') > -1) os = 'Linux';
    else if(ua.indexOf('Android') > -1) os = 'Android';
    else if(ua.indexOf('iPhone') > -1 || ua.indexOf('iPad') > -1) os = 'iOS';

    return os;
  }

  isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  isTablet() {
    return /iPad|Android|Silk/.test(navigator.userAgent);
  }

  isDesktop() {
    return !this.isMobile() && !this.isTablet();
  }

  getDeviceType() {
    if(this.isDesktop()) return 'desktop';
    if(this.isTablet()) return 'tablet';
    return 'mobile';
  }

  // ===== تحسين الأداء على الأجهزة المختلفة =====
  optimizeForDevice() {
    const deviceType = this.getDeviceType();
    const optimization = {
      deviceType: deviceType,
      settings: {}
    };

    if(deviceType === 'mobile') {
      optimization.settings = {
        imageQuality: 'low',
        animationsEnabled: false,
        fetchBatchSize: 10,
        cacheEnabled: true,
        deferredLoading: true
      };
    } else if(deviceType === 'tablet') {
      optimization.settings = {
        imageQuality: 'medium',
        animationsEnabled: true,
        fetchBatchSize: 25,
        cacheEnabled: true,
        deferredLoading: false
      };
    } else {
      optimization.settings = {
        imageQuality: 'high',
        animationsEnabled: true,
        fetchBatchSize: 50,
        cacheEnabled: true,
        deferredLoading: false
      };
    }

    return optimization;
  }

  // ===== معالجة الأخطاء عبر المتصفحات =====
  handleCrossBrowserError(error) {
    const errorReport = {
      message: error.message,
      stack: error.stack,
      browser: this.getBrowserInfo(),
      os: this.getOS(),
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    };

    console.error('❌ خطأ متعلق بـ المتصفح:', errorReport);

    // إرسال التقرير إلى خادم التحليلات
    // في الإنتاج: استخدم Sentry أو مشابه

    return errorReport;
  }

  // ===== الحفظ والتحميل =====
  saveCompatibility() {
    localStorage.setItem('superpro_language', this.currentLanguage);
  }

  loadCompatibility() {
    const language = localStorage.getItem('superpro_language') || 'ar';
    this.setLanguageDirection(language);
  }
}

// إنشاء instance عام
const compatibility = new Compatibility();
compatibility.loadPolyfills();
compatibility.loadCompatibility();
console.log('✅ تم تحميل نظام التوافقية والترجمة');
