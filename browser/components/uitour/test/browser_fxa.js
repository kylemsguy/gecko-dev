/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

"use strict";

ChromeUtils.import("resource://services-sync/UIState.jsm");

ChromeUtils.defineModuleGetter(this, "fxAccounts",
                               "resource://gre/modules/FxAccounts.jsm");

var gTestTab;
var gContentAPI;
var gContentWindow;

function test() {
  UITourTest();
}

const oldState = UIState.get();
registerCleanupFunction(async function() {
  await signOut();
  gSync.updateAllUI(oldState);
});

var tests = [
  taskify(async function test_highlight_accountStatus_loggedOut() {
    let userData = await fxAccounts.getSignedInUser();
    is(userData, null, "Not logged in initially");
    await showMenuPromise("appMenu");
    await showHighlightPromise("accountStatus");
    let highlight = document.getElementById("UITourHighlightContainer");
    is(highlight.getAttribute("targetName"), "accountStatus", "Correct highlight target");
  }),

  taskify(async function test_highlight_accountStatus_loggedIn() {
    await setSignedInUser();
    let userData = await fxAccounts.getSignedInUser();
    isnot(userData, null, "Logged in now");
    gSync.updateAllUI({ status: UIState.STATUS_SIGNED_IN, lastSync: new Date(), email: "foo@example.com" });
    await showMenuPromise("appMenu");
    await showHighlightPromise("accountStatus");
    let highlight = document.getElementById("UITourHighlightContainer");
    let expectedTarget = "appMenu-fxa-avatar";
    is(highlight.popupBoxObject.anchorNode.id, expectedTarget, "Anchored on avatar");
    is(highlight.getAttribute("targetName"), "accountStatus", "Correct highlight target");
  }),
];

// Watch out - these will fire observers which if you aren't careful, may
// interfere with the tests.
function setSignedInUser(data) {
  if (!data) {
    data = {
      email: "foo@example.com",
      uid: "1234@lcip.org",
      assertion: "foobar",
      sessionToken: "dead",
      kSync: "beef",
      kXCS: "cafe",
      kExtSync: "bacon",
      kExtKbHash: "cheese",
      verified: true
    };
  }
 return fxAccounts.setSignedInUser(data);
}

function signOut() {
  // we always want a "localOnly" signout here...
  return fxAccounts.signOut(true);
}
