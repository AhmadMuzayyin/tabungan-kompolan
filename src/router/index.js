// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import { auth, db } from '../firebase/config';
import { getDoc, doc } from 'firebase/firestore';

// Lazy loading untuk optimasi performa
const Home = () => import('../views/Home.vue');
const Login = () => import('../views/Login.vue');
const MemberDashboard = () => import('../views/member/Dashboard.vue');
const MemberDeposit = () => import('../views/member/Deposit.vue');
const MemberWithdraw = () => import('../views/member/Withdraw.vue');
const MemberHistory = () => import('../views/member/TransactionHistory.vue');
const MemberProfile = () => import('../views/member/Profile.vue');
const AdminDashboard = () => import('../views/admin/Dashboard.vue');
const AdminMembers = () => import('../views/admin/Members.vue');
const AdminApprovals = () => import('../views/admin/Approvals.vue');
const AdminReports = () => import('../views/admin/Reports.vue');
const AdminProfile = () => import('../views/admin/Profile.vue');
const AdminSettings = () => import('../views/admin/Settings.vue');
const NotFound = () => import('../views/NotFound.vue');

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresGuest: true }
  },
  {
    path: '/member',
    name: 'MemberDashboard',
    component: MemberDashboard,
    meta: { requiresAuth: true, role: 'member' }
  },
  {
    path: '/member/deposit',
    name: 'MemberDeposit',
    component: MemberDeposit,
    meta: { requiresAuth: true, role: 'member' }
  },
  {
    path: '/member/withdraw',
    name: 'MemberWithdraw',
    component: MemberWithdraw,
    meta: { requiresAuth: true, role: 'member' }
  },
  {
    path: '/member/history',
    name: 'MemberHistory',
    component: MemberHistory,
    meta: { requiresAuth: true, role: 'member' }
  },
  {
    path: '/member/profile',
    name: 'MemberProfile',
    component: MemberProfile,
    meta: { requiresAuth: true, role: 'member' }
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/members',
    name: 'AdminMembers',
    component: AdminMembers,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/approvals',
    name: 'AdminApprovals',
    component: AdminApprovals,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/reports',
    name: 'AdminReports',
    component: AdminReports,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/profile',
    name: 'AdminProfile',
    component: AdminProfile,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/settings',
    name: 'AdminSettings',
    component: AdminSettings,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Navigation Guards
router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest);
  const requiredRole = to.meta.role;

  // Tunggu Firebase Auth untuk menginisialisasi
  await new Promise(resolve => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      unsubscribe();
      resolve(user);
    });
  });

  const currentUser = auth.currentUser;
  let userRole = null;

  if (currentUser) {
    try {
      // Baca langsung dari Firestore untuk userRole
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        userRole = userDoc.data().role || 'member';
        console.log("User role from Firestore:", userRole);
      } else {
        userRole = 'member';
      }
    } catch (error) {
      console.error('Error getting user role:', error);
      userRole = 'member';
    }
  }

  if (requiresAuth && !currentUser) {
    next({ name: 'Login' });
  } else if (requiresGuest && currentUser) {
    if (userRole === 'admin') {
      next({ name: 'AdminDashboard' });
    } else {
      next({ name: 'MemberDashboard' });
    }
  } else if (requiredRole && userRole !== requiredRole) {
    // Redirect ke halaman yang sesuai dengan role
    if (userRole === 'admin') {
      next({ name: 'AdminDashboard' });
    } else if (userRole === 'member') {
      next({ name: 'MemberDashboard' });
    } else {
      next({ name: 'Login' });
    }
  } else {
    next();
  }
});

export default router;