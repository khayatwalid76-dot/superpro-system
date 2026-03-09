// ============= نظام الفواتير والدفع =============

class InvoiceSystem {
  constructor() {
    this.invoices = [];
    this.payments = [];
    this.invoiceTemplates = this.initializeTemplates();
  }

  initializeTemplates() {
    return {
      standard: {
        name: 'قياسي',
        includeCompanyInfo: true,
        includeClientInfo: true,
        showItemDetails: true,
        showNotes: true
      },
      detailed: {
        name: 'مفصل',
        includeCompanyInfo: true,
        includeClientInfo: true,
        showItemDetails: true,
        showNotes: true,
        showHistory: true
      },
      simple: {
        name: 'بسيط',
        includeCompanyInfo: false,
        includeClientInfo: true,
        showItemDetails: true,
        showNotes: false
      }
    };
  }

  // إنشاء فاتورة جديدة
  createInvoice(invoiceData) {
    const invoice = {
      id: this.generateInvoiceNumber(),
      clientId: invoiceData.clientId,
      clientName: invoiceData.clientName,
      items: invoiceData.items || [],
      subtotal: 0,
      tax: invoiceData.tax || 0,
      total: 0,
      discount: invoiceData.discount || 0,
      issueDate: new Date().toISOString(),
      dueDate: invoiceData.dueDate,
      status: 'draft', // draft, sent, paid, overdue, cancelled
      paymentTerms: invoiceData.paymentTerms || 'فور الاستلام',
      notes: invoiceData.notes || '',
      template: invoiceData.template || 'standard',
      paid: false,
      paymentDate: null
    };

    // حساب الإجمالي
    invoice.subtotal = invoice.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    invoice.total = (invoice.subtotal - invoice.discount) + invoice.tax;

    this.invoices.push(invoice);
    this.saveInvoices();
    return invoice;
  }

  // تحديث الفاتورة
  updateInvoice(invoiceId, updates) {
    const invoice = this.invoices.find(i => i.id === invoiceId);
    if(!invoice) return false;

    // لا يمكن تعديل الفواتير المدفوعة
    if(invoice.status === 'paid') {
      console.warn('⚠️ لا يمكن تعديل فاتورة مدفوعة');
      return false;
    }

    Object.assign(invoice, updates);

    // إعادة حساب الإجمالي
    if(updates.items || updates.discount || updates.tax) {
      invoice.subtotal = invoice.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      invoice.total = (invoice.subtotal - invoice.discount) + invoice.tax;
    }

    this.saveInvoices();
    return true;
  }

  // تسجيل دفع
  recordPayment(invoiceId, amount, paymentMethod = 'cash') {
    const invoice = this.invoices.find(i => i.id === invoiceId);
    if(!invoice) return false;

    const payment = {
      id: Date.now(),
      invoiceId: invoiceId,
      amount: amount,
      paymentMethod: paymentMethod, // cash, check, transfer, credit_card
      paymentDate: new Date().toISOString(),
      reference: `PAY-${Date.now()}`
    };

    this.payments.push(payment);

    // تحديث حالة الفاتورة
    const totalPaid = this.getTotalPaidForInvoice(invoiceId);
    if(totalPaid >= invoice.total) {
      invoice.status = 'paid';
      invoice.paid = true;
      invoice.paymentDate = new Date().toISOString();
    } else if(totalPaid > 0) {
      invoice.status = 'partial';
    }

    this.saveInvoices();
    this.savePayments();
    return payment;
  }

  // الحصول على إجمالي المدفوع للفاتورة
  getTotalPaidForInvoice(invoiceId) {
    return this.payments
      .filter(p => p.invoiceId === invoiceId)
      .reduce((sum, p) => sum + p.amount, 0);
  }

  // إرسال الفاتورة بالبريد الإلكتروني
  sendInvoiceByEmail(invoiceId, recipientEmail) {
    const invoice = this.invoices.find(i => i.id === invoiceId);
    if(!invoice) return false;

    // في الإنتاج: استخدم خدمة بريد مثل SendGrid أو mailgun
    console.log(`📧 إرسال الفاتورة ${invoiceId} إلى ${recipientEmail}`);

    invoice.status = 'sent';
    this.saveInvoices();

    return {
      success: true,
      message: `تم إرسال الفاتورة إلى ${recipientEmail}`,
      invoiceId: invoiceId
    };
  }

  // إنشاء فواتير متكررة
  createRecurringInvoice(recurringData) {
    const recurring = {
      id: Date.now(),
      clientId: recurringData.clientId,
      items: recurringData.items,
      frequency: recurringData.frequency, // monthly, quarterly, yearly
      startDate: recurringData.startDate,
      endDate: recurringData.endDate,
      active: true,
      lastGenerated: null,
      invoices: []
    };

    localStorage.setItem(`superpro_recurring_${recurring.id}`, JSON.stringify(recurring));
    return recurring;
  }

  // إنشاء فواتير متكررة تلقائياً
  generateRecurringInvoices() {
    const today = new Date();
    const recurringItems = JSON.parse(localStorage.getItem('superpro_recurring') || '[]');

    recurringItems.forEach(recurring => {
      if(!recurring.active) return;

      const lastGenerated = recurring.lastGenerated ? new Date(recurring.lastGenerated) : new Date(recurring.startDate);
      const nextDate = new Date(lastGenerated);

      switch(recurring.frequency) {
        case 'monthly':
          nextDate.setMonth(nextDate.getMonth() + 1);
          break;
        case 'quarterly':
          nextDate.setMonth(nextDate.getMonth() + 3);
          break;
        case 'yearly':
          nextDate.setFullYear(nextDate.getFullYear() + 1);
          break;
      }

      if(nextDate <= today) {
        const invoice = this.createInvoice({
          clientId: recurring.clientId,
          items: recurring.items,
          dueDate: nextDate.toISOString()
        });

        recurring.lastGenerated = new Date().toISOString();
        recurring.invoices.push(invoice.id);
      }
    });
  }

  // تصدير الفاتورة كـ PDF
  exportInvoiceToPDF(invoiceId) {
    const invoice = this.invoices.find(i => i.id === invoiceId);
    if(!invoice) return false;

    // في الإنتاج: استخدم مكتبة مثل jsPDF أو html2pdf
    console.log(`📄 تصدير الفاتورة ${invoiceId} إلى PDF`);
    return true;
  }

  // الحصول على تقرير مبيعات
  getSalesReport(startDate, endDate) {
    const invoices = this.invoices.filter(inv => {
      const date = new Date(inv.issueDate);
      return date >= new Date(startDate) && date <= new Date(endDate);
    });

    return {
      period: `${startDate} - ${endDate}`,
      totalInvoices: invoices.length,
      totalRevenue: invoices.reduce((sum, inv) => sum + inv.total, 0),
      totalPaid: this.payments
        .filter(p => {
          const invoice = this.invoices.find(i => i.id === p.invoiceId);
          return invoice && new Date(invoice.issueDate) >= new Date(startDate) && new Date(invoice.issueDate) <= new Date(endDate);
        })
        .reduce((sum, p) => sum + p.amount, 0),
      totalOverdue: invoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.total, 0),
      invoicesByStatus: {
        draft: invoices.filter(i => i.status === 'draft').length,
        sent: invoices.filter(i => i.status === 'sent').length,
        paid: invoices.filter(i => i.status === 'paid').length,
        overdue: invoices.filter(i => i.status === 'overdue').length
      }
    };
  }

  // توليد رقم الفاتورة
  generateInvoiceNumber() {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const sequence = this.invoices.filter(i => i.id.startsWith(`${year}-${month}`)).length + 1;
    return `${year}-${month}-${String(sequence).padStart(4, '0')}`;
  }

  // حفظ واسترجاع
  saveInvoices() {
    localStorage.setItem('superpro_invoices', JSON.stringify(this.invoices));
  }

  savePayments() {
    localStorage.setItem('superpro_payments', JSON.stringify(this.payments));
  }

  loadInvoices() {
    const invoices = localStorage.getItem('superpro_invoices');
    const payments = localStorage.getItem('superpro_payments');

    if(invoices) this.invoices = JSON.parse(invoices);
    if(payments) this.payments = JSON.parse(payments);
  }
}

// إنشاء instance عام
const invoiceSystem = new InvoiceSystem();
invoiceSystem.loadInvoices();
console.log('✅ تم تحميل نظام الفواتير والدفع');
