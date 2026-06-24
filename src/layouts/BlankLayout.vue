<script setup lang="ts">
import { MY_NAME, MY_REPO_LINK, ORIGINAL_REPO_LINK, ORIGINAL_REPO_NAME } from '../config';

// Blank layout - renders the router view with minimal chrome and footer
const repoName = 'roim-picx';
</script>

<template>
    <div class="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950">
        <!-- Main Content -->
        <div class="flex-1 w-full">
            <router-view />
        </div>

        <!-- Footer -->
        <div
            class="w-full py-4 border-t border-gray-200/50 dark:border-gray-800/50 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm mt-auto">
            <div
                class="max-w-7xl mx-auto flex flex-col items-center gap-2 text-gray-500 dark:text-gray-400 text-sm px-4">
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
                    <span class="mr-1">Powered by <a  target="_blank" :href="MY_REPO_LINK"  class="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors hover:underline">{{ MY_NAME }}</a> (· based on</span>
                    <a :href="ORIGINAL_REPO_LINK" target="_blank"
                        class="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors hover:underline">
                        {{ORIGINAL_REPO_NAME  }}
                    </a>
                    <span>)</span>
                </div>
            </div>
        </div>
    </div>
</template>
