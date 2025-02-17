/* -*- Mode: C++; tab-width: 8; indent-tabs-mode: nil; c-basic-offset: 4 -*-
 * vim: set ts=8 sts=4 et sw=4 tw=99:
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* Various JS utility functions. */

#include "jsutil.h"

#include "mozilla/Assertions.h"
#include "mozilla/Atomics.h"
#include "mozilla/Maybe.h"
#include "mozilla/ThreadLocal.h"

#include <stdio.h>

#include "jstypes.h"

#include "js/Utility.h"
#include "util/Windows.h"
#include "vm/HelperThreads.h"

using namespace js;

using mozilla::Maybe;

#if defined(DEBUG) || defined(JS_OOM_BREAKPOINT)
/* For OOM testing functionality in Utility.h. */
namespace js {

mozilla::Atomic<AutoEnterOOMUnsafeRegion*> AutoEnterOOMUnsafeRegion::owner_;

namespace oom {

JS_PUBLIC_DATA(uint32_t) targetThread = 0;
MOZ_THREAD_LOCAL(uint32_t) threadType;
JS_PUBLIC_DATA(uint64_t) maxAllocations = UINT64_MAX;
JS_PUBLIC_DATA(uint64_t) counter = 0;
JS_PUBLIC_DATA(bool) failAlways = true;

JS_PUBLIC_DATA(uint32_t) stackTargetThread = 0;
JS_PUBLIC_DATA(uint64_t) maxStackChecks = UINT64_MAX;
JS_PUBLIC_DATA(uint64_t) stackCheckCounter = 0;
JS_PUBLIC_DATA(bool) stackCheckFailAlways = true;

JS_PUBLIC_DATA(uint32_t) interruptTargetThread = 0;
JS_PUBLIC_DATA(uint64_t) maxInterruptChecks = UINT64_MAX;
JS_PUBLIC_DATA(uint64_t) interruptCheckCounter = 0;
JS_PUBLIC_DATA(bool) interruptCheckFailAlways = true;

bool
InitThreadType(void) {
    return threadType.init();
}

void
SetThreadType(ThreadType type) {
    threadType.set(type);
}

uint32_t
GetThreadType(void) {
    return threadType.get();
}

static inline bool
IsHelperThreadType(uint32_t thread)
{
    return thread != THREAD_TYPE_NONE && thread != THREAD_TYPE_COOPERATING;
}

void
SimulateOOMAfter(uint64_t allocations, uint32_t thread, bool always)
{
    Maybe<AutoLockHelperThreadState> lock;
    if (IsHelperThreadType(targetThread) || IsHelperThreadType(thread)) {
        lock.emplace();
        HelperThreadState().waitForAllThreadsLocked(lock.ref());
    }

    MOZ_ASSERT(counter + allocations > counter);
    MOZ_ASSERT(thread > js::THREAD_TYPE_NONE && thread < js::THREAD_TYPE_MAX);
    targetThread = thread;
    maxAllocations = counter + allocations;
    failAlways = always;
}

void
ResetSimulatedOOM()
{
    Maybe<AutoLockHelperThreadState> lock;
    if (IsHelperThreadType(targetThread)) {
        lock.emplace();
        HelperThreadState().waitForAllThreadsLocked(lock.ref());
    }

    targetThread = THREAD_TYPE_NONE;
    maxAllocations = UINT64_MAX;
    failAlways = false;
}

void
SimulateStackOOMAfter(uint64_t checks, uint32_t thread, bool always)
{
    Maybe<AutoLockHelperThreadState> lock;
    if (IsHelperThreadType(stackTargetThread) || IsHelperThreadType(thread)) {
        lock.emplace();
        HelperThreadState().waitForAllThreadsLocked(lock.ref());
    }

    MOZ_ASSERT(stackCheckCounter + checks > stackCheckCounter);
    MOZ_ASSERT(thread > js::THREAD_TYPE_NONE && thread < js::THREAD_TYPE_MAX);
    stackTargetThread = thread;
    maxStackChecks = stackCheckCounter + checks;
    stackCheckFailAlways = always;
}

void
ResetSimulatedStackOOM()
{
    Maybe<AutoLockHelperThreadState> lock;
    if (IsHelperThreadType(stackTargetThread)) {
        lock.emplace();
        HelperThreadState().waitForAllThreadsLocked(lock.ref());
    }

    stackTargetThread = THREAD_TYPE_NONE;
    maxStackChecks = UINT64_MAX;
    stackCheckFailAlways = false;
}

void
SimulateInterruptAfter(uint64_t checks, uint32_t thread, bool always)
{
    Maybe<AutoLockHelperThreadState> lock;
    if (IsHelperThreadType(interruptTargetThread) || IsHelperThreadType(thread)) {
        lock.emplace();
        HelperThreadState().waitForAllThreadsLocked(lock.ref());
    }

    MOZ_ASSERT(interruptCheckCounter + checks > interruptCheckCounter);
    MOZ_ASSERT(thread > js::THREAD_TYPE_NONE && thread < js::THREAD_TYPE_MAX);
    interruptTargetThread = thread;
    maxInterruptChecks = interruptCheckCounter + checks;
    interruptCheckFailAlways = always;
}

void
ResetSimulatedInterrupt()
{
    Maybe<AutoLockHelperThreadState> lock;
    if (IsHelperThreadType(interruptTargetThread)) {
        lock.emplace();
        HelperThreadState().waitForAllThreadsLocked(lock.ref());
    }

    interruptTargetThread = THREAD_TYPE_NONE;
    maxInterruptChecks = UINT64_MAX;
    interruptCheckFailAlways = false;
}

} // namespace oom
} // namespace js
#endif // defined(DEBUG) || defined(JS_OOM_BREAKPOINT)

JS_PUBLIC_DATA(arena_id_t) js::MallocArena;

void
js::InitMallocAllocator()
{
    MallocArena = moz_create_arena();
}

void
js::ShutDownMallocAllocator()
{
    moz_dispose_arena(MallocArena);
}

JS_PUBLIC_API(void)
JS_Assert(const char* s, const char* file, int ln)
{
    MOZ_ReportAssertionFailure(s, file, ln);
    MOZ_CRASH();
}

#ifdef __linux__

#include <malloc.h>
#include <stdlib.h>

namespace js {

// This function calls all the vanilla heap allocation functions.  It is never
// called, and exists purely to help config/check_vanilla_allocations.py.  See
// that script for more details.
extern MOZ_COLD void
AllTheNonBasicVanillaNewAllocations()
{
    // posix_memalign and aligned_alloc aren't available on all Linux
    // configurations.
    // valloc was deprecated in Android 5.0
    //char* q;
    //posix_memalign((void**)&q, 16, 16);

    intptr_t p =
        intptr_t(malloc(16)) +
        intptr_t(calloc(1, 16)) +
        intptr_t(realloc(nullptr, 16)) +
        intptr_t(new char) +
        intptr_t(new char) +
        intptr_t(new char) +
        intptr_t(new char[16]) +
        intptr_t(memalign(16, 16)) +
        //intptr_t(q) +
        //intptr_t(aligned_alloc(16, 16)) +
        //intptr_t(valloc(4096)) +
        intptr_t(strdup("dummy"));

    printf("%u\n", uint32_t(p));  // make sure |p| is not optimized away

    free((int*)p);      // this would crash if ever actually called

    MOZ_CRASH();
}

} // namespace js

#endif // __linux__
