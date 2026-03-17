// ============================================
// PERFORMANCE OPTIMIZATION
// Database Queries, Caching, Indexing
// ============================================

const performanceOptimizer = {
  cache: {},
  cacheExpiry: 5 * 60 * 1000, // 5 minutes
  
  // Set cache value
  setCache(key, value, ttl = this.cacheExpiry) {
    this.cache[key] = {
      data: value,
      timestamp: Date.now(),
      ttl: ttl
    };
  },
  
  // Get cache value
  getCache(key) {
    const cached = this.cache[key];
    if(!cached) return null;
    
    // Check if expired
    if(Date.now() - cached.timestamp > cached.ttl) {
      delete this.cache[key];
      return null;
    }
    
    return cached.data;
  },
  
  // Clear cache
  clearCache(key = null) {
    if(key) {
      delete this.cache[key];
    } else {
      this.cache = {};
    }
  }
};

// ============= OPTIMIZED DATA LOADING =============
async function loadEmployeesOptimized() {
  try {
    // Check cache first
    const cached = performanceOptimizer.getCache('employees');
    if(cached) {
      appData.employees = cached;
      const tbody = document.getElementById('empTbody');
      tbody.innerHTML = cached.map((emp, idx) => `
        <tr>
          <td>${idx + 1}</td>
          <td>${emp.name}</td>
          <td>${emp.nationality || '-'}</td>
          <td>${emp.job || '-'}</td>
          <td>${emp.salary || 0}</td>
          <td><span class="badge badge-green">${emp.status || '┘╪┤╪╖'}</span></td>
        </tr>
      `).join('');
      return;
    }
    
    // Load from Firebase if not cached
    if(typeof employeeService !== 'undefined') {
      try {
        const firebaseEmployees = await employeeService.getEmployees();
        if(firebaseEmployees && firebaseEmployees.length > 0) {
          appData.employees = firebaseEmployees;
          performanceOptimizer.setCache('employees', firebaseEmployees);
        }
      } catch(error) {
        console.warn('Firebase load error:', error);
      }
    }
    
    // Display data
    const tbody = document.getElementById('empTbody');
    const html = appData.employees.map((emp, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td>${emp.name}</td>
        <td>${emp.nationality || '-'}</td>
        <td>${emp.job || '-'}</td>
        <td>${emp.salary || 0}</td>
        <td><span class="badge badge-green">${emp.status || '┘╪┤╪╖'}</span></td>
      </tr>
    `).join('');
    
    tbody.innerHTML = html || '<tr><td colspan="6">┘╪د ╪ز┘ê╪ش╪» ┘à┘ê╪╕┘┘è┘</td></tr>';
  } catch(error) {
    console.error('Load error:', error);
  }
}

// ============= INDEXED QUERIES =============
const queryIndexes = {
  employees: {
    byId: {},
    byName: {},
    byDepartment: {},
    byStatus: {}
  },
  clients: {
    byId: {},
    byName: {},
    byArea: {}
  },
  contracts: {
    byId: {},
    byClientId: {},
    byStatus: {}
  },
  
  build() {
    // Index employees
    appData.employees.forEach(emp => {
      this.employees.byId[emp.id] = emp;
      this.employees.byName[emp.name] = emp;
      if(emp.job) this.employees.byDepartment[emp.job] = this.employees.byDepartment[emp.job] || [];
      if(emp.job) this.employees.byDepartment[emp.job].push(emp);
      if(emp.status) this.employees.byStatus[emp.status] = this.employees.byStatus[emp.status] || [];
      if(emp.status) this.employees.byStatus[emp.status].push(emp);
    });
    
    // Index clients
    appData.clients.forEach(client => {
      this.clients.byId[client.id] = client;
      this.clients.byName[client.name] = client;
      if(client.area) this.clients.byArea[client.area] = this.clients.byArea[client.area] || [];
      if(client.area) this.clients.byArea[client.area].push(client);
    });
    
    // Index contracts
    appData.contracts.forEach(contract => {
      this.contracts.byId[contract.id] = contract;
      this.contracts.byClientId[contract.clientId] = this.contracts.byClientId[contract.clientId] || [];
      this.contracts.byClientId[contract.clientId].push(contract);
      if(contract.status) this.contracts.byStatus[contract.status] = this.contracts.byStatus[contract.status] || [];
      if(contract.status) this.contracts.byStatus[contract.status].push(contract);
    });
  },
  
  findEmployeeById(id) {
    return this.employees.byId[id];
  },
  
  findEmployeesByDepartment(dept) {
    return this.employees.byDepartment[dept] || [];
  },
  
  findEmployeesByStatus(status) {
    return this.employees.byStatus[status] || [];
  },
  
  findClientsByArea(area) {
    return this.clients.byArea[area] || [];
  },
  
  findContractsByClient(clientId) {
    return this.contracts.byClientId[clientId] || [];
  }
};

// ============= BATCH OPERATIONS =============
async function batchLoadData() {
  try {
    const startTime = performance.now();
    
    // Load all data in parallel
    const promises = [
      employeeService.getEmployees(),
      clientService.getClients(),
      contractService.getContracts(),
      attendanceService.getAttendance(),
      payrollService.getPayroll()
    ];
    
    const [employees, clients, contracts, attendance, payroll] = await Promise.all(promises);
    
    // Update appData
    if(employees) appData.employees = employees;
    if(clients) appData.clients = clients;
    if(contracts) appData.contracts = contracts;
    if(attendance) appData.attendance = attendance;
    if(payroll) appData.payroll = payroll;
    
    // Build indexes
    queryIndexes.build();
    
    // Cache data
    performanceOptimizer.setCache('employees', employees);
    performanceOptimizer.setCache('clients', clients);
    performanceOptimizer.setCache('contracts', contracts);
    
    const endTime = performance.now();
    console.log(`ظ£à Batch load completed in ${(endTime - startTime).toFixed(2)}ms`);
    
    return true;
  } catch(error) {
    console.error('Batch load error:', error);
    return false;
  }
}

// ============= PAGINATION SYSTEM =============
const paginator = {
  pageSize: 20,
  
  paginate(data, pageNumber = 1) {
    const start = (pageNumber - 1) * this.pageSize;
    const end = start + this.pageSize;
    
    return {
      data: data.slice(start, end),
      pageNumber,
      pageSize: this.pageSize,
      totalItems: data.length,
      totalPages: Math.ceil(data.length / this.pageSize),
      hasNext: end < data.length,
      hasPrev: pageNumber > 1
    };
  }
};

// ============= LAZY LOADING TABLES =============
function setupLazyLoadingTable(tableId, fullData) {
  let currentPage = 1;
  const pageSize = 20;
  let filteredData = fullData;
  
  function renderTable(page = 1) {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const pageData = filteredData.slice(start, end);
    
    const tbody = document.getElementById(tableId);
    const html = pageData.map((row, idx) => {
      const keys = Object.keys(row);
      return `<tr>${keys.map(k => `<td>${row[k]}</td>`).join('')}</tr>`;
    }).join('');
    
    tbody.innerHTML = html;
    
    // Update pagination info
    const totalPages = Math.ceil(filteredData.length / pageSize);
    document.getElementById(`${tableId}-info`).textContent = 
      `╪╡┘╪ص╪ر ${page} ┘à┘ ${totalPages} (${filteredData.length} ╪╣┘╪د╪╡╪▒)`;
  }
  
  function searchTable(query) {
    const lower = query.toLowerCase();
    filteredData = fullData.filter(row => {
      return Object.values(row).some(val => 
        String(val).toLowerCase().includes(lower)
      );
    });
    currentPage = 1;
    renderTable();
  }
  
  function nextPage() {
    const totalPages = Math.ceil(filteredData.length / pageSize);
    if(currentPage < totalPages) {
      currentPage++;
      renderTable(currentPage);
    }
  }
  
  function prevPage() {
    if(currentPage > 1) {
      currentPage--;
      renderTable(currentPage);
    }
  }
  
  renderTable();
  
  return { renderTable, searchTable, nextPage, prevPage };
}

// ============= DEBOUNCING =============
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ============= OPTIMIZED SEARCH =============
const optimizedSearch = {
  searchIndex: {},
  
  buildIndex(data, searchFields) {
    data.forEach(item => {
      const searchText = searchFields.map(f => String(item[f]).toLowerCase()).join(' ');
      this.searchIndex[item.id] = searchText;
    });
  },
  
  search(query) {
    const lower = query.toLowerCase();
    return Object.entries(this.searchIndex)
      .filter(([id, text]) => text.includes(lower))
      .map(([id]) => id);
  }
};

// ============= LAZY LOAD IMAGES =============
function setupLazyLoadImages() {
  if('IntersectionObserver' in window) {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if(entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    });
    
    images.forEach(img => imageObserver.observe(img));
  }
}

// ============= PERFORMANCE MONITORING =============
const performanceMonitor = {
  metrics: {},
  
  startMeasure(label) {
    performance.mark(`${label}-start`);
  },
  
  endMeasure(label) {
    performance.mark(`${label}-end`);
    try {
      performance.measure(label, `${label}-start`, `${label}-end`);
      const measure = performance.getEntriesByName(label)[0];
      this.metrics[label] = measure.duration;
      console.log(`ظ▒ي╕ ${label}: ${measure.duration.toFixed(2)}ms`);
    } catch(e) {
      console.error('Measure error:', e);
    }
  },
  
  getReport() {
    return {
      metrics: this.metrics,
      totalTime: Object.values(this.metrics).reduce((a, b) => a + b, 0)
    };
  }
};

// ============= WEB WORKERS (For Heavy Operations) =============
function useWebWorker(scriptPath, data) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(scriptPath);
    worker.postMessage(data);
    worker.onmessage = (e) => {
      resolve(e.data);
      worker.terminate();
    };
    worker.onerror = reject;
  });
}

// ============= REQUEST BATCHING =============
const requestBatcher = {
  queue: [],
  batchTimer: null,
  batchSize: 10,
  batchDelay: 100,
  
  add(request) {
    this.queue.push(request);
    
    if(this.queue.length >= this.batchSize) {
      this.flush();
    } else if(!this.batchTimer) {
      this.batchTimer = setTimeout(() => this.flush(), this.batchDelay);
    }
  },
  
  async flush() {
    if(this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }
    
    const batch = [...this.queue];
    this.queue = [];
    
    if(batch.length === 0) return;
    
    try {
      // Process batch
      const results = await Promise.all(batch.map(req => req()));
      return results;
    } catch(error) {
      console.error('Batch error:', error);
    }
  }
};

// ============= EXPORT OPTIMIZATION TOOLS =============
window.performanceOptimizer = performanceOptimizer;
window.queryIndexes = queryIndexes;
window.paginator = paginator;
window.setupLazyLoadingTable = setupLazyLoadingTable;
window.optimizedSearch = optimizedSearch;
window.performanceMonitor = performanceMonitor;
window.debounce = debounce;
window.setupLazyLoadImages = setupLazyLoadImages;
window.batchLoadData = batchLoadData;
window.loadEmployeesOptimized = loadEmployeesOptimized;

console.log('ظ£à Performance Optimization Loaded');
