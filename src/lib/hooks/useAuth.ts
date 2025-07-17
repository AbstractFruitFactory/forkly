import { browser } from '$app/environment';
import { writable, derived } from 'svelte/store';
import { goto } from '$app/navigation';
import { page } from '$app/stores';

function createAuthStore() {
    const { subscribe, set } = writable<{
        isAuthenticated: boolean;
        isLoading: boolean;
    }>({
        isAuthenticated: false,
        isLoading: true
    });

    // Initialize the store
    if (browser) {
        const checkAuth = () => {
            const hasAuthCookie = document.cookie.includes('auth-session=');
            set({ isAuthenticated: hasAuthCookie, isLoading: false });
        };

        // Check initial state
        checkAuth();

        // Set up cookie change listener
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                checkAuth();
            }
        });
    }

    const logout = async () => {
        try {
            const response = await fetch('/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                set({ isAuthenticated: false, isLoading: false });
                goto('/login');
            }
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return {
        subscribe,
        logout
    };
}

export const auth = createAuthStore();

// Derived store that combines auth state with page data
export const authGuard = derived([auth, page], ([$auth, $page]) => {
    const publicRoutes = ['/login', '/signup'];
    const isPublicRoute = publicRoutes.some(route => $page.url.pathname.startsWith(route));

    // Redirect to login if not authenticated and not on a public route
    if (browser && !$auth.isLoading && !$auth.isAuthenticated && !isPublicRoute) {
        goto('/login');
    }

    // Redirect to home if authenticated and on a public route
    if (browser && !$auth.isLoading && $auth.isAuthenticated && isPublicRoute) {
        goto('/');
    }

    return {
        ...$auth,
        isPublicRoute
    };
}); 