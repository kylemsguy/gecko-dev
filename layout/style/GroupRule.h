/* -*- Mode: C++; tab-width: 8; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim: set ts=8 sts=2 et sw=2 tw=80: */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*
 * internal interface representing CSS style rules that contain other
 * rules, such as @media rules
 */

#ifndef mozilla_css_GroupRule_h__
#define mozilla_css_GroupRule_h__

#include "mozilla/Attributes.h"
#include "mozilla/ErrorResult.h"
#include "mozilla/MemoryReporting.h"
#include "mozilla/ServoCSSRuleList.h"
#include "mozilla/Variant.h"
#include "mozilla/css/Rule.h"
#include "nsCycleCollectionParticipant.h"

class nsPresContext;
class nsMediaQueryResultCacheKey;

namespace mozilla {

class StyleSheet;

namespace dom {
class CSSRuleList;
} // namespace dom

namespace css {

class GroupRule;
class GroupRuleRuleList;


struct ServoGroupRuleRules
{
  explicit ServoGroupRuleRules(already_AddRefed<ServoCssRules> aRawRules)
    : mRuleList(new ServoCSSRuleList(Move(aRawRules), nullptr)) {}
  ServoGroupRuleRules(ServoGroupRuleRules&& aOther)
    : mRuleList(Move(aOther.mRuleList)) {}
  ServoGroupRuleRules(const ServoGroupRuleRules& aCopy) {
    // Do we ever clone Servo rules?
    MOZ_ASSERT_UNREACHABLE("stylo: Cloning GroupRule not implemented");
  }
  ~ServoGroupRuleRules();

  void SetParentRule(GroupRule* aParentRule) {
    if (mRuleList) {
      mRuleList->SetParentRule(aParentRule);
    }
  }
  void SetStyleSheet(StyleSheet* aSheet) {
    if (mRuleList) {
      mRuleList->SetStyleSheet(aSheet);
    }
  }

  void Clear() {
    if (mRuleList) {
      mRuleList->DropReference();
      mRuleList = nullptr;
    }
  }
  void Traverse(nsCycleCollectionTraversalCallback& cb) {
    ImplCycleCollectionTraverse(cb, mRuleList, "mRuleList");
  }

#ifdef DEBUG
  void List(FILE* out, int32_t aIndent) const;
#endif

  int32_t StyleRuleCount() const { return mRuleList->Length(); }
  Rule* GetStyleRuleAt(int32_t aIndex) const {
    return mRuleList->GetRule(aIndex);
  }

  nsresult DeleteStyleRuleAt(uint32_t aIndex) {
    return mRuleList->DeleteRule(aIndex);
  }

  dom::CSSRuleList* CssRules(GroupRule* aParentRule) {
    return mRuleList;
  }

  size_t SizeOfExcludingThis(MallocSizeOf aMallocSizeOf) const;

  RefPtr<ServoCSSRuleList> mRuleList;
};

struct DummyGroupRuleRules
{
  void SetParentRule(GroupRule* aParentRule) {}
  void SetStyleSheet(StyleSheet* aSheet) {}
  void Clear() {}
  void Traverse(nsCycleCollectionTraversalCallback& cb) {}
#ifdef DEBUG
  void List(FILE* out, int32_t aIndex) const {}
#endif
  int32_t StyleRuleCount() const { return 0; }
  Rule* GetStyleRuleAt(int32_t aIndex) const { return nullptr; }
  nsresult DeleteStyleRuleAt(uint32_t aIndex) { return NS_ERROR_NOT_IMPLEMENTED; }
  dom::CSSRuleList* CssRules(GroupRule* aParentRule) { return nullptr; }
  size_t SizeOfExcludingThis(MallocSizeOf aMallocSizeOf) const { return 0; }
};

#define REDIRECT_TO_INNER(call_)                   \
  if (mInner.is<DummyGroupRuleRules>()) {          \
    return mInner.as<DummyGroupRuleRules>().call_; \
  } else {                                         \
    return mInner.as<ServoGroupRuleRules>().call_; \
  }

// inherits from Rule so it can be shared between
// MediaRule and DocumentRule
class GroupRule : public Rule
{
protected:
  GroupRule(uint32_t aLineNumber, uint32_t aColumnNumber);
  GroupRule(already_AddRefed<ServoCssRules> aRules,
            uint32_t aLineNumber, uint32_t aColumnNumber);
  GroupRule(const GroupRule& aCopy);
  virtual ~GroupRule();
public:

  NS_DECL_CYCLE_COLLECTION_CLASS_INHERITED(GroupRule, Rule)
  NS_DECL_ISUPPORTS_INHERITED
  virtual bool IsCCLeaf() const override;

#ifdef DEBUG
  void List(FILE* out = stdout, int32_t aIndent = 0) const override {
    REDIRECT_TO_INNER(List(out, aIndent))
  }
#endif
  virtual void SetStyleSheet(StyleSheet* aSheet) override;

public:

  int32_t StyleRuleCount() const {
    REDIRECT_TO_INNER(StyleRuleCount())
  }
  Rule* GetStyleRuleAt(uint32_t aIndex) const {
    REDIRECT_TO_INNER(GetStyleRuleAt(aIndex))
  }


  /*
   * The next two methods should never be called unless you have first
   * called WillDirty() on the parent stylesheet.  After they are
   * called, DidDirty() needs to be called on the sheet.
   */
  nsresult DeleteStyleRuleAt(uint32_t aIndex) {
    REDIRECT_TO_INNER(DeleteStyleRuleAt(aIndex));
  }

  // non-virtual -- it is only called by subclasses
  size_t SizeOfExcludingThis(mozilla::MallocSizeOf aMallocSizeOf) const {
    REDIRECT_TO_INNER(SizeOfExcludingThis(aMallocSizeOf))
  }
  virtual size_t SizeOfIncludingThis(mozilla::MallocSizeOf aMallocSizeOf) const override = 0;

  // WebIDL API
  dom::CSSRuleList* CssRules();
  uint32_t InsertRule(const nsAString& aRule, uint32_t aIndex,
                      ErrorResult& aRv);
  void DeleteRule(uint32_t aIndex, ErrorResult& aRv);

protected:

private:
  // This only reason for the DummyGroupRuleRules is that ServoKeyframesRule
  // inherits from CSSKeyframesRules (and thus GroupRule). Once
  // ServoKeyframesRule can be made to inherit from Rule, the
  // DummyGroupRuleRules can be removed.
  Variant<DummyGroupRuleRules, ServoGroupRuleRules> mInner;
};

#undef REDIRECT_TO_INNER

// Implementation of WebIDL CSSConditionRule.
class ConditionRule : public GroupRule
{
protected:
  using GroupRule::GroupRule;

public:
  virtual void GetConditionText(nsAString& aConditionText) = 0;
  virtual void SetConditionText(const nsAString& aConditionText,
                                ErrorResult& aRv) = 0;
};

} // namespace css
} // namespace mozilla

#endif /* mozilla_css_GroupRule_h__ */
