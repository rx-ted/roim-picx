<template>
  <div class="mx-auto max-w-3xl my-8 px-4 sm:px-6 relative min-h-[60vh]">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">{{ $t('terms.title') }}</h1>
      <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">{{ $t('terms.lastUpdated') }}</p>
    </div>

    <div class="prose prose-gray dark:prose-invert max-w-none">
      <section class="mb-8">
        <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{{ $t('terms.acceptanceTitle') }}</h2>
        <p class="text-gray-600 dark:text-gray-400 leading-relaxed">{{ $t('terms.acceptanceContent') }}</p>
      </section>

      <section class="mb-8">
        <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{{ $t('terms.serviceDescTitle') }}</h2>
        <p class="text-gray-600 dark:text-gray-400 leading-relaxed">{{ $t('terms.serviceDescContent') }}</p>
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
        <i18n-t keypath="terms.contactContent" tag="p" class="text-gray-600 dark:text-gray-400 leading-relaxed">
          <template #email>
            <a :href="`mailto:${email}`" class="text-indigo-600 dark:text-indigo-400 hover:underline">{{ email }}</a>
          </template>
          <template #url>
            <a :href="url" target="_blank" rel="noopener" class="text-indigo-600 dark:text-indigo-400 hover:underline">{{ url }}</a>
          </template>
        </i18n-t>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
const email = 'gjy.18sui@gmail.com'
const url = 'https://github.com/roimdev/roim-picx/issues'
</script>
