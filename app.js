if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js')
            .then((reg) => console.log('serviceworker registered', reg))
            .catch((err) => console.log('serviceworker registered unsuccessfully!', err))
            
    });
}