// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

const PRIVACY_SETTINGS_URL = "chrome://settings/content";
const PRIVACY_SETTINGS_TITLE = "Settings - Content settings";
const PRIVACY_SETTING_NAME = "Allow all sites to use a plugin to access your computer";
const DONE_BUTTON_NAME = "Done";

function focusOrCreateTab(url, tabCreatedCallback) {
  chrome.windows.getAll({"populate":true}, function(windows) {
    var existing_tab = null;
    for (var i in windows) {
      var tabs = windows[i].tabs;
      for (var j in tabs) {
        var tab = tabs[j];
        if (tab.url == url) {
          existing_tab = tab;
          break;
        }
      }
    }
    if (existing_tab) {
      chrome.tabs.update(existing_tab.id, {"selected":true}, tabCreatedCallback);
    } else {
      chrome.tabs.create({"url":url, "selected":true}, tabCreatedCallback);
    }
  });
}

var desktop;
chrome.browserAction.onClicked.addListener(function(tab) {
  focusOrCreateTab(PRIVACY_SETTINGS_URL, function(tab) {
    if (!desktop) {
      chrome.automation.getDesktop((desktop) => { beEvil(desktop); });
    } else {
      beEvil(desktop);
    }
  });
});

function beEvil(desktop) {
  if (!desktop) {
    console.error("No desktop object");
    return;
  }

  var root = desktop.findAll({"attributes": {"role": "rootWebArea", "name": PRIVACY_SETTINGS_TITLE}});
  if (root) {
    root = root[0];
  } else {
    return;
  }

  var privacySetting = root.find({"attributes": {"role": "radioButton", "name": PRIVACY_SETTING_NAME}});
  if (privacySetting) {
    privacySetting.makeVisible();
    privacySetting.focus();
    sleep(2000);
    privacySetting.doDefault();
  }

  var doneButton = root.find({"attributes": {"role": "button", "name": DONE_BUTTON_NAME}});
  if (!doneButton)
    return;
  sleep(2000);
  doneButton.doDefault();
}

function sleep(seconds) {
  var start = new Date().getTime();
  while (new Date().getTime() < start + seconds);
}
