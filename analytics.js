// Google Analytics 4 Configuration
// استبدل 'G-XXXXXXXXXX' بمعرفك الخاص

(function() {
    'use strict';
    
    // التحقق من الموافقة على الكوكيز
    function hasConsent() {
        return localStorage.getItem('analytics-consent') === 'granted';
    }
    
    // طلب الموافقة على الكوكيز
    function requestConsent() {
        if (!hasConsent() && !localStorage.getItem('analytics-consent')) {
            const consentBanner = document.createElement('div');
            consentBanner.id = 'analytics-consent-banner';
            consentBanner.className = 'position-fixed bottom-0 start-0 end-0 bg-dark text-white p-3 text-center';
            consentBanner.style.cssText = 'z-index: 9999; box-shadow: 0 -2px 10px rgba(0,0,0,0.3);';
            consentBanner.innerHTML = `
                <div class="container">
                    <div class="row align-items-center">
                        <div class="col-md-8">
                            <p class="mb-0 mb-md-2">
                                📊 نستخدم Google Analytics لتحسين تجربتك. هل توافق على استخدام الكوكيز؟
                            </p>
                        </div>
                        <div class="col-md-4">
                            <button class="btn btn-success btn-sm me-2" onclick="grantAnalyticsConsent()">
                                موافق
                            </button>
                            <button class="btn btn-outline-light btn-sm" onclick="denyAnalyticsConsent()">
                                لا، شكراً
                            </button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(consentBanner);
        }
    }
    
    // منح الموافقة
    window.grantAnalyticsConsent = function() {
        localStorage.setItem('analytics-consent', 'granted');
        loadAnalytics();
        removeConsentBanner();
    };
    
    // رفض الموافقة
    window.denyAnalyticsConsent = function() {
        localStorage.setItem('analytics-consent', 'denied');
        removeConsentBanner();
    };
    
    // إزالة بانر الموافقة
    function removeConsentBanner() {
        const banner = document.getElementById('analytics-consent-banner');
        if (banner) {
            banner.remove();
        }
    }
    
    // تحميل Google Analytics
    function loadAnalytics() {
        if (!hasConsent()) return;
        
        // إنشاء tag Google Analytics
        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX';
        document.head.appendChild(script);
        
        // تهيئة gtag
        window.dataLayer = window.dataLayer || [];
        window.gtag = function() {
            dataLayer.push(arguments);
        };
        gtag('js', new Date());
        gtag('config', 'G-XXXXXXXXXX', {
            'anonymize_ip': true,
            'cookie_flags': 'SameSite=None;Secure'
        });
        
        console.log('✅ Google Analytics loaded');
    }
    
    // تتبع الأحداث المخصصة
    window.trackEvent = function(category, action, label = null, value = null) {
        if (!hasConsent() || typeof gtag === 'undefined') return;
        
        const eventParams = {
            'event_category': category,
            'event_action': action
        };
        
        if (label) eventParams['event_label'] = label;
        if (value) eventParams['value'] = value;
        
        gtag('event', action, eventParams);
    };
    
    // تتبع مشاهدات الصفحة
    window.trackPageView = function(page) {
        if (!hasConsent() || typeof gtag === 'undefined') return;
        gtag('config', 'G-XXXXXXXXXX', {
            'page_path': page
        });
    };
    
    // تتبع استخدام الميزات
    window.trackFeature = function(featureName) {
        trackEvent('Feature Usage', featureName, 'SUPER_PRO System');
    };
    
    // تتبع الأخطاء
    window.trackError = function(error, context = '') {
        trackEvent('Error', error.message, context);
    };
    
    // بدء التتبع
    setTimeout(() => {
        if (hasConsent()) {
            loadAnalytics();
        } else {
            requestConsent();
        }
    }, 2000);
    
})();
