// seo-pwa-enhanced.js - تحسينات SEO و PWA
// ================================================

class SEOEnhancer {
    constructor() {
        this.metaTags = {};
        this.structuredData = {};
        this.performanceMetrics = {};
        this.init();
    }

    init() {
        this.setupPWAFeatures();
        this.optimizeSEO();
        this.setupServiceWorker();
        this.trackPerformance();
    }

    // إعداد ميزات PWA
    setupPWAFeatures() {
        // إضافة meta tags لـ PWA
        this.addPWAMetaTags();
        
        // إعداد التثبيت
        this.setupInstallPrompt();
        
        // إعداد الإشعارات
        this.setupNotifications();
    }

    // إضافة PWA meta tags
    addPWAMetaTags() {
        const metaTags = [
            { name: 'theme-color', content: '#3498db' },
            { name: 'apple-mobile-web-app-capable', content: 'yes' },
            { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
            { name: 'apple-mobile-web-app-title', content: 'SUPER_PRO' },
            { name: 'application-name', content: 'SUPER_PRO SYSTEM' },
            { name: 'msapplication-TileColor', content: '#3498db' },
            { name: 'msapplication-config', content: '/browserconfig.xml' }
        ];

        metaTags.forEach(tag => {
            if (!document.querySelector(`meta[name="${tag.name}"]`)) {
                const meta = document.createElement('meta');
                meta.name = tag.name;
                meta.content = tag.content;
                document.head.appendChild(meta);
            }
        });
    }

    // إعداد تثبيت التطبيق
    setupInstallPrompt() {
        let deferredPrompt;
        
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            
            // إظهار زر التثبيت
            this.showInstallButton(deferredPrompt);
        });

        window.addEventListener('appinstalled', () => {
            console.log('✅ تم تثبيت التطبيق بنجاح');
            this.hideInstallButton();
        });
    }

    // إظهار زر التثبيت
    showInstallButton(prompt) {
        if (document.querySelector('.install-btn')) return;
        
        const installBtn = document.createElement('button');
        installBtn.className = 'install-btn btn btn-primary position-fixed';
        installBtn.style.cssText = `
            bottom: 20px;
            left: 20px;
            z-index: 1000;
            border-radius: 50px;
            padding: 12px 20px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        installBtn.innerHTML = '<i class="fas fa-download"></i> تثبيت التطبيق';
        
        installBtn.addEventListener('click', async () => {
            if (prompt) {
                prompt.prompt();
                const { outcome } = await prompt.userChoice;
                console.log(`نتيجة التثبيت: ${outcome}`);
                deferredPrompt = null;
            }
        });
        
        document.body.appendChild(installBtn);
    }

    // إخفاء زر التثبيت
    hideInstallButton() {
        const btn = document.querySelector('.install-btn');
        if (btn) btn.remove();
    }

    // إعداد الإشعارات
    setupNotifications() {
        if ('Notification' in window) {
            // طلب الإذن للإشعارات
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    console.log('✅ تم منح إذن الإشعارات');
                }
            });
        }
    }

    // تحسين SEO
    optimizeSEO() {
        this.addStructuredData();
        this.optimizeImages();
        this.setupCanonicalURL();
        this.addOpenGraphTags();
        this.addTwitterCards();
    }

    // إضافة البيانات المنظمة
    addStructuredData() {
        const structuredData = {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "SUPER PRO SYSTEM",
            "description": "نظام إدارة متكامل باللغة العربية للشركات الصغيرة والمتوسطة",
            "url": "https://superpro-system.netlify.app/",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web",
            "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "SAR"
            },
            "author": {
                "@type": "Organization",
                "name": "SUPER PRO SYSTEM"
            },
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "ratingCount": "150"
            },
            "inLanguage": "ar",
            "datePublished": "2024-01-01",
            "dateModified": new Date().toISOString().split('T')[0]
        };

        this.addStructuredDataScript(structuredData, 'application');
    }

    // إضافة script للبيانات المنظمة
    addStructuredDataScript(data, type) {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(data, null, 2);
        document.head.appendChild(script);
    }

    // تحسين الصور
    optimizeImages() {
        const images = document.querySelectorAll('img');
        
        images.forEach(img => {
            // إضافة alt text تلقائياً
            if (!img.alt) {
                img.alt = this.generateAltText(img);
            }
            
            // إضافة loading lazy
            if (!img.loading) {
                img.loading = 'lazy';
            }
            
            // إضافة srcset إذا أمكن
            this.addSrcSet(img);
        });
    }

    // إنشاء alt text تلقائي
    generateAltText(img) {
        const src = img.src || '';
        const filename = src.split('/').pop()?.split('.')[0] || '';
        return `صورة ${filename.replace(/[-_]/g, ' ')}`;
    }

    // إضافة srcset للصور
    addSrcSet(img) {
        if (img.srcset) return;
        
        // محاكاة srcset للصور المختلفة
        const src = img.src;
        if (src.includes('superpro_bg.jpg')) {
            img.srcset = `
                ${src} 1200w,
                ${src}?w=800 800w,
                ${src}?w=600 600w,
                ${src}?w=400 400w
            `;
            img.sizes = '(max-width: 600px) 400px, (max-width: 1200px) 800px, 1200px';
        }
    }

    // إعداد الرابط الأساسي
    setupCanonicalURL() {
        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.rel = 'canonical';
            document.head.appendChild(canonical);
        }
        canonical.href = window.location.href;
    }

    // إضافة Open Graph tags
    addOpenGraphTags() {
        const ogTags = [
            { property: 'og:type', content: 'website' },
            { property: 'og:url', content: 'https://superpro-system.netlify.app/' },
            { property: 'og:title', content: 'SUPER PRO SYSTEM - نظام إدارة الشركة المتكامل' },
            { property: 'og:description', content: 'نظام إدارة متكامل باللغة العربية للشركات الصغيرة والمتوسطة' },
            { property: 'og:image', content: 'https://superpro-system.netlify.app/superpro_bg.jpg' },
            { property: 'og:image:width', content: '1200' },
            { property: 'og:image:height', content: '630' },
            { property: 'og:locale', content: 'ar_AR' }
        ];

        ogTags.forEach(tag => {
            if (!document.querySelector(`meta[property="${tag.property}"]`)) {
                const meta = document.createElement('meta');
                meta.property = tag.property;
                meta.content = tag.content;
                document.head.appendChild(meta);
            }
        });
    }

    // إضافة Twitter Cards
    addTwitterCards() {
        const twitterTags = [
            { name: 'twitter:card', content: 'summary_large_image' },
            { name: 'twitter:url', content: 'https://superpro-system.netlify.app/' },
            { name: 'twitter:title', content: 'SUPER PRO SYSTEM - نظام إدارة الشركة المتكامل' },
            { name: 'twitter:description', content: 'نظام إدارة متكامل باللغة العربية للشركات الصغيرة والمتوسطة' },
            { name: 'twitter:image', content: 'https://superpro-system.netlify.app/superpro_bg.jpg' }
        ];

        twitterTags.forEach(tag => {
            if (!document.querySelector(`meta[name="${tag.name}"]`)) {
                const meta = document.createElement('meta');
                meta.name = tag.name;
                meta.content = tag.content;
                document.head.appendChild(meta);
            }
        });
    }

    // إعداد Service Worker
    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('✅ Service Worker مسجل:', registration);
                    this.setupServiceWorkerUpdates(registration);
                })
                .catch(error => {
                    console.log('❌ فشل تسجيل Service Worker:', error);
                });
        }
    }

    // إعداد تحديثات Service Worker
    setupServiceWorkerUpdates(registration) {
        registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            
            newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // هناك نسخة جديدة
                    this.showUpdateNotification();
                }
            });
        });
    }

    // إظهار إشعار التحديث
    showUpdateNotification() {
        const notification = document.createElement('div');
        notification.className = 'update-notification alert alert-info alert-dismissible fade show position-fixed';
        notification.style.cssText = `
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 9999;
            min-width: 300px;
        `;
        
        notification.innerHTML = `
            <i class="fas fa-info-circle"></i>
            يتوفر تحديث جديد للتطبيق
            <button class="btn btn-sm btn-primary me-2" onclick="this.parentElement.remove(); location.reload()">
                تحديث الآن
            </button>
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(notification);
    }

    // تتبع الأداء
    trackPerformance() {
        // تتبع Core Web Vitals
        this.trackWebVitals();
        
        // تتبع وقت التحميل
        this.trackLoadTime();
        
        // تتبع استخدام الذاكرة
        this.trackMemoryUsage();
    }

    // تتبع Core Web Vitals
    trackWebVitals() {
        if ('PerformanceObserver' in window) {
            // LCP (Largest Contentful Paint)
            const lcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                this.performanceMetrics.lcp = lastEntry.renderTime || lastEntry.loadTime;
            });
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

            // FID (First Input Delay)
            const fidObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    this.performanceMetrics.fid = entry.processingStart - entry.startTime;
                });
            });
            fidObserver.observe({ entryTypes: ['first-input'] });

            // CLS (Cumulative Layout Shift)
            let clsValue = 0;
            const clsObserver = new PerformanceObserver((list) => {
                list.getEntries().forEach(entry => {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                        this.performanceMetrics.cls = clsValue;
                    }
                });
            });
            clsObserver.observe({ entryTypes: ['layout-shift'] });
        }
    }

    // تتبع وقت التحميل
    trackLoadTime() {
        window.addEventListener('load', () => {
            const navigation = performance.getEntriesByType('navigation')[0];
            if (navigation) {
                this.performanceMetrics.loadTime = navigation.loadEventEnd - navigation.loadEventStart;
                this.performanceMetrics.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
            }
        });
    }

    // تتبع استخدام الذاكرة
    trackMemoryUsage() {
        if ('memory' in performance) {
            setInterval(() => {
                this.performanceMetrics.memory = {
                    used: performance.memory.usedJSHeapSize,
                    total: performance.memory.totalJSHeapSize,
                    limit: performance.memory.jsHeapSizeLimit
                };
            }, 30000); // كل 30 ثانية
        }
    }

    // الحصول على تقرير الأداء
    getPerformanceReport() {
        return {
            metrics: this.performanceMetrics,
            recommendations: this.getPerformanceRecommendations(),
            score: this.calculatePerformanceScore()
        };
    }

    // الحصول على توصيات الأداء
    getPerformanceRecommendations() {
        const recommendations = [];
        
        if (this.performanceMetrics.lcp > 2500) {
            recommendations.push('تحسين أكبر عنصر محتوى (LCP > 2.5s)');
        }
        
        if (this.performanceMetrics.fid > 100) {
            recommendations.push('تحسين استجابة الإدخال الأول (FID > 100ms)');
        }
        
        if (this.performanceMetrics.cls > 0.1) {
            recommendations.push('تقليل تغيير التخطيط التراكمي (CLS > 0.1)');
        }
        
        if (this.performanceMetrics.loadTime > 3000) {
            recommendations.push('تحسين وقت التحميل (> 3s)');
        }
        
        return recommendations;
    }

    // حساب درجة الأداء
    calculatePerformanceScore() {
        let score = 100;
        
        if (this.performanceMetrics.lcp > 2500) score -= 20;
        if (this.performanceMetrics.fid > 100) score -= 20;
        if (this.performanceMetrics.cls > 0.1) score -= 20;
        if (this.performanceMetrics.loadTime > 3000) score -= 20;
        
        return Math.max(0, score);
    }

    // تحسين محركات البحث
    optimizeForSearch() {
        // إضافة breadcrumb
        this.addBreadcrumbData();
        
        // إضافة موقع الشركة
        this.addOrganizationData();
        
        // تحسين الروابط الداخلية
        this.optimizeInternalLinks();
    }

    // إضافة بيانات breadcrumb
    addBreadcrumbData() {
        const breadcrumbData = {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "الرئيسية",
                    "item": "https://superpro-system.netlify.app/"
                },
                {
                    "@type": "ListItem",
                    "position": 2,
                    "name": "نظام الإدارة",
                    "item": "https://superpro-system.netlify.app/"
                }
            ]
        };
        
        this.addStructuredDataScript(breadcrumbData, 'breadcrumb');
    }

    // إضافة بيانات المؤسسة
    addOrganizationData() {
        const organizationData = {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "SUPER PRO SYSTEM",
            "url": "https://superpro-system.netlify.app/",
            "logo": "https://superpro-system.netlify.app/superpro_bg.jpg",
            "description": "نظام إدارة متكامل باللغة العربية للشركات الصغيرة والمتوسطة",
            "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer service"
            }
        };
        
        this.addStructuredDataScript(organizationData, 'organization');
    }

    // تحسين الروابط الداخلية
    optimizeInternalLinks() {
        const links = document.querySelectorAll('a[href]');
        
        links.forEach(link => {
            // إضافة title إذا لم يكن موجوداً
            if (!link.title && link.textContent.trim()) {
                link.title = link.textContent.trim();
            }
            
            // تحسين الروابط الخارجية
            if (link.hostname !== window.location.hostname) {
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
            }
        });
    }
}

// إنشاء نسخة واحدة من محسن SEO
const seoEnhancer = new SEOEnhancer();

// تصدير للاستخدام العام
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SEOEnhancer;
} else {
    window.SEOEnhancer = SEOEnhancer;
    window.seoEnhancer = seoEnhancer;
}
