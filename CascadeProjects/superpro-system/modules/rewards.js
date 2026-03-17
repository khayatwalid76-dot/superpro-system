// ============= نظام المكافآت والحوافز =============

class RewardsAndIncentives {
  constructor() {
    this.employees = [];
    this.rewards = [];
    this.pointsSystem = {};
    this.leaderboard = [];
    this.challenges = [];
    this.bonuses = [];
  }

  // ===== نظام النقاط =====
  initializePointsSystem(config = {}) {
    this.pointsSystem = {
      pointsPerTask: config.pointsPerTask || 10,
      pointsPerSale: config.pointsPerSale || 50,
      pointsPerAttendance: config.pointsPerAttendance || 5,
      pointsPerLateArrival: config.pointsPerLateArrival || -10,
      pointsPerAbsence: config.pointsPerAbsence || -25,
      redeemPointsPerBonus: config.redeemPointsPerBonus || 100,
      levels: config.levels || this.getDefaultLevels()
    };

    return this.pointsSystem;
  }

  getDefaultLevels() {
    return [
      { level: 1, name: 'Bronze', minPoints: 0, color: '#CD7F32' },
      { level: 2, name: 'Silver', minPoints: 500, color: '#C0C0C0' },
      { level: 3, name: 'Gold', minPoints: 1000, color: '#FFD700' },
      { level: 4, name: 'Platinum', minPoints: 2000, color: '#E5E4E2' }
    ];
  }

  awardPoints(employeeId, points, reason) {
    const employee = this.employees.find(e => e.id === employeeId);
    if(!employee) {
      this.employees.push({
        id: employeeId,
        name: 'Employee ' + employeeId,
        totalPoints: points,
        pointsHistory: []
      });
    } else {
      const emp = this.employees.find(e => e.id === employeeId);
      emp.totalPoints += points;
    }

    this.recordPointsTransaction(employeeId, points, reason);
    this.updateLeaderboard();

    console.log(`⭐ تم منح ${points} نقطة إلى الموظف ${employeeId}: ${reason}`);

    return { status: 'success', points: points, reason: reason };
  }

  recordPointsTransaction(employeeId, points, reason) {
    const employee = this.employees.find(e => e.id === employeeId);
    if(employee) {
      employee.pointsHistory.push({
        date: new Date().toISOString(),
        points: points,
        reason: reason,
        balance: employee.totalPoints
      });
    }
  }

  getEmployeeLevel(employeeId) {
    const employee = this.employees.find(e => e.id === employeeId);
    if(!employee) return null;

    const levels = this.pointsSystem.levels || this.getDefaultLevels();
    const level = levels
      .filter(l => l.minPoints <= employee.totalPoints)
      .sort((a, b) => b.minPoints - a.minPoints)[0];

    return level;
  }

  redeemPoints(employeeId, pointsToRedeem) {
    const employee = this.employees.find(e => e.id === employeeId);
    if(!employee) return { error: 'الموظف غير موجود' };

    if(employee.totalPoints < pointsToRedeem) {
      return { error: 'نقاط غير كافية' };
    }

    employee.totalPoints -= pointsToRedeem;
    this.recordPointsTransaction(employeeId, -pointsToRedeem, `استرجاع نقاط - مكافأة`);

    const rewardValue = pointsToRedeem / this.pointsSystem.redeemPointsPerBonus;

    return {
      status: 'success',
      pointsRedeemed: pointsToRedeem,
      rewardValue: rewardValue,
      remainingPoints: employee.totalPoints
    };
  }

  // ===== المكافآت والجوائز =====
  createReward(rewardData) {
    const reward = {
      id: Date.now(),
      name: rewardData.name,
      description: rewardData.description || '',
      type: rewardData.type, // cash, voucher, certificate, promotion
      value: rewardData.value,
      pointsRequired: rewardData.pointsRequired,
      category: rewardData.category || 'performance',
      active: true,
      createdAt: new Date().toISOString(),
      recipients: []
    };

    this.rewards.push(reward);
    console.log(`🎁 تم إنشاء مكافأة: ${reward.name}`);

    return reward;
  }

  awardRewardToEmployee(employeeId, rewardId) {
    const reward = this.rewards.find(r => r.id === rewardId);
    if(!reward) return { error: 'المكافأة غير موجودة' };

    const employee = this.employees.find(e => e.id === employeeId);
    if(!employee) return { error: 'الموظف غير موجود' };

    if(employee.totalPoints < reward.pointsRequired) {
      return { error: 'نقاط غير كافية للحصول على هذه المكافأة' };
    }

    // خصم النقاط
    this.awardPoints(employeeId, -reward.pointsRequired, `الحصول على مكافأة: ${reward.name}`);

    // تسجيل المكافأة
    reward.recipients.push({
      employeeId: employeeId,
      awardedAt: new Date().toISOString(),
      status: 'claimed'
    });

    return { status: 'success', reward: reward };
  }

  // ===== الحوافز =====
  createIncentiveProgram(programData) {
    const program = {
      id: Date.now(),
      name: programData.name,
      description: programData.description || '',
      type: programData.type, // sales, attendance, performance, quality
      target: programData.target, // numeric target
      unit: programData.unit, // units, %, amount
      rewardPerUnit: programData.rewardPerUnit,
      startDate: programData.startDate,
      endDate: programData.endDate,
      status: 'active',
      participants: [],
      createdAt: new Date().toISOString()
    };

    this.challenges.push(program);
    console.log(`🎯 تم إنشاء برنامج حوافز: ${program.name}`);

    return program;
  }

  participateInProgram(programId, employeeId) {
    const program = this.challenges.find(c => c.id === programId);
    if(!program) return { error: 'البرنامج غير موجود' };

    if(!program.participants.some(p => p.employeeId === employeeId)) {
      program.participants.push({
        employeeId: employeeId,
        progress: 0,
        reward: 0,
        joinedAt: new Date().toISOString()
      });
    }

    return { status: 'success', program: program };
  }

  updateProgramProgress(programId, employeeId, progress) {
    const program = this.challenges.find(c => c.id === programId);
    if(!program) return { error: 'البرنامج غير موجود' };

    const participant = program.participants.find(p => p.employeeId === employeeId);
    if(!participant) return { error: 'الموظف ليس في البرنامج' };

    participant.progress = progress;

    // حساب المكافأة
    if(progress >= program.target) {
      const reward = program.target * program.rewardPerUnit;
      participant.reward = reward;
      this.awardPoints(employeeId, Math.round(reward * 10), `إكمالي برنامج: ${program.name}`);
    }

    return { status: 'success', participant: participant };
  }

  // ===== المكافآت الإضافية =====
  createBonus(bonusData) {
    const bonus = {
      id: Date.now(),
      name: bonusData.name,
      description: bonusData.description || '',
      type: bonusData.type, // performance, attendance, sales, holiday, special
      amount: bonusData.amount,
      percentage: bonusData.percentage || 0,
      applicableTo: bonusData.applicableTo || 'all', // all, department, specific
      department: bonusData.department || null,
      employees: bonusData.employees || [],
      startDate: bonusData.startDate,
      endDate: bonusData.endDate,
      criteria: bonusData.criteria || {},
      status: 'planned', // planned, active, completed
      createdAt: new Date().toISOString()
    };

    this.bonuses.push(bonus);
    console.log(`💰 تم إنشاء مكافأة إضافية: ${bonus.name}`);

    return bonus;
  }

  calculateBonusForEmployee(employeeId, bonusId) {
    const bonus = this.bonuses.find(b => b.id === bonusId);
    if(!bonus) return { error: 'المكافأة الإضافية غير موجودة' };

    // تحقق من معايير المكافأة
    let bonusAmount = 0;

    if(bonus.applicableTo === 'all' || 
       (bonus.applicableTo === 'specific' && bonus.employees.includes(employeeId))) {
      bonusAmount = bonus.amount;
      if(bonus.percentage) {
        // احسب النسبة من الراتب الأساسي
        bonusAmount += 5000 * (bonus.percentage / 100); // 5000 هو راتب افتراضي
      }
    }

    return { status: 'success', bonusAmount: bonusAmount };
  }

  // ===== لوحة المتصدرين =====
  updateLeaderboard() {
    this.leaderboard = this.employees
      .map(emp => ({
        rank: 0,
        employeeId: emp.id,
        name: emp.name,
        points: emp.totalPoints,
        level: this.getEmployeeLevel(emp.id)
      }))
      .sort((a, b) => b.points - a.points)
      .map((item, index) => {
        item.rank = index + 1;
        return item;
      });

    return this.leaderboard;
  }

  getLeaderboard(limit = 10) {
    return this.leaderboard.slice(0, limit);
  }

  getEmployeeRank(employeeId) {
    return this.leaderboard.find(item => item.employeeId === employeeId);
  }

  // ===== التقارير والإحصائيات =====
  getRewardsReport(startDate, endDate) {
    const report = {
      period: { startDate, endDate },
      totalRewardsAwarded: 0,
      totalRewardsValue: 0,
      rewardsByType: {},
      topRewardees: [],
      totalParticipants: 0
    };

    this.rewards.forEach(reward => {
      const recipients = reward.recipients.filter(r => {
        const date = new Date(r.awardedAt);
        return date >= new Date(startDate) && date <= new Date(endDate);
      });

      report.totalRewardsAwarded += recipients.length;
      report.totalRewardsValue += recipients.length * reward.value;

      if(!report.rewardsByType[reward.type]) report.rewardsByType[reward.type] = 0;
      report.rewardsByType[reward.type] += recipients.length;
    });

    // أفضل الموظفين حصولاً على مكافآت
    report.topRewardees = this.leaderboard.slice(0, 5);
    report.totalParticipants = this.employees.length;

    return report;
  }

  // ===== الحفظ والتحميل =====
  saveRewards() {
    localStorage.setItem('superpro_employees', JSON.stringify(this.employees));
    localStorage.setItem('superpro_rewards', JSON.stringify(this.rewards));
    localStorage.setItem('superpro_points_system', JSON.stringify(this.pointsSystem));
    localStorage.setItem('superpro_challenges', JSON.stringify(this.challenges));
    localStorage.setItem('superpro_bonuses', JSON.stringify(this.bonuses));
  }

  loadRewards() {
    const employees = localStorage.getItem('superpro_employees');
    const rewards = localStorage.getItem('superpro_rewards');
    const pointsSystem = localStorage.getItem('superpro_points_system');
    const challenges = localStorage.getItem('superpro_challenges');
    const bonuses = localStorage.getItem('superpro_bonuses');

    if(employees) this.employees = JSON.parse(employees);
    if(rewards) this.rewards = JSON.parse(rewards);
    if(pointsSystem) this.pointsSystem = JSON.parse(pointsSystem);
    if(challenges) this.challenges = JSON.parse(challenges);
    if(bonuses) this.bonuses = JSON.parse(bonuses);
  }
}

// إنشاء instance عام
const rewardsAndIncentives = new RewardsAndIncentives();
rewardsAndIncentives.initializePointsSystem();
rewardsAndIncentives.loadRewards();
console.log('✅ تم تحميل نظام المكافآت والحوافز');
