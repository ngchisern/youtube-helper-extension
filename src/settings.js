'use strict';

import './settings.css';

(function () {
    const languageStorage = {
        get: (cb) => {
            chrome.storage.sync.get(['language'], (result) => {
                cb(result.language);
            });
        },
        set: (value, cb) => {
            chrome.storage.sync.set(
                {
                    language: value,
                },
                () => {
                    cb();
                }
            );
        },
    };

    languageStorage.get((lang) => {
        if (typeof lang === 'undefined') {
            languageStorage.set('English', () => { });
            document.getElementById('languages').value = 'English';
        } else {
            document.getElementById('languages').value = lang;
        }
    })

    document.getElementById('submitBtn').addEventListener('click', () => {
        const sel = document.getElementById('languages');
        const language = sel.options[sel.selectedIndex].value;
        languageStorage.set(language, () => { });
    });
})();
