/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

"use strict";

// Test that temp permissions are persisted through moving tabs to new windows.
add_task(async function testTempPermissionOnTabMove() {
  let uri = NetUtil.newURI("https://example.com");
  let id = "geo";

  let tab = await BrowserTestUtils.openNewForegroundTab(gBrowser, uri.spec);

  SitePermissions.set(uri, id, SitePermissions.BLOCK, SitePermissions.SCOPE_TEMPORARY, tab.linkedBrowser);

  Assert.deepEqual(SitePermissions.get(uri, id, tab.linkedBrowser), {
    state: SitePermissions.BLOCK,
    scope: SitePermissions.SCOPE_TEMPORARY,
  });

  let promiseWin = BrowserTestUtils.waitForNewWindow();
  gBrowser.replaceTabWithWindow(tab);
  let win = await promiseWin;
  tab = win.gBrowser.selectedTab;

  Assert.deepEqual(SitePermissions.get(uri, id, tab.linkedBrowser), {
    state: SitePermissions.BLOCK,
    scope: SitePermissions.SCOPE_TEMPORARY,
  });

  SitePermissions.remove(uri, id, tab.linkedBrowser);
  await BrowserTestUtils.closeWindow(win);
});

// Test that temp permissions don't affect other tabs of the same URI.
add_task(async function testTempPermissionMultipleTabs() {
  let uri = NetUtil.newURI("https://example.com");
  let id = "geo";

  let tab1 = await BrowserTestUtils.openNewForegroundTab(gBrowser, uri.spec);
  let tab2 = await BrowserTestUtils.openNewForegroundTab(gBrowser, uri.spec);

  SitePermissions.set(uri, id, SitePermissions.BLOCK, SitePermissions.SCOPE_TEMPORARY, tab2.linkedBrowser);

  Assert.deepEqual(SitePermissions.get(uri, id, tab2.linkedBrowser), {
    state: SitePermissions.BLOCK,
    scope: SitePermissions.SCOPE_TEMPORARY,
  });

  Assert.deepEqual(SitePermissions.get(uri, id, tab1.linkedBrowser), {
    state: SitePermissions.UNKNOWN,
    scope: SitePermissions.SCOPE_PERSISTENT,
  });

  let geoIcon = document.querySelector(".blocked-permission-icon[data-permission-id=geo]");

  Assert.notEqual(geoIcon.boxObject.width, 0, "geo anchor should be visible");

  await BrowserTestUtils.switchTab(gBrowser, tab1);

  Assert.equal(geoIcon.boxObject.width, 0, "geo anchor should not be visible");

  SitePermissions.remove(uri, id, tab2.linkedBrowser);
  BrowserTestUtils.removeTab(tab1);
  BrowserTestUtils.removeTab(tab2);
});

