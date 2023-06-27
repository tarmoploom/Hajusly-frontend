import { createRouter, createWebHashHistory } from 'vue-router';
import Home from '@/views/HomeView.vue';
import { useAuthStore } from '@/store/authStore';

export const routes = [
  {
    meta: {
      title: 'Log in',
    },
    path: '/',
    name: '',
    component: () => import('@/views/LoginView.vue'),
  },
  {
    meta: {
      title: 'register',
    },
    path: '/register',
    name: 'register',
    component: () => import('@/views/RegisterView.vue'),
  },
  {
    // Document title tag
    // We combine it with defaultDocumentTitle set in `src/main.js` on router.afterEach hook
    meta: {
      title: 'Dashboard',
      requiresAuth: true,
    },
    path: '/dashboard',
    name: 'dashboard',
    component: Home,
  },
  {
    meta: {
      title: 'resultlist',
      requiresAuth: true,
    },
    path: '/resultlist/:courseIdProp/:rootModuleIdProp',
    name: 'resultlist',
    props: true,
    component: () => import('@/views/ResultList.vue'),
  },
  {
    meta: {
      title: 'Profile',
      requiresAuth: true,
    },
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/ProfileView.vue'),
  },
  {
    meta: {
      title: 'Add Student',
      requiresAuth: true,
    },
    path: '/addStudent',
    name: 'addStudent',
    component: () => import('@/views/AddStudentView.vue'),
  },
  {
    meta: {
      title: 'Messages',
      requiresAuth: true,
    },
    path: '/messages',
    name: 'messages',
    component: () => import('@/views/MessagesView.vue'),
  },
  {
    meta: {
      title: 'Create Course',
      requiresAuth: true,
    },
    path: '/createCourse',
    name: 'createCourse',
    component: () => import('@/views/CreateCourseView.vue'),
  },
  {
    meta: {
      title: 'Add Module',
      requiresAuth: true,
    },
    path: '/addModule/:courseId/:parentId',
    name: 'addModule',
    component: () => import('@/views/AddModuleView.vue'),
  },
  {
    meta: {
      title: 'Edit Module',
      requiresAuth: true,
    },
    path: '/editModule/:courseId/:parentId',
    name: 'editModule',
    component: () => import('@/views/AddModuleView.vue'),
  },
  {
    meta: {
      title: 'Example Course',
      requiresAuth: true,
    },
    path: '/course/:id',
    name: 'courseView',
    component: () => import('@/views/CourseView.vue'),
  },
  {
    meta: {
      title: 'Edit Students',
      requiresAuth: true,
    },
    path: '/editStudents/',
    name: 'editStudents',
    component: () => import('@/views/ManageCourseStudentsView.vue'),
  },
  {
    meta: {
      title: 'Manage Students',
      requiresAuth: true,
    },
    path: '/manageStudents/:courseId/:parentId',
    name: 'manageStudents',
    props: true,
    component: () => import('@/views/ManageCourseStudentsView.vue'),
  },
  {
    meta: {
      title: 'My Results',
      requiresAuth: false,
    },
    path: '/myresults/:id',
    name: 'myresults',
    component: () => import('@/views/StudentPublicView.vue'),
  },
  {
    meta: {
      title: 'Edit Course Tags',
      requiresAuth: true,
    },
    path: '/editCourseTags/:courseId/:parentId',
    name: 'editCourseTags',
    component: () => import('@/views/EditCourseTagsView.vue'),
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0 };
  },
});

// TODO: uncomment for demo
// NOTICE: disabling rn, annoying if not saved to cookie
router.beforeEach(async (to) => {
  const useAuth = useAuthStore();
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!useAuth.isAuthenticated) {
      return '/';
    }
  }
});

router.afterEach((to, from) => {
  const match = to.path.match(/\/(course|resultlist)\/(\d+)\/?(null)?$/);

  if (match) {
    // Save the last parameter to local storage
    localStorage.setItem('lastVisitedCourse', match[2]);
  }
});

export default router;
