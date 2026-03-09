// ============= التحليلات والتقارير المتقدمة =============

class AdvancedAnalytics {
  constructor() {
    this.dashboards = {};
    this.kpis = {};
    this.predictions = {};
    this.trends = {};
  }

  // ===== لوحات المعلومات التنفيذية =====
  createDashboard(dashboardId, title, metrics = []) {
    const dashboard = {
      id: dashboardId,
      title: title,
      metrics: metrics,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      refreshInterval: 5, // دقائق
      active: true,
      widgets: []
    };

    this.dashboards[dashboardId] = dashboard;
    return dashboard;
  }

  addWidgetToDashboard(dashboardId, widget) {
    if(!this.dashboards[dashboardId]) return { error: 'Dashboard not found' };

    const w = {
      id: Date.now(),
      type: widget.type, // chart, table, kpi, gauge
      title: widget.title,
      dataSource: widget.dataSource,
      refreshRate: widget.refreshRate || 5,
      position: widget.position || { x: 0, y: 0, width: 4, height: 3 }
    };

    this.dashboards[dashboardId].widgets.push(w);
    return w;
  }

  // ===== مؤشرات الأداء الرئيسية (KPIs) =====
  createKPI(kpiId, title, formula, target, unit = '') {
    const kpi = {
      id: kpiId,
      title: title,
      formula: formula, // دالة لحساب القيمة
      target: target,
      unit: unit,
      currentValue: 0,
      progress: 0, // نسبة التحقق
      status: 'neutral', // good, warning, critical
      trend: 'stable', // up, down, stable
      history: [], // آخر 90 يوم
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };

    this.kpis[kpiId] = kpi;
    return kpi;
  }

  updateKPI(kpiId, currentValue) {
    if(!this.kpis[kpiId]) return { error: 'KPI not found' };

    const kpi = this.kpis[kpiId];
    const previousValue = kpi.currentValue;

    kpi.currentValue = currentValue;
    kpi.progress = (currentValue / kpi.target) * 100;
    kpi.lastUpdated = new Date().toISOString();

    // حالة الـ KPI
    if(kpi.progress >= 100) kpi.status = 'good';
    else if(kpi.progress >= 75) kpi.status = 'warning';
    else kpi.status = 'critical';

    // الاتجاه
    if(currentValue > previousValue) kpi.trend = 'up';
    else if(currentValue < previousValue) kpi.trend = 'down';
    else kpi.trend = 'stable';

    // سجل المتغيرات
    kpi.history.push({
      date: new Date().toISOString(),
      value: currentValue,
      progress: kpi.progress
    });

    // الاحتفاظ بآخر 90 يوم فقط
    if(kpi.history.length > 90) kpi.history.shift();

    return kpi;
  }

  getAllKPIs() {
    return Object.values(this.kpis);
  }

  // ===== التنبؤات =====
  createPrediction(model, historicalData) {
    const prediction = {
      id: Date.now(),
      model: model, // linear, exponential, polynomial
      dataPoints: historicalData.length,
      createdAt: new Date().toISOString(),
      forecast: [],
      accuracy: 0,
      confidence: 0.95
    };

    // حساب التنبؤات
    prediction.forecast = this.calculateForecast(historicalData, model, 30);
    prediction.accuracy = this.calculateAccuracy(historicalData);

    this.predictions[prediction.id] = prediction;
    return prediction;
  }

  calculateForecast(data, model, days) {
    console.log(`📈 حساب التنبؤات باستخدام نموذج ${model} لـ ${days} يوم`);

    const forecast = [];
    const avgGrowth = ((data[data.length - 1] - data[0]) / data.length);

    for(let i = 1; i <= days; i++) {
      if(model === 'linear') {
        forecast.push(data[data.length - 1] + (avgGrowth * i));
      } else if(model === 'exponential') {
        forecast.push(data[data.length - 1] * Math.pow(1.05, i));
      } else if(model === 'polynomial') {
        forecast.push(data[data.length - 1] + (avgGrowth * i) + (Math.random() * 100));
      }
    }

    return forecast;
  }

  calculateAccuracy(data) {
    // حساب بسيط للدقة
    // في الإنتاج: استخدم ML library
    return 0.85 + (Math.random() * 0.1);
  }

  // ===== تحليل الاتجاهات =====
  analyzeTrend(dataCategory, timeRange = '30d') {
    console.log(`📊 تحليل الاتجاه: ${dataCategory} - آخر ${timeRange}`);

    const trend = {
      category: dataCategory,
      timeRange: timeRange,
      dataPoints: [],
      average: 0,
      min: 0,
      max: 0,
      std_deviation: 0,
      trend_direction: 'stable',
      seasonality: false,
      anomalies: []
    };

    // جمع البيانات
    // في الإنتاج: استعلم من قاعدة البيانات
    const sampleData = this.generateSampleTrendData(30);
    trend.dataPoints = sampleData;

    // حسابات إحصائية
    trend.average = sampleData.reduce((a, b) => a + b) / sampleData.length;
    trend.min = Math.min(...sampleData);
    trend.max = Math.max(...sampleData);
    trend.std_deviation = this.calculateStandardDeviation(sampleData);

    // الاتجاه العام
    const recentAverage = sampleData.slice(-10).reduce((a, b) => a + b) / 10;
    if(recentAverage > trend.average * 1.1) trend.trend_direction = 'up';
    else if(recentAverage < trend.average * 0.9) trend.trend_direction = 'down';

    // اكتشاف الشذوذ
    trend.anomalies = this.detectAnomalies(sampleData, trend.average);

    this.trends[dataCategory] = trend;
    return trend;
  }

  generateSampleTrendData(days) {
    const data = [];
    for(let i = 0; i < days; i++) {
      data.push(Math.floor(Math.random() * 1000) + 5000);
    }
    return data;
  }

  calculateStandardDeviation(data) {
    const avg = data.reduce((a, b) => a + b) / data.length;
    const squareDiffs = data.map(x => Math.pow(x - avg, 2));
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b) / squareDiffs.length;
    return Math.sqrt(avgSquareDiff);
  }

  detectAnomalies(data, average) {
    const anomalies = [];
    const threshold = average * 0.5; // انحراف 50%

    data.forEach((value, index) => {
      if(Math.abs(value - average) > threshold) {
        anomalies.push({
          index: index,
          value: value,
          deviation: ((value - average) / average) * 100
        });
      }
    });

    return anomalies;
  }

  // ===== مقارنة الفترات =====
  comparePeriods(metric, period1, period2) {
    console.log(`⚖️ مقارنة: ${metric} بين ${period1} و ${period2}`);

    const comparison = {
      metric: metric,
      period1: {
        label: period1,
        value: Math.floor(Math.random() * 100000) + 50000,
        growth: 0
      },
      period2: {
        label: period2,
        value: Math.floor(Math.random() * 100000) + 50000,
        growth: 0
      },
      difference: 0,
      percentageChange: 0,
      comparison: 'better' // better, worse, equal
    };

    comparison.difference = comparison.period2.value - comparison.period1.value;
    comparison.percentageChange = (comparison.difference / comparison.period1.value) * 100;
    comparison.comparison = comparison.percentageChange > 0 ? 'better' : comparison.percentageChange < 0 ? 'worse' : 'equal';

    return comparison;
  }

  // ===== تحليل الأداء =====
  performanceAnalysis(employees) {
    console.log('🎯 تحليل أداء الموظفين...');

    const analysis = {
      totalEmployees: employees.length,
      performanceMetrics: {
        topPerformers: [],
        averagePerformers: [],
        needsImprovement: []
      },
      departmentComparison: {},
      recommendations: []
    };

    // تصنيف الموظفين
    employees.forEach(emp => {
      const performanceScore = (emp.attendance || 0) * 0.3 + 
                              (emp.productivity || 0) * 0.4 + 
                              (emp.teamwork || 0) * 0.3;

      if(performanceScore >= 80) analysis.performanceMetrics.topPerformers.push(emp);
      else if(performanceScore >= 60) analysis.performanceMetrics.averagePerformers.push(emp);
      else analysis.performanceMetrics.needsImprovement.push(emp);
    });

    // التوصيات
    if(analysis.performanceMetrics.needsImprovement.length > 0.2 * employees.length) {
      analysis.recommendations.push('قد تحتاج إلى برامج تدريب إضافية');
    }

    if(analysis.performanceMetrics.topPerformers.length > 0.3 * employees.length) {
      analysis.recommendations.push('الفريق يؤدي بشكل جيد - فكر في الحوافز');
    }

    return analysis;
  }

  // ===== تحليل التكاليف =====
  costAnalysis(expenses) {
    console.log('💰 تحليل التكاليف...');

    const analysis = {
      totalExpenses: 0,
      byCategory: {},
      topExpenses: [],
      savingsOpportunities: [],
      budgetStatus: {}
    };

    // حساب الإجمالي
    analysis.totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    // التصنيف
    expenses.forEach(exp => {
      if(!analysis.byCategory[exp.category]) {
        analysis.byCategory[exp.category] = 0;
      }
      analysis.byCategory[exp.category] += exp.amount;
    });

    // أكبر التكاليف
    analysis.topExpenses = expenses.sort((a, b) => b.amount - a.amount).slice(0, 5);

    // فرص التوفير (بسيطة)
    if(analysis.byCategory['operations'] > analysis.totalExpenses * 0.4) {
      analysis.savingsOpportunities.push({
        category: 'operations',
        suggestion: 'النفقات التشغيلية عالية - فكر في المتقاصة',
        potentialSavings: analysis.byCategory['operations'] * 0.1
      });
    }

    return analysis;
  }

  // ===== ROI Analysis =====
  calculateROI(investment, returns, period = 12) {
    console.log(`📊 حساب العائد على الاستثمار: استثمار ${investment}, عائد ${returns}`);

    const roi = {
      investment: investment,
      returns: returns,
      period: period,
      netProfit: returns - investment,
      roiPercentage: ((returns - investment) / investment) * 100,
      roiPerMonth: ((returns - investment) / investment / period) * 100,
      paybackPeriod: investment / (returns / period),
      recommendation: ''
    };

    if(roi.roiPercentage > 50) roi.recommendation = 'استثمار ممتاز - يستحق المتابعة';
    else if(roi.roiPercentage > 20) roi.recommendation = 'استثمار جيد - متابعة موصى بها';
    else if(roi.roiPercentage > 0) roi.recommendation = 'استثمار مقبول - مراقبة مستمرة';
    else roi.recommendation = 'استثمار سلبي - يحتاج إلى استعادة النظر';

    return roi;
  }

  // الحفظ والتحميل
  saveAnalytics() {
    localStorage.setItem('superpro_dashboards', JSON.stringify(this.dashboards));
    localStorage.setItem('superpro_kpis', JSON.stringify(this.kpis));
    localStorage.setItem('superpro_predictions', JSON.stringify(this.predictions));
    localStorage.setItem('superpro_trends', JSON.stringify(this.trends));
  }

  loadAnalytics() {
    const dashboards = localStorage.getItem('superpro_dashboards');
    const kpis = localStorage.getItem('superpro_kpis');
    const predictions = localStorage.getItem('superpro_predictions');
    const trends = localStorage.getItem('superpro_trends');

    if(dashboards) this.dashboards = JSON.parse(dashboards);
    if(kpis) this.kpis = JSON.parse(kpis);
    if(predictions) this.predictions = JSON.parse(predictions);
    if(trends) this.trends = JSON.parse(trends);
  }
}

// إنشاء instance عام
const advancedAnalytics = new AdvancedAnalytics();
advancedAnalytics.loadAnalytics();
console.log('✅ تم تحميل نظام التحليلات المتقدمة');
