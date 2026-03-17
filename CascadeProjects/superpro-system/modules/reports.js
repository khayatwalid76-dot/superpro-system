// ============= نظام التقارير والرسوم البيانية =============

class ReportSystem {
  constructor() {
    this.reports = [];
    this.charts = {};
  }

  // تقرير الأرباح والخسائر
  generateProfitLossReport(startDate, endDate) {
    const income = this.getIncomeInRange(startDate, endDate);
    const expenses = this.getExpensesInRange(startDate, endDate);
    const profit = income - expenses;

    return {
      period: `${startDate} - ${endDate}`,
      totalIncome: income,
      totalExpenses: expenses,
      netProfit: profit,
      profitMargin: ((profit / income) * 100).toFixed(2) + '%',
      timestamp: new Date().toISOString()
    };
  }

  // تقرير أداء الموظفين
  generateEmployeePerformanceReport(employees, attendance) {
    return employees.map(emp => {
      const empAttendance = attendance.filter(a => a.empId === emp.id);
      const presentDays = empAttendance.filter(a => a.status === 'حاضر').length;
      const absentDays = empAttendance.filter(a => a.status === 'غياب').length;
      const attendanceRate = ((presentDays / (presentDays + absentDays)) * 100).toFixed(2);

      return {
        employeeId: emp.id,
        employeeName: emp.name,
        job: emp.job,
        totalDaysWorked: presentDays,
        absentDays: absentDays,
        attendanceRate: attendanceRate + '%',
        salary: emp.salary,
        monthlyPerformanceScore: Math.random() * 100
      };
    });
  }

  // تقرير العملاء والعقود
  generateClientContractsReport(clients, contracts) {
    return clients.map(client => {
      const clientContracts = contracts.filter(c => c.clientId === client.id);
      const activeContracts = clientContracts.filter(c => c.status === 'نشط').length;
      const totalValue = clientContracts.reduce((sum, c) => sum + c.amount, 0);

      return {
        clientId: client.id,
        clientName: client.name,
        phone: client.phone,
        area: client.area,
        totalContracts: clientContracts.length,
        activeContracts: activeContracts,
        contractValue: totalValue,
        lastContractDate: clientContracts[clientContracts.length - 1]?.date || 'لا يوجد'
      };
    });
  }

  // مساعدات البحث
  getIncomeInRange(startDate, endDate) {
    // نسخة مبسطة - في الإنتاج استخدم قاعدة البيانات الحقيقية
    return 50000;
  }

  getExpensesInRange(startDate, endDate) {
    return 25000;
  }

  // تصدير التقرير
  exportReport(report, format = 'pdf') {
    console.log(`💾 تصدير التقرير بصيغة ${format}`);
    const reportStr = JSON.stringify(report, null, 2);
    
    if(format === 'json') {
      const blob = new Blob([reportStr], { type: 'application/json' });
      this.downloadFile(blob, 'report.json');
    } else if(format === 'csv') {
      const csv = this.jsonToCSV(report);
      const blob = new Blob([csv], { type: 'text/csv' });
      this.downloadFile(blob, 'report.csv');
    }
  }

  downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  jsonToCSV(obj) {
    // تحويل بسيط JSON إلى CSV
    if(Array.isArray(obj)) {
      const headers = Object.keys(obj[0]);
      const rows = obj.map(item => headers.map(h => item[h]).join(','));
      return headers.join(',') + '\n' + rows.join('\n');
    }
    return '';
  }
}

// إنشاء instance عام
const reportSystem = new ReportSystem();
console.log('✅ تم تحميل نظام التقارير');
