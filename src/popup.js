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

  let isYouTubeVideo = false;

  async function checkYouTubeVideo() {
    // Check whether watching YouTube video
    console.log('checking YouTube Video');
    const tab = await getCurrentTab();
    const url = tab.url;
    isYouTubeVideo = url.startsWith('https://www.youtube.com/watch');
    if (!isYouTubeVideo) {
      console.log('not watching YouTube video');
      document.getElementById('heading').innerText = 'Cannot find YouTube Video'
      document.getElementById('not_found_section').style.display = 'block';
    }
  }

  function setupBtn(id, onClick) {
    document.getElementById('btn_row').style.display = 'block';
    document.getElementById(id).style.display = 'inline-block';
    document.getElementById(id).addEventListener('click', onClick);
  }

  function hideBtn(id) {
    document.getElementById(id).style.display = 'none'
  }

  async function checkLogin() {
    // Check whether already login to OpenAI
    console.log('checking login');
    var port = chrome.runtime.connect({});
    port.postMessage({ type: 'AUTHENTICATE' });
    port.onMessage.addListener(function (resp) {
      console.log(`Authenticated: ${resp.isAuthenticated}`);
      if (!resp.isAuthenticated) {
        loginPage()
      } else if (isYouTubeVideo) {
        actionPage()
      } else {
        // keep button hidden
      }
    })
  }

  async function check() {
    await checkYouTubeVideo();
    await checkLogin();
  }

  async function loginPage() {
    document.getElementById('heading').innerText = `You're not logged in!`
    setupBtn('login', () => {
      chrome.windows.create({
        url: CHAT_URL,
        type: "popup"
      }, function (win) {
        // close popup so that user needs to reopen after login
        // so that this script reruns to check login
        window.close();
      })
    })
    hideBtn('summarize')
    hideBtn('translate')
  }

  async function actionPage() {
    document.getElementById('heading').innerText = 'Pick an action'
    setupBtn('summarize', () => {
      summarize();
    });
    setupBtn('translate', () => {
      translate();
    })
    hideBtn('login')
  }

  async function resultPage(heading) {
    document.getElementById('heading').innerText = heading
    document.getElementById('btn_row').style.display = 'none';
    document.getElementById('content_section').style.display = 'block';
    hideBtn('login')
    hideBtn('summarize')
    hideBtn('translate')
  }

  async function summarize() {
    const tab = await getCurrentTab();
    const url = tab.url;

    resultPage('Summary');
    var content = document.getElementById('content')
    content.style.textAlign = "left";

    content.innerText = "Waiting for response..."

    var port = chrome.runtime.connect({});
    port.postMessage({ type: 'SUMMARY', url: url });
    port.onMessage.addListener(function (resp) {
      content.innerText = resp.content
    })
  }

  async function translate() {
    const tab = await getCurrentTab();
    const url = tab.url;
    const language = 'English'

    resultPage('Translation')
    var content = document.getElementById('content');
    content.style.textAlign = "center";

    content.innerText = "Waiting for response..."

    var port = chrome.runtime.connect({});
    port.postMessage({ type: 'TRANSLATE', url: url, language: language });
    port.onMessage.addListener(function (resp) {
      content.innerText = resp.content
    })
  }

  document.addEventListener('DOMContentLoaded', check);
})();
