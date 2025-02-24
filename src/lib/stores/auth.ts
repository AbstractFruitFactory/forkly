import { writable } from 'svelte/store'
import { browser } from '$app/environment'

function createAuthStore() {
    const { subscribe, set } = writable<{
        isAuthenticated: boolean;
        isLoading: boolean;
    }>({
        isAuthenticated: false,
        isLoading: true
    });

    if (browser) {
        // Check auth state when store is initialized
        const checkAuth = () => {
            const hasAuthCookie = document.cookie.includes('auth-session=');
            set({ isAuthenticated: hasAuthCookie, isLoading: false });
        };

        // Initial check
        checkAuth();

        // Check auth state when tab becomes visible
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                checkAuth();
            }
        });
    }

    return {
        subscribe,
        logout: async () => {
            try {
                const response = await fetch('/api/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    set({ isAuthenticated: false, isLoading: false });
                }
            } catch (error) {
                console.error('Logout failed:', error);
            }
        }
    };
}

export const auth = createAuthStore(); 