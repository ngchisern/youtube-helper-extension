'use strict';

import './popup.css';
import CHAT_URL from './constants.js';

(function () {
  // We will make use of Storage API to get and store `count` value
  // More information on Storage API can we found at
  // https://developer.chrome.com/extensions/storage

  // To get storage access, we have to mention it in `permissions` property of manifest.json file
  // More information on Permissions can we found at
  // https://developer.chrome.com/extensions/declare_permissions
  // const counterStorage = {
  //   get: (cb) => {
  //     chrome.storage.sync.get(['count'], (result) => {
  //       cb(result.count);
  //     });
  //   },
  //   set: (value, cb) => {
  //     chrome.storage.sync.set(
  //       {
  //         count: value,
  //       },
  //       () => {
  //         cb();
  //       }
  //     );
  //   },
  // };

  // function setupCounter(initialValue = 0) {
  //   document.getElementById('counter').innerHTML = initialValue;

  //   document.getElementById('incrementBtn').addEventListener('click', () => {
  //     updateCounter({
  //       type: 'INCREMENT',
  //     });
  //   });

  //   document.getElementById('decrementBtn').addEventListener('click', () => {
  //     updateCounter({
  //       type: 'DECREMENT',
  //     });
  //   });
  // }

  // function updateCounter({ type }) {
  //   counterStorage.get((count) => {
  //     let newCount;

  //     if (type === 'INCREMENT') {
  //       newCount = count + 1;
  //     } else if (type === 'DECREMENT') {
  //       newCount = count - 1;
  //     } else {
  //       newCount = count;
  //     }

  //     counterStorage.set(newCount, () => {
  //       document.getElementById('counter').innerHTML = newCount;

  //       // Communicate with content script of
  //       // active tab by sending a message
  //       chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  //         const tab = tabs[0];

  //         chrome.tabs.sendMessage(
  //           tab.id,
  //           {
  //             type: 'COUNT',
  //             payload: {
  //               count: newCount,
  //             },
  //           },
  //           (response) => {
  //             console.log('Current count value passed to contentScript file');
  //           }
  //         );
  //       });
  //     });
  //   });
  // }

  // https://developer.chrome.com/docs/extensions/reference/tabs/#get-the-current-tab
  async function getCurrentTab() {
    let queryOptions = { active: true, lastFocusedWindow: true };
    // `tab` will either be a `tabs.Tab` instance or `undefined`.
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
  }

  async function checkYouTubeVideo() {
    // Check whether watching YouTube video
    console.log('checking YouTube Video');
    const queryOptions = { active: true, lastFocusedWindow: true };
    const tab = await getCurrentTab();
    const url = tab.url;
    if (url.startsWith('https://www.youtube.com/watch')) {
      console.log('is watching YouTube video');
      document.getElementById('status').innerText = 'Found YouTube Video'
    } else {
      console.log('not watching YouTube video');
      document.getElementById('status').innerText = 'Cannot find YouTube Video'
    }
  }

  async function checkLogin() {
    console.log('checking login');
    // Check whether already login to OpenAI
    var port = chrome.runtime.connect({});
    port.postMessage({ type: 'AUTHENTICATE' });
    port.onMessage.addListener(function (resp) {
      console.log(`Authenticated: ${resp.isAuthenticated}`);
      if (!resp.isAuthenticated) {
        document.getElementById('button').value = 'Login';
        document.getElementById('button').addEventListener('click', () => {
          window.open(CHAT_URL, '_blank');
          // chrome.tabs.create({ "url": CHAT_URL });
        });
      } else {
        summarize()  
      }
    })
  }

  async function check() {
    await checkYouTubeVideo();
    await checkLogin();
    // TODO summarize button
  }

  async function summarize() {
    const tab = await getCurrentTab();
    const url = tab.url;
    
    var port = chrome.runtime.connect({});
    port.postMessage({ type: 'SUMMARY', url: url });
    port.onMessage.addListener(function (resp) {
      console.log(resp.content)
    })
  }

  document.addEventListener('DOMContentLoaded', check);
})();
