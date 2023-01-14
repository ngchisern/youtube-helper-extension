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
    if (isYouTubeVideo) {
      console.log('is watching YouTube video');
      document.getElementById('status').innerText = 'Found YouTube Video'
    } else {
      console.log('not watching YouTube video');
      document.getElementById('status').innerText = 'Cannot find YouTube Video'
    }
  }

  function setupLoginBtn() {
    document.getElementById('button').innerHTML = 'Login';
    document.getElementById('button').style.display = 'inline-block';
    document.getElementById('button').addEventListener('click', () => {
      chrome.windows.create({
        url: CHAT_URL,
        type: "popup"
      }, function (win) {
        // close popup so that user needs to reopen after login
        // so that this script reruns to check login
        window.close();
      });
    });
  }

  function setupSummaryBtn() {
    document.getElementById('button').innerHTML = 'Summarize';
    document.getElementById('button').style.display = 'inline-block';
    document.getElementById('button').addEventListener('click', () => {
      // TODO summarize
      hideButtons();
      summarize();
    });
  }

  async function checkLogin() {
    // Check whether already login to OpenAI
    console.log('checking login');
    var port = chrome.runtime.connect({});
    port.postMessage({ type: 'AUTHENTICATE' });
    port.onMessage.addListener(function (resp) {
      console.log(`Authenticated: ${resp.isAuthenticated}`);
      if (!resp.isAuthenticated) {
        setupLoginBtn();
      } else if (isYouTubeVideo) {
        setupSummaryBtn();
      } else {
        // keep button hidden
      }
    })
  }

  async function check() {
    await checkYouTubeVideo();
    await checkLogin();
  }

  async function hideButtons() {
    document.getElementById('button').style.display = 'none'
  }

  async function summarize() {
    const tab = await getCurrentTab();
    const url = tab.url;

    var subject = document.getElementById('subject')
  
    subject.innerText = "Waiting for response..."

    var port = chrome.runtime.connect({});
    port.postMessage({ type: 'SUMMARY', url: url });
    port.onMessage.addListener(function (resp) {
      subject.innerText = resp.content
    })
  }

  document.addEventListener('DOMContentLoaded', check);
})();
