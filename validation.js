// validation.js - نظام التحقق من صحة البيانات
// ================================================

class Validator {
    constructor() {
        this.rules = {
            required: (value) => value !== null && value !== undefined && value.toString().trim() !== '',
            email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
            phone: (value) => /^[\+]?[0-9]{10,15}$/.test(value.replace(/[\s\-\(\)]/g, '')),
            number: (value) => !isNaN(value) && isFinite(value),
            positive: (value) => !isNaN(value) && parseFloat(value) > 0,
            integer: (value) => Number.isInteger(parseFloat(value)),
            minLength: (min) => (value) => value.toString().length >= min,
            maxLength: (max) => (value) => value.toString().length <= max,
            min: (min) => (value) => parseFloat(value) >= min,
            max: (max) => (value) => parseFloat(value) <= max,
            pattern: (regex) => (value) => regex.test(value),
            date: (value) => !isNaN(Date.parse(value)),
            id: (value) => /^[a-zA-Z0-9_-]+$/.test(value),
            arabicText: (value) => /^[\u0600-\u06FF\s\-\.\,\!\?]+$/.test(value),
            englishText: (value) => /^[a-zA-Z\s\-\.\,\!\?]+$/.test(value)
        };
    }

    // التحقق من حقل واحد
    validateField(value, rules, fieldName = '') {
        const errors = [];
        
        for (const rule of rules) {
            const ruleName = typeof rule === 'string' ? rule : Object.keys(rule)[0];
            const ruleParams = typeof rule === 'string' ? null : rule[ruleName];
            
            let validationFn;
            
            if (typeof rule === 'string') {
                validationFn = this.rules[ruleName];
            } else {
                validationFn = this.rules[ruleName];
                if (ruleParams !== undefined) {
                    if (typeof this.rules[ruleName] === 'function') {
                        validationFn = this.rules[ruleName](ruleParams);
                    }
                }
            }
            
            if (!validationFn) {
                continue;
            }
            
            try {
                const result = validationFn(value);
                if (!result) {
                    errors.push(this.getErrorMessage(ruleName, ruleParams, fieldName, value));
                }
            } catch (error) {
                errors.push(`خطأ في التحقق من ${fieldName}: ${error.message}`);
            }
        }
        
        return errors;
    }

    // التحقق من نموذج كامل
    validateForm(data, schema) {
        const errors = {};
        let isValid = true;
        
        for (const [fieldName, rules] of Object.entries(schema)) {
            const value = data[fieldName];
            const fieldErrors = this.validateField(value, rules, fieldName);
            
            if (fieldErrors.length > 0) {
                errors[fieldName] = fieldErrors;
                isValid = false;
            }
        }
        
        return { isValid, errors };
    }

    // الحصول على رسالة الخطأ
    getErrorMessage(rule, params, fieldName, value) {
        const messages = {
            required: `${fieldName} حقل مطلوب`,
            email: 'البريد الإلكتروني غير صحيح',
            phone: 'رقم الهاتف غير صحيح',
            number: `${fieldName} يجب أن يكون رقماً`,
            positive: `${fieldName} يجب أن يكون رقماً موجباً`,
            integer: `${fieldName} يجب أن يكون رقماً صحيحاً`,
            minLength: `${fieldName} يجب أن يحتوي على ${params} أحرف على الأقل`,
            maxLength: `${fieldName} يجب أن لا يتجاوز ${params} حرف`,
            min: `${fieldName} يجب أن يكون ${params} أو أكثر`,
            max: `${fieldName} يجب أن لا يتجاوز ${params}`,
            pattern: `${fieldName} التنسيق غير صحيح`,
            date: `${fieldName} تاريخ غير صحيح`,
            id: `${fieldName} يحتوي على أحرف غير مسموح بها`,
            arabicText: `${fieldName} يجب أن يكون باللغة العربية فقط`,
            englishText: `${fieldName} يجب أن يكون باللغة الإنجليزية فقط`
        };
        
        return messages[rule] || `${fieldName} قيمة غير صحيحة`;
    }

    // إضافة قاعدة تحقق مخصصة
    addRule(name, fn, message) {
        this.rules[name] = fn;
        this.getErrorMessage = (rule, params, fieldName, value) => {
            if (rule === name) {
                return typeof message === 'function' ? message(params, fieldName, value) : message;
            }
            return this.getErrorMessage(rule, params, fieldName, value);
        };
    }
}

// تعريفات التحقق للنماذج المختلفة
const validationSchemas = {
    employee: {
        name: ['required', 'arabicText', 'minLength:2', 'maxLength:100'],
        email: ['required', 'email'],
        phone: ['required', 'phone'],
        position: ['required', 'arabicText', 'minLength:2'],
        salary: ['required', 'number', 'positive'],
        idNumber: ['required', 'id', 'minLength:10', 'maxLength:20'],
        residenceExpiry: ['required', 'date']
    },
    client: {
        name: ['required', 'arabicText', 'minLength:2', 'maxLength:100'],
        email: ['email'],
        phone: ['required', 'phone'],
        company: ['arabicText', 'maxLength:100'],
        address: ['maxLength:200']
    },
    contract: {
        title: ['required', 'arabicText', 'minLength:2', 'maxLength:200'],
        clientId: ['required'],
        value: ['required', 'number', 'positive'],
        startDate: ['required', 'date'],
        endDate: ['required', 'date'],
        description: ['maxLength:500']
    },
    attendance: {
        employeeId: ['required'],
        date: ['required', 'date'],
        checkIn: ['required'],
        checkOut: [],
        notes: ['maxLength:200']
    },
    transaction: {
        type: ['required'],
        amount: ['required', 'number', 'positive'],
        category: ['required'],
        description: ['required', 'minLength:2', 'maxLength:200'],
        date: ['required', 'date']
    }
};

// دوال مساعدة للتحقق من النماذج
function validateEmployee(data) {
    const validator = new Validator();
    return validator.validateForm(data, validationSchemas.employee);
}

function validateClient(data) {
    const validator = new Validator();
    return validator.validateForm(data, validationSchemas.client);
}

function validateContract(data) {
    const validator = new Validator();
    return validator.validateForm(data, validationSchemas.contract);
}

function validateAttendance(data) {
    const validator = new Validator();
    return validator.validateForm(data, validationSchemas.attendance);
}

function validateTransaction(data) {
    const validator = new Validator();
    return validator.validateForm(data, validationSchemas.transaction);
}

// تحقق من تواريخ العقود
function validateContractDates(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    
    if (start >= end) {
        return { valid: false, message: 'تاريخ البدء يجب أن يكون قبل تاريخ الانتهاء' };
    }
    
    if (end < today) {
        return { valid: false, message: 'تاريخ الانتهاء لا يمكن أن يكون في الماضي' };
    }
    
    return { valid: true };
}

// تحقق من رقم الهاتف السعودي
function validateSaudiPhone(phone) {
    const saudiPattern = /^(\+966|00966|0)?5[0-9]{8}$/;
    return saudiPattern.test(phone.replace(/[\s\-\(\)]/g, ''));
}

// تحقق من الإقامة
function validateResidency(idNumber, expiryDate) {
    const errors = [];
    
    if (!idNumber || idNumber.length < 10) {
        errors.push('رقم الإقامة غير صحيح');
    }
    
    if (!expiryDate || new Date(expiryDate) <= new Date()) {
        errors.push('تاريخ انتهاء الإقامة غير صحيح');
    }
    
    return errors;
}

// تصدير للإستخدام العام
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Validator,
        validationSchemas,
        validateEmployee,
        validateClient,
        validateContract,
        validateAttendance,
        validateTransaction,
        validateContractDates,
        validateSaudiPhone,
        validateResidency
    };
} else {
    window.Validator = Validator;
    window.validationSchemas = validationSchemas;
    window.validateEmployee = validateEmployee;
    window.validateClient = validateClient;
    window.validateContract = validateContract;
    window.validateAttendance = validateAttendance;
    window.validateTransaction = validateTransaction;
    window.validateContractDates = validateContractDates;
    window.validateSaudiPhone = validateSaudiPhone;
    window.validateResidency = validateResidency;
}
