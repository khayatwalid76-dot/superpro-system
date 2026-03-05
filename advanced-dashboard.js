/**
 * ================================================
 * نظام لوحة التحكم المتقدمة - Advanced Dashboard System
 * Professional Performance Visualization v2.0
 * ================================================
 * يوفر:
 * ✅ رسوم بيانية احترافية متقدمة
 * ✅ عرض الأداء الشهري الاحترافي
 * ✅ دعم اللغات الثلاث
 * ✅ تصميم عصري معاصر
 * ================================================
 */

class AdvancedDashboard {
    constructor() {
        this.chartInstances = {};
        this.performanceData = this.generatePerformanceData();
        this.currentLanguage = this.getCurrentLanguage();
        this.initializeDashboard();
        this.setupLanguageListener();
    }

    /**
     * الحصول على اللغة الحالية
     */
    getCurrentLanguage() {
        return localStorage.getItem('selectedLanguage') || 'ar';
    }

    /**
     * إنشاء بيانات الأداء الشهري
     */
    generatePerformanceData() {
        const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'];
        const monthsEn = ['January', 'February', 'March', 'April', 'May', 'June'];
        const monthsFr = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin'];

        return {
            labels: {
                ar: months,
                en: monthsEn,
                fr: monthsFr
            },
            revenue: [45000, 52000, 48000, 61000, 55000, 68000],
            expenses: [32000, 38000, 35000, 42000, 38000, 45000],
            profit: [13000, 14000, 13000, 19000, 17000, 23000]
        };
    }

    /**
     * حساب البيانات المشتقة
     */
    calculateDerivedData(data) {
        return {
            avgRevenue: (data.revenue.reduce((a, b) => a + b, 0) / data.revenue.length).toFixed(0),
            avgExpenses: (data.expenses.reduce((a, b) => a + b, 0) / data.expenses.length).toFixed(0),
            avgProfit: (data.profit.reduce((a, b) => a + b, 0) / data.profit.length).toFixed(0),
            totalRevenue: data.revenue.reduce((a, b) => a + b, 0),
            totalExpenses: data.expenses.reduce((a, b) => a + b, 0),
            totalProfit: data.profit.reduce((a, b) => a + b, 0),
            maxRevenue: Math.max(...data.revenue),
            minRevenue: Math.min(...data.revenue),
            growthRate: (((data.revenue[data.revenue.length - 1] - data.revenue[0]) / data.revenue[0]) * 100).toFixed(1)
        };
    }

    /**
     * تهيئة لوحة التحكم - Initialization
     */
    initializeDashboard() {
        console.log('🚀 جاري تهيئة لوحة التحكم المتقدمة... | Initializing Advanced Dashboard...');
        
        // تأخير طفيف لضمان تحميل الملفات التابعة
        setTimeout(() => {
            this.initializeCharts();
            this.loadPerformanceMetrics();
            this.setupEventListeners();
            console.log('✅ تم تحميل لوحة التحكم بنجاح | Dashboard loaded successfully');
        }, 500);
    }

    /**
     * تهيئة الرسوم البيانية
     */
    initializeCharts() {
        // رسم بياني للأداء الشهري (خط متقدم)
        this.createMonthlyPerformanceChart();
        
        // رسم بياني لمقارنة الإيرادات والمصروفات
        this.createComparisonChart();
        
        // رسم بياني للنسب المئوية
        this.createProfitMarginChart();
        
        // رسم بياني للتوقعات المستقبلية
        this.createForecastChart();
    }

    /**
     * إنشاء رسم بياني للأداء الشهري
     */
    createMonthlyPerformanceChart() {
        const ctx = document.getElementById('monthlyPerformanceChart');
        if (!ctx) return;

        const labels = this.performanceData.labels[this.currentLanguage];
        const derived = this.calculateDerivedData(this.performanceData);

        const gradient1 = ctx.getContext('2d').createLinearGradient(0, 0, 0, 400);
        gradient1.addColorStop(0, 'rgba(102, 126, 234, 0.4)');
        gradient1.addColorStop(1, 'rgba(102, 126, 234, 0)');

        const gradient2 = ctx.getContext('2d').createLinearGradient(0, 0, 0, 400);
        gradient2.addColorStop(0, 'rgba(240, 147, 251, 0.4)');
        gradient2.addColorStop(1, 'rgba(240, 147, 251, 0)');

        const gradient3 = ctx.getContext('2d').createLinearGradient(0, 0, 0, 400);
        gradient3.addColorStop(0, 'rgba(79, 172, 254, 0.4)');
        gradient3.addColorStop(1, 'rgba(79, 172, 254, 0)');

        this.chartInstances.monthlyPerformance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: window.languageSystem ? window.languageSystem.getTranslation('dashboard.revenue') : 'الإيرادات',
                        data: this.performanceData.revenue,
                        borderColor: '#667eea',
                        backgroundColor: gradient1,
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 6,
                        pointBackgroundColor: '#667eea',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointHoverRadius: 8,
                        pointHoverBackgroundColor: '#667eea',
                        shadowColor: 'rgba(0, 0, 0, 0.1)',
                        shadowBlur: 10
                    },
                    {
                        label: window.languageSystem ? window.languageSystem.getTranslation('dashboard.expenses') : 'المصروفات',
                        data: this.performanceData.expenses,
                        borderColor: '#f093fb',
                        backgroundColor: gradient2,
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 6,
                        pointBackgroundColor: '#f093fb',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointHoverRadius: 8,
                        pointHoverBackgroundColor: '#f093fb'
                    },
                    {
                        label: window.languageSystem ? window.languageSystem.getTranslation('dashboard.netProfit') : 'صافي الربح',
                        data: this.performanceData.profit,
                        borderColor: '#4facfe',
                        backgroundColor: gradient3,
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 6,
                        pointBackgroundColor: '#4facfe',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointHoverRadius: 8,
                        pointHoverBackgroundColor: '#4facfe'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            font: { size: 14, weight: 'bold', family: 'Arial, sans-serif' },
                            padding: 20,
                            usePointStyle: true,
                            pointStyle: 'circle',
                            boxWidth: 10
                        }
                    },
                    tooltip: {
                        enabled: true,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        titleFont: { size: 14, weight: 'bold' },
                        bodyFont: { size: 13 },
                        borderColor: '#ddd',
                        borderWidth: 1,
                        displayColors: true,
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + context.parsed.y.toLocaleString('ar-EG') + ' ريال';
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(0, 0, 0, 0.05)' },
                        ticks: { font: { size: 12 }, callback: function(value) { return value.toLocaleString('ar-EG'); } }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { font: { size: 12 } }
                    }
                }
            }
        });
    }

    /**
     * إنشاء رسم بياني المقارنة
     */
    createComparisonChart() {
        const ctx = document.getElementById('comparisonChart');
        if (!ctx) return;

        const labels = this.performanceData.labels[this.currentLanguage];

        this.chartInstances.comparison = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'الإيرادات | Revenue',
                        data: this.performanceData.revenue,
                        backgroundColor: '#667eea',
                        borderColor: '#667eea',
                        borderRadius: 8,
                        borderWidth: 2
                    },
                    {
                        label: 'المصروفات | Expenses',
                        data: this.performanceData.expenses,
                        backgroundColor: '#f093fb',
                        borderColor: '#f093fb',
                        borderRadius: 8,
                        borderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(0, 0, 0, 0.05)' }
                    }
                }
            }
        });
    }

    /**
     * إنشاء رسم بياني الهامش الربحي
     */
    createProfitMarginChart() {
        const ctx = document.getElementById('profitMarginChart');
        if (!ctx) return;

        const margins = this.performanceData.profit.map((p, i) => 
            ((p / this.performanceData.revenue[i]) * 100).toFixed(1)
        );

        this.chartInstances.margin = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: this.performanceData.labels[this.currentLanguage],
                datasets: [{
                    data: margins,
                    backgroundColor: [
                        '#667eea', '#f093fb', '#4facfe', '#fbc844',
                        '#fa709a', '#a8edea'
                    ],
                    borderColor: '#fff',
                    borderWidth: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'right'
                    }
                }
            }
        });
    }

    /**
     * إنشاء رسم بياني التوقعات
     */
    createForecastChart() {
        const ctx = document.getElementById('forecastChart');
        if (!ctx) return;

        // محاكاة بيانات التوقعات
        const allLabels = [...this.performanceData.labels[this.currentLanguage], 'يوليو'];
        const historicalRevenue = [...this.performanceData.revenue, null];
        const forecastRevenue = [null, null, null, null, null, null, 75000];

        this.chartInstances.forecast = new Chart(ctx, {
            type: 'line',
            data: {
                labels: allLabels,
                datasets: [
                    {
                        label: 'البيانات التاريخية | Historical',
                        data: historicalRevenue,
                        borderColor: '#667eea',
                        borderWidth: 3,
                        pointRadius: 5,
                        fill: false,
                        tension: 0.4
                    },
                    {
                        label: 'التوقعات | Forecast',
                        data: forecastRevenue,
                        borderColor: '#f5576c',
                        borderDash: [5, 5],
                        borderWidth: 2,
                        pointRadius: 5,
                        fill: false,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: true }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }

    /**
     * تحميل مقاييس الأداء
     */
    loadPerformanceMetrics() {
        const derived = this.calculateDerivedData(this.performanceData);

        // تحديث بطاقات المقاييس
        const metricsContainer = document.getElementById('performanceMetrics');
        if (metricsContainer) {
            metricsContainer.innerHTML = this.generateMetricsHTML(derived);
        }
    }

    /**
     * إنشاء HTML بطاقات المقاييس
     */
    generateMetricsHTML(data) {
        return `
            <div class="metrics-grid">
                <div class="metric-card">
                    <div class="metric-icon">💰</div>
                    <div class="metric-info">
                        <h4>إجمالي الإيرادات</h4>
                        <p class="metric-value">${(data.totalRevenue/1000).toFixed(0)}K</p>
                        <small>متوسط: ${(data.avgRevenue/1000).toFixed(0)}K</small>
                    </div>
                </div>
                <div class="metric-card">
                    <div class="metric-icon">📊</div>
                    <div class="metric-info">
                        <h4>إجمالي المصروفات</h4>
                        <p class="metric-value">${(data.totalExpenses/1000).toFixed(0)}K</p>
                        <small>متوسط: ${(data.avgExpenses/1000).toFixed(0)}K</small>
                    </div>
                </div>
                <div class="metric-card">
                    <div class="metric-icon">📈</div>
                    <div class="metric-info">
                        <h4>صافي الربح</h4>
                        <p class="metric-value">${(data.totalProfit/1000).toFixed(0)}K</p>
                        <small>متوسط: ${(data.avgProfit/1000).toFixed(0)}K</small>
                    </div>
                </div>
                <div class="metric-card">
                    <div class="metric-icon">📉</div>
                    <div class="metric-info">
                        <h4>معدل النمو</h4>
                        <p class="metric-value">${data.growthRate}%</p>
                        <small>من يناير إلى يونيو</small>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * إعداد مستمعات الأحداث
     */
    setupEventListeners() {
        const refreshBtn = document.getElementById('refreshDashboard');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshDashboard());
        }
    }

    /**
     * تحديث لوحة التحكم
     */
    refreshDashboard() {
        console.log('🔄 جاري تحديث البيانات...');
        
        // إعادة تحميل البيانات
        this.performanceData = this.generatePerformanceData();
        
        // تدمير الرسوم البيانية القديمة
        Object.values(this.chartInstances).forEach(chart => {
            if (chart) chart.destroy();
        });
        
        // إعادة تهيئة الرسوم البيانية
        this.chartInstances = {};
        this.initializeCharts();
        this.loadPerformanceMetrics();
        
        console.log('✅ تم تحديث البيانات بنجاح');
    }

    /**
     * إعداد مستمع تغيير اللغة
     */
    setupLanguageListener() {
        document.addEventListener('languageChanged', (event) => {
            this.currentLanguage = event.detail.language;
            console.log('🌐 تم تغيير اللغة إلى:', this.currentLanguage);
            
            // تحديث الرسوم البيانية
            this.refreshDashboard();
        });
    }

    /**
     * الحصول على نقطة بيانات محددة
     */
    getMetricValue(month, metric) {
        if (metric === 'revenue') return this.performanceData.revenue[month];
        if (metric === 'expenses') return this.performanceData.expenses[month];
        if (metric === 'profit') return this.performanceData.profit[month];
    }

    /**
     * تصدير البيانات
     */
    exportData(format = 'json') {
        const derived = this.calculateDerivedData(this.performanceData);
        const data = {
            generatedAt: new Date().toLocaleString('ar-EG'),
            performanceData: this.performanceData,
            metrics: derived
        };

        if (format === 'json') {
            const dataStr = JSON.stringify(data, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            this.downloadFile(dataBlob, 'dashboard-data.json');
        } else if (format === 'csv') {
            const csv = this.convertToCSV(this.performanceData);
            const dataBlob = new Blob([csv], { type: 'text/csv' });
            this.downloadFile(dataBlob, 'dashboard-data.csv');
        }
    }

    /**
     * تحويل البيانات إلى CSV
     */
    convertToCSV(data) {
        let csv = 'الشهر,الإيرادات,المصروفات,الربح\n';
        const labels = data.labels['ar'];
        
        for (let i = 0; i < labels.length; i++) {
            csv += `${labels[i]},${data.revenue[i]},${data.expenses[i]},${data.profit[i]}\n`;
        }
        
        return csv;
    }

    /**
     * تحميل ملف
     */
    downloadFile(blob, filename) {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        window.URL.revokeObjectURL(url);
    }
}

// ✅ تهيئة لوحة التحكم عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    if (window.Chart) {
        window.advancedDashboard = new AdvancedDashboard();
        console.log('📊 تم تهيئة نظام لوحة التحكم المتقدة بنجاح');
    } else {
        console.warn('⚠️ Chart.js لم يتم تحميله بعد');
        setTimeout(() => {
            if (window.Chart) {
                window.advancedDashboard = new AdvancedDashboard();
            }
        }, 1000);
    }
});

// تصدير للاستخدام الخارجي
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdvancedDashboard;
}