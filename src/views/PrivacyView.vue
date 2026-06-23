<template>
  <div class="mx-auto max-w-3xl my-8 px-4 sm:px-6 relative min-h-[60vh]">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">{{ $t('privacy.title') }}</h1>
      <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">{{ $t('privacy.lastUpdated', { date: formattedDate }) }}</p>
    </div>

    <div class="prose prose-gray dark:prose-invert max-w-none">
      <section class="mb-8">
        <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{{ $t('privacy.introTitle') }}</h2>
        <p class="text-gray-600 dark:text-gray-400 leading-relaxed">{{ $t('privacy.introContent', { siteName: SITE_NAME }) }}</p>
      </section>

      <section class="mb-8">
        <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{{ $t('privacy.dataCollectionTitle') }}</h2>
        <p class="text-gray-600 dark:text-gray-400 leading-relaxed mb-2">{{ $t('privacy.dataCollectionContent') }}</p>
        <ul class="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-1">
          <li>{{ $t('privacy.dataCollectionItem1') }}</li>
          <li>{{ $t('privacy.dataCollectionItem2') }}</li>
          <li>{{ $t('privacy.dataCollectionItem3') }}</li>
          <li>{{ $t('privacy.dataCollectionItem4') }}</li>
          <li>{{ $t('privacy.dataCollectionItem5') }}</li>
        </ul>
      </section>

      <section class="mb-8">
        <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{{ $t('privacy.dataUsageTitle') }}</h2>
        <p class="text-gray-600 dark:text-gray-400 leading-relaxed mb-2">{{ $t('privacy.dataUsageContent') }}</p>
        <ul class="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-1">
          <li>{{ $t('privacy.dataUsageItem1') }}</li>
          <li>{{ $t('privacy.dataUsageItem2') }}</li>
          <li>{{ $t('privacy.dataUsageItem3') }}</li>
          <li>{{ $t('privacy.dataUsageItem4') }}</li>
        </ul>
      </section>

      <section class="mb-8">
        <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{{ $t('privacy.cookiesTitle') }}</h2>
        <p class="text-gray-600 dark:text-gray-400 leading-relaxed">{{ $t('privacy.cookiesContent') }}</p>
      </section>

      <section class="mb-8">
        <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{{ $t('privacy.thirdPartyTitle') }}</h2>
        <p class="text-gray-600 dark:text-gray-400 leading-relaxed mb-2">{{ $t('privacy.thirdPartyContent') }}</p>
        <ul class="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-1">
          <li>{{ $t('privacy.thirdPartyItem1') }}</li>
          <li>{{ $t('privacy.thirdPartyItem2') }}</li>
          <li>{{ $t('privacy.thirdPartyItem3') }}</li>
          <li>{{ $t('privacy.thirdPartyItem4') }}</li>
        </ul>
      </section>

      <section class="mb-8">
        <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{{ $t('privacy.userRightsTitle') }}</h2>
        <p class="text-gray-600 dark:text-gray-400 leading-relaxed mb-2">{{ $t('privacy.userRightsContent') }}</p>
        <ul class="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-1">
          <li>{{ $t('privacy.userRightsItem1') }}</li>
          <li>{{ $t('privacy.userRightsItem2') }}</li>
          <li>{{ $t('privacy.userRightsItem3') }}</li>
          <li>{{ $t('privacy.userRightsItem4') }}</li>
          <li>{{ $t('privacy.userRightsItem5') }}</li>
        </ul>
      </section>

      <section class="mb-8">
        <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{{ $t('privacy.dataSecurityTitle') }}</h2>
        <p class="text-gray-600 dark:text-gray-400 leading-relaxed">{{ $t('privacy.dataSecurityContent') }}</p>
      </section>

      <section class="mb-8">
        <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{{ $t('privacy.policyChangesTitle') }}</h2>
        <p class="text-gray-600 dark:text-gray-400 leading-relaxed">{{ $t('privacy.policyChangesContent') }}</p>
      </section>

      <section class="mb-8">
        <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{{ $t('privacy.contactTitle') }}</h2>
        <p class="text-gray-600 dark:text-gray-400 leading-relaxed">{{ $t('privacy.contactContent') }}</p>
        <div class="text-gray-600 dark:text-gray-400 leading-relaxed mt-2 space-y-1">
          <div>
            <a :href="`mailto:${CONTACT_EMAIL}`" class="text-indigo-600 dark:text-indigo-400 hover:underline">{{ CONTACT_EMAIL }}</a>
          </div>
          <div>
            <a :href="ISSUES_URL" target="_blank" rel="noopener" class="text-indigo-600 dark:text-indigo-400 hover:underline">{{ ISSUES_URL }}</a>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
import { SITE_NAME, LAST_UPDATED, CONTACT_EMAIL, ISSUES_URL } from '../config'

const { locale } = useI18n()
const formattedDate = computed(() => {
  const d = new Date(LAST_UPDATED)
  return new Intl.DateTimeFormat(locale.value === 'zh-CN' ? 'zh-CN' : 'en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  }).format(d)
})
</script>
