/* -*- indent-tabs-mode: nil; js-indent-level: 2 -*- */
/* vim: set ft=javascript ts=2 et sw=2 tw=80: */
/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

"use strict";

// Common code shared by browser_toolbox_options_disable_cache-*.js
const TEST_URI = URL_ROOT + "browser_toolbox_options_disable_cache.sjs";
var tabs = [
  {
    title: "Tab 0",
    desc: "Toggles cache on.",
    startToolbox: true
  },
  {
    title: "Tab 1",
    desc: "Toolbox open before Tab 1 toggles cache.",
    startToolbox: true
  },
  {
    title: "Tab 2",
    desc: "Opens toolbox after Tab 1 has toggled cache. Also closes and opens.",
    startToolbox: false
  },
  {
    title: "Tab 3",
    desc: "No toolbox",
    startToolbox: false
  }];

async function initTab(tabX, startToolbox) {
  tabX.tab = await addTab(TEST_URI);
  tabX.target = TargetFactory.forTab(tabX.tab);

  if (startToolbox) {
    tabX.toolbox = await gDevTools.showToolbox(tabX.target, "options");
  }
}

async function checkCacheStateForAllTabs(states) {
  for (let i = 0; i < tabs.length; i++) {
    let tab = tabs[i];
    await checkCacheEnabled(tab, states[i]);
  }
}

async function checkCacheEnabled(tabX, expected) {
  gBrowser.selectedTab = tabX.tab;

  await reloadTab(tabX);

  let oldGuid = await ContentTask.spawn(gBrowser.selectedBrowser, {}, function () {
    let doc = content.document;
    let h1 = doc.querySelector("h1");
    return h1.textContent;
  });

  await reloadTab(tabX);

  let guid = await ContentTask.spawn(gBrowser.selectedBrowser, {}, function () {
    let doc = content.document;
    let h1 = doc.querySelector("h1");
    return h1.textContent;
  });

  if (expected) {
    is(guid, oldGuid, tabX.title + " cache is enabled");
  } else {
    isnot(guid, oldGuid, tabX.title + " cache is not enabled");
  }
}

async function setDisableCacheCheckboxChecked(tabX, state) {
  gBrowser.selectedTab = tabX.tab;

  let panel = tabX.toolbox.getCurrentPanel();
  let cbx = panel.panelDoc.getElementById("devtools-disable-cache");

  if (cbx.checked !== state) {
    info("Setting disable cache checkbox to " + state + " for " + tabX.title);
    cbx.click();

    // We need to wait for all checkboxes to be updated and the docshells to
    // apply the new cache settings.
    await waitForTick();
  }
}

function reloadTab(tabX) {
  let def = defer();
  let browser = gBrowser.selectedBrowser;

  BrowserTestUtils.browserLoaded(browser).then(function () {
    info("Reloaded tab " + tabX.title);
    def.resolve();
  });

  info("Reloading tab " + tabX.title);
  let mm = loadFrameScriptUtils();
  mm.sendAsyncMessage("devtools:test:reload");

  return def.promise;
}

async function destroyTab(tabX) {
  let toolbox = gDevTools.getToolbox(tabX.target);

  let onceDestroyed = promise.resolve();
  if (toolbox) {
    onceDestroyed = gDevTools.once("toolbox-destroyed");
  }

  info("Removing tab " + tabX.title);
  gBrowser.removeTab(tabX.tab);
  info("Removed tab " + tabX.title);

  info("Waiting for toolbox-destroyed");
  await onceDestroyed;
}

async function finishUp() {
  for (let tab of tabs) {
    await destroyTab(tab);
  }

  tabs = null;
}
