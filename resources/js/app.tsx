import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../css/app.css';
import { initializeTheme } from './hooks/use-appearance';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <StrictMode>
                <App {...props} />
            </StrictMode>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();

// Register service worker only in production to avoid cache issues in development.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator
            .serviceWorker.register('/sw.js', {
                updateViaCache: 'none',
            })
            .then((registration) => {
                if (registration.waiting) {
                    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                }

                registration.addEventListener('updatefound', () => {
                    const installing = registration.installing;
                    if (!installing) return;

                    installing.addEventListener('statechange', () => {
                        if (
                            installing.state === 'installed' &&
                            navigator.serviceWorker.controller
                        ) {
                            installing.postMessage({ type: 'SKIP_WAITING' });
                        }
                    });
                });

                let hasRefreshed = false;
                navigator.serviceWorker.addEventListener('controllerchange', () => {
                    if (hasRefreshed) return;
                    hasRefreshed = true;
                    window.location.reload();
                });
            })
            .catch(() => {
                // ignore registration errors
            });
    });
}
