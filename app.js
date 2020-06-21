
function askPermission() {
    return new Promise(function (resolve, reject) {
        var permissionResult = Notification.requestPermission(function (result) {
            resolve(result);
        });
  
        if (permissionResult) {
            permissionResult.then(resolve, reject);
        }
    }).then(function (permissionResult) {
        if (permissionResult !== 'granted') {
            throw new Error('We weren\'t granted permission.');
        }
    });
}

if ('serviceWorker' in navigator && 'pushManager' in window) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js')
            .then(async (reg) => {
                console.log('serviceworker registered', reg);
                return Promise.all([reg, askPermission()]).then(result => {
                    let registion = result[0];
                    document.querySelector('#js-notification-btn').addEventListener('click', function () {
                        var title = 'PWA即学即用';
                        var options = {
                            body: '邀请你一起学习',
                            icon: 'icons/icon-48x48.png',
                            actions: [{
                                action: 'show-book',
                                title: '去看看'
                            }, {
                                action: 'contact-me',
                                title: '联系我'
                            }],
                            tag: 'pwa-starter',
                            renotify: true
                        };
                        registion.showNotification(title, options);
                    });
                });
            }).catch((err) => console.log('serviceworker registered unsuccessfully!', err))
    });

    navigator.serviceWorker.addEventListener('message', event => {
        let action = event.data;
        console.log(`${action}`);
        switch (action) {
            case 'show-book':
                location.href = 'https://book.douban.com/subject/20515024/';
                break;
            case 'contact-me':
                location.href = 'mailto:someone@sample.com';
                break;
            default:
                // document.querySelector('.panel').classList.add('show');
                break;
        }
    
    })
}