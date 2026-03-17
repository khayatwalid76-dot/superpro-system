// ============================================
// ENHANCED AUTHENTICATION SYSTEM
// SuperPro System v2 with Firebase Auth
// ============================================

// Ensure currentUser is defined globally
if(typeof currentUser === 'undefined') {
  window.currentUser = null;
}

// ============= FIREBASE AUTHENTICATION SETUP =============
const authConfig = {
  enabled: true,
  providers: {
    email: true,
    phone: false,
    social: false
  }
};

// Initialize Firebase Authentication
async function initializeAuth() {
  try {
    const auth = getAuth();
    
    // Persist auth state (optional - skip if not available)
    try {
      if(typeof setPersistence !== 'undefined') {
        // Browser local persistence not available in all environments
        console.log('⚠️ setPersistence not available, using default persistence');
      }
    } catch(e) {
      console.warn('⚠️ Persistence config skipped:', e);
    }
    
    // Monitor auth state changes
    onAuthStateChanged(auth, (user) => {
      if(user) {
        console.log('ظ£à User authenticated:', user.email);
        loadUserProfile(user.uid);
      } else {
        console.log('ظإî User not authenticated');
        currentUser = null;
      }
    });
    
    console.log('ظ£à Firebase Auth initialized');
    return true;
  } catch(error) {
    console.error('ظإî Auth initialization error:', error);
    return false;
  }
}

// ============= REGISTRATION SYSTEM =============
async function registerUser(email, password, name, role = 'viewer') {
  try {
    const auth = getAuth();
    
    // Validate inputs
    if(!email || !password || !name) {
      showToast('┘è╪▒╪ش┘ë ┘à┘╪ة ╪ش┘à┘è╪╣ ╪د┘╪ص┘é┘ê┘ ╪د┘┘à╪╖┘┘ê╪ذ╪ر', 'error');
      return false;
    }
    
    if(password.length < 6) {
      showToast('┘â┘┘à╪ر ╪د┘┘à╪▒┘ê╪▒ ┘è╪ش╪ذ ╪ث┘ ╪ز┘â┘ê┘ 6 ╪ث╪ص╪▒┘ ╪╣┘┘ë ╪د┘╪ث┘é┘', 'error');
      return false;
    }
    
    // Create user account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;
    
    // Update profile
    await updateProfile(userCredential.user, {
      displayName: name
    });
    
    // Save user data to Firebase
    const db = getDatabase();
    const userRef = ref(db, `users/${uid}`);
    await set(userRef, {
      email: email,
      name: name,
      role: role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      status: '┘╪┤╪╖'
    });
    
    showToast('ظ£à ╪ز┘à ╪د┘╪ز╪│╪ش┘è┘ ╪ذ┘╪ش╪د╪ص!', 'success');
    return true;
  } catch(error) {
    console.error('Registration error:', error);
    
    if(error.code === 'auth/email-already-in-use') {
      showToast('╪د┘╪ذ╪▒┘è╪» ╪د┘╪ح┘┘â╪ز╪▒┘ê┘┘è ┘à╪│╪ز╪«╪»┘à ╪ذ╪د┘┘╪╣┘', 'error');
    } else if(error.code === 'auth/weak-password') {
      showToast('┘â┘┘à╪ر ╪د┘┘à╪▒┘ê╪▒ ╪╢╪╣┘è┘╪ر ╪ش╪»╪د┘ï', 'error');
    } else if(error.code === 'auth/invalid-email') {
      showToast('╪د┘╪ذ╪▒┘è╪» ╪د┘╪ح┘┘â╪ز╪▒┘ê┘┘è ╪║┘è╪▒ ╪╡╪ص┘è╪ص', 'error');
    } else {
      showToast(`╪«╪╖╪ث: ${error.message}`, 'error');
    }
    return false;
  }
}

// ============= ENHANCED LOGIN SYSTEM =============
async function enhancedLogin(email, password) {
  try {
    const auth = getAuth();
    
    // Sign in with email and password
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Load user profile
    await loadUserProfile(user.uid);
    
    // Update last login
    const db = getDatabase();
    const userRef = ref(db, `users/${user.uid}`);
    await update(userRef, {
      lastLogin: new Date().toISOString()
    });
    
    // Log activity
    await logActivity('login', `╪ز╪│╪ش┘è┘ ╪»╪«┘ê┘ ╪ذ┘╪ش╪د╪ص - ${user.email}`);
    
    showToast('ظ£à ╪ز┘à ╪ز╪│╪ش┘è┘ ╪د┘╪»╪«┘ê┘ ╪ذ┘╪ش╪د╪ص!', 'success');
    return true;
  } catch(error) {
    console.error('Login error:', error);
    
    if(error.code === 'auth/user-not-found') {
      showToast('╪د┘╪ذ╪▒┘è╪» ╪د┘╪ح┘┘â╪ز╪▒┘ê┘┘è ╪║┘è╪▒ ┘à╪│╪ش┘', 'error');
    } else if(error.code === 'auth/wrong-password') {
      showToast('┘â┘┘à╪ر ╪د┘┘à╪▒┘ê╪▒ ╪║┘è╪▒ ╪╡╪ص┘è╪ص╪ر', 'error');
    } else if(error.code === 'auth/invalid-email') {
      showToast('╪د┘╪ذ╪▒┘è╪» ╪د┘╪ح┘┘â╪ز╪▒┘ê┘┘è ╪║┘è╪▒ ╪╡╪ص┘è╪ص', 'error');
    } else if(error.code === 'auth/too-many-requests') {
      showToast('┘à╪ص╪د┘ê┘╪د╪ز ┘à╪ز┘â╪▒╪▒╪ر - ╪ص╪د┘ê┘ ┘╪د╪ص┘é╪د┘ï', 'error');
    } else {
      showToast(`╪«╪╖╪ث: ${error.message}`, 'error');
    }
    return false;
  }
}

// ============= LOAD USER PROFILE =============
async function loadUserProfile(uid) {
  try {
    const db = getDatabase();
    const userRef = ref(db, `users/${uid}`);
    const snapshot = await get(userRef);
    
    if(snapshot.exists()) {
      const userData = snapshot.val();
      currentUser = {
        uid: uid,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        createdAt: userData.createdAt,
        lastLogin: userData.lastLogin,
        status: userData.status
      };
      
      // Update UI
      updateUserInfo();
      return true;
    }
    return false;
  } catch(error) {
    console.error('Profile load error:', error);
    return false;
  }
}

// ============= PASSWORD RESET =============
async function resetPassword(email) {
  try {
    const auth = getAuth();
    await sendPasswordResetEmail(auth, email);
    showToast('ظ£à ╪ز┘à ╪ح╪▒╪│╪د┘ ╪▒╪د╪ذ╪╖ ╪ح╪╣╪د╪»╪ر ╪ز╪╣┘è┘è┘ ┘â┘┘à╪ر ╪د┘┘à╪▒┘ê╪▒ ╪ح┘┘ë ╪ذ╪▒┘è╪»┘â', 'success');
    return true;
  } catch(error) {
    console.error('Reset password error:', error);
    
    if(error.code === 'auth/user-not-found') {
      showToast('╪د┘╪ذ╪▒┘è╪» ╪د┘╪ح┘┘â╪ز╪▒┘ê┘┘è ╪║┘è╪▒ ┘à╪│╪ش┘', 'error');
    } else {
      showToast(`╪«╪╖╪ث: ${error.message}`, 'error');
    }
    return false;
  }
}

// ============= LOGOUT =============
async function logout() {
  try {
    const auth = getAuth();
    
    // Log activity
    await logActivity('logout', '╪ز╪│╪ش┘è┘ ╪«╪▒┘ê╪ش');
    
    // Sign out
    await signOut(auth);
    
    // Clear UI
    currentUser = null;
    document.getElementById('appWrapper').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'flex';
    
    showToast('ظ£à ╪ز┘à ╪ز╪│╪ش┘è┘ ╪د┘╪«╪▒┘ê╪ش ╪ذ┘╪ش╪د╪ص', 'success');
    return true;
  } catch(error) {
    console.error('Logout error:', error);
    showToast('╪«╪╖╪ث ┘┘è ╪ز╪│╪ش┘è┘ ╪د┘╪«╪▒┘ê╪ش', 'error');
    return false;
  }
}

// ============= CHANGE PASSWORD =============
async function changePassword(oldPassword, newPassword) {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if(!user) {
      showToast('┘è╪ش╪ذ ╪ز╪│╪ش┘è┘ ╪د┘╪»╪«┘ê┘ ╪ث┘ê┘╪د┘ï', 'error');
      return false;
    }
    
    // Re-authenticate user
    const credential = EmailAuthProvider.credential(user.email, oldPassword);
    await reauthenticateWithCredential(user, credential);
    
    // Update password
    await updatePassword(user, newPassword);
    
    // Log activity
    await logActivity('password_change', '╪ز╪║┘è┘è╪▒ ┘â┘┘à╪ر ╪د┘┘à╪▒┘ê╪▒');
    
    showToast('ظ£à ╪ز┘à ╪ز╪║┘è┘è╪▒ ┘â┘┘à╪ر ╪د┘┘à╪▒┘ê╪▒ ╪ذ┘╪ش╪د╪ص', 'success');
    return true;
  } catch(error) {
    console.error('Change password error:', error);
    
    if(error.code === 'auth/wrong-password') {
      showToast('┘â┘┘à╪ر ╪د┘┘à╪▒┘ê╪▒ ╪د┘╪ص╪د┘┘è╪ر ╪║┘è╪▒ ╪╡╪ص┘è╪ص╪ر', 'error');
    } else {
      showToast(`╪«╪╖╪ث: ${error.message}`, 'error');
    }
    return false;
  }
}

// ============= ROLE MANAGEMENT =============
async function updateUserRole(uid, newRole) {
  try {
    // Only admins can update roles
    if(currentUser.role !== 'admin') {
      showToast('┘┘è╪│ ┘╪»┘è┘â ╪د┘╪╡┘╪د╪ص┘è╪د╪ز ╪د┘┘╪د╪▓┘à╪ر', 'error');
      return false;
    }
    
    const db = getDatabase();
    const userRef = ref(db, `users/${uid}`);
    await update(userRef, {
      role: newRole,
      updatedAt: new Date().toISOString()
    });
    
    await logActivity('role_update', `╪ز╪ص╪»┘è╪س ╪»┘ê╪▒ ╪د┘┘à╪│╪ز╪«╪»┘à ╪ح┘┘ë ${newRole}`);
    showToast('ظ£à ╪ز┘à ╪ز╪ص╪»┘è╪س ╪د┘╪»┘ê╪▒ ╪ذ┘╪ش╪د╪ص', 'success');
    return true;
  } catch(error) {
    console.error('Role update error:', error);
    showToast('╪«╪╖╪ث ┘┘è ╪ز╪ص╪»┘è╪س ╪د┘╪»┘ê╪▒', 'error');
    return false;
  }
}

// ============= ROLE CHECKING FUNCTIONS =============
function isAdmin() {
  return currentUser && currentUser.role === 'admin';
}

function isSupervisor() {
  return currentUser && (currentUser.role === 'admin' || currentUser.role === 'supervisor');
}

function canEdit(field = null) {
  return isSupervisor();
}

function canDelete(field = null) {
  return isAdmin();
}

function canViewFinancial() {
  return isSupervisor();
}

// ============= ACTIVITY LOGGING =============
async function logActivity(action, description) {
  try {
    if(!currentUser) return;
    
    const db = getDatabase();
    const activityRef = ref(db, `activityLog/${Date.now()}`);
    await set(activityRef, {
      userId: currentUser.uid,
      userEmail: currentUser.email,
      userName: currentUser.name,
      action: action,
      description: description,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      ipInfo: 'CLIENT_SIDE'
    });
  } catch(error) {
    console.error('Activity log error:', error);
  }
}

// ============= SESSION MANAGEMENT =============
const sessionManager = {
  timeout: 30 * 60 * 1000, // 30 minutes
  warningTime: 25 * 60 * 1000, // 25 minutes
  
  startWatcher() {
    let timeoutId;
    
    const resetTimeout = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        this.logout();
      }, this.timeout);
      
      // Show warning at 25 minutes
      setTimeout(() => {
        showToast('ظأبي╕ ╪│┘è┘╪ز┘ç┘è ╪د┘╪ز╪ص┘é┘é ┘à┘ ┘ç┘ê┘è╪ز┘â ╪«┘╪د┘ 5 ╪»┘é╪د╪خ┘é', 'warning');
      }, this.warningTime);
    };
    
    // Reset on user activity
    document.addEventListener('mousemove', resetTimeout);
    document.addEventListener('keypress', resetTimeout);
    document.addEventListener('click', resetTimeout);
    
    resetTimeout();
  },
  
  async logout() {
    showToast('╪د┘╪ز┘ç╪ز ╪ش┘╪│╪ز┘â ╪ذ╪│╪ذ╪ذ ╪╣╪»┘à ╪د┘┘╪┤╪د╪╖', 'warning');
    await logout();
  }
};

// ============= TWO-FACTOR AUTHENTICATION (FUTURE) =============
async function enable2FA(phoneNumber) {
  // Placeholder for 2FA implementation
  console.log('2FA feature coming soon');
  showToast('╪«╪د╪╡┘è╪ر ╪د┘┘à╪╡╪د╪»┘é╪ر ╪د┘╪س┘╪د╪خ┘è╪ر ┘é╪▒┘è╪ذ╪د┘ï', 'info');
}

// ============= PERMISSION MIDDLEWARE =============
function requireRole(requiredRole) {
  return function(fn) {
    return async function(...args) {
      if(!currentUser) {
        showToast('┘è╪ش╪ذ ╪ز╪│╪ش┘è┘ ╪د┘╪»╪«┘ê┘ ╪ث┘ê┘╪د┘ï', 'error');
        return;
      }
      
      const roles = {
        'admin': 3,
        'supervisor': 2,
        'viewer': 1
      };
      
      if(roles[currentUser.role] >= roles[requiredRole]) {
        return fn.apply(this, args);
      } else {
        showToast('┘┘è╪│ ┘╪»┘è┘â ╪╡┘╪د╪ص┘è╪د╪ز ┘â╪د┘┘è╪ر', 'error');
        return;
      }
    };
  };
}

// ============= INITIALIZE AUTH ON STARTUP =============
document.addEventListener('DOMContentLoaded', function() {
  initializeAuth();
  sessionManager.startWatcher();
});

// Export functions for use in app.js
window.registerUser = registerUser;
window.enhancedLogin = enhancedLogin;
window.logout = logout;
window.changePassword = changePassword;
window.resetPassword = resetPassword;
window.updateUserRole = updateUserRole;
window.isAdmin = isAdmin;
window.isSupervisor = isSupervisor;
window.canEdit = canEdit;
window.canDelete = canDelete;
window.canViewFinancial = canViewFinancial;
window.logActivity = logActivity;

console.log('ظ£à Enhanced Auth System Loaded');
