// Copyright (c) 2019 https://github.com/makitosan . All rights reserved.

chrome.app.runtime.onLaunched.addListener(
  function(launchData) {
    chrome.app.window.create(
      'index.html',
      {
        id: "window" ,
        height: 590,
        width: 590
      },
      function(win) {
        win.contentWindow.launchData = launchData;
      });
  });
