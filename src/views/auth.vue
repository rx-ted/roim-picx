<template>
  <div class="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-950">
    <div v-if="isCallback" class="text-center">
      <font-awesome-icon :icon="faSpinner" spin class="text-3xl text-indigo-500" />
      <p class="mt-4 text-gray-500 dark:text-gray-400">{{ $t('auth.verifying') }}</p>
    </div>
    <div v-else class="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <LoginDialog @login-success="redirectAfterLogin" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';
import storage from '../utils/storage';
import { computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { requestGithubLogin } from '../utils/request';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import LoginDialog from '../components/LoginDialog.vue';

const router = useRouter();
const route = useRoute();

const isCallback = computed(
  () =>
    !!(
      route.query.code ||
      route.query.steam_token ||
      route.query.google_token ||
      route.query.error
    ),
);

const redirectAfterLogin = () => {
  const saved = sessionStorage.getItem('redirectAfterLogin');
  sessionStorage.removeItem('redirectAfterLogin');
  router.push(saved || '/');
};

onMounted(() => {
  const code = route.query.code as string;
  if (code) {
    requestGithubLogin(code)
      .then((res) => {
        storage.local.set('auth-token', res);
        ElMessage.success('GitHub 登录成功');
        redirectAfterLogin();
      })
      .catch((err) => {
        ElMessage.error(err.message || 'GitHub 登录失败');
      });
  }

  const steamToken = route.query.steam_token as string;
  const steamUserStr = route.query.steam_user as string;
  if (steamToken && steamUserStr) {
    try {
      const steamUser = JSON.parse(steamUserStr);
      storage.local.set('auth-token', { token: steamToken, user: steamUser });
      ElMessage.success('Steam 登录成功');
      redirectAfterLogin();
    } catch (e) {
      ElMessage.error('Steam 登录失败');
    }
  }

  const googleToken = route.query.google_token as string;
  const googleUserStr = route.query.google_user as string;
  if (googleToken && googleUserStr) {
    try {
      const googleUser = JSON.parse(googleUserStr);
      storage.local.set('auth-token', { token: googleToken, user: googleUser });
      ElMessage.success('Google 登录成功');
      redirectAfterLogin();
    } catch (e) {
      ElMessage.error('Google 登录失败');
    }
  }

  const authError = route.query.error as string;
  if (authError) {
    ElMessage.error(`登录失败: ${authError}`);
  }
});
</script>
