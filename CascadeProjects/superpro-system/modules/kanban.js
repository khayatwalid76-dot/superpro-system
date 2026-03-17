// ============= نظام لوحة المهام (Kanban Board) =============

class KanbanBoard {
  constructor() {
    this.columns = this.initializeColumns();
    this.tasks = [];
  }

  initializeColumns() {
    return {
      todo: { title: 'قيد الانتظار', color: '#95a5a6', tasks: [] },
      inProgress: { title: 'قيد التنفيذ', color: '#3498db', tasks: [] },
      review: { title: 'تحت المراجعة', color: '#f39c12', tasks: [] },
      done: { title: 'منجز', color: '#27ae60', tasks: [] }
    };
  }

  // إضافة مهمة
  addTask(task) {
    task.id = task.id || Date.now();
    task.createdAt = task.createdAt || new Date().toISOString();
    task.status = task.status || 'todo';

    this.tasks.push(task);
    this.updateColumns();
    this.saveTasks();
    return task;
  }

  // تحديث المهمة
  updateTask(taskId, updates) {
    const task = this.tasks.find(t => t.id === taskId);
    if(!task) return false;

    Object.assign(task, updates);
    this.updateColumns();
    this.saveTasks();
    return true;
  }

  // نقل مهمة بين الأعمدة
  moveTask(taskId, newStatus) {
    const task = this.tasks.find(t => t.id === taskId);
    if(!task) return false;

    const oldStatus = task.status;
    task.status = newStatus;
    task.updatedAt = new Date().toISOString();

    // تسجيل الحركة
    if(!task.history) task.history = [];
    task.history.push({
      from: oldStatus,
      to: newStatus,
      timestamp: task.updatedAt
    });

    this.updateColumns();
    this.saveTasks();
    return true;
  }

  // حذف مهمة
  deleteTask(taskId) {
    const index = this.tasks.findIndex(t => t.id === taskId);
    if(index === -1) return false;

    this.tasks.splice(index, 1);
    this.updateColumns();
    this.saveTasks();
    return true;
  }

  // تحديث الأعمدة
  updateColumns() {
    // إعادة تعيين جميع الأعمدة
    Object.keys(this.columns).forEach(status => {
      this.columns[status].tasks = this.tasks.filter(t => t.status === status);
    });
  }

  // الحصول على مهام الموظف
  getEmployeeTasks(employeeId) {
    return this.tasks.filter(t => t.assignee === employeeId);
  }

  // الحصول على المهام المتأخرة
  getOverdueTasks() {
    const today = new Date();
    return this.tasks.filter(t => {
      if(t.status === 'done') return false;
      return new Date(t.dueDate) < today;
    });
  }

  // الحصول على إحصائيات لوحة المهام
  getStats() {
    return {
      total: this.tasks.length,
      todo: this.columns.todo.tasks.length,
      inProgress: this.columns.inProgress.tasks.length,
      review: this.columns.review.tasks.length,
      done: this.columns.done.tasks.length,
      overdue: this.getOverdueTasks().length,
      completionRate: ((this.columns.done.tasks.length / this.tasks.length) * 100).toFixed(1)
    };
  }

  // حساب الإنتاجية
  calculateProductivity(employeeId, startDate, endDate) {
    const employeeTasks = this.getEmployeeTasks(employeeId);
    const completedTasks = employeeTasks.filter(t => t.status === 'done');

    const tasksInPeriod = completedTasks.filter(t => {
      const completeDate = new Date(t.completedAt);
      return completeDate >= new Date(startDate) && completeDate <= new Date(endDate);
    });

    return {
      employeeId: employeeId,
      period: `${startDate} - ${endDate}`,
      totalTasks: employeeTasks.length,
      completedTasks: completedTasks.length,
      tasksInPeriod: tasksInPeriod.length,
      completionRate: ((completedTasks.length / employeeTasks.length) * 100).toFixed(1),
      averageTimePerTask: this.calculateAverageTime(completedTasks)
    };
  }

  // حساب متوسط الوقت للمهمة
  calculateAverageTime(tasks) {
    if(tasks.length === 0) return 0;

    const totalTime = tasks.reduce((sum, task) => {
      if(task.createdAt && task.completedAt) {
        const start = new Date(task.createdAt);
        const end = new Date(task.completedAt);
        return sum + (end - start);
      }
      return sum;
    }, 0);

    const averageMs = totalTime / tasks.length;
    const averageDays = (averageMs / (1000 * 60 * 60 * 24)).toFixed(1);
    return averageDays;
  }

  // تصدير البيانات
  exportToCSV() {
    let csv = 'ID,الموضوع,الموظف,الحالة,التاريخ المستحق,الأولوية,الإنشاء\n';

    this.tasks.forEach(task => {
      csv += `${task.id},"${task.title}","${task.assignee || 'غير معين'}","${task.status}","${task.dueDate || 'N/A'}","${task.priority || 'عادي'}","${task.createdAt}"\n`;
    });

    return csv;
  }

  // حفظ واسترجاع
  saveTasks() {
    localStorage.setItem('superpro_kanban_tasks', JSON.stringify(this.tasks));
  }

  loadTasks() {
    const stored = localStorage.getItem('superpro_kanban_tasks');
    if(stored) {
      this.tasks = JSON.parse(stored);
      this.updateColumns();
    }
  }
}

// إنشاء instance عام
const kanbanBoard = new KanbanBoard();
kanbanBoard.loadTasks();
console.log('✅ تم تحميل نظام لوحة المهام');
