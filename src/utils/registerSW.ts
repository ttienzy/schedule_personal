export function registerServiceWorker() {
    // Temporarily disabled for build
    console.log('Service Worker registration disabled');
    return;

    /* eslint-disable no-unreachable */
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker
                .register('/sw.js')
                .then(() => {
                    // Service worker registered
                })
                .catch(() => {
                    // Service worker registration failed
                });
        });
    }
    /* eslint-enable no-unreachable */
}
