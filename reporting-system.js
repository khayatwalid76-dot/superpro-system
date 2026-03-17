// ============================================
// ADVANCED REPORTING SYSTEM
// SuperPro System v2 Business Intelligence
// ============================================

const reportManager = {
  reports: {},
  
  // Financial Reports
  async generateFinancialReport(startDate, endDate) {
    try {
      const db = getDatabase();
      
      // Get income and expenses
      const incomeRef = ref(db, 'income');
      const expenseRef = ref(db, 'expenses');
      
      const incomeSnapshot = await get(incomeRef);
      const expenseSnapshot = await get(expenseRef);
      
      const income = incomeSnapshot.exists() ? Object.values(incomeSnapshot.val()) : [];
      const expenses = expenseSnapshot.exists() ? Object.values(expenseSnapshot.val()) : [];
      
      // Filter by date range
      const filteredIncome = income.filter(i => 
        i.date >= startDate && i.date <= endDate
      );
      
      const filteredExpenses = expenses.filter(e => 
        e.date >= startDate && e.date <= endDate
      );
      
      // Calculate totals
      const totalIncome = filteredIncome.reduce((sum, i) => sum + (i.amount || 0), 0);
      const totalExpenses = filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
      const netProfit = totalIncome - totalExpenses;
      
      // Group by type/category
      const incomeByType = {};
      const expensesByCategory = {};
      
      filteredIncome.forEach(i => {
        const type = i.type || '╪╣╪د┘à';
        incomeByType[type] = (incomeByType[type] || 0) + i.amount;
      });
      
      filteredExpenses.forEach(e => {
        const cat = e.category || '╪╣╪د┘à';
        expensesByCategory[cat] = (expensesByCategory[cat] || 0) + e.amount;
      });
      
      return {
        period: `${startDate} ╪ح┘┘ë ${endDate}`,
        totalIncome,
        totalExpenses,
        netProfit,
        profitMargin: totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(2) : 0,
        transactionCount: filteredIncome.length + filteredExpenses.length,
        incomeByType,
        expensesByCategory,
        incomeDetails: filteredIncome,
        expenseDetails: filteredExpenses,
        generatedAt: new Date().toISOString()
      };
    } catch(error) {
      console.error('Financial report error:', error);
      showToast('╪«╪╖╪ث ┘┘è ╪ح┘╪┤╪د╪ة ╪د┘╪ز┘é╪▒┘è╪▒ ╪د┘┘à╪د┘┘è', 'error');
      return null;
    }
  },
  
  // HR & Payroll Reports
  async generatePayrollReport(month) {
    try {
      const db = getDatabase();
      
      const employeeRef = ref(db, 'employees');
      const payrollRef = ref(db, 'payroll');
      
      const empSnapshot = await get(employeeRef);
      const paySnapshot = await get(payrollRef);
      
      const employees = empSnapshot.exists() ? Object.values(empSnapshot.val()) : [];
      const payrolls = paySnapshot.exists() ? Object.values(paySnapshot.val()) : [];
      
      // Filter payroll for selected month
      const monthPayrolls = payrolls.filter(p => p.month === month);
      
      // Calculate totals
      const totalBaseSalary = monthPayrolls.reduce((sum, p) => sum + (p.basicSalary || 0), 0);
      const totalDeductions = monthPayrolls.reduce((sum, p) => sum + (p.deductions || 0), 0);
      const totalNetSalary = monthPayrolls.reduce((sum, p) => sum + (p.netSalary || 0), 0);
      
      // Employee breakdown
      const payrollDetails = monthPayrolls.map(p => {
        const emp = employees.find(e => e.id === p.employeeId);
        return {
          employeeId: p.employeeId,
          employeeName: emp ? emp.name : 'Unknown',
          job: emp ? emp.job : '-',
          basicSalary: p.basicSalary,
          deductions: p.deductions,
          netSalary: p.netSalary,
          status: emp ? emp.status : 'inactive'
        };
      });
      
      return {
        month,
        totalEmployees: payrollDetails.length,
        totalBaseSalary,
        totalDeductions,
        totalNetSalary,
        averageSalary: payrollDetails.length > 0 ? (totalNetSalary / payrollDetails.length).toFixed(2) : 0,
        payrollDetails,
        generatedAt: new Date().toISOString()
      };
    } catch(error) {
      console.error('Payroll report error:', error);
      showToast('╪«╪╖╪ث ┘┘è ╪ح┘╪┤╪د╪ة ╪ز┘é╪▒┘è╪▒ ╪د┘╪▒┘ê╪د╪ز╪ذ', 'error');
      return null;
    }
  },
  
  // Attendance Report
  async generateAttendanceReport(startDate, endDate) {
    try {
      const db = getDatabase();
      
      const attRef = ref(db, 'attendance');
      const empRef = ref(db, 'employees');
      
      const attSnapshot = await get(attRef);
      const empSnapshot = await get(empRef);
      
      const attendance = attSnapshot.exists() ? Object.values(attSnapshot.val()) : [];
      const employees = empSnapshot.exists() ? Object.values(empSnapshot.val()) : [];
      
      // Filter by date
      const filtered = attendance.filter(a => a.date >= startDate && a.date <= endDate);
      
      // Group by employee
      const byEmployee = {};
      filtered.forEach(a => {
        if(!byEmployee[a.empId]) {
          byEmployee[a.empId] = { present: 0, absent: 0, total: 0 };
        }
        byEmployee[a.empId].total++;
        if(a.status === '╪ص╪د╪╢╪▒') {
          byEmployee[a.empId].present++;
        } else {
          byEmployee[a.empId].absent++;
        }
      });
      
      // Create report
      const attendanceDetails = employees.map(emp => {
        const stats = byEmployee[emp.id] || { present: 0, absent: 0, total: 0 };
        return {
          employeeId: emp.id,
          employeeName: emp.name,
          present: stats.present,
          absent: stats.absent,
          total: stats.total,
          attendanceRate: stats.total > 0 ? ((stats.present / stats.total) * 100).toFixed(2) : 0
        };
      });
      
      const totalPresent = attendanceDetails.reduce((sum, a) => sum + a.present, 0);
      const totalAbsent = attendanceDetails.reduce((sum, a) => sum + a.absent, 0);
      
      return {
        period: `${startDate} ╪ح┘┘ë ${endDate}`,
        totalEmployees: employees.length,
        totalPresent,
        totalAbsent,
        overallAttendanceRate: (totalPresent + totalAbsent) > 0 ? 
          ((totalPresent / (totalPresent + totalAbsent)) * 100).toFixed(2) : 0,
        attendanceDetails,
        generatedAt: new Date().toISOString()
      };
    } catch(error) {
      console.error('Attendance report error:', error);
      showToast('╪«╪╖╪ث ┘┘è ╪ح┘╪┤╪د╪ة ╪ز┘é╪▒┘è╪▒ ╪د┘╪ص╪╢┘ê╪▒', 'error');
      return null;
    }
  },
  
  // Client Report
  async generateClientReport() {
    try {
      const db = getDatabase();
      
      const clientRef = ref(db, 'clients');
      const contractRef = ref(db, 'contracts');
      
      const clientSnapshot = await get(clientRef);
      const contractSnapshot = await get(contractRef);
      
      const clients = clientSnapshot.exists() ? Object.values(clientSnapshot.val()) : [];
      const contracts = contractSnapshot.exists() ? Object.values(contractSnapshot.val()) : [];
      
      // Analyze contracts by client
      const clientData = clients.map(client => {
        const clientContracts = contracts.filter(c => c.clientId === client.id);
        const totalContractValue = clientContracts.reduce((sum, c) => sum + (c.amount || 0), 0);
        
        return {
          clientId: client.id,
          clientName: client.name,
          phone: client.phone,
          area: client.area,
          contractCount: clientContracts.length,
          totalContractValue,
          activeContracts: clientContracts.filter(c => c.status === '┘╪┤╪╖').length
        };
      });
      
      // Sort by contract value
      clientData.sort((a, b) => b.totalContractValue - a.totalContractValue);
      
      return {
        totalClients: clients.length,
        totalContracts: contracts.length,
        totalContractValue: contracts.reduce((sum, c) => sum + (c.amount || 0), 0),
        averageContractValue: contracts.length > 0 ? 
          (contracts.reduce((sum, c) => sum + (c.amount || 0), 0) / contracts.length).toFixed(2) : 0,
        topClients: clientData.slice(0, 10),
        allClients: clientData,
        generatedAt: new Date().toISOString()
      };
    } catch(error) {
      console.error('Client report error:', error);
      showToast('╪«╪╖╪ث ┘┘è ╪ح┘╪┤╪د╪ة ╪ز┘é╪▒┘è╪▒ ╪د┘╪╣┘à┘╪د╪ة', 'error');
      return null;
    }
  },
  
  // Performance Dashboard
  async generateDashboardMetrics() {
    try {
      const db = getDatabase();
      
      // Get all data
      const empRef = ref(db, 'employees');
      const clientRef = ref(db, 'clients');
      const contractRef = ref(db, 'contracts');
      const incomeRef = ref(db, 'income');
      const expenseRef = ref(db, 'expenses');
      const attRef = ref(db, 'attendance');
      
      const empSnapshot = await get(empRef);
      const clientSnapshot = await get(clientRef);
      const contractSnapshot = await get(contractRef);
      const incomeSnapshot = await get(incomeRef);
      const expenseSnapshot = await get(expenseRef);
      const attSnapshot = await get(attRef);
      
      const employees = empSnapshot.exists() ? Object.values(empSnapshot.val()) : [];
      const clients = clientSnapshot.exists() ? Object.values(clientSnapshot.val()) : [];
      const contracts = contractSnapshot.exists() ? Object.values(contractSnapshot.val()) : [];
      const income = incomeSnapshot.exists() ? Object.values(incomeSnapshot.val()) : [];
      const expenses = expenseSnapshot.exists() ? Object.values(expenseSnapshot.val()) : [];
      const attendance = attSnapshot.exists() ? Object.values(attSnapshot.val()) : [];
      
      // Calculate metrics
      const totalIncome = income.reduce((sum, i) => sum + (i.amount || 0), 0);
      const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
      const netProfit = totalIncome - totalExpenses;
      
      // Today's attendance
      const today = new Date().toISOString().split('T')[0];
      const todayAttendance = attendance.filter(a => a.date === today);
      const presentToday = todayAttendance.filter(a => a.status === '╪ص╪د╪╢╪▒').length;
      
      return {
        summary: {
          totalEmployees: employees.length,
          activeEmployees: employees.filter(e => e.status === '┘╪┤╪╖').length,
          totalClients: clients.length,
          totalContracts: contracts.length,
          activeContracts: contracts.filter(c => c.status === '┘╪┤╪╖').length
        },
        financial: {
          totalIncome,
          totalExpenses,
          netProfit,
          profitMargin: totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(2) : 0
        },
        attendance: {
          presentToday,
          absentToday: attendance.filter(a => a.date === today && a.status === '╪║┘è╪د╪ذ').length,
          notReportedToday: employees.length - todayAttendance.length
        },
        generatedAt: new Date().toISOString()
      };
    } catch(error) {
      console.error('Dashboard metrics error:', error);
      return null;
    }
  }
};

// ============= EXPORT FUNCTIONS =============
function exportReportToExcel(reportData, filename) {
  try {
    const ws = XLSX.utils.json_to_sheet(reportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    XLSX.writeFile(wb, `${filename}-${new Date().toISOString().split('T')[0]}.xlsx`);
    showToast('ظ£à ╪ز┘à ╪ز╪╡╪»┘è╪▒ ╪د┘╪ز┘é╪▒┘è╪▒ ╪ذ┘╪ش╪د╪ص', 'success');
  } catch(error) {
    console.error('Export error:', error);
    showToast('╪«╪╖╪ث ┘┘è ╪ز╪╡╪»┘è╪▒ ╪د┘╪ز┘é╪▒┘è╪▒', 'error');
  }
}

function exportReportToPDF(reportData, title) {
  try {
    const docContent = JSON.stringify(reportData, null, 2);
    const blob = new Blob([docContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    showToast('ظ£à ╪ز┘à ╪ز╪╡╪»┘è╪▒ ╪د┘╪ز┘é╪▒┘è╪▒ ╪ذ┘╪ش╪د╪ص', 'success');
  } catch(error) {
    console.error('Export error:', error);
    showToast('╪«╪╖╪ث ┘┘è ╪ز╪╡╪»┘è╪▒ ╪د┘╪ز┘é╪▒┘è╪▒', 'error');
  }
}

function printReport(reportData, title) {
  const printWindow = window.open('', '', 'width=900,height=800');
  printWindow.document.write('<html><head><title>' + title + '</title>');
  printWindow.document.write('<style>body{font-family:Arial;direction:rtl}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px;text-align:right}</style>');
  printWindow.document.write('</head><body>');
  printWindow.document.write('<h1>' + title + '</h1>');
  printWindow.document.write('<pre>' + JSON.stringify(reportData, null, 2) + '</pre>');
  printWindow.document.write('</body></html>');
  printWindow.document.close();
  printWindow.print();
}

// ============= EMAIL REPORTS =============
async function emailReport(email, reportData, reportTitle) {
  // This would call a backend service
  try {
    // Placeholder for email service
    showToast('╪│┘è╪ز┘à ╪ح╪▒╪│╪د┘ ╪د┘╪ز┘é╪▒┘è╪▒ ╪ح┘┘ë ╪ذ╪▒┘è╪»┘â ┘é╪▒┘è╪ذ╪د┘ï', 'info');
    return true;
  } catch(error) {
    console.error('Email report error:', error);
    return false;
  }
}

// ============= SCHEDULE REPORTS =============
const reportScheduler = {
  schedules: {},
  
  async scheduleDaily(reportType, time = '09:00') {
    // Schedule daily report
    this.schedules[reportType] = {
      frequency: 'daily',
      time,
      lastRun: null,
      nextRun: this.calculateNextRun(time)
    };
  },
  
  async scheduleWeekly(reportType, dayOfWeek = 'Sunday', time = '09:00') {
    this.schedules[reportType] = {
      frequency: 'weekly',
      dayOfWeek,
      time,
      lastRun: null,
      nextRun: this.calculateNextRun(time)
    };
  },
  
  async scheduleMonthly(reportType, dayOfMonth = 1, time = '09:00') {
    this.schedules[reportType] = {
      frequency: 'monthly',
      dayOfMonth,
      time,
      lastRun: null,
      nextRun: this.calculateNextRun(time)
    };
  },
  
  calculateNextRun(time) {
    const [hours, minutes] = time.split(':');
    const next = new Date();
    next.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    if(next < new Date()) {
      next.setDate(next.getDate() + 1);
    }
    return next;
  }
};

// ============= EXPORT FOR USE =============
window.reportManager = reportManager;
window.reportScheduler = reportScheduler;
window.exportReportToExcel = exportReportToExcel;
window.exportReportToPDF = exportReportToPDF;
window.printReport = printReport;
window.emailReport = emailReport;

console.log('ظ£à Advanced Reporting System Loaded');
