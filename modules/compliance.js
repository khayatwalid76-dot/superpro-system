// ============= نظام إدارة الامتثال والقوانين =============

class ComplianceAndCompliance {
  constructor() {
    this.policies = [];
    this.audits = [];
    this.violations = [];
    this.certifications = [];
    this.regulations = [];
    this.acknowledgedPolicies = [];
  }

  // ===== السياسات =====
  createPolicy(policyData) {
    const policy = {
      id: Date.now(),
      title: policyData.title,
      description: policyData.description || '',
      category: policyData.category, // hr, finance, security, data, environment
      content: policyData.content,
      version: policyData.version || '1.0',
      effectiveDate: policyData.effectiveDate,
      lastUpdated: new Date().toISOString(),
      status: 'active', // active, draft, deprecated
      audience: policyData.audience || 'all', // all, department, specific
      requiresAcknowledgment: policyData.requiresAcknowledgment !== false,
      attachments: policyData.attachments || []
    };

    this.policies.push(policy);
    console.log(`📋 تم إنشاء سياسة: ${policy.title}`);

    return policy;
  }

  getActivePolicies(category = null) {
    let policies = this.policies.filter(p => p.status === 'active');
    if(category) {
      policies = policies.filter(p => p.category === category);
    }
    return policies;
  }

  acknowledgePolicyByEmployee(employeeId, policyId) {
    const policy = this.policies.find(p => p.id === policyId);
    if(!policy) return { error: 'السياسة غير موجودة' };

    const acknowledgment = {
      employeeId: employeeId,
      policyId: policyId,
      acknowledgedAt: new Date().toISOString(),
      ipAddress: '192.168.1.1', // يتم التقاطه من الخادم
      userAgent: navigator.userAgent
    };

    this.acknowledgedPolicies.push(acknowledgment);
    console.log(`✅ تم تأكيد السياسة من قبل الموظف: ${employeeId}`);

    return { status: 'success', acknowledgment: acknowledgment };
  }

  // ===== التدقيق والفحصات =====
  createAudit(auditData) {
    const audit = {
      id: Date.now(),
      name: auditData.name,
      description: auditData.description || '',
      auditType: auditData.auditType, // internal, external, regulatory
      scope: auditData.scope, // entire, department, process
      startDate: auditData.startDate,
      endDate: auditData.endDate,
      auditor: auditData.auditor || 'currentUser',
      status: 'scheduled', // scheduled, in_progress, completed, pending_review
      findings: [],
      recommendations: [],
      createdAt: new Date().toISOString()
    };

    this.audits.push(audit);
    console.log(`🔍 تم جدولة التدقيق: ${audit.name}`);

    return audit;
  }

  addFindingToAudit(auditId, finding) {
    const audit = this.audits.find(a => a.id === auditId);
    if(!audit) return { error: 'التدقيق غير موجود' };

    const f = {
      id: Date.now(),
      description: finding.description,
      severity: finding.severity, // critical, high, medium, low
      category: finding.category,
      evidence: finding.evidence || [],
      status: 'open', // open, in_progress, resolved
      createdAt: new Date().toISOString()
    };

    audit.findings.push(f);
    return f;
  }

  addRecommendationToAudit(auditId, recommendation) {
    const audit = this.audits.find(a => a.id === auditId);
    if(!audit) return { error: 'التدقيق غير موجود' };

    const rec = {
      id: Date.now(),
      description: recommendation.description,
      priority: recommendation.priority, // high, medium, low
      owner: recommendation.owner || '',
      dueDate: recommendation.dueDate,
      status: 'pending', // pending, in_progress, completed
      createdAt: new Date().toISOString()
    };

    audit.recommendations.push(rec);
    return rec;
  }

  closeAudit(auditId, summary) {
    const audit = this.audits.find(a => a.id === auditId);
    if(!audit) return { error: 'التدقيق غير موجود' };

    audit.status = 'completed';
    audit.endDate = new Date().toISOString();

    console.log(`✅ انتهى التدقيق: ${audit.name}`);

    return { status: 'success', audit: audit };
  }

  // ===== الانتهاكات =====
  reportViolation(violationData) {
    const violation = {
      id: Date.now(),
      reportedBy: violationData.reportedBy || 'currentUser',
      reportedAt: new Date().toISOString(),
      policyId: violationData.policyId,
      employeeId: violationData.employeeId,
      description: violationData.description,
      severity: violationData.severity, // critical, high, medium, low
      evidence: violationData.evidence || [],
      status: 'reported', // reported, under_investigation, resolved, dismissed
      investigationFindings: '',
      disciplinaryAction: null,
      resolvedAt: null
    };

    this.violations.push(violation);
    console.log(`⚠️ تم الإبلاغ عن انتهاك: ${violation.description}`);

    return violation;
  }

  investigateViolation(violationId, findings) {
    const violation = this.violations.find(v => v.id === violationId);
    if(!violation) return { error: 'الانتهاك غير موجود' };

    violation.status = 'under_investigation';
    violation.investigationFindings = findings;

    return { status: 'success', violation: violation };
  }

  resolveViolation(violationId, action) {
    const violation = this.violations.find(v => v.id === violationId);
    if(!violation) return { error: 'الانتهاك غير موجود' };

    violation.status = 'resolved';
    violation.disciplinaryAction = action;
    violation.resolvedAt = new Date().toISOString();

    console.log(`✅ تم الانتهاء من التحقيق في الانتهاك`);

    return { status: 'success', violation: violation };
  }

  // ===== الشهادات والمقاييس =====
  createCertification(certData) {
    const certification = {
      id: Date.now(),
      name: certData.name,
      description: certData.description || '',
      standard: certData.standard, // ISO9001, ISO27001, SOC2, other
      issueDate: certData.issueDate,
      expiryDate: certData.expiryDate,
      issuingBody: certData.issuingBody,
      certificateNumber: certData.certificateNumber || 'CERT-' + Date.now(),
      scope: certData.scope,
      status: 'active', // active, expired, suspended, revoked
      auditResults: []
    };

    this.certifications.push(certification);
    console.log(`🏆 تم إضافة شهادة: ${certification.name}`);

    return certification;
  }

  checkCertificationExpiry() {
    const now = new Date();
    const alerts = [];

    this.certifications.forEach(cert => {
      const expiry = new Date(cert.expiryDate);
      const daysUntilExpiry = Math.floor((expiry - now) / (1000 * 60 * 60 * 24));

      if(daysUntilExpiry < 0) {
        cert.status = 'expired';
        alerts.push({
          type: 'expired',
          certification: cert.name,
          message: `انتهت صلاحية الشهادة: ${cert.name}`
        });
      } else if(daysUntilExpiry < 90) {
        alerts.push({
          type: 'expiring_soon',
          certification: cert.name,
          daysRemaining: daysUntilExpiry,
          message: `الشهادة ستنتهي صلاحيتها خلال ${daysUntilExpiry} يوم`
        });
      }
    });

    return alerts;
  }

  // ===== اللوائح التنظيمية =====
  addRegulation(regulationData) {
    const regulation = {
      id: Date.now(),
      title: regulationData.title,
      description: regulationData.description || '',
      jurisdiction: regulationData.jurisdiction, // KSA, UAE, international
      applicableDate: regulationData.applicableDate,
      requiredActions: regulationData.requiredActions || [],
      complianceStatus: 'pending', // pending, in_progress, compliant, non_compliant
      owner: regulationData.owner || '',
      deadline: regulationData.deadline,
      penalties: regulationData.penalties || ''
    };

    this.regulations.push(regulation);
    console.log(`📜 تم إضافة لائحة تنظيمية: ${regulation.title}`);

    return regulation;
  }

  updateRegulatoryCompliance(regulationId, status) {
    const regulation = this.regulations.find(r => r.id === regulationId);
    if(!regulation) return { error: 'اللائحة غير موجودة' };

    regulation.complianceStatus = status;
    return { status: 'success', regulation: regulation };
  }

  // ===== التقارير =====
  generateComplianceReport(startDate, endDate) {
    const report = {
      period: { startDate, endDate },
      totalPolicies: this.policies.length,
      activePolicies: this.policies.filter(p => p.status === 'active').length,
      totalAudits: this.audits.length,
      completedAudits: this.audits.filter(a => a.status === 'completed').length,
      totalViolations: this.violations.length,
      resolvedViolations: this.violations.filter(v => v.status === 'resolved').length,
      activeCertifications: this.certifications.filter(c => c.status === 'active').length,
      expiredCertifications: this.certifications.filter(c => c.status === 'expired').length,
      findingsBySeverity: this.getFindingsBySeverity(),
      regulatoryStatus: this.getRegulationStatus(),
      violationsByCategory: this.getViolationsByCategory(),
      recommendations: []
    };

    // التوصيات
    if(report.activeCertifications === 0) {
      report.recommendations.push('يتطلب إعادة تقييم المتطلبات التنظيمية');
    }

    if(report.resolvedViolations < report.totalViolations * 0.5) {
      report.recommendations.push('هناك انتهاكات قائمة تحتاج إلى اهتمام');
    }

    return report;
  }

  getFindingsBySeverity() {
    const findings = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    };

    this.audits.forEach(audit => {
      audit.findings.forEach(f => {
        findings[f.severity]++;
      });
    });

    return findings;
  }

  getViolationsByCategory() {
    const categories = {};
    this.violations.forEach(v => {
      const policy = this.policies.find(p => p.id === v.policyId);
      const category = policy?.category || 'unknown';
      categories[category] = (categories[category] || 0) + 1;
    });
    return categories;
  }

  getRegulationStatus() {
    return {
      total: this.regulations.length,
      compliant: this.regulations.filter(r => r.complianceStatus === 'compliant').length,
      nonCompliant: this.regulations.filter(r => r.complianceStatus === 'non_compliant').length,
      pending: this.regulations.filter(r => r.complianceStatus === 'pending').length
    };
  }

  // ===== الحفظ والتحميل =====
  saveCompliance() {
    localStorage.setItem('superpro_policies', JSON.stringify(this.policies));
    localStorage.setItem('superpro_audits', JSON.stringify(this.audits));
    localStorage.setItem('superpro_violations', JSON.stringify(this.violations));
    localStorage.setItem('superpro_certifications', JSON.stringify(this.certifications));
    localStorage.setItem('superpro_regulations', JSON.stringify(this.regulations));
    localStorage.setItem('superpro_acknowledged_policies', JSON.stringify(this.acknowledgedPolicies));
  }

  loadCompliance() {
    const policies = localStorage.getItem('superpro_policies');
    const audits = localStorage.getItem('superpro_audits');
    const violations = localStorage.getItem('superpro_violations');
    const certifications = localStorage.getItem('superpro_certifications');
    const regulations = localStorage.getItem('superpro_regulations');
    const acknowledgedPolicies = localStorage.getItem('superpro_acknowledged_policies');

    if(policies) this.policies = JSON.parse(policies);
    if(audits) this.audits = JSON.parse(audits);
    if(violations) this.violations = JSON.parse(violations);
    if(certifications) this.certifications = JSON.parse(certifications);
    if(regulations) this.regulations = JSON.parse(regulations);
    if(acknowledgedPolicies) this.acknowledgedPolicies = JSON.parse(acknowledgedPolicies);
  }
}

// إنشاء instance عام
const complianceAndCompliance = new ComplianceAndCompliance();
complianceAndCompliance.loadCompliance();
console.log('✅ تم تحميل نظام إدارة الامتثال والقوانين');
