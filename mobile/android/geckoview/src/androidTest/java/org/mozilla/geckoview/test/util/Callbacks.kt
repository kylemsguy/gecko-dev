/* Any copyright is dedicated to the Public Domain.
   http://creativecommons.org/publicdomain/zero/1.0/ */

package org.mozilla.geckoview.test.util

import org.mozilla.geckoview.GeckoSession

class Callbacks private constructor() {
    object Default : All {
    }

    interface All : ContentDelegate, NavigationDelegate, PermissionDelegate, ProgressDelegate,
                    PromptDelegate, ScrollDelegate, TrackingProtectionDelegate {
    }

    interface ContentDelegate : GeckoSession.ContentDelegate {
        override fun onTitleChange(session: GeckoSession, title: String) {
        }

        override fun onFocusRequest(session: GeckoSession) {
        }

        override fun onCloseRequest(session: GeckoSession) {
        }

        override fun onFullScreen(session: GeckoSession, fullScreen: Boolean) {
        }

        override fun onContextMenu(session: GeckoSession, screenX: Int, screenY: Int, uri: String, elementType: Int, elementSrc: String) {
        }
    }

    interface NavigationDelegate : GeckoSession.NavigationDelegate {
        override fun onLocationChange(session: GeckoSession, url: String) {
        }

        override fun onCanGoBack(session: GeckoSession, canGoBack: Boolean) {
        }

        override fun onCanGoForward(session: GeckoSession, canGoForward: Boolean) {
        }

        override fun onLoadRequest(session: GeckoSession, uri: String, where: Int, response: GeckoSession.Response<Boolean>) {
            response.respond(false)
        }

        override fun onNewSession(session: GeckoSession, uri: String, response: GeckoSession.Response<GeckoSession>) {
            response.respond(null)
        }
    }

    interface PermissionDelegate : GeckoSession.PermissionDelegate {
        override fun onAndroidPermissionsRequest(session: GeckoSession, permissions: Array<out String>, callback: GeckoSession.PermissionDelegate.Callback) {
            callback.reject()
        }

        override fun onContentPermissionRequest(session: GeckoSession, uri: String, type: Int, access: String, callback: GeckoSession.PermissionDelegate.Callback) {
            callback.reject()
        }

        override fun onMediaPermissionRequest(session: GeckoSession, uri: String, video: Array<out GeckoSession.PermissionDelegate.MediaSource>, audio: Array<out GeckoSession.PermissionDelegate.MediaSource>, callback: GeckoSession.PermissionDelegate.MediaCallback) {
            callback.reject()
        }
    }

    interface ProgressDelegate : GeckoSession.ProgressDelegate {
        override fun onPageStart(session: GeckoSession, url: String) {
        }

        override fun onPageStop(session: GeckoSession, success: Boolean) {
        }

        override fun onSecurityChange(session: GeckoSession, securityInfo: GeckoSession.ProgressDelegate.SecurityInformation) {
        }
    }

    interface PromptDelegate : GeckoSession.PromptDelegate {
        override fun onAlert(session: GeckoSession, title: String, msg: String, callback: GeckoSession.PromptDelegate.AlertCallback) {
            callback.dismiss()
        }

        override fun onButtonPrompt(session: GeckoSession, title: String, msg: String, btnMsg: Array<out String>, callback: GeckoSession.PromptDelegate.ButtonCallback) {
            callback.dismiss()
        }

        override fun onTextPrompt(session: GeckoSession, title: String, msg: String, value: String, callback: GeckoSession.PromptDelegate.TextCallback) {
            callback.dismiss()
        }

        override fun onAuthPrompt(session: GeckoSession, title: String, msg: String, options: GeckoSession.PromptDelegate.AuthOptions, callback: GeckoSession.PromptDelegate.AuthCallback) {
            callback.dismiss()
        }

        override fun onChoicePrompt(session: GeckoSession, title: String, msg: String, type: Int, choices: Array<out GeckoSession.PromptDelegate.Choice>, callback: GeckoSession.PromptDelegate.ChoiceCallback) {
            callback.dismiss()
        }

        override fun onColorPrompt(session: GeckoSession, title: String, value: String, callback: GeckoSession.PromptDelegate.TextCallback) {
            callback.dismiss()
        }

        override fun onDateTimePrompt(session: GeckoSession, title: String, type: Int, value: String, min: String, max: String, callback: GeckoSession.PromptDelegate.TextCallback) {
            callback.dismiss()
        }

        override fun onFilePrompt(session: GeckoSession, title: String, type: Int, mimeTypes: Array<out String>, callback: GeckoSession.PromptDelegate.FileCallback) {
            callback.dismiss()
        }
    }

    interface ScrollDelegate : GeckoSession.ScrollDelegate {
        override fun onScrollChanged(session: GeckoSession, scrollX: Int, scrollY: Int) {
        }
    }

    interface TrackingProtectionDelegate : GeckoSession.TrackingProtectionDelegate {
        override fun onTrackerBlocked(session: GeckoSession, uri: String, categories: Int) {
        }
    }
}
