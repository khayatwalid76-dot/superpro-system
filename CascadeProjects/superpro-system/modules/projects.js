// ============= نظام إدارة المشاريع والعمليات =============

class ProjectManagement {
  constructor() {
    this.projects = [];
    this.processes = [];
    this.templates = [];
    this.milestones = [];
    this.risks = [];
  }

  // ===== المشاريع =====
  createProject(projectData) {
    const project = {
      id: Date.now(),
      name: projectData.name,
      description: projectData.description || '',
      owner: projectData.owner || 'currentUser',
      team: projectData.team || [],
      startDate: projectData.startDate,
      endDate: projectData.endDate,
      budget: projectData.budget || 0,
      status: 'planning', // planning, active, paused, completed, cancelled
      progress: 0,
      priority: projectData.priority || 'medium', // low, medium, high, critical
      tasks: [],
      phases: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.projects.push(project);
    console.log(`📦 تم إنشاء مشروع: ${project.name}`);

    return project;
  }

  updateProjectStatus(projectId, newStatus) {
    const project = this.projects.find(p => p.id === projectId);
    if(!project) return { error: 'المشروع غير موجود' };

    project.status = newStatus;
    project.updatedAt = new Date().toISOString();

    return { status: 'success', project: project };
  }

  updateProjectProgress(projectId, progress) {
    const project = this.projects.find(p => p.id === projectId);
    if(!project) return { error: 'المشروع غير موجود' };

    project.progress = Math.min(100, Math.max(0, progress));
    project.updatedAt = new Date().toISOString();

    if(progress === 100) {
      project.status = 'completed';
    }

    return { status: 'success', progress: project.progress };
  }

  // ===== مراحل المشروع =====
  addPhase(projectId, phase) {
    const project = this.projects.find(p => p.id === projectId);
    if(!project) return { error: 'المشروع غير موجود' };

    const projectPhase = {
      id: Date.now(),
      name: phase.name,
      description: phase.description || '',
      startDate: phase.startDate,
      endDate: phase.endDate,
      status: 'pending',
      progress: 0,
      order: project.phases.length + 1,
      deliverables: []
    };

    project.phases.push(projectPhase);
    return projectPhase;
  }

  // ===== المهام =====
  addTaskToProject(projectId, task) {
    const project = this.projects.find(p => p.id === projectId);
    if(!project) return { error: 'المشروع غير موجود' };

    const projectTask = {
      id: Date.now(),
      title: task.title,
      description: task.description || '',
      assignedTo: task.assignedTo,
      priority: task.priority || 'medium',
      status: 'open',
      startDate: task.startDate,
      dueDate: task.dueDate,
      estimatedHours: task.estimatedHours || 0,
      actualHours: 0,
      progress: 0,
      dependencies: task.dependencies || [],
      subtasks: [],
      comments: []
    };

    project.tasks.push(projectTask);
    return projectTask;
  }

  updateTaskStatus(projectId, taskId, newStatus) {
    const project = this.projects.find(p => p.id === projectId);
    if(!project) return { error: 'المشروع غير موجود' };

    const task = project.tasks.find(t => t.id === taskId);
    if(!task) return { error: 'المهمة غير موجودة' };

    task.status = newStatus;

    if(newStatus === 'completed') {
      task.progress = 100;
    }

    return { status: 'success', task: task };
  }

  estimateProjectCompletion(projectId) {
    const project = this.projects.find(p => p.id === projectId);
    if(!project) return { error: 'المشروع غير موجود' };

    const incompleteTasks = project.tasks.filter(t => t.status !== 'completed');
    const completedTasks = project.tasks.filter(t => t.status === 'completed');

    const totalEstimated = project.tasks.reduce((sum, t) => sum + t.estimatedHours, 0);
    const completedEstimated = completedTasks.reduce((sum, t) => sum + t.estimatedHours, 0);
    const remainingEstimated = incompleteTasks.reduce((sum, t) => sum + t.estimatedHours, 0);

    return {
      totalEstimatedHours: totalEstimated,
      completedHours: completedEstimated,
      remainingHours: remainingEstimated,
      percentageComplete: (completedEstimated / totalEstimated) * 100,
      estimatedCompletionDate: this.calculateEstimationDate(remainingEstimated)
    };
  }

  calculateEstimationDate(remainingHours) {
    // افترض 8 ساعات عمل يومية
    const daysNeeded = Math.ceil(remainingHours / 8);
    const date = new Date();
    date.setDate(date.getDate() + daysNeeded);
    return date.toISOString().split('T')[0];
  }

  // ===== الأهداف (Milestones) =====
  addMilestone(projectId, milestone) {
    const project = this.projects.find(p => p.id === projectId);
    if(!project) return { error: 'المشروع غير موجود' };

    const m = {
      id: Date.now(),
      name: milestone.name,
      description: milestone.description || '',
      dueDate: milestone.dueDate,
      status: 'pending',
      completed: false,
      completedDate: null,
      deliverables: milestone.deliverables || []
    };

    this.milestones.push(m);
    return m;
  }

  // ===== إدارة المخاطر =====
  addRisk(projectId, risk) {
    const r = {
      id: Date.now(),
      projectId: projectId,
      description: risk.description,
      probability: risk.probability || 'medium', // low, medium, high
      impact: risk.impact || 'medium', // low, medium, high
      riskLevel: this.calculateRiskLevel(risk.probability, risk.impact),
      mitigation: risk.mitigation || '',
      owner: risk.owner || '',
      status: 'identified',
      createdAt: new Date().toISOString()
    };

    this.risks.push(r);
    return r;
  }

  calculateRiskLevel(probability, impact) {
    const scale = { 'low': 1, 'medium': 2, 'high': 3 };
    const score = scale[probability] * scale[impact];

    if(score >= 6) return 'critical';
    if(score >= 4) return 'high';
    if(score >= 2) return 'medium';
    return 'low';
  }

  // ===== قوالب المشاريع =====
  createProjectTemplate(templateData) {
    const template = {
      id: Date.now(),
      name: templateData.name,
      description: templateData.description || '',
      industry: templateData.industry || '',
      phases: templateData.phases || [],
      tasks: templateData.tasks || [],
      estimatedDuration: templateData.estimatedDuration || 0,
      budget: templateData.budget || 0,
      createdAt: new Date().toISOString(),
      usageCount: 0
    };

    this.templates.push(template);
    return template;
  }

  createProjectFromTemplate(templateId, projectName) {
    const template = this.templates.find(t => t.id === templateId);
    if(!template) return { error: 'القالب غير موجود' };

    const project = this.createProject({
      name: projectName,
      description: template.description,
      budget: template.budget,
      endDate: new Date(Date.now() + template.estimatedDuration * 24 * 60 * 60 * 1000).toISOString()
    });

    // نسخ المراحل والمهام
    template.phases.forEach(phase => {
      this.addPhase(project.id, phase);
    });

    template.tasks.forEach(task => {
      this.addTaskToProject(project.id, task);
    });

    template.usageCount++;

    return project;
  }

  // ===== العمليات =====
  createProcess(processData) {
    const process = {
      id: Date.now(),
      name: processData.name,
      description: processData.description || '',
      steps: processData.steps || [],
      owner: processData.owner || '',
      status: 'active',
      instances: [],
      metrics: { totalExecutions: 0, successfulExecutions: 0, failedExecutions: 0 },
      createdAt: new Date().toISOString()
    };

    this.processes.push(process);
    return process;
  }

  executeProcess(processId, data) {
    const process = this.processes.find(p => p.id === processId);
    if(!process) return { error: 'العملية غير موجودة' };

    const instance = {
      id: Date.now(),
      processId: processId,
      data: data,
      status: 'running',
      startTime: new Date().toISOString(),
      endTime: null,
      result: null,
      steps: process.steps.map(s => ({
        ...s,
        status: 'pending'
      }))
    };

    process.instances.push(instance);
    process.metrics.totalExecutions++;

    // تنفيذ الخطوات
    this.executeProcessSteps(instance);

    return instance;
  }

  executeProcessSteps(instance) {
    instance.steps.forEach((step, index) => {
      console.log(`⚙️ تنفيذ خطوة: ${step.name}`);
      step.status = 'completed';
      
      // محاكاة التنفيذ
      if(Math.random() > 0.1) {
        step.result = { success: true };
      } else {
        step.result = { success: false, error: 'خطأ في التنفيذ' };
      }
    });

    instance.status = 'completed';
    instance.endTime = new Date().toISOString();

    const allSuccessful = instance.steps.every(s => s.result?.success);
    if(allSuccessful) {
      const process = this.processes.find(p => p.id === instance.processId);
      process.metrics.successfulExecutions++;
    } else {
      const process = this.processes.find(p => p.id === instance.processId);
      process.metrics.failedExecutions++;
    }

    return instance;
  }

  // ===== الإحصائيات =====
  getProjectStatistics(projectId) {
    const project = this.projects.find(p => p.id === projectId);
    if(!project) return { error: 'المشروع غير موجود' };

    const completedTasks = project.tasks.filter(t => t.status === 'completed');
    const ongoingTasks = project.tasks.filter(t => t.status === 'open' || t.status === 'in_progress');
    const overdueTasks = project.tasks.filter(t => t.status !== 'completed' && new Date(t.dueDate) < new Date());

    const totalHours = project.tasks.reduce((sum, t) => sum + t.estimatedHours, 0);
    const completedHours = completedTasks.reduce((sum, t) => sum + t.estimatedHours, 0);

    return {
      projectId: project.id,
      projectName: project.name,
      progress: project.progress,
      totalTasks: project.tasks.length,
      completedTasks: completedTasks.length,
      ongoingTasks: ongoingTasks.length,
      overdueTasks: overdueTasks.length,
      totalEstimatedHours: totalHours,
      completedHours: completedHours,
      remainingHours: totalHours - completedHours,
      budgetUsed: project.budget * (project.progress / 100),
      budgetRemaining: project.budget * ((100 - project.progress) / 100),
      phases: project.phases.length,
      teamSize: project.team.length
    };
  }

  // ===== الحفظ والتحميل =====
  saveProjects() {
    localStorage.setItem('superpro_projects', JSON.stringify(this.projects));
    localStorage.setItem('superpro_processes', JSON.stringify(this.processes));
    localStorage.setItem('superpro_templates', JSON.stringify(this.templates));
    localStorage.setItem('superpro_milestones', JSON.stringify(this.milestones));
    localStorage.setItem('superpro_risks', JSON.stringify(this.risks));
  }

  loadProjects() {
    const projects = localStorage.getItem('superpro_projects');
    const processes = localStorage.getItem('superpro_processes');
    const templates = localStorage.getItem('superpro_templates');
    const milestones = localStorage.getItem('superpro_milestones');
    const risks = localStorage.getItem('superpro_risks');

    if(projects) this.projects = JSON.parse(projects);
    if(processes) this.processes = JSON.parse(processes);
    if(templates) this.templates = JSON.parse(templates);
    if(milestones) this.milestones = JSON.parse(milestones);
    if(risks) this.risks = JSON.parse(risks);
  }
}

// إنشاء instance عام
const projectManagement = new ProjectManagement();
projectManagement.loadProjects();
console.log('✅ تم تحميل نظام إدارة المشاريع والعمليات');
