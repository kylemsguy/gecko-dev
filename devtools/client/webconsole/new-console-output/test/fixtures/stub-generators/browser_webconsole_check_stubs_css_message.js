/* -*- indent-tabs-mode: nil; js-indent-level: 2 -*- */
/* vim: set ft=javascript ts=2 et sw=2 tw=80: */
/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

"use strict";

ChromeUtils.import("resource://gre/modules/osfile.jsm", {});

add_task(async function() {
  let generatedStubs = await generateCssMessageStubs();

  let repoStubFilePath = getTestFilePath("../stubs/cssMessage.js");
  let repoStubFileContent = await OS.File.read(repoStubFilePath, { encoding: "utf-8" });

  if (generatedStubs != repoStubFileContent) {
    ok(false, "The cssMessage stubs file needs to be updated by running " +
      "`mach test devtools/client/webconsole/new-console-output/test/fixtures/" +
      "stub-generators/browser_webconsole_update_stubs_css_message.js`");
  } else {
    ok(true, "The cssMessage stubs file is up to date");
  }
});
