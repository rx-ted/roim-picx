<script setup lang="ts">
import {
  faCog,
  faUpload,
  faSignOutAlt,
  faUserCircle,
  faShieldAlt,
  faBars,
  faChevronRight,
  faShareAlt,
  faFolder,
  faHome,
} from '@fortawesome/free-solid-svg-icons';
import { useRouter, useRoute } from 'vue-router';
import {
  ElAvatar,
  ElDialog,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
  ElMessage,
  ElMessageBox,
} from 'element-plus';
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import storage from '../utils/storage';
import ThemeToggle from '../components/ThemeToggle.vue';
import LanguageSwitcher from '../components/LanguageSwitcher.vue';
import { parseUserFromToken } from '../utils/jwt';
import type { User } from '../utils/types';
import { requestCurrentUser } from '../utils/request';
import LoginDialog from '../components/LoginDialog.vue';
import { MY_NAME, MY_REPO_LINK, ORIGINAL_AUTHOR_NAME, ORIGINAL_REPO_LINK } from '../config';
import { useAuth } from '../composables/useAuth';

const { t } = useI18n();
const router = useRouter();
const route = useRoute();

const { token, updateToken, clearToken } = useAuth();
const currentUser = ref<User | null>(null);
const isAdmin = ref(false);

const publicRoutes = ['/', '/up', '/auth', '/privacy', '/terms'];

const updateUserInfo = async () => {
  const t = storage.local.get('auth-token');
  token.value = t;
  if (t) {
    const parsed = parseUserFromToken(t.token);
    if (!parsed) {
      clearToken();
      currentUser.value = null;
      isAdmin.value = false;
      return;
    }
    currentUser.value = parsed;
    // 公开页面不发起 API 验证（避免 401 触发拦截器跳转）
    if (publicRoutes.includes(route.path)) {
      isAdmin.value = false;
      return;
    }
    try {
      const userInfo = await requestCurrentUser();
      isAdmin.value = userInfo.role === 'admin' || userInfo.isAdmin === true;
    } catch {
      clearToken();
      currentUser.value = null;
      isAdmin.value = false;
    }
  } else {
    currentUser.value = null;
    isAdmin.value = false;
  }
};

watch(
  () => route.path,
  () => {
    updateUserInfo();
  },
);

const navItems = computed(() => {
  return [
    { path: '/', label: t('nav.home'), icon: faHome },
    { path: '/up', label: t('nav.upload'), icon: faUpload },
    { path: '/manage', label: t('nav.manage'), icon: faCog },
    { path: '/albums', label: t('nav.albums'), icon: faFolder },
    { path: '/shares', label: t('nav.myShares'), icon: faShareAlt },
  ];
});

onMounted(() => {
  updateUserInfo();
});

const handleNavClick = (item: any) => {
  router.push(item.path);
};

const showLoginDialog = ref(false);
const redirectPath = ref('/');

const onLoginSuccess = () => {
  showLoginDialog.value = false;
  updateToken();
  updateUserInfo();
  router.push(redirectPath.value);
};

const handleAdminClick = async () => {
  if (token.value) {
    router.push('/admin');
    return;
  }
  redirectPath.value = '/admin';
  showLoginDialog.value = true;
};

const openLogin = () => {
  redirectPath.value = route.path;
  showLoginDialog.value = true;
};

const handleCommand = (cmd: string) => {
  if (cmd === 'logout') {
    logout();
  } else if (cmd === '/admin') {
    handleAdminClick();
  } else {
    router.push(cmd);
  }
};

const logout = async () => {
  try {
    await ElMessageBox.confirm(t('nav.logoutConfirmMsg'), t('nav.logoutConfirmTitle'), {
      confirmButtonText: t('common.confirm'),
      cancelButtonText: t('common.cancel'),
      type: 'warning',
    });
    clearToken();
    currentUser.value = null;
    ElMessage.success(t('nav.logout'));
    router.push('/');
  } catch (e) {
    // User cancelled
  }
};
</script>

<template>
    <div class="flex flex-col min-h-screen">
        <!-- Header -->
        <div
            class="w-full h-16 bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/50 dark:border-gray-800/50 sticky left-0 top-0 backdrop-blur-md z-50 transition-all duration-300">
            <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
                <div class="flex items-center gap-3 cursor-pointer" @click="router.push('/')">
                    <img src="../assets/picx-logo.png" class="w-8 h-8 object-contain drop-shadow-sm" />
                </div>

                <div class="flex items-center gap-2">
                    <!-- Desktop Navigation -->
                    <div class="hidden md:flex items-center gap-2">
                        <div v-for="item in navItems" :key="item.path"
                            class="px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition-all duration-200 flex items-center gap-2"
                            :class="[
                                $route.path === item.path
                                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-indigo-200 dark:ring-indigo-800'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                            ]" @click="handleNavClick(item)">
                            <font-awesome-icon :icon="item.icon" />
                            <span>{{ item.label }}</span>
                        </div>
                    </div>

                    <!-- User Profile / Admin (Desktop Only) -->
                    <div v-if="token"
                        class="hidden md:flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-700 ml-2">
                        <el-dropdown trigger="click" @command="handleCommand">
                            <div class="flex items-center gap-2 group relative cursor-pointer">
                                <div class="relative">
                                    <el-avatar :size="32" :src="currentUser?.avatar_url"
                                        class="ring-2 ring-white dark:ring-gray-800 shadow-sm transition-transform group-hover:scale-105">
                                        <template #default>
                                            <font-awesome-icon :icon="faUserCircle" class="text-xl text-gray-400" />
                                        </template>
                                    </el-avatar>
                                    <span v-if="!currentUser"
                                        class="absolute -bottom-1 -right-1 w-3 h-3 bg-gray-400 rounded-full border-2 border-white dark:border-gray-800"
                                        title="Admin Token"></span>
                                    <span v-else
                                        class="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"
                                        title="Oauth"></span>
                                </div>
                                <div class="hidden lg:flex flex-col items-start leading-none gap-1">
                                    <span class="text-xs font-bold text-gray-700 dark:text-gray-200">{{
                                        currentUser?.name || 'Administrator' }}</span>
                                    <span class="text-[10px] text-gray-400 uppercase tracking-wider font-medium">{{
                                        currentUser ? 'Oauth' : 'System' }}</span>
                                </div>
                            </div>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item command="/admin">
                                        <div class="flex items-center gap-3">
                                            <font-awesome-icon :icon="faShieldAlt" class="w-4" />
                                            <span>{{ t('nav.admin') }}</span>
                                        </div>
                                    </el-dropdown-item>
                                    <el-dropdown-item command="logout" divided class="!text-red-500">
                                        <div class="flex items-center gap-3">
                                            <font-awesome-icon :icon="faSignOutAlt" class="w-4" />
                                            <span>{{ t('nav.logout') }}</span>
                                        </div>
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </div>
                    <div v-else
                        class="hidden md:flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-700 ml-2">
                        <div class="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors cursor-pointer"
                            @click="openLogin">
                            <font-awesome-icon :icon="faUserCircle" class="text-xl" />
                        </div>
                    </div>

                    <!-- Essential Actions (Theme, Language, Mobile Avatar) -->
                    <div
                        class="flex items-center gap-3 pl-2 sm:pl-4 border-l border-gray-200 dark:border-gray-700 ml-1 sm:ml-2">
                        <!-- Mobile Avatar (Hidden on Desktop) -->
                        <div v-if="token" class="md:hidden">
                            <el-avatar :size="28" :src="currentUser?.avatar_url">
                                <template #default>
                                    <font-awesome-icon :icon="faUserCircle" class="text-lg text-gray-400" />
                                </template>
                            </el-avatar>
                        </div>
                        <LanguageSwitcher />
                        <theme-toggle />
                    </div>

                    <!-- Mobile Menu Icon (Far Right) -->
                    <div class="md:hidden flex items-center border-l border-gray-200 dark:border-gray-700 pl-2">
                        <el-dropdown trigger="click" @command="handleCommand">
                            <div
                                class="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer">
                                <font-awesome-icon :icon="faBars" class="text-xl" />
                            </div>
                            <template #dropdown>
                                <el-dropdown-menu class="w-48">
                                    <el-dropdown-item v-for="item in navItems" :key="item.path" :command="item.path">
                                        <div class="flex items-center justify-between w-full py-1">
                                            <div class="flex items-center gap-3">
                                                <font-awesome-icon :icon="item.icon" class="w-4" />
                                                <span>{{ item.label }}</span>
                                            </div>
                                            <font-awesome-icon :icon="faChevronRight" class="text-[10px] opacity-30" />
                                        </div>
                                    </el-dropdown-item>
                                    <el-dropdown-item command="/admin">
                                        <div class="flex items-center justify-between w-full py-1">
                                            <div class="flex items-center gap-3">
                                                <font-awesome-icon :icon="faShieldAlt" class="w-4" />
                                                <span>{{ t('nav.admin') }}</span>
                                            </div>
                                            <font-awesome-icon :icon="faChevronRight" class="text-[10px] opacity-30" />
                                        </div>
                                    </el-dropdown-item>
                                    <el-dropdown-item v-if="token" divided command="logout" class="!text-red-500">
                                        <div class="flex items-center gap-3 py-1">
                                            <font-awesome-icon :icon="faSignOutAlt" class="w-4" />
                                            <span>{{ $t('nav.logout') }}</span>
                                        </div>
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </div>
                </div>
            </div>
        </div>

        <!-- Main Content -->
        <div class="flex-1 w-full min-h-[calc(100vh-64px-64px)]">
            <router-view />
        </div>

        <!-- Footer -->
        <div
            class="w-full py-6 border-t border-gray-200/50 dark:border-gray-800/50 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm mt-auto">
            <div class="max-w-7xl mx-auto flex flex-col items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                <div class="flex items-center gap-4">
                    <router-link to="/privacy"
                        class="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors hover:underline">
                        {{ $t('footer.privacy') }}
                    </router-link>
                    <router-link to="/terms"
                        class="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors hover:underline">
                        {{ $t('footer.terms') }}
                    </router-link>
                </div>
                <div class="flex items-center">
                    <span class="mr-1">Powered by </span>
                    <a :href="MY_REPO_LINK" target="_blank"
                        class="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors hover:underline">{{
                            MY_NAME }}</a> <span>&nbsp;(based on &nbsp;</span>
                    <a :href="ORIGINAL_REPO_LINK" target="_blank"
                        class="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors hover:underline">
                        {{ ORIGINAL_AUTHOR_NAME }}
                    </a>
                    <span>)</span>
                </div>
            </div>
        </div>

        <!-- Login Dialog -->
        <el-dialog v-model="showLoginDialog" :title="$t('auth.login')" width="420px" :close-on-click-modal="false"
            class="login-dialog" destroy-on-close>
            <LoginDialog :dialog="true" @login-success="onLoginSuccess" />
        </el-dialog>
    </div>
</template>
