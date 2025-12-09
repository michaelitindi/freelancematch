# Code Audit & Fixes

## Issues Found & Fixed

### 1. ❌ API Endpoint Mismatches

**Issue:** Components calling wrong endpoint paths

**Frontend Calls:**
- `/api/realtime/events/:userId` 
- `/api/realtime/events/:id/read`

**Actual Endpoints:**
- `/api/events/:userId` ✅
- Missing: `/api/events/:id/read` ❌

**Fix Required:** Add missing endpoint or update frontend calls

### 2. ❌ Missing Read Event Endpoint

**Components using:** `NotificationCenter.tsx`

**Fix:** Add endpoint to mark events as read

### 3. ⚠️ Hardcoded URLs

**Found in:**
- `src/app/api/[[...route]]/route.ts` - Tempo canvas URL
- `src/components/landing/LandingPage.tsx` - Unsplash images (OK for demo)
- `src/components/courses/CoursesView.tsx` - Unsplash images (OK for demo)

**Action:** Replace Tempo URL with environment variable

### 4. ⚠️ Upload Endpoint Path

**Frontend calls:** `/api/upload/:type`
**Worker has:** `/upload/:type` (mounted at root)

**Action:** Verify routing works correctly

## Fixes to Apply

### Fix 1: Add Missing Event Read Endpoint
