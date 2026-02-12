// تحسينات الأداء المتقدمة
// Performance Optimizations

class PerformanceOptimizer {
    constructor() {
        this.observer = null;
        this.loadedImages = new Set();
        this.init();
    }

    init() {
        this.setupLazyLoading();
        this.setupIntersectionObserver();
        this.optimizeImages();
        this.setupResourceHints();
        this.monitorPerformance();
    }

    // Lazy Loading للصور
    setupLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');
        
        if ('IntersectionObserver' in window) {
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadImage(entry.target);
                        this.observer.unobserve(entry.target);
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.01
            });

            images.forEach(img => this.observer.observe(img));
        } else {
            // Fallback للمتصفحات القديمة
            images.forEach(img => this.loadImage(img));
        }
    }

    // تحميل الصورة
    loadImage(img) {
        const src = img.dataset.src;
        if (!src || this.loadedImages.has(src)) return;

        img.src = src;
        img.onload = () => {
            img.classList.add('loaded');
            this.loadedImages.add(src);
        };
        
        img.onerror = () => {
            img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjZjBmMGYwIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5IiBmb250LXNpemU9IjE2Ij7Ym9udOY9eKAr9mK2YfYqiD9mK2YfYqjwvdGV4dD4KPC9zdmc+';
        };
    }

    // Intersection Observer للعناصر الأخرى
    setupIntersectionObserver() {
        const elements = document.querySelectorAll('[data-lazy]');
        
        const elementObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadLazyElement(entry.target);
                    elementObserver.unobserve(entry.target);
                }
            });
        });

        elements.forEach(el => elementObserver.observe(el));
    }

    // تحميل العنصر المتأخر
    loadLazyElement(element) {
        const type = element.dataset.lazy;
        
        switch(type) {
            case 'iframe':
                const src = element.dataset.src;
                if (src) {
                    element.src = src;
                    element.onload = () => element.classList.add('loaded');
                }
                break;
                
            case 'background':
                const bgSrc = element.dataset.bg;
                if (bgSrc) {
                    element.style.backgroundImage = `url(${bgSrc})`;
                    element.classList.add('loaded');
                }
                break;
        }
    }

    // تحسين الصور
    optimizeImages() {
        const images = document.querySelectorAll('img:not([data-src])');
        
        images.forEach(img => {
            // إضافة loading="lazy"
            if (!img.hasAttribute('loading')) {
                img.setAttribute('loading', 'lazy');
            }
            
            // إضافة alt text تلقائياً
            if (!img.hasAttribute('alt')) {
                img.setAttribute('alt', 'صورة في SUPER_PRO SYSTEM');
            }
            
            // تحسين الأبعاد
            if (!img.style.aspectRatio && img.naturalWidth && img.naturalHeight) {
                img.style.aspectRatio = `${img.naturalWidth} / ${img.naturalHeight}`;
            }
        });
    }

    // Resource Hints
    setupResourceHints() {
        // Preload للموارد الحرجة
        const criticalResources = [
            { href: '/app.js', as: 'script' },
            { href: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css', as: 'style' }
        ];

        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource.href;
            link.as = resource.as;
            document.head.appendChild(link);
        });

        // Prefetch للصفحات التالية
        const likelyPages = ['/employees', '/clients', '/contracts'];
        likelyPages.forEach(page => {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = page;
            document.head.appendChild(link);
        });
    }

    // مراقبة الأداء
    monitorPerformance() {
        // مراقبة وقت التحميل
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                if (perfData) {
                    const loadTime = perfData.loadEventEnd - perfData.loadEventStart;
                    console.log(`⏱️ Page load time: ${loadTime}ms`);
                    
                    // إرسال البيانات للتحليل
                    if (typeof trackEvent === 'function') {
                        trackEvent('Performance', 'Page Load Time', Math.round(loadTime));
                    }
                }
            }, 0);
        });

        // مراقبة Core Web Vitals
        this.observeWebVitals();
    }

    // مراقبة Core Web Vitals
    observeWebVitals() {
        // Largest Contentful Paint (LCP)
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            console.log(`🎨 LCP: ${lastEntry.startTime}ms`);
            
            if (typeof trackEvent === 'function') {
                trackEvent('Web Vitals', 'LCP', Math.round(lastEntry.startTime));
            }
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay (FID)
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            entries.forEach(entry => {
                console.log(`⚡ FID: ${entry.processingStart - entry.startTime}ms`);
                
                if (typeof trackEvent === 'function') {
                    trackEvent('Web Vitals', 'FID', Math.round(entry.processingStart - entry.startTime));
                }
            });
        }).observe({ entryTypes: ['first-input'] });

        // Cumulative Layout Shift (CLS)
        let clsValue = 0;
        new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
                if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                }
            }
            console.log(`📐 CLS: ${clsValue}`);
            
            if (typeof trackEvent === 'function') {
                trackEvent('Web Vitals', 'CLS', Math.round(clsValue * 1000));
            }
        }).observe({ entryTypes: ['layout-shift'] });
    }

    // تحسين التمرير
    optimizeScrolling() {
        let ticking = false;
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    // تحديث العناصر المرئية
                    this.updateVisibleElements();
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    // تحديث العناصر المرئية
    updateVisibleElements() {
        const elements = document.querySelectorAll('[data-viewport]');
        
        elements.forEach(element => {
            const rect = element.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
            
            if (isVisible) {
                element.classList.add('in-viewport');
            } else {
                element.classList.remove('in-viewport');
            }
        });
    }

    // ضغط الصور ديناميكياً
    compressImages() {
        const images = document.querySelectorAll('img[data-compress="true"]');
        
        images.forEach(img => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                
                canvas.toBlob((blob) => {
                    const compressedUrl = URL.createObjectURL(blob);
                    img.src = compressedUrl;
                }, 'image/jpeg', 0.8);
            };
        });
    }
}

// تهيئة محسن الأداء
let performanceOptimizer;

window.addEventListener('DOMContentLoaded', () => {
    performanceOptimizer = new PerformanceOptimizer();
    console.log('🚀 Performance Optimizer initialized');
});

// دوال عالمية للاستخدام في أجزاء أخرى من التطبيق
window.lazyLoadImage = function(src, callback) {
    const img = new Image();
    img.onload = callback;
    img.src = src;
    return img;
};

window.preloadResource = function(url, type = 'script') {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    link.as = type;
    document.head.appendChild(link);
};

console.log('⚡ Performance optimizations loaded');
