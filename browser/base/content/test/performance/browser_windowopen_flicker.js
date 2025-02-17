/* Any copyright is dedicated to the Public Domain.
   http://creativecommons.org/publicdomain/zero/1.0/ */

"use strict";

/*
 * This test ensures that there is no unexpected flicker
 * when opening new windows.
 */

add_task(async function() {
  // Flushing all caches helps to ensure that we get consistent
  // behaviour when opening a new window, even if windows have been
  // opened in previous tests.
  Services.obs.notifyObservers(null, "startupcache-invalidate");
  Services.obs.notifyObservers(null, "chrome-flush-skin-caches");
  Services.obs.notifyObservers(null, "chrome-flush-caches");

  let win = window.openDialog("chrome://browser/content/", "_blank",
                              "chrome,all,dialog=no,remote,suppressanimation",
                              "about:home");

  // Avoid showing the remotecontrol UI.
  await new Promise(resolve => {
    win.addEventListener("DOMContentLoaded", () => {
      delete win.Marionette;
      win.Marionette = {running: false};
      resolve();
    }, {once: true});
  });

  let canvas = win.document.createElementNS("http://www.w3.org/1999/xhtml",
                                            "canvas");
  canvas.mozOpaque = true;
  let ctx = canvas.getContext("2d", {alpha: false, willReadFrequently: true});

  let frames = [];

  let afterPaintListener = event => {
    let width, height;
    canvas.width = width = win.innerWidth;
    canvas.height = height = win.innerHeight;
    ctx.drawWindow(win, 0, 0, width, height, "white",
                   ctx.DRAWWINDOW_DO_NOT_FLUSH | ctx.DRAWWINDOW_DRAW_VIEW |
                   ctx.DRAWWINDOW_ASYNC_DECODE_IMAGES |
                   ctx.DRAWWINDOW_USE_WIDGET_LAYERS);
    frames.push({data: Cu.cloneInto(ctx.getImageData(0, 0, width, height).data, {}),
                 width, height});
  };
  win.addEventListener("MozAfterPaint", afterPaintListener);

  await TestUtils.topicObserved("browser-delayed-startup-finished",
                                subject => subject == win);

  await BrowserTestUtils.firstBrowserLoaded(win, false);
  await BrowserTestUtils.browserStopped(win.gBrowser.selectedBrowser, "about:home");

  await new Promise(resolve => {
    // 10 is an arbitrary value here, it needs to be at least 2 to avoid
    // races with code initializing itself using idle callbacks.
    (function waitForIdle(count = 10) {
      if (!count) {
        resolve();
        return;
      }
      Services.tm.idleDispatchToMainThread(() => {
        waitForIdle(count - 1);
      });
    })();
  });
  win.removeEventListener("MozAfterPaint", afterPaintListener);

  let unexpectedRects = 0;
  let alreadyFocused = false;
  for (let i = 1; i < frames.length; ++i) {
    let frame = frames[i], previousFrame = frames[i - 1];
    let rects = compareFrames(frame, previousFrame);

    // The first screenshot we get in OSX / Windows shows an unfocused browser
    // window for some reason. See bug 1445161.
    //
    // We'll assume the changes we are seeing are due to this focus change if
    // there are at least 5 areas that changed near the top of the screen, but
    // will only ignore this once (hence the alreadyFocused variable).
    if (!alreadyFocused && rects.length > 5 && rects.every(r => r.y2 < 100)) {
      alreadyFocused = true;
      todo(false,
           "bug 1445161 - the window should be focused at first paint, " + rects.toSource());
      continue;
    }

    rects = rects.filter(rect => {
      let inRange = (val, min, max) => min <= val && val <= max;
      let width = frame.width;

      let exceptions = [
        {name: "bug 1421463 - reload toolbar icon shouldn't flicker",
         condition: r => r.h == 13 && inRange(r.w, 14, 16) && // icon size
                         inRange(r.y1, 40, 80) && // in the toolbar
                         // near the left side of the screen
                         // The reload icon is shifted on devedition builds
                         // where there's an additional devtools toolbar icon.
                         AppConstants.MOZ_DEV_EDITION ? inRange(r.x1, 100, 120) :
                                                        inRange(r.x1, 65, 100)
        },
      ];

      let rectText = `${rect.toSource()}, window width: ${width}`;
      for (let e of exceptions) {
        if (e.condition(rect)) {
          todo(false, e.name + ", " + rectText);
          return false;
        }
      }

      ok(false, "unexpected changed rect: " + rectText);
      return true;
    });
    if (!rects.length) {
      info("ignoring identical frame");
      continue;
    }

    // Before dumping a frame with unexpected differences for the first time,
    // ensure at least one previous frame has been logged so that it's possible
    // to see the differences when examining the log.
    if (!unexpectedRects) {
      dumpFrame(previousFrame);
    }
    unexpectedRects += rects.length;
    dumpFrame(frame);
  }
  is(unexpectedRects, 0, "should have 0 unknown flickering areas");

  await BrowserTestUtils.closeWindow(win);
});
