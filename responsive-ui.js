// responsive-ui.js - تحسين الواجهة للشاشات الصغيرة
// ================================================

class ResponsiveUI {
    constructor() {
        this.breakpoints = {
            xs: 0,      // الهواتف الصغيرة
            sm: 576,    // الهواتف الكبيرة
            md: 768,    // الأجهزة اللوحية
            lg: 992,    // الشاشات المتوسطة
            xl: 1200,   // الشاشات الكبيرة
            xxl: 1400   // الشاشات الكبيرة جداً
        };
        
        this.currentBreakpoint = this.getCurrentBreakpoint();
        this.setupEventListeners();
        this.optimizeForMobile();
    }

    // الحصول على نقطة التوقف الحالية
    getCurrentBreakpoint() {
        const width = window.innerWidth;
        
        if (width < this.breakpoints.sm) return 'xs';
        if (width < this.breakpoints.md) return 'sm';
        if (width < this.breakpoints.lg) return 'md';
        if (width < this.breakpoints.xl) return 'lg';
        if (width < this.breakpoints.xxl) return 'xl';
        return 'xxl';
    }

    // إعداد المستمعين للأحداث
    setupEventListeners() {
        window.addEventListener('resize', this.debounce(() => {
            const newBreakpoint = this.getCurrentBreakpoint();
            if (newBreakpoint !== this.currentBreakpoint) {
                this.currentBreakpoint = newBreakpoint;
                this.handleBreakpointChange(newBreakpoint);
            }
        }, 250));

        // معالجة تغيير الاتجاه
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.adjustLayoutForOrientation();
            }, 100);
        });
    }

    // التعامل مع تغيير نقطة التوقف
    handleBreakpointChange(breakpoint) {
        console.log(`📱 تغيير حجم الشاشة: ${breakpoint}`);
        
        // تحسين القائمة الجانبية
        this.optimizeSidebar(breakpoint);
        
        // تحسين الجداول
        this.optimizeTables(breakpoint);
        
        // تحسين البطاقات
        this.optimizeCards(breakpoint);
        
        // تحسين النماذج
        this.optimizeForms(breakpoint);
        
        // تحسين الأزرار
        this.optimizeButtons(breakpoint);
    }

    // تحسين القائمة الجانبية
    optimizeSidebar(breakpoint) {
        const sidebar = document.querySelector('.sidebar');
        const mainContent = document.querySelector('.main-content');
        
        if (!sidebar) return;
        
        if (breakpoint === 'xs' || breakpoint === 'sm') {
            sidebar.classList.add('mobile-sidebar');
            mainContent.classList.add('mobile-main');
            
            // إضافة زر القائمة
            this.addMobileMenuToggle();
            
            // جعل القائمة منبثقة
            sidebar.classList.add('offcanvas');
        } else {
            sidebar.classList.remove('mobile-sidebar', 'offcanvas');
            mainContent.classList.remove('mobile-main');
        }
    }

    // إضافة زر القائمة للهواتف
    addMobileMenuToggle() {
        if (document.querySelector('.mobile-menu-toggle')) return;
        
        const header = document.querySelector('.app-header') || document.querySelector('.navbar');
        if (!header) return;
        
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'mobile-menu-toggle btn btn-link';
        toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
        toggleBtn.style.cssText = `
            display: block;
            font-size: 1.5rem;
            color: var(--primary);
            background: none;
            border: none;
            padding: 10px;
            margin-right: 10px;
        `;
        
        toggleBtn.addEventListener('click', () => {
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) {
                sidebar.classList.toggle('show');
            }
        });
        
        header.insertBefore(toggleBtn, header.firstChild);
    }

    // تحسين الجداول للشاشات الصغيرة
    optimizeTables(breakpoint) {
        const tables = document.querySelectorAll('table');
        
        tables.forEach(table => {
            if (breakpoint === 'xs' || breakpoint === 'sm') {
                this.makeTableResponsive(table);
            } else {
                this.restoreTable(table);
            }
        });
    }

    // جعل الجدول متجاوب
    makeTableResponsive(table) {
        if (table.classList.contains('responsive-processed')) return;
        
        const wrapper = document.createElement('div');
        wrapper.className = 'table-responsive-wrapper';
        wrapper.style.cssText = `
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            margin: 10px 0;
            border: 1px solid #dee2e6;
            border-radius: 8px;
        `;
        
        table.parentNode.insertBefore(wrapper, table);
        wrapper.appendChild(table);
        table.classList.add('responsive-processed');
        
        // إضافة تحسينات للمس
        this.addTouchScrolling(wrapper);
    }

    // استعادة الجدول الأصلي
    restoreTable(table) {
        if (!table.classList.contains('responsive-processed')) return;
        
        const wrapper = table.parentNode;
        if (wrapper && wrapper.classList.contains('table-responsive-wrapper')) {
            wrapper.parentNode.insertBefore(table, wrapper);
            wrapper.remove();
        }
        table.classList.remove('responsive-processed');
    }

    // إضافة التمرير باللمس
    addTouchScrolling(element) {
        let isDown = false;
        let startX;
        let scrollLeft;

        element.addEventListener('mousedown', (e) => {
            isDown = true;
            startX = e.pageX - element.offsetLeft;
            scrollLeft = element.scrollLeft;
        });

        element.addEventListener('mouseleave', () => {
            isDown = false;
        });

        element.addEventListener('mouseup', () => {
            isDown = false;
        });

        element.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - element.offsetLeft;
            const walk = (x - startX) * 2;
            element.scrollLeft = scrollLeft - walk;
        });
    }

    // تحسين البطاقات
    optimizeCards(breakpoint) {
        const cards = document.querySelectorAll('.card');
        
        cards.forEach(card => {
            if (breakpoint === 'xs' || breakpoint === 'sm') {
                card.style.marginBottom = '15px';
                card.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
            } else {
                card.style.marginBottom = '';
                card.style.boxShadow = '';
            }
        });
    }

    // تحسين النماذج
    optimizeForms(breakpoint) {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            if (breakpoint === 'xs' || breakpoint === 'sm') {
                this.optimizeFormForMobile(form);
            } else {
                this.restoreForm(form);
            }
        });
    }

    // تحسين النموذج للهاتف
    optimizeFormForMobile(form) {
        const formGroups = form.querySelectorAll('.form-group, .mb-3');
        
        formGroups.forEach(group => {
            group.style.marginBottom = '20px';
            
            // تحسين حجم الحقول
            const inputs = group.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                input.style.fontSize = '16px'; // منع التكبير في iOS
                input.style.padding = '12px';
                input.style.minHeight = '44px'; // مسافة كافية للإصبع
            });
        });
    }

    // استعادة النموذج
    restoreForm(form) {
        const formGroups = form.querySelectorAll('.form-group, .mb-3');
        
        formGroups.forEach(group => {
            group.style.marginBottom = '';
            
            const inputs = group.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                input.style.fontSize = '';
                input.style.padding = '';
                input.style.minHeight = '';
            });
        });
    }

    // تحسين الأزرار
    optimizeButtons(breakpoint) {
        const buttons = document.querySelectorAll('.btn');
        
        buttons.forEach(btn => {
            if (breakpoint === 'xs' || breakpoint === 'sm') {
                btn.style.minHeight = '44px';
                btn.style.fontSize = '16px';
                btn.style.padding = '12px 20px';
                btn.style.margin = '5px';
            } else {
                btn.style.minHeight = '';
                btn.style.fontSize = '';
                btn.style.padding = '';
                btn.style.margin = '';
            }
        });
    }

    // تحسين للهواتف
    optimizeForMobile() {
        // إضافة meta tag للهواتف
        this.addMobileMetaTags();
        
        // تحسين الأداء
        this.optimizePerformance();
        
        // إضافة إيماءات اللمس
        this.addTouchGestures();
    }

    // إضافة meta tags للهواتف
    addMobileMetaTags() {
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes');
        }
    }

    // تحسين الأداء للهواتف
    optimizePerformance() {
        // تقليل الحركات
        if (this.currentBreakpoint === 'xs' || this.currentBreakpoint === 'sm') {
            document.documentElement.style.setProperty('--transition-speed', '0.1s');
        }
        
        // تحسين الصور
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            img.loading = 'lazy';
        });
    }

    // إضافة إيماءات اللمس
    addTouchGestures() {
        const swipeableElements = document.querySelectorAll('.card, .modal-content');
        
        swipeableElements.forEach(element => {
            let touchStartX = 0;
            let touchEndX = 0;
            
            element.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
            });
            
            element.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                this.handleSwipe(element, touchStartX, touchEndX);
            });
        });
    }

    // التعامل مع السحب
    handleSwipe(element, startX, endX) {
        const swipeThreshold = 50;
        const diff = startX - endX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // سحب لليسار
                element.classList.add('swipe-left');
            } else {
                // سحب لليمين
                element.classList.add('swipe-right');
            }
            
            setTimeout(() => {
                element.classList.remove('swipe-left', 'swipe-right');
            }, 300);
        }
    }

    // التعامل مع تغيير الاتجاه
    adjustLayoutForOrientation() {
        const isLandscape = window.innerWidth > window.innerHeight;
        
        if (isLandscape) {
            document.body.classList.add('landscape');
            document.body.classList.remove('portrait');
        } else {
            document.body.classList.add('portrait');
            document.body.classList.remove('landscape');
        }
    }

    // دالة debounce
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // الحصول على معلومات الشاشة
    getScreenInfo() {
        return {
            width: window.innerWidth,
            height: window.innerHeight,
            breakpoint: this.currentBreakpoint,
            orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
            devicePixelRatio: window.devicePixelRatio || 1,
            isMobile: this.currentBreakpoint === 'xs' || this.currentBreakpoint === 'sm',
            isTablet: this.currentBreakpoint === 'md',
            isDesktop: ['lg', 'xl', 'xxl'].includes(this.currentBreakpoint)
        };
    }

    // إضافة CSS للشاشات الصغيرة
    addResponsiveCSS() {
        const style = document.createElement('style');
        style.textContent = `
            /* Mobile Optimizations */
            @media (max-width: 576px) {
                .mobile-sidebar {
                    position: fixed;
                    top: 0;
                    right: -280px;
                    width: 280px;
                    height: 100vh;
                    background: white;
                    z-index: 1050;
                    transition: right 0.3s ease;
                    box-shadow: -2px 0 10px rgba(0,0,0,0.1);
                }
                
                .mobile-sidebar.show {
                    right: 0;
                }
                
                .mobile-main {
                    margin-right: 0 !important;
                }
                
                .table-responsive-wrapper {
                    -webkit-overflow-scrolling: touch;
                }
                
                .btn {
                    min-height: 44px;
                    font-size: 16px;
                }
                
                input, select, textarea {
                    font-size: 16px !important;
                    min-height: 44px;
                }
                
                .card {
                    margin-bottom: 15px;
                }
                
                .modal-dialog {
                    margin: 10px;
                    max-width: calc(100% - 20px);
                }
            }
            
            /* Landscape Orientation */
            @media (max-height: 500px) and (orientation: landscape) {
                .modal-dialog {
                    max-height: 90vh;
                    overflow-y: auto;
                }
                
                .navbar {
                    min-height: auto;
                }
            }
            
            /* Touch Optimizations */
            * {
                -webkit-tap-highlight-color: transparent;
            }
            
            .btn, .card, .table tr {
                -webkit-touch-callout: none;
                -webkit-user-select: none;
                user-select: none;
            }
            
            /* Swipe Animations */
            .swipe-left {
                transform: translateX(-20px);
                opacity: 0.8;
                transition: all 0.3s ease;
            }
            
            .swipe-right {
                transform: translateX(20px);
                opacity: 0.8;
                transition: all 0.3s ease;
            }
        `;
        
        document.head.appendChild(style);
    }
}

// إنشاء نسخة واحدة من مدير الواجهة المتجاوبة
const responsiveUI = new ResponsiveUI();

// إضافة CSS عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    responsiveUI.addResponsiveCSS();
});

// تصدير للإستخدام العام
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResponsiveUI;
} else {
    window.ResponsiveUI = ResponsiveUI;
    window.responsiveUI = responsiveUI;
}
