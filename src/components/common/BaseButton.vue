<script setup lang="ts">
import { computed } from 'vue';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

interface Props {
  type?: 'primary' | 'secondary' | 'danger' | 'white' | 'indigo' | 'success' | 'warning'; // Add more as needed
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: any; // FontAwesome icon object
  block?: boolean;
  circle?: boolean;
  tip?: string;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'white',
  size: 'md',
  loading: false,
  disabled: false,
  block: false,
  circle: false,
});

const baseClasses = computed(() => {
  return [
    'font-medium transition-colors shadow-sm flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
    props.circle ? 'rounded-full p-0' : 'rounded-lg',
  ].join(' ');
});

const typeClasses = computed(() => {
  switch (props.type) {
    case 'primary': // Indigo
    case 'indigo':
      return 'bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500';
    case 'danger':
      return 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 focus:ring-red-500';
    case 'success':
      return 'bg-green-50 hover:bg-green-100 text-green-600 border border-green-200 focus:ring-green-500';
    case 'warning':
      return 'bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-200 focus:ring-amber-500';
    case 'secondary': // Gray/Light
      return 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 focus:ring-gray-500';
    case 'white':
    default:
      return 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-indigo-600 dark:hover:text-indigo-400 focus:ring-indigo-500';
  }
});

const sizeClasses = computed(() => {
  if (props.circle) {
    switch (props.size) {
      case 'sm':
        return 'w-8 h-8 text-xs';
      case 'lg':
        return 'w-12 h-12 text-lg';
      case 'md':
      default:
        return 'w-10 h-10 text-sm';
    }
  }
  switch (props.size) {
    case 'sm':
      return 'px-3 py-1.5 text-sm';
    case 'lg':
      return 'px-6 py-3 text-lg';
    case 'md':
    default:
      return 'px-4 py-2';
  }
});
</script>

<template>
  <button :class="[baseClasses, typeClasses, sizeClasses, { 'w-full': block }]" :disabled="disabled || loading"
    :tip="tip" class="tip-btn">
    <font-awesome-icon v-if="loading" :icon="faSpinner" spin />
    <font-awesome-icon v-else-if="icon" :icon="icon" />
    <slot />
  </button>
</template>


<style lang="css">
.tip-btn {
  position: relative;
  padding: 8px 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
}

.tip-btn[tip]:hover::after {
  content: attr(tip);
  position: absolute;
  bottom: 120%;
  left: 50%;
  transform: translateX(-50%);
  background: #333;
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  pointer-events: none;
}
</style>