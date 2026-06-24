<template>
  <div class="max-w-md w-full mx-auto">
    <div class="text-center">
      <div
        class="mx-auto h-16 w-16 bg-white dark:bg-gray-800 rounded-2xl shadow-xl flex items-center justify-center p-3 mb-6">
        <img src="../assets/picx-logo.png" class="h-full w-full object-contain" />
      </div>
      <h2 class="text-3xl font-extrabold text-gray-900 dark:text-gray-100">{{ dialog ? $t('auth.login') :
        $t('auth.welcome') }}</h2>
      <p v-if="authConfig.githubLoginEnabled || authConfig.steamLoginEnabled || authConfig.googleLoginEnabled"
        class="mt-2 text-sm text-gray-500 dark:text-gray-400">
        {{ $t('auth.githubHint') }}
      </p>
    </div>

    <div
      class="mt-8 bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl shadow-indigo-100/50 dark:shadow-none border border-gray-100 dark:border-gray-700">
      <div class="space-y-6">
        <!-- Token 登录 -->
        <template v-if="authConfig.allowTokenLogin">
          <div class="space-y-3">
            <BaseInput v-model="token" :type="showPassword ? 'text' : 'password'" required
              :placeholder="$t('auth.tokenPlaceholder')" @keyup.enter="saveToken">
              <template #prefix>
                <font-awesome-icon :icon="faLock" class="text-sm" />
              </template>
              <template #suffix>
                <button type="button" class="text-gray-400 hover:text-indigo-600 transition-colors"
                  @click="showPassword = !showPassword">
                  <font-awesome-icon :icon="showPassword ? faEyeSlash : faEye" class="text-sm" />
                </button>
              </template>
            </BaseInput>
          </div>

          <div>
            <BaseButton type="indigo" block @click="saveToken" :loading="loading" class="!py-4 !text-sm !font-bold">
              <font-awesome-icon v-if="!loading" :icon="faSignInAlt" class="mr-2" />
              {{ loading ? $t('auth.verifying') : $t('auth.login') }}
            </BaseButton>
          </div>
        </template>

        <!-- 分隔线 -->
        <div class="relative" v-if="authConfig.allowTokenLogin && authConfig.githubLoginEnabled">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-100 dark:border-gray-700"></div>
          </div>
          <div class="relative flex justify-center text-xs uppercase">
            <span class="px-3 bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 font-medium">{{
              $t('auth.orOther')
              }}</span>
          </div>
        </div>

        <!-- GitHub 登录 -->
        <div v-if="authConfig.githubLoginEnabled">
          <BaseButton block @click="loginWithGithub" :disabled="loading" class="!py-3.5 !font-bold">
            <font-awesome-icon :icon="faGithub" class="text-lg mr-2" />
            {{ $t('auth.githubLogin') }}
          </BaseButton>
        </div>

        <!-- Steam 登录 -->
        <div v-if="authConfig.steamLoginEnabled">
          <BaseButton block @click="loginWithSteam" :disabled="loading" class="!py-3.5 !font-bold">
            <font-awesome-icon :icon="faSteam" class="text-lg mr-2" />
            {{ $t('auth.steamLogin') }}
          </BaseButton>
        </div>

        <!-- Google 登录 -->
        <div v-if="authConfig.googleLoginEnabled">
          <BaseButton block @click="loginWithGoogle" :disabled="loading" class="!py-3.5 !font-bold">
            <font-awesome-icon :icon="faGoogle" class="text-lg text-red-500 mr-2" />
            {{ $t('auth.googleLogin') }}
          </BaseButton>
        </div>

        <!-- 无可用登录方式提示 -->
        <div
          v-if="!configLoading && !authConfig.allowTokenLogin && !authConfig.githubLoginEnabled && !authConfig.steamLoginEnabled && !authConfig.googleLoginEnabled"
          class="text-center text-sm text-red-500">
          {{ $t('auth.noLoginMethod') }}
        </div>

        <!-- Language & Theme Switchers -->
        <div class="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </div>

    <p class="text-center text-xs text-gray-400 dark:text-gray-500 mt-4" v-if="authConfig.allowTokenLogin">
      {{ $t('auth.noToken') }}
      <a :href="'mailto:' + CONTACT_EMAIL"
        class="font-bold text-indigo-500 hover:text-indigo-600 underline underline-offset-4">{{ CONTACT_EMAIL }}</a>
    </p>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';
import storage from '../utils/storage';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  checkToken,
  requestGithubLogin,
  requestAuthConfig,
  requestSteamLogin,
  type AuthConfig,
} from '../utils/request';
import { faLock, faEye, faEyeSlash, faSignInAlt } from '@fortawesome/free-solid-svg-icons';
import { faGithub, faSteam, faGoogle } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import BaseInput from './common/BaseInput.vue';
import BaseButton from './common/BaseButton.vue';
import LanguageSwitcher from './LanguageSwitcher.vue';
import ThemeToggle from './ThemeToggle.vue';
import { CONTACT_EMAIL } from '../config';

const props = withDefaults(
  defineProps<{
    dialog?: boolean;
  }>(),
  {
    dialog: false,
  },
);

const emit = defineEmits<{
  'login-success': [];
  close: [];
}>();

const token = ref('');
const loading = ref(false);
const showPassword = ref(false);
const router = useRouter();

const githubClientIdEnv = import.meta.env.VITE_GITHUB_CLIENT_ID;

const authConfig = ref<AuthConfig>({
  allowTokenLogin: true,
  githubLoginEnabled: !!githubClientIdEnv,
  steamLoginEnabled: false,
  googleLoginEnabled: false,
  storageProviders: [],
  defaultStorage: 'R2',
});
const configLoading = ref(true);

const saveToken = () => {
  loading.value = true;
  if (!token.value) {
    loading.value = false;
    ElMessage.error('请输入token');
    return;
  }
  checkToken({ token: token.value })
    .then((res) => {
      if (res && typeof res === 'object' && 'token' in res) {
        storage.local.set('auth-token', res);
        ElMessage.success('验证成功');
        emit('login-success');
      } else if (res === true) {
        storage.local.set('auth-token', token.value);
        ElMessage.success('验证成功');
        emit('login-success');
      } else {
        ElMessage.error('Token无效');
      }
    })
    .finally(() => {
      loading.value = false;
    });
};

const loginWithGithub = () => {
  const clientId = githubClientIdEnv;
  if (!clientId) {
    ElMessage.error('GitHub 登录未配置');
    return;
  }
  const redirectUri = `${window.location.origin}/auth`;
  window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=read:user`;
};

const loginWithSteam = async () => {
  loading.value = true;
  try {
    const res = await requestSteamLogin();
    if (res.authUrl) {
      window.location.href = res.authUrl;
    } else {
      ElMessage.error('Steam 登录未配置');
    }
  } catch (e) {
    ElMessage.error('Steam 登录失败');
  } finally {
    loading.value = false;
  }
};

const loginWithGoogle = () => {
  loading.value = true;
  window.location.href = `${window.location.origin}/rest/google/login`;
};

onMounted(async () => {
  try {
    const config = await requestAuthConfig();
    authConfig.value = config;
  } catch (e) {
    console.error('Failed to load auth config:', e);
  } finally {
    configLoading.value = false;
  }
});
</script>
