import { ref, computed } from 'vue';
import storage from '../utils/storage';

const _token = ref(storage.local.get('auth-token'));

export function useAuth() {
  const isLoggedIn = computed(() => !!_token.value);

  const updateToken = () => {
    _token.value = storage.local.get('auth-token');
  };

  const clearToken = () => {
    storage.local.remove('auth-token');
    _token.value = '';
  };

  return {
    token: _token,
    isLoggedIn,
    updateToken,
    clearToken,
  };
}
