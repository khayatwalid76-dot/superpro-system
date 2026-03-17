// ============= نظام إدارة الموارد البشرية المتقدم =============

class HRSystem {
  constructor() {
    this.employees = [];
    this.evaluations = [];
    this.trainings = [];
    this.awards = [];
    this.disciplinaryActions = [];
  }

  // ===== تقييمات الأداء =====
  createPerformanceEvaluation(employeeId, evaluationData) {
    const evaluation = {
      id: Date.now(),
      employeeId: employeeId,
      evaluationDate: new Date().toISOString(),
      period: evaluationData.period,
      evaluator: evaluationData.evaluator,
      score: evaluationData.score, // 1-5
      categories: evaluationData.categories || {
        workQuality: 0,
        productivity: 0,
        teamwork: 0,
        communication: 0,
        reliability: 0,
        innovation: 0
      },
      comments: evaluationData.comments,
      recommendations: evaluationData.recommendations,
      goals: evaluationData.goals || []
    };

    this.evaluations.push(evaluation);
    this.saveEvaluations();
    return evaluation;
  }

  // الحصول على تقييمات الموظف
  getEmployeeEvaluations(employeeId) {
    return this.evaluations.filter(e => e.employeeId === employeeId);
  }

  // حساب متوسط التقييم
  getAverageScore(employeeId) {
    const evals = this.getEmployeeEvaluations(employeeId);
    if(evals.length === 0) return 0;

    const totalScore = evals.reduce((sum, e) => sum + e.score, 0);
    return (totalScore / evals.length).toFixed(2);
  }

  // ===== التدريب والتطوير =====
  enrollEmployeeInTraining(employeeId, trainingId) {
    const training = {
      id: Date.now(),
      employeeId: employeeId,
      trainingId: trainingId,
      enrollmentDate: new Date().toISOString(),
      completionDate: null,
      status: 'enrolled', // enrolled, in_progress, completed, cancelled
      score: null,
      certificate: false,
      feedback: ''
    };

    this.trainings.push(training);
    this.saveTrainings();
    return training;
  }

  // تحديث حالة التدريب
  updateTrainingStatus(trainingEnrollmentId, newStatus, data = {}) {
    const training = this.trainings.find(t => t.id === trainingEnrollmentId);
    if(!training) return false;

    training.status = newStatus;

    if(newStatus === 'completed') {
      training.completionDate = new Date().toISOString();
      training.score = data.score || 0;
      training.certificate = data.certificate || false;
    }

    this.saveTrainings();
    return true;
  }

  // الحصول على تاريخ التدريب للموظف
  getEmployeeTrainingHistory(employeeId) {
    return this.trainings.filter(t => t.employeeId === employeeId);
  }

  // ===== المكافآت والعقوبات =====
  awardEmployee(employeeId, awardData) {
    const award = {
      id: Date.now(),
      employeeId: employeeId,
      awardType: awardData.type, // bonus, promotion, recognition, certificate
      title: awardData.title,
      description: awardData.description,
      amount: awardData.amount || 0,
      awardDate: new Date().toISOString(),
      issuedBy: awardData.issuedBy,
      certificate: awardData.certificate || false
    };

    this.awards.push(award);
    this.saveAwards();
    return award;
  }

  // تطبيق إجراء تأديبي
  recordDisciplinaryAction(employeeId, actionData) {
    const action = {
      id: Date.now(),
      employeeId: employeeId,
      actionType: actionData.type, // warning, suspension, termination, demotion
      severity: actionData.severity, // 1-5
      reason: actionData.reason,
      description: actionData.description,
      actionDate: new Date().toISOString(),
      actionTakenBy: actionData.actionTakenBy,
      appealDeadline: actionData.appealDeadline || null,
      appealResult: null
    };

    this.disciplinaryActions.push(action);
    this.saveActions();
    return action;
  }

  // الحصول على السجل التأديبي
  getDisciplinaryRecord(employeeId) {
    return this.disciplinaryActions.filter(a => a.employeeId === employeeId);
  }

  // ===== تقرير الموارد البشرية =====
  generateHRReport(startDate, endDate) {
    const evaluations = this.evaluations.filter(e => {
      const date = new Date(e.evaluationDate);
      return date >= new Date(startDate) && date <= new Date(endDate);
    });

    const trainings = this.trainings.filter(t => {
      const date = new Date(t.enrollmentDate);
      return date >= new Date(startDate) && date <= new Date(endDate);
    });

    const rewards = this.awards.filter(a => {
      const date = new Date(a.awardDate);
      return date >= new Date(startDate) && date <= new Date(endDate);
    });

    return {
      period: `${startDate} - ${endDate}`,
      evaluations: {
        total: evaluations.length,
        average: this.calculateAverageEvaluation(evaluations),
        byScore: this.groupByScore(evaluations)
      },
      training: {
        total: trainings.length,
        completed: trainings.filter(t => t.status === 'completed').length,
        inProgress: trainings.filter(t => t.status === 'in_progress').length,
        employees: new Set(trainings.map(t => t.employeeId)).size
      },
      rewards: {
        total: rewards.length,
        totalAmount: rewards.reduce((sum, a) => sum + a.amount, 0),
        byType: this.groupByAwardType(rewards)
      }
    };
  }

  // ===== مساعدات الحساب =====
  calculateAverageEvaluation(evaluations) {
    if(evaluations.length === 0) return 0;
    const total = evaluations.reduce((sum, e) => sum + e.score, 0);
    return (total / evaluations.length).toFixed(2);
  }

  groupByScore(evaluations) {
    const grouped = {};
    evaluations.forEach(e => {
      if(!grouped[e.score]) grouped[e.score] = 0;
      grouped[e.score]++;
    });
    return grouped;
  }

  groupByAwardType(awards) {
    const grouped = {};
    awards.forEach(a => {
      if(!grouped[a.awardType]) grouped[a.awardType] = 0;
      grouped[a.awardType]++;
    });
    return grouped;
  }

  // ===== نظام الأهداف =====
  setEmployeeGoals(employeeId, goals) {
    const employeeGoals = {
      employeeId: employeeId,
      quarter: `Q${Math.ceil((new Date().getMonth() + 1) / 3)}-${new Date().getFullYear()}`,
      goals: goals, // array of {title, description, target, deadline}
      createdAt: new Date().toISOString(),
      progress: goals.map(g => ({ title: g.title, completion: 0 }))
    };

    localStorage.setItem(`superpro_goals_${employeeId}`, JSON.stringify(employeeGoals));
    return employeeGoals;
  }

  updateGoalProgress(employeeId, goalIndex, progress) {
    const stored = localStorage.getItem(`superpro_goals_${employeeId}`);
    if(!stored) return false;

    const goals = JSON.parse(stored);
    if(goals.progress[goalIndex]) {
      goals.progress[goalIndex].completion = progress;
      goals.progress[goalIndex].updatedAt = new Date().toISOString();

      localStorage.setItem(`superpro_goals_${employeeId}`, JSON.stringify(goals));
      return true;
    }

    return false;
  }

  // حفظ واسترجاع
  saveEvaluations() {
    localStorage.setItem('superpro_evaluations', JSON.stringify(this.evaluations));
  }

  saveTrainings() {
    localStorage.setItem('superpro_trainings', JSON.stringify(this.trainings));
  }

  saveAwards() {
    localStorage.setItem('superpro_awards', JSON.stringify(this.awards));
  }

  saveActions() {
    localStorage.setItem('superpro_disciplinary', JSON.stringify(this.disciplinaryActions));
  }

  load() {
    const evals = localStorage.getItem('superpro_evaluations');
    const trainings = localStorage.getItem('superpro_trainings');
    const awards = localStorage.getItem('superpro_awards');
    const actions = localStorage.getItem('superpro_disciplinary');

    if(evals) this.evaluations = JSON.parse(evals);
    if(trainings) this.trainings = JSON.parse(trainings);
    if(awards) this.awards = JSON.parse(awards);
    if(actions) this.disciplinaryActions = JSON.parse(actions);
  }
}

// إنشاء instance عام
const hrSystem = new HRSystem();
hrSystem.load();
console.log('✅ تم تحميل نظام إدارة الموارد البشرية');
