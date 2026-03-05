/**
 * CLEANING SYSTEM ENHANCEMENTS
 * نظام تحسينات متخصص لشركات التنظيفات
 * يتضمن: إدارة الفرق، الخدمات، التقييمات، والتقارير المتقدمة
 */

// ============================================
// 1. إدارة الفرق والمواقع
// ============================================

class TeamManagement {
    constructor() {
        this.teams = JSON.parse(localStorage.getItem('cleaning_teams')) || [];
        this.locations = JSON.parse(localStorage.getItem('cleaning_locations')) || [];
        this.teamAssignments = JSON.parse(localStorage.getItem('team_assignments')) || [];
    }

    // إضافة فريق جديد
    addTeam(teamData) {
        const team = {
            id: Date.now(),
            ...teamData,
            createdAt: new Date().toISOString(),
            status: 'نشط',
            members: [] // أسماء أعضاء الفريق
        };
        this.teams.push(team);
        this.save();
        return team;
    }

    // تحديث معلومات الفريق
    updateTeam(teamId, data) {
        const index = this.teams.findIndex(t => t.id === teamId);
        if (index !== -1) {
            this.teams[index] = { ...this.teams[index], ...data, updatedAt: new Date().toISOString() };
            this.save();
            return this.teams[index];
        }
        return null;
    }

    // حذف فريق
    deleteTeam(teamId) {
        this.teams = this.teams.filter(t => t.id !== teamId);
        this.save();
    }

    // إضافة موقع جديد
    addLocation(locationData) {
        const location = {
            id: Date.now(),
            ...locationData,
            createdAt: new Date().toISOString()
        };
        this.locations.push(location);
        this.save();
        return location;
    }

    // تعيين فريق لموقع/عميل
    assignTeamToLocation(teamId, locationId, date) {
        const assignment = {
            id: Date.now(),
            teamId,
            locationId,
            date,
            status: 'معينة',
            createdAt: new Date().toISOString()
        };
        this.teamAssignments.push(assignment);
        this.save();
        return assignment;
    }

    // الحصول على الفرق المتاحة
    getAvailableTeams(date) {
        return this.teams.filter(team => {
            const assignments = this.teamAssignments.filter(a => a.teamId === team.id && a.date === date);
            return assignments.length === 0 && team.status === 'نشط';
        });
    }

    save() {
        localStorage.setItem('cleaning_teams', JSON.stringify(this.teams));
        localStorage.setItem('cleaning_locations', JSON.stringify(this.locations));
        localStorage.setItem('team_assignments', JSON.stringify(this.teamAssignments));
    }
}

// ============================================
// 2. نظام الخدمات والحزم
// ============================================

class ServicePackages {
    constructor() {
        this.services = JSON.parse(localStorage.getItem('cleaning_services')) || this.initializeDefaultServices();
        this.packages = JSON.parse(localStorage.getItem('cleaning_packages')) || this.initializeDefaultPackages();
    }

    initializeDefaultServices() {
        return [
            { id: 1, name: 'تنظيف منزلي', category: 'منازل', basePrice: 100, description: 'تنظيف شامل للمنزل' },
            { id: 2, name: 'تنظيف مكاتب', category: 'مكاتب', basePrice: 150, description: 'تنظيف المكاتب والمساحات التجارية' },
            { id: 3, name: 'غسيل النوافذ', category: 'خدمات إضافية', basePrice: 50, description: 'تنظيف وغسيل النوافذ' },
            { id: 4, name: 'تنظيف الحدائق', category: 'خارجي', basePrice: 80, description: 'تنظيف وصيانة الحدائق' },
            { id: 5, name: 'تنظيف بعد الرينوفيشن', category: 'خاص', basePrice: 200, description: 'تنظيف شامل بعد أعمال الترميم' }
        ];
    }

    initializeDefaultPackages() {
        return [
            {
                id: 1,
                name: 'الحزمة الأساسية', 
                type: 'أسبوعية',
                duration: 'أسبوعي',
                services: [1],
                price: 300,
                discount: 0,
                finalPrice: 300,
                description: 'تنظيف أسبوعي للمنزل'
            },
            {
                id: 2,
                name: 'الحزمة الشاملة',
                type: 'شهرية',
                duration: 'شهري',
                services: [1, 3],
                price: 1000,
                discount: 10,
                finalPrice: 900,
                description: 'تنظيف شامل شهري مع غسيل النوافذ'
            },
            {
                id: 3,
                name: 'حزمة الشركات',
                type: 'يومية',
                duration: 'يومي',
                services: [2],
                price: 150,
                discount: 5,
                finalPrice: 142.5,
                description: 'تنظيف يومي للمكاتب والشركات'
            }
        ];
    }

    addService(serviceData) {
        const service = {
            id: Date.now(),
            ...serviceData,
            createdAt: new Date().toISOString()
        };
        this.services.push(service);
        this.save();
        return service;
    }

    addPackage(packageData) {
        const pkg = {
            id: Date.now(),
            ...packageData,
            createdAt: new Date().toISOString()
        };
        this.packages.push(pkg);
        this.save();
        return pkg;
    }

    save() {
        localStorage.setItem('cleaning_services', JSON.stringify(this.services));
        localStorage.setItem('cleaning_packages', JSON.stringify(this.packages));
    }
}

// ============================================
// 3. نظام التقييمات والآراء
// ============================================

class CustomerRatings {
    constructor() {
        this.ratings = JSON.parse(localStorage.getItem('customer_ratings')) || [];
        this.feedback = JSON.parse(localStorage.getItem('customer_feedback')) || [];
    }

    // إضافة تقييم للخدمة
    addRating(ratingData) {
        const rating = {
            id: Date.now(),
            ...ratingData,
            date: new Date().toISOString(),
            status: 'جديد'
        };
        this.ratings.push(rating);
        this.save();
        return rating;
    }

    // إضافة ملاحظات/تعليقات
    addFeedback(feedbackData) {
        const feedback = {
            id: Date.now(),
            ...feedbackData,
            date: new Date().toISOString(),
            resolved: false
        };
        this.feedback.push(feedback);
        this.save();
        return feedback;
    }

    // حساب متوسط التقييم
    getAverageRating(clientId = null) {
        let ratings = this.ratings;
        if (clientId) {
            ratings = ratings.filter(r => r.clientId === clientId);
        }
        
        if (ratings.length === 0) return 0;
        
        const total = ratings.reduce((sum, r) => sum + (r.rating || 0), 0);
        return (total / ratings.length).toFixed(1);
    }

    // الحصول على إحصائيات التقييمات
    getRatingStats(clientId = null) {
        let ratings = this.ratings;
        if (clientId) {
            ratings = ratings.filter(r => r.clientId === clientId);
        }

        const stats = {
            total: ratings.length,
            average: this.getAverageRating(clientId),
            distribution: {}
        };

        for (let i = 1; i <= 5; i++) {
            const count = ratings.filter(r => r.rating === i).length;
            stats.distribution[i] = {
                count,
                percentage: ratings.length > 0 ? ((count / ratings.length) * 100).toFixed(1) : 0
            };
        }

        return stats;
    }

    // الحصول على التعليقات السلبية
    getNegativeFeedback(threshold = 3) {
        return this.feedback.filter(f => !f.resolved && f.severity && f.severity >= threshold);
    }

    save() {
        localStorage.setItem('customer_ratings', JSON.stringify(this.ratings));
        localStorage.setItem('customer_feedback', JSON.stringify(this.feedback));
    }
}

// ============================================
// 4. نظام الإحصائيات والتقارير المتقدمة
// ============================================

class CleaningAnalytics {
    constructor(employees, contracts, dailyWork, dailyIncome, dailyExpenses) {
        this.employees = employees;
        this.contracts = contracts;
        this.dailyWork = dailyWork;
        this.dailyIncome = dailyIncome;
        this.dailyExpenses = dailyExpenses;
        this.ratings = new CustomerRatings();
    }

    // إحصائيات الأداء اليومي
    getDailyPerformance(date) {
        const dayWork = this.dailyWork.filter(w => w.date === date);
        const dayIncome = this.dailyIncome.filter(i => i.date === date);
        const dayExpenses = this.dailyExpenses.filter(e => e.date === date);

        return {
            date,
            jobsCompleted: dayWork.length,
            totalHours: dayWork.reduce((sum, w) => sum + (parseFloat(w.totalHours) || 0), 0),
            totalIncome: dayIncome.reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0),
            totalExpenses: dayExpenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0),
            netProfit: dayIncome.reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0) - 
                      dayExpenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0),
            activeTeams: new Set(dayWork.map(w => w.teamId || w.worker)).size
        };
    }

    // أداء الموظفين
    getEmployeePerformance(employeeId, startDate, endDate) {
        const work = this.dailyWork.filter(w => {
            const empMatch = w.workers ? w.workers.includes(employeeId) : w.worker === employeeId;
            const dateMatch = w.date >= startDate && w.date <= endDate;
            return empMatch && dateMatch;
        });

        return {
            employeeId,
            jobsCompleted: work.length,
            totalHours: work.reduce((sum, w) => sum + (parseFloat(w.totalHours) || 0), 0),
            averageRating: this.ratings.getAverageRating(employeeId),
            totalEarnings: work.reduce((sum, w) => sum + (parseFloat(w.amount) || 0), 0),
            clientSatisfaction: this.ratings.getRatingStats(employeeId)
        };
    }

    // تحليل الربحية
    getProfitabilityAnalysis(startDate, endDate) {
        const income = this.dailyIncome.filter(i => i.date >= startDate && i.date <= endDate),
                expenses = this.dailyExpenses.filter(e => e.date >= startDate && e.date <= endDate);

        const totalIncome = income.reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);
        const totalExpenses = expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
        const netProfit = totalIncome - totalExpenses;

        return {
            period: `${startDate} إلى ${endDate}`,
            totalIncome,
            totalExpenses,
            netProfit,
            profitMargin: totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(2) : 0,
            expenseBreakdown: this.getExpenseBreakdown(expenses)
        };
    }

    getExpenseBreakdown(expenses) {
        const breakdown = {};
        expenses.forEach(e => {
            const type = e.type || 'أخرى';
            breakdown[type] = (breakdown[type] || 0) + (parseFloat(e.amount) || 0);
        });
        return breakdown;
    }

    // أكثر العملاء قيمة
    getTopClients(limit = 10) {
        const clientIncome = {};
        
        this.dailyWork.forEach(work => {
            const client = work.client;
            clientIncome[client] = (clientIncome[client] || 0) + (parseFloat(work.amount) || 0);
        });

        return Object.entries(clientIncome)
            .map(([client, income]) => ({
                client,
                totalIncome: income,
                rating: this.ratings.getAverageRating(client),
                jobsCount: this.dailyWork.filter(w => w.client === client).length
            }))
            .sort((a, b) => b.totalIncome - a.totalIncome)
            .slice(0, limit);
    }

    // أداء الفرق
    getTeamPerformance(teamId, startDate, endDate) {
        const work = this.dailyWork.filter(w => {
            const teamMatch = w.teamId === teamId;
            const dateMatch = w.date >= startDate && w.date <= endDate;
            return teamMatch && dateMatch;
        });

        return {
            teamId,
            jobsCompleted: work.length,
            totalIncome: work.reduce((sum, w) => sum + (parseFloat(w.amount) || 0), 0),
            averageIncomePerJob: work.length > 0 ? 
                (work.reduce((sum, w) => sum + (parseFloat(w.amount) || 0), 0) / work.length).toFixed(2) : 0,
            totalHours: work.reduce((sum, w) => sum + (parseFloat(w.totalHours) || 0), 0),
            costPerHour: work.length > 0 ? 
                (work.reduce((sum, w) => sum + (parseFloat(w.amount) || 0), 0) / 
                work.reduce((sum, w) => sum + (parseFloat(w.totalHours) || 0), 1)).toFixed(2) : 0
        };
    }

    // التقرير الشامل
    getComprehensiveReport(startDate, endDate) {
        return {
            period: `${startDate} إلى ${endDate}`,
            dailyPerformance: this.getDateRangePerformance(startDate, endDate),
            topClients: this.getTopClients(),
            profitability: this.getProfitabilityAnalysis(startDate, endDate),
            employeeStats: this.getEmployeeStats(startDate, endDate),
            serviceStats: this.getServiceStats(startDate, endDate)
        };
    }

    getDateRangePerformance(startDate, endDate) {
        let totalJobs = 0, totalIncome = 0, totalExpenses = 0, daysWorked = 0;
        
        const dateArray = this.getDateRange(startDate, endDate);
        
        dateArray.forEach(date => {
            const performance = this.getDailyPerformance(date);
            totalJobs += performance.jobsCompleted;
            totalIncome += performance.totalIncome;
            totalExpenses += performance.totalExpenses;
            if (performance.jobsCompleted > 0) daysWorked++;
        });

        return {
            totalJobs,
            totalIncome,
            totalExpenses,
            netProfit: totalIncome - totalExpenses,
            daysWorked,
            averageJobsPerDay: daysWorked > 0 ? (totalJobs / daysWorked).toFixed(2) : 0,
            averageIncomePerDay: daysWorked > 0 ? (totalIncome / daysWorked).toFixed(2) : 0
        };
    }

    getEmployeeStats(startDate, endDate) {
        const stats = {};
        
        this.dailyWork
            .filter(w => w.date >= startDate && w.date <= endDate)
            .forEach(work => {
                if (work.workers) {
                    work.workers.forEach(empId => {
                        if (!stats[empId]) {
                            stats[empId] = { jobs: 0, hours: 0, income: 0, rating: 0 };
                        }
                        stats[empId].jobs++;
                        stats[empId].hours += parseFloat(work.totalHours) || 0;
                        stats[empId].income += parseFloat(work.amount) || 0;
                    });
                }
            });

        return Object.entries(stats).map(([empId, data]) => ({
            employeeId: empId,
            ...data,
            averageIncomePerJob: data.jobs > 0 ? (data.income / data.jobs).toFixed(2) : 0
        }));
    }

    getServiceStats(startDate, endDate) {
        const stats = {};
        
        this.dailyWork
            .filter(w => w.date >= startDate && w.date <= endDate)
            .forEach(work => {
                const service = work.serviceType || 'عام';
                if (!stats[service]) {
                    stats[service] = { count: 0, totalIncome: 0 };
                }
                stats[service].count++;
                stats[service].totalIncome += parseFloat(work.amount) || 0;
            });

        return Object.entries(stats).map(([service, data]) => ({
            service,
            ...data,
            averagePrice: data.count > 0 ? (data.totalIncome / data.count).toFixed(2) : 0
        }));
    }

    getDateRange(startDate, endDate) {
        const dates = [];
        const currentDate = new Date(startDate);
        const end = new Date(endDate);

        while (currentDate <= end) {
            dates.push(currentDate.toISOString().split('T')[0]);
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return dates;
    }
}

// ============================================
// 5. الدوال المساعدة والتصدير
// ============================================

const cleaningSystem = {
    teams: new TeamManagement(),
    services: new ServicePackages(),
    ratings: new CustomerRatings(),
    
    // إنشاء نسخة من التحليلات
    createAnalytics: (employees, contracts, dailyWork, dailyIncome, dailyExpenses) => {
        return new CleaningAnalytics(employees, contracts, dailyWork, dailyIncome, dailyExpenses);
    }
};

// تصدير الكائنات
if (typeof module !== 'undefined' && module.exports) {
    module.exports = cleaningSystem;
}
