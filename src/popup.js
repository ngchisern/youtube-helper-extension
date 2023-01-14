'use strict';

import './popup.css';
import { CHAT_URL } from './constants';

(function () {
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
    const tab = await getCurrentTab();
    const url = tab.url;
    if (url.startsWith('https://www.youtube.com/watch')) {
      console.log('is watching YouTube video');
      document.getElementById('status').innerText = 'Found YouTube Video'
      return true;
    } else {
      console.log('not watching YouTube video');
      document.getElementById('status').innerText = 'Cannot find YouTube Video'
      return false;
    }
  }

  async function checkLogin() {
    // Check whether already login to OpenAI
    console.log('checking login');
    var port = chrome.runtime.connect({});
    port.postMessage({ type: 'AUTHENTICATE' });
    port.onMessage.addListener(function (resp) {
      console.log(`Authenticated: ${resp.isAuthenticated}`);
      if (!resp.isAuthenticated) {
        console.log(`not authenticated, opening CHAT_URL:${CHAT_URL}`);
        document.getElementById('button').innerHTML = 'Login';
        document.getElementById('button').addEventListener('click', () => {
          chrome.windows.create({
            url: CHAT_URL,
            type: "popup"
          }, function(win) {
            // close popup so that user needs to reopen after login
            // so that this script reruns to check login
            window.close();
          });
        });
      }
    })
  }

  async function check() {
    const isYouTubeVideo = await checkYouTubeVideo();
    await checkLogin();
    // TODO summarize button
  }

  document.addEventListener('DOMContentLoaded', check);
})();
