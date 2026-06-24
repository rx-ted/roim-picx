<template>
  <div class="mx-auto max-w-3xl my-8 px-4 sm:px-6 relative min-h-[60vh]">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">{{ $t('terms.title') }}</h1>
      <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">{{ $t('terms.lastUpdated', { date: formattedDate }) }}</p>
    </div>

    <div class="prose prose-gray dark:prose-invert max-w-none">
      <section class="mb-8">
        <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{{ $t('terms.acceptanceTitle') }}</h2>
        <p class="text-gray-600 dark:text-gray-400 leading-relaxed">{{ $t('terms.acceptanceContent', { siteName: SITE_NAME }) }}</p>
      </section>

      <section class="mb-8">
        <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{{ $t('terms.serviceDescTitle') }}</h2>
        <p class="text-gray-600 dark:text-gray-400 leading-relaxed">{{ $t('terms.serviceDescContent', { siteName: SITE_NAME }) }}</p>
      </section>

      <section class="mb-8">
        <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{{ $t('terms.userObligationsTitle') }}</h2>
        <p class="text-gray-600 dark:text-gray-400 leading-relaxed mb-2">{{ $t('terms.userObligationsContent') }}</p>
        <ul class="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-1">
          <li>{{ $t('terms.userObligationsItem1') }}</li>
          <li>{{ $t('terms.userObligationsItem2') }}</li>
          <li>{{ $t('terms.userObligationsItem3') }}</li>
          <li>{{ $t('terms.userObligationsItem4') }}</li>
          <li>{{ $t('terms.userObligationsItem5') }}</li>
        </ul>
      </section>

      <section class="mb-8">
        <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{{ $t('terms.intellectualPropertyTitle') }}</h2>
        <p class="text-gray-600 dark:text-gray-400 leading-relaxed">{{ $t('terms.intellectualPropertyContent') }}</p>
      </section>

      <section class="mb-8">
        <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{{ $t('terms.disclaimerTitle') }}</h2>
        <p class="text-gray-600 dark:text-gray-400 leading-relaxed">{{ $t('terms.disclaimerContent') }}</p>
      </section>

      <section class="mb-8">
        <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{{ $t('terms.limitationTitle') }}</h2>
        <p class="text-gray-600 dark:text-gray-400 leading-relaxed">{{ $t('terms.limitationContent') }}</p>
      </section>

      <section class="mb-8">
        <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{{ $t('terms.terminationTitle') }}</h2>
        <p class="text-gray-600 dark:text-gray-400 leading-relaxed">{{ $t('terms.terminationContent') }}</p>
      </section>

      <section class="mb-8">
        <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{{ $t('terms.governingLawTitle') }}</h2>
        <p class="text-gray-600 dark:text-gray-400 leading-relaxed">{{ $t('terms.governingLawContent') }}</p>
      </section>

      <section class="mb-8">
        <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{{ $t('terms.changesTitle') }}</h2>
        <p class="text-gray-600 dark:text-gray-400 leading-relaxed">{{ $t('terms.changesContent') }}</p>
      </section>

      <section class="mb-8">
        <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{{ $t('terms.contactTitle') }}</h2>
        <p class="text-gray-600 dark:text-gray-400 leading-relaxed">{{ $t('terms.contactContent') }}</p>
        <div class="text-gray-600 dark:text-gray-400 leading-relaxed mt-2 space-y-1">
          <div>
            <a :href="`mailto:${CONTACT_EMAIL}`" class="text-indigo-600 dark:text-indigo-400 hover:underline">{{ CONTACT_EMAIL }}</a>
          </div>
          <div>
            <a :href="REPO_ISSUES_URL" target="_blank" rel="noopener" class="text-indigo-600 dark:text-indigo-400 hover:underline">{{ REPO_ISSUES_URL }}</a>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';
import { SITE_NAME, LAST_UPDATED, CONTACT_EMAIL, REPO_ISSUES_URL } from '../config';

const { locale } = useI18n();
const formattedDate = computed(() => {
  const d = new Date(LAST_UPDATED);
  return new Intl.DateTimeFormat(locale.value === 'zh-CN' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
});
</script>
