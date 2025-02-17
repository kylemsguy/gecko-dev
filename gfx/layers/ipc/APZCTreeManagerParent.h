/* -*- Mode: C++; tab-width: 8; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim: set ts=8 sts=2 et sw=2 tw=80: */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

#ifndef mozilla_layers_APZCTreeManagerParent_h
#define mozilla_layers_APZCTreeManagerParent_h

#include "mozilla/layers/PAPZCTreeManagerParent.h"

namespace mozilla {
namespace layers {

class APZCTreeManager;

class APZCTreeManagerParent
    : public PAPZCTreeManagerParent
{
public:

  explicit APZCTreeManagerParent(LayersId aLayersId, RefPtr<APZCTreeManager> aAPZCTreeManager);
  virtual ~APZCTreeManagerParent();

  LayersId GetLayersId() const { return mLayersId; }

  /**
   * Called when the layer tree that this protocol is connected to
   * is adopted by another compositor, and we need to switch APZCTreeManagers.
   */
  void ChildAdopted(RefPtr<APZCTreeManager> aAPZCTreeManager);

  mozilla::ipc::IPCResult
  RecvSetKeyboardMap(const KeyboardMap& aKeyboardMap) override;

  mozilla::ipc::IPCResult
  RecvZoomToRect(
          const ScrollableLayerGuid& aGuid,
          const CSSRect& aRect,
          const uint32_t& aFlags) override;

  mozilla::ipc::IPCResult
  RecvContentReceivedInputBlock(
          const uint64_t& aInputBlockId,
          const bool& aPreventDefault) override;

  mozilla::ipc::IPCResult
  RecvSetTargetAPZC(
          const uint64_t& aInputBlockId,
          nsTArray<ScrollableLayerGuid>&& aTargets) override;

  mozilla::ipc::IPCResult
  RecvUpdateZoomConstraints(
          const ScrollableLayerGuid& aGuid,
          const MaybeZoomConstraints& aConstraints) override;

  mozilla::ipc::IPCResult
  RecvSetDPI(const float& aDpiValue) override;

  mozilla::ipc::IPCResult
  RecvSetAllowedTouchBehavior(
          const uint64_t& aInputBlockId,
          nsTArray<TouchBehaviorFlags>&& aValues) override;

  mozilla::ipc::IPCResult
  RecvStartScrollbarDrag(
          const ScrollableLayerGuid& aGuid,
          const AsyncDragMetrics& aDragMetrics) override;

  mozilla::ipc::IPCResult
  RecvStartAutoscroll(
          const ScrollableLayerGuid& aGuid,
          const ScreenPoint& aAnchorLocation) override;

  mozilla::ipc::IPCResult
  RecvStopAutoscroll(const ScrollableLayerGuid& aGuid) override;

  mozilla::ipc::IPCResult
  RecvSetLongTapEnabled(const bool& aTapGestureEnabled) override;

  void
  ActorDestroy(ActorDestroyReason aWhy) override { }

private:
  LayersId mLayersId;
  RefPtr<APZCTreeManager> mTreeManager;
};

} // namespace layers
} // namespace mozilla

#endif // mozilla_layers_APZCTreeManagerParent_h
