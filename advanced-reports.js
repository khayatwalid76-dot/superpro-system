// نظام التقارير المتقدم مع التصدير
// Advanced Reports System with Export

class AdvancedReportsSystem {
    constructor() {
        this.reports = {
            employees: {
                title: 'تقرير الموظفين',
                icon: 'fas fa-users',
                fields: ['name', 'job', 'salary', 'nationality', 'status', 'hireDate', 'phone'],
                filters: ['department', 'status', 'nationality', 'salaryRange']
            },
            clients: {
                title: 'تقرير العملاء',
                icon: 'fas fa-user-tie',
                fields: ['name', 'phone', 'email', 'area', 'contractCount', 'totalValue'],
                filters: ['area', 'activeContracts', 'valueRange']
            },
            contracts: {
                title: 'تقرير العقود',
                icon: 'fas fa-file-contract',
                fields: ['number', 'client', 'employee', 'startDate', 'endDate', 'amount', 'status'],
                filters: ['status', 'dateRange', 'client', 'employee', 'amountRange']
            },
            financial: {
                title: 'التقرير المالي',
                icon: 'fas fa-chart-line',
                fields: ['date', 'type', 'description', 'amount', 'category', 'paymentMethod'],
                filters: ['dateRange', 'type', 'category', 'amountRange']
            },
            attendance: {
                title: 'تقرير الحضور',
                icon: 'fas fa-clock',
                fields: ['employee', 'date', 'checkIn', 'checkOut', 'workingHours', 'status'],
                filters: ['dateRange', 'employee', 'department', 'status']
            }
        };
        
        this.charts = {};
        this.init();
    }

    init() {
        this.setupReportsUI();
        this.initializeCharts();
        this.setupExportHandlers();
    }

    // إعداد واجهة التقارير
    setupReportsUI() {
        const reportsSection = document.getElementById('reports');
        if (!reportsSection) return;

        const reportsHTML = `
            <div class="container-fluid">
                <div class="row mb-4">
                    <div class="col-12">
                        <h2 class="section-title">
                            <i class="fas fa-chart-bar me-3"></i>
                            التقارير المتقدمة
                        </h2>
                    </div>
                </div>

                <!-- أدوات التصفية والتصدير -->
                <div class="row mb-4">
                    <div class="col-12">
                        <div class="card">
                            <div class="card-body">
                                <div class="row align-items-end">
                                    <div class="col-md-3">
                                        <label class="form-label">نوع التقرير</label>
                                        <select class="form-select" id="reportType">
                                            <option value="">اختر التقرير</option>
                                            ${Object.keys(this.reports).map(key => 
                                                `<option value="${key}">${this.reports[key].title}</option>`
                                            ).join('')}
                                        </select>
                                    </div>
                                    <div class="col-md-3">
                                        <label class="form-label">الفترة</label>
                                        <select class="form-select" id="reportPeriod">
                                            <option value="today">اليوم</option>
                                            <option value="week">هذا الأسبوع</option>
                                            <option value="month" selected>هذا الشهر</option>
                                            <option value="quarter">هذا الربع</option>
                                            <option value="year">هذه السنة</option>
                                            <option value="custom">مخصص</option>
                                        </select>
                                    </div>
                                    <div class="col-md-3">
                                        <label class="form-label">من تاريخ</label>
                                        <input type="date" class="form-control" id="reportDateFrom">
                                    </div>
                                    <div class="col-md-3">
                                        <label class="form-label">إلى تاريخ</label>
                                        <input type="date" class="form-control" id="reportDateTo">
                                    </div>
                                </div>
                                
                                <div class="row mt-3">
                                    <div class="col-12">
                                        <div class="btn-group" role="group">
                                            <button type="button" class="btn btn-primary" onclick="advancedReports.generateReport()">
                                                <i class="fas fa-play me-2"></i>توليد التقرير
                                            </button>
                                            <button type="button" class="btn btn-success" onclick="advancedReports.exportToExcel()">
                                                <i class="fas fa-file-excel me-2"></i>تصدير Excel
                                            </button>
                                            <button type="button" class="btn btn-danger" onclick="advancedReports.exportToPDF()">
                                                <i class="fas fa-file-pdf me-2"></i>تصدير PDF
                                            </button>
                                            <button type="button" class="btn btn-info" onclick="advancedReports.printReport()">
                                                <i class="fas fa-print me-2"></i>طباعة
                                            </button>
                                            <button type="button" class="btn btn-warning" onclick="advancedReports.scheduleReport()">
                                                <i class="fas fa-clock me-2"></i>جدولة
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- محتوى التقرير -->
                <div class="row">
                    <div class="col-12">
                        <div class="card">
                            <div class="card-header d-flex justify-content-between align-items-center">
                                <span id="reportTitle">اختر التقرير لعرضه</span>
                                <div class="btn-group btn-group-sm">
                                    <button type="button" class="btn btn-outline-secondary" onclick="advancedReports.toggleChart()">
                                        <i class="fas fa-chart-pie"></i>
                                    </button>
                                    <button type="button" class="btn btn-outline-secondary" onclick="advancedReports.toggleTable()">
                                        <i class="fas fa-table"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="card-body">
                                <!-- الرسوم البيانية -->
                                <div id="chartsContainer" class="row mb-4" style="display: none;">
                                    <div class="col-md-6">
                                        <div class="card">
                                            <div class="card-header">التحليل الإجمالي</div>
                                            <div class="card-body">
                                                <canvas id="summaryChart"></canvas>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="card">
                                            <div class="card-header">التوزيع</div>
                                            <div class="card-body">
                                                <canvas id="distributionChart"></canvas>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- الجدول -->
                                <div id="tableContainer">
                                    <div class="text-center text-muted py-5">
                                        <i class="fas fa-chart-bar fa-3x mb-3"></i>
                                        <p>اختر نوع التقرير وانقر على "توليد التقرير"</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        reportsSection.innerHTML = reportsHTML;
        this.setupEventListeners();
    }

    // إعداد مستمعي الأحداث
    setupEventListeners() {
        document.getElementById('reportPeriod')?.addEventListener('change', (e) => {
            this.handlePeriodChange(e.target.value);
        });

        document.getElementById('reportType')?.addEventListener('change', (e) => {
            this.handleReportTypeChange(e.target.value);
        });
    }

    // التعامل مع تغيير الفترة
    handlePeriodChange(period) {
        const today = new Date();
        let fromDate, toDate;

        switch (period) {
            case 'today':
                fromDate = toDate = today;
                break;
            case 'week':
                fromDate = new Date(today.setDate(today.getDate() - today.getDay()));
                toDate = new Date(today.setDate(today.getDate() - today.getDay() + 6));
                break;
            case 'month':
                fromDate = new Date(today.getFullYear(), today.getMonth(), 1);
                toDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                break;
            case 'quarter':
                const quarter = Math.floor(today.getMonth() / 3);
                fromDate = new Date(today.getFullYear(), quarter * 3, 1);
                toDate = new Date(today.getFullYear(), (quarter + 1) * 3, 0);
                break;
            case 'year':
                fromDate = new Date(today.getFullYear(), 0, 1);
                toDate = new Date(today.getFullYear(), 12, 0);
                break;
            case 'custom':
                // إظهار حقول التاريخ المخصص
                document.getElementById('reportDateFrom').disabled = false;
                document.getElementById('reportDateTo').disabled = false;
                return;
        }

        // تعيين التواريخ
        if (period !== 'custom') {
            document.getElementById('reportDateFrom').value = fromDate.toISOString().split('T')[0];
            document.getElementById('reportDateTo').value = toDate.toISOString().split('T')[0];
            document.getElementById('reportDateFrom').disabled = true;
            document.getElementById('reportDateTo').disabled = true;
        }
    }

    // التعامل مع تغيير نوع التقرير
    handleReportTypeChange(reportType) {
        if (!reportType) return;

        const report = this.reports[reportType];
        document.getElementById('reportTitle').textContent = report.title;
        
        // إضافة فلاتر خاصة بالتقرير
        this.addReportFilters(report.filters);
    }

    // إضافة فلاتر التقرير
    addReportFilters(filters) {
        const filtersContainer = document.getElementById('reportFilters');
        if (!filtersContainer) return;

        let filtersHTML = '';
        filters.forEach(filter => {
            switch (filter) {
                case 'department':
                    filtersHTML += `
                        <div class="col-md-2">
                            <label class="form-label">القسم</label>
                            <select class="form-select" id="filterDepartment">
                                <option value="">جميع الأقسام</option>
                                <option value="IT">تقنية المعلومات</option>
                                <option value="HR">الموارد البشرية</option>
                                <option value="Finance">المالية</option>
                                <option value="Operations">العمليات</option>
                            </select>
                        </div>
                    `;
                    break;
                case 'status':
                    filtersHTML += `
                        <div class="col-md-2">
                            <label class="form-label">الحالة</label>
                            <select class="form-select" id="filterStatus">
                                <option value="">جميع الحالات</option>
                                <option value="active">نشط</option>
                                <option value="inactive">غير نشط</option>
                                <option value="pending">معلق</option>
                            </select>
                        </div>
                    `;
                    break;
                // يمكن إضافة المزيد من الفلاتر
            }
        });

        filtersContainer.innerHTML = filtersHTML;
    }

    // توليد التقرير
    async generateReport() {
        const reportType = document.getElementById('reportType').value;
        const period = document.getElementById('reportPeriod').value;
        const fromDate = document.getElementById('reportDateFrom').value;
        const toDate = document.getElementById('reportDateTo').value;

        if (!reportType) {
            alert('الرجاء اختيار نوع التقرير');
            return;
        }

        try {
            // الحصول على البيانات
            const data = await this.getReportData(reportType, { fromDate, toDate, period });
            
            // عرض الرسوم البيانية
            this.displayCharts(reportType, data);
            
            // عرض الجدول
            this.displayTable(reportType, data);
            
            // حفظ التقرير في التاريخ
            this.saveReportToHistory(reportType, data);
            
            // تتبع التوليد
            if (typeof trackEvent === 'function') {
                trackEvent('Reports', 'Generate Report', reportType);
            }
            
        } catch (error) {
            console.error('Error generating report:', error);
            alert('خطأ في توليد التقرير: ' + error.message);
        }
    }

    // الحصول على بيانات التقرير
    async getReportData(reportType, filters) {
        const data = {
            employees: window.employees || [],
            clients: window.clients || [],
            contracts: window.contracts || [],
            financial: this.getFinancialData(filters),
            attendance: window.attendance || []
        };

        let reportData = data[reportType] || [];

        // تطبيق الفلاتر
        if (filters.fromDate && filters.toDate) {
            reportData = this.filterByDate(reportData, filters.fromDate, filters.toDate);
        }

        return reportData;
    }

    // الحصول على البيانات المالية
    getFinancialData(filters) {
        const income = window.dailyIncome || [];
        const expenses = window.dailyExpenses || [];
        
        const financialData = [
            ...income.map(item => ({ ...item, type: 'income' })),
            ...expenses.map(item => ({ ...item, type: 'expense' }))
        ];

        if (filters.fromDate && filters.toDate) {
            return this.filterByDate(financialData, filters.fromDate, filters.toDate);
        }

        return financialData;
    }

    // فلترة حسب التاريخ
    filterByDate(data, fromDate, toDate) {
        return data.filter(item => {
            const itemDate = new Date(item.date || item.createdAt);
            const from = new Date(fromDate);
            const to = new Date(toDate);
            return itemDate >= from && itemDate <= to;
        });
    }

    // عرض الرسوم البيانية
    displayCharts(reportType, data) {
        document.getElementById('chartsContainer').style.display = 'block';
        
        // تدمج الرسوم البيانية القديمة إذا وجدت
        if (this.charts.summaryChart) {
            this.charts.summaryChart.destroy();
        }
        if (this.charts.distributionChart) {
            this.charts.distributionChart.destroy();
        }

        // رسم بياني إجمالي
        const summaryCtx = document.getElementById('summaryChart').getContext('2d');
        this.charts.summaryChart = new Chart(summaryCtx, {
            type: 'bar',
            data: this.getSummaryChartData(reportType, data),
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'التحليل الإجمالي'
                    }
                }
            }
        });

        // رسم بياني توزيع
        const distributionCtx = document.getElementById('distributionChart').getContext('2d');
        this.charts.distributionChart = new Chart(distributionCtx, {
            type: 'doughnut',
            data: this.getDistributionChartData(reportType, data),
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                    },
                    title: {
                        display: true,
                        text: 'التوزيع'
                    }
                }
            }
        });
    }

    // الحصول على بيانات الرسم البياني الإجمالي
    getSummaryChartData(reportType, data) {
        const chartData = {
            labels: [],
            datasets: [{
                label: 'الإجمالي',
                data: [],
                backgroundColor: 'rgba(52, 152, 219, 0.5)',
                borderColor: 'rgba(52, 152, 219, 1)',
                borderWidth: 1
            }]
        };

        switch (reportType) {
            case 'employees':
                const statusCount = {};
                data.forEach(emp => {
                    statusCount[emp.status] = (statusCount[emp.status] || 0) + 1;
                });
                chartData.labels = Object.keys(statusCount);
                chartData.datasets[0].data = Object.values(statusCount);
                break;
                
            case 'financial':
                const monthlyData = {};
                data.forEach(item => {
                    const month = new Date(item.date).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short' });
                    const amount = parseFloat(item.amount) || 0;
                    if (item.type === 'income') {
                        monthlyData[month] = (monthlyData[month] || 0) + amount;
                    } else {
                        monthlyData[month] = (monthlyData[month] || 0) - amount;
                    }
                });
                chartData.labels = Object.keys(monthlyData);
                chartData.datasets[0].data = Object.values(monthlyData);
                break;
                
            // يمكن إضافة المزيد من الحالات
        }

        return chartData;
    }

    // الحصول على بيانات الرسم البياني التوزيع
    getDistributionChartData(reportType, data) {
        const chartData = {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF'
                ]
            }]
        };

        switch (reportType) {
            case 'employees':
                const nationalityCount = {};
                data.forEach(emp => {
                    nationalityCount[emp.nationality] = (nationalityCount[emp.nationality] || 0) + 1;
                });
                chartData.labels = Object.keys(nationalityCount);
                chartData.datasets[0].data = Object.values(nationalityCount);
                break;
                
            case 'clients':
                const areaCount = {};
                data.forEach(client => {
                    areaCount[client.area || 'غير محدد'] = (areaCount[client.area || 'غير محدد'] || 0) + 1;
                });
                chartData.labels = Object.keys(areaCount);
                chartData.datasets[0].data = Object.values(areaCount);
                break;
                
            // يمكن إضافة المزيد من الحالات
        }

        return chartData;
    }

    // عرض الجدول
    displayTable(reportType, data) {
        const tableContainer = document.getElementById('tableContainer');
        const report = this.reports[reportType];
        
        let tableHTML = `
            <div class="table-responsive">
                <table class="table table-striped table-hover">
                    <thead class="table-dark">
                        <tr>
                            <th>#</th>
                            ${report.fields.map(field => this.getFieldLabel(field)).map(label => 
                                `<th>${label}</th>`
                            ).join('')}
                        </tr>
                    </thead>
                    <tbody>
        `;

        data.forEach((item, index) => {
            tableHTML += `
                <tr>
                    <td>${index + 1}</td>
                    ${report.fields.map(field => this.getFieldValue(item, field)).map(value => 
                        `<td>${value}</td>`
                    ).join('')}
                </tr>
            `;
        });

        tableHTML += `
                    </tbody>
                </table>
            </div>
            
            <!-- ملخص التقرير -->
            <div class="row mt-4">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header">ملخص التقرير</div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-3">
                                    <div class="text-center">
                                        <h4 class="text-primary">${data.length}</h4>
                                        <p class="mb-0">إجمالي السجلات</p>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="text-center">
                                        <h4 class="text-success">${this.calculateTotal(data, 'amount')}</h4>
                                        <p class="mb-0">الإجمالي المبلغ</p>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="text-center">
                                        <h4 class="text-info">${new Date().toLocaleDateString('ar-SA')}</h4>
                                        <p class="mb-0">تاريخ التقرير</p>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="text-center">
                                        <h4 class="text-warning">${reportType}</h4>
                                        <p class="mb-0">نوع التقرير</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        tableContainer.innerHTML = tableHTML;
    }

    // الحصول على تسمية الحقل
    getFieldLabel(field) {
        const labels = {
            name: 'الاسم',
            job: 'الوظيفة',
            salary: 'الراتب',
            nationality: 'الجنسية',
            status: 'الحالة',
            hireDate: 'تاريخ التوظيف',
            phone: 'الهاتف',
            email: 'البريد الإلكتروني',
            area: 'المنطقة',
            contractCount: 'عدد العقود',
            totalValue: 'الإجمالي',
            number: 'رقم العقد',
            client: 'العميل',
            employee: 'الموظف',
            startDate: 'تاريخ البدء',
            endDate: 'تاريخ الانتهاء',
            amount: 'المبلغ',
            date: 'التاريخ',
            type: 'النوع',
            description: 'الوصف',
            category: 'الفئة',
            paymentMethod: 'طريقة الدفع',
            checkIn: 'تاريخ الحضور',
            checkOut: 'تاريخ الانصراف',
            workingHours: 'ساعات العمل'
        };
        
        return labels[field] || field;
    }

    // الحصول على قيمة الحقل
    getFieldValue(item, field) {
        let value = item[field];
        
        // تنسيق القيم الخاصة
        switch (field) {
            case 'salary':
            case 'amount':
            case 'totalValue':
                value = typeof value === 'number' ? value.toLocaleString('ar-SA') + ' ر.ق' : value;
                break;
            case 'hireDate':
            case 'startDate':
            case 'endDate':
            case 'date':
            case 'checkIn':
            case 'checkOut':
                value = value ? new Date(value).toLocaleDateString('ar-SA') : '-';
                break;
            case 'status':
                const statusColors = {
                    active: 'success',
                    inactive: 'danger',
                    pending: 'warning'
                };
                const color = statusColors[value] || 'secondary';
                value = `<span class="badge bg-${color}">${this.getFieldLabel(field)}</span>`;
                break;
        }
        
        return value || '-';
    }

    // حساب الإجمالي
    calculateTotal(data, field) {
        if (!data.length) return '0';
        
        const total = data.reduce((sum, item) => {
            const value = parseFloat(item[field]) || 0;
            return sum + value;
        }, 0);
        
        return total.toLocaleString('ar-SA') + ' ر.ق';
    }

    // حفظ التقرير في التاريخ
    saveReportToHistory(reportType, data) {
        const history = JSON.parse(localStorage.getItem('reportsHistory') || '[]');
        
        const report = {
            id: Date.now().toString(),
            type: reportType,
            title: this.reports[reportType].title,
            data: data,
            generatedAt: new Date().toISOString(),
            filters: {
                period: document.getElementById('reportPeriod').value,
                fromDate: document.getElementById('reportDateFrom').value,
                toDate: document.getElementById('reportDateTo').value
            }
        };
        
        history.unshift(report);
        
        // الاحتفاظ بآخر 50 تقرير
        if (history.length > 50) {
            history.splice(50);
        }
        
        localStorage.setItem('reportsHistory', JSON.stringify(history));
    }

    // التصدير إلى Excel
    exportToExcel() {
        const reportType = document.getElementById('reportType').value;
        if (!reportType) {
            alert('الرجاء توليد التقرير أولاً');
            return;
        }

        try {
            // الحصول على بيانات التقرير الحالي
            const table = document.querySelector('#tableContainer table');
            if (!table) {
                alert('لا توجد بيانات للتصدير');
                return;
            }

            // استخدام SheetJS للتصدير
            const ws = XLSX.utils.table_to_sheet(table);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, this.reports[reportType].title);
            
            // تنزيل الملف
            XLSX.writeFile(wb, `${this.reports[reportType].title}_${new Date().toISOString().split('T')[0]}.xlsx`);
            
            // تتبع التصدير
            if (typeof trackEvent === 'function') {
                trackEvent('Reports', 'Export Excel', reportType);
            }
            
        } catch (error) {
            console.error('Error exporting to Excel:', error);
            alert('خطأ في التصدير إلى Excel: ' + error.message);
        }
    }

    // التصدير إلى PDF
    exportToPDF() {
        const reportType = document.getElementById('reportType').value;
        if (!reportType) {
            alert('الرجاء توليد التقرير أولاً');
            return;
        }

        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // إضافة العنوان
            doc.setFontSize(20);
            doc.text(this.reports[reportType].title, 105, 20, { align: 'center' });
            
            // إضافة التاريخ
            doc.setFontSize(12);
            doc.text(`التاريخ: ${new Date().toLocaleDateString('ar-SA')}`, 105, 30, { align: 'center' });
            
            // إضافة الجدول
            const table = document.querySelector('#tableContainer table');
            if (table) {
                doc.autoTable({
                    html: table,
                    startY: 40,
                    theme: 'grid',
                    styles: {
                        font: 'helvetica',
                        fontSize: 8,
                        cellPadding: 2
                    },
                    headStyles: {
                        fillColor: [52, 152, 219],
                        textColor: 255,
                        fontStyle: 'bold'
                    }
                });
            }
            
            // تنزيل الملف
            doc.save(`${this.reports[reportType].title}_${new Date().toISOString().split('T')[0]}.pdf`);
            
            // تتبع التصدير
            if (typeof trackEvent === 'function') {
                trackEvent('Reports', 'Export PDF', reportType);
            }
            
        } catch (error) {
            console.error('Error exporting to PDF:', error);
            alert('خطأ في التصدير إلى PDF: ' + error.message);
        }
    }

    // طباعة التقرير
    printReport() {
        const reportType = document.getElementById('reportType').value;
        if (!reportType) {
            alert('الرجاء توليد التقرير أولاً');
            return;
        }

        // إنشاء نافذة طباعة
        const printWindow = window.open('', '_blank');
        
        const reportHTML = `
            <!DOCTYPE html>
            <html dir="rtl" lang="ar">
            <head>
                <meta charset="UTF-8">
                <title>${this.reports[reportType].title}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
                    th { background-color: #f2f2f2; font-weight: bold; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .summary { margin-top: 30px; padding: 15px; background: #f9f9f9; }
                    @media print { body { margin: 0; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>${this.reports[reportType].title}</h1>
                    <p>التاريخ: ${new Date().toLocaleDateString('ar-SA')}</p>
                </div>
                ${document.getElementById('tableContainer').innerHTML}
                <script>
                    window.onload = function() {
                        window.print();
                        window.close();
                    }
                </script>
            </body>
            </html>
        `;
        
        printWindow.document.write(reportHTML);
        printWindow.document.close();
        
        // تتبع الطباعة
        if (typeof trackEvent === 'function') {
            trackEvent('Reports', 'Print', reportType);
        }
    }

    // جدولة التقرير
    scheduleReport() {
        const reportType = document.getElementById('reportType').value;
        if (!reportType) {
            alert('الرجاء اختيار التقرير أولاً');
            return;
        }

        const schedule = prompt('أدخل جدولة التقرير (يومي، أسبوعي، شهري):');
        if (schedule) {
            const schedules = JSON.parse(localStorage.getItem('reportSchedules') || '[]');
            
            schedules.push({
                id: Date.now().toString(),
                reportType: reportType,
                title: this.reports[reportType].title,
                schedule: schedule,
                filters: {
                    period: document.getElementById('reportPeriod').value,
                    fromDate: document.getElementById('reportDateFrom').value,
                    toDate: document.getElementById('reportDateTo').value
                },
                createdAt: new Date().toISOString(),
                active: true
            });
            
            localStorage.setItem('reportSchedules', JSON.stringify(schedules));
            alert('تم جدولة التقرير بنجاح');
        }
    }

    // تبديل عرض الرسوم البيانية
    toggleChart() {
        const chartsContainer = document.getElementById('chartsContainer');
        chartsContainer.style.display = chartsContainer.style.display === 'none' ? 'block' : 'none';
    }

    // تبديل عرض الجدول
    toggleTable() {
        const tableContainer = document.getElementById('tableContainer');
        tableContainer.style.display = tableContainer.style.display === 'none' ? 'block' : 'none';
    }

    // إعداد معالجات التصدير
    setupExportHandlers() {
        // اختصارات لوحة المفاتيح
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'e':
                        e.preventDefault();
                        this.exportToExcel();
                        break;
                    case 'p':
                        e.preventDefault();
                        this.exportToPDF();
                        break;
                    case 'Print':
                        e.preventDefault();
                        this.printReport();
                        break;
                }
            }
        });
    }

    // تهيئة الرسوم البيانية
    initializeCharts() {
        // التحقق من وجود Chart.js
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js not loaded');
            return;
        }
        
        console.log('📊 Charts initialized');
    }
}

// تهيئة نظام التقارير المتقدم
let advancedReports;

window.addEventListener('DOMContentLoaded', () => {
    advancedReports = new AdvancedReportsSystem();
    console.log('📊 Advanced Reports System initialized');
});

console.log('📊 Advanced Reports System loaded');
