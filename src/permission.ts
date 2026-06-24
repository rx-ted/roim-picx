import router from './plugins/router';
import storage from './utils/storage';

router.beforeEach((to, from, next) => {
  const path = to.path;
  const token = storage.local.get('auth-token');
  // 不需要授权的页面
  if (
    path === '/' ||
    path === '/up' ||
    path === '/auth' ||
    path.startsWith('/delete') ||
    path.startsWith('/s/') ||
    to.meta.public
  ) {
    next();
    return;
  }
  if (!token) {
    router.push('/auth');
    return;
  }
  next();
});
