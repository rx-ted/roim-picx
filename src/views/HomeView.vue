<template>
  <div class="min-h-[calc(100vh-64px)]">
    <!-- Hero -->
    <section class="relative overflow-hidden">
      <div
        class="absolute inset-0 bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/80 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950/30" />
      <div
        class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM0ZjQ2ZTUiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
      <div class="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-20 pb-24 sm:pt-28 sm:pb-32">
        <div class="text-center">
          <div class="flex items-center justify-center gap-3 mb-6">
            <img src="../assets/picx-logo.png" class="w-14 h-14 sm:w-16 sm:h-16 object-contain drop-shadow-md" />
          </div>
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
            <span
              class="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">{{
                $t('home.heroTitle') }}</span>
          </h1>
          <p class="mt-6 text-lg sm:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            {{ $t('home.heroSubtitle') }}
          </p>
          <div class="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 px-4">
            <router-link to="/up"
              class="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-base shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 transition-all hover:shadow-xl hover:-translate-y-0.5">
              <font-awesome-icon :icon="faCloudUploadAlt" />
              {{ $t('home.startUpload') }}
            </router-link>
            <router-link to="/manage"
              class="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-semibold text-base shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all hover:-translate-y-0.5">
              <font-awesome-icon :icon="faImage" />
              {{ $t('home.browseImages') }}
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="border-t border-gray-100 dark:border-gray-800">
      <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div class="text-center mb-16">
          <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">{{ $t('home.featuresTitle') }}
          </h2>
          <p class="mt-4 text-gray-500 dark:text-gray-400 max-w-xl mx-auto">{{ $t('home.featuresSubtitle') }}</p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div v-for="(feat, i) in features" :key="i"
            class="group relative bg-white dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 hover:border-indigo-200 dark:hover:border-indigo-800/50 shadow-sm hover:shadow-md transition-all duration-300">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-4 transition-colors"
              :class="feat.bgClass">
              <font-awesome-icon :icon="feat.icon" :class="feat.iconClass" />
            </div>
            <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">{{ feat.title }}</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{{ feat.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Data Usage -->
    <section class="border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
      <div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div class="text-center mb-12">
          <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">{{ $t('home.dataTitle') }}</h2>
          <p class="mt-4 text-gray-500 dark:text-gray-400 max-w-xl mx-auto">{{ $t('home.dataSubtitle') }}</p>
        </div>
        <div
          class="bg-white dark:bg-gray-800 rounded-2xl p-8 sm:p-10 border border-gray-100 dark:border-gray-700/50 shadow-sm">
          <ul class="space-y-6">
            <li v-for="(item, i) in dataItems" :key="i" class="flex gap-4">
              <div class="shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5" :class="item.iconBg">
                <font-awesome-icon :icon="item.icon" class="text-xs" :class="item.iconColor" />
              </div>
              <div>
                <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">{{ item.title }}</p>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{{ item.desc }}</p>
              </div>
            </li>
          </ul>
          <div class="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 text-center">
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ $t('home.dataMore') }}
              <router-link target="_blank" to="/privacy"
                class="text-indigo-600 dark:text-indigo-400 hover:underline font-medium inline-flex items-center gap-1">{{ $t('home.privacyLink')
                }}<font-awesome-icon :icon="faExternalLinkAlt" class="text-[10px] opacity-60" /></router-link>
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="border-t border-gray-100 dark:border-gray-800">
      <div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
        <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">{{ $t('home.ctaTitle') }}</h2>
        <p class="mt-4 text-gray-500 dark:text-gray-400 max-w-lg mx-auto">{{ $t('home.ctaSubtitle') }}</p>
        <div class="mt-8">
          <router-link to="/up"
            class="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-base shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 transition-all hover:shadow-xl hover:-translate-y-0.5">
            <font-awesome-icon :icon="faCloudUploadAlt" />
            {{ $t('home.startUpload') }}
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  faCloudUploadAlt,
  faImage,
  faUpload,
  faFolderOpen,
  faShareAlt,
  faPhotoFilm,
  faCheckCircle,
  faLock,
  faEnvelope,
  faExternalLinkAlt,
} from '@fortawesome/free-solid-svg-icons';

const { t } = useI18n();

const features = computed(() => [
  {
    icon: faUpload,
    title: t('home.featUploadTitle'),
    desc: t('home.featUploadDesc'),
    bgClass: 'bg-indigo-50 dark:bg-indigo-900/20',
    iconClass: 'text-indigo-600 dark:text-indigo-400',
  },
  {
    icon: faFolderOpen,
    title: t('home.featManageTitle'),
    desc: t('home.featManageDesc'),
    bgClass: 'bg-emerald-50 dark:bg-emerald-900/20',
    iconClass: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    icon: faShareAlt,
    title: t('home.featShareTitle'),
    desc: t('home.featShareDesc'),
    bgClass: 'bg-amber-50 dark:bg-amber-900/20',
    iconClass: 'text-amber-600 dark:text-amber-400',
  },
  {
    icon: faPhotoFilm,
    title: t('home.featAlbumTitle'),
    desc: t('home.featAlbumDesc'),
    bgClass: 'bg-rose-50 dark:bg-rose-900/20',
    iconClass: 'text-rose-600 dark:text-rose-400',
  },
]);

const dataItems = computed(() => [
  {
    icon: faCheckCircle,
    title: t('home.dataAuthTitle'),
    desc: t('home.dataAuthDesc'),
    iconBg: 'bg-indigo-100 dark:bg-indigo-900/30',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
  },
  {
    icon: faImage,
    title: t('home.dataImagesTitle'),
    desc: t('home.dataImagesDesc'),
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    icon: faLock,
    title: t('home.dataPrivacyTitle'),
    desc: t('home.dataPrivacyDesc'),
    iconBg: 'bg-amber-100 dark:bg-amber-900/30',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    icon: faEnvelope,
    title: t('home.dataContactTitle'),
    desc: t('home.dataContactDesc'),
    iconBg: 'bg-rose-100 dark:bg-rose-900/30',
    iconColor: 'text-rose-600 dark:text-rose-400',
  },
]);
</script>
