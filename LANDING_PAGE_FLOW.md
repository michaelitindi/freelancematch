# Landing Page Input Flow

## Step-by-Step: What Happens When Buyer Enters Description

### 1. User Types in Landing Page Input
**Location:** Landing page hero section

```tsx
<textarea
  placeholder="What do you need help with today? Describe your project..."
  value={projectDescription}
  onChange={(e) => setProjectDescription(e.target.value)}
/>
```

**Example:** User types "I need a website for my restaurant"

---

### 2. User Clicks "Get Matched" Button

```tsx
<Button onClick={handleGetMatched}>
  Get Matched
</Button>
```

---

### 3. handleGetMatched Triggered

**File:** `src/components/landing/LandingPage.tsx`

```tsx
const handleGetMatched = () => {
  onGetStarted('buyer', projectDescription);
};
```

**What happens:**
- Calls parent's `onGetStarted` function
- Passes role: `'buyer'`
- Passes description: `"I need a website for my restaurant"`

---

### 4. Main Page handleGetStarted

**File:** `src/app/page.tsx`

```tsx
const handleGetStarted = (role: UserRole, projectDescription?: string) => {
  setInitialRole(role);
  if (role === 'buyer' && projectDescription) {
    // Go directly to PostRequestForm
    setInitialProjectDescription(projectDescription);
    setShowLanding(false);
    setShowPostRequest(true);
  } else {
    // Go to auth
    setShowLanding(false);
    setShowAuth(true);
  }
};
```

**What happens:**
- Stores role: `'buyer'`
- Stores description: `"I need a website for my restaurant"`
- Hides landing page
- Shows PostRequestForm

---

### 5. PostRequestForm Rendered (Guest Mode)

**File:** `src/components/matching/PostRequestForm.tsx`

```tsx
<PostRequestForm 
  initialDescription="I need a website for my restaurant"
  isGuest={true}
  onAuthRequired={handlePostRequestAuthRequired}
/>
```

**What user sees:**
- Form with 3 fields:
  - ✅ **Description** - Pre-filled: "I need a website for my restaurant"
  - ⚠️ **Category** - Empty (user must select)
  - ⚠️ **Budget** - Empty (user must enter)

---

### 6. User Completes Form

**User actions:**
1. Description already filled ✅
2. Selects category: "Web Development"
3. Enters budget: "$500"
4. Clicks "Post Request"

---

### 7. Form Submission (Guest User)

```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Guest user - require auth first
  if (isGuest && onAuthRequired) {
    onAuthRequired({ category, description, budget });
    return;
  }
  
  // ... rest of submission
};
```

**What happens:**
- Form data saved: `{ category, description, budget }`
- Triggers `onAuthRequired` callback
- User redirected to auth page

---

### 8. Auth Page Shown

**User sees:**
- Login/Register form
- Message: "Sign up to post your project"

**User actions:**
- Registers new account OR
- Logs in to existing account

---

### 9. After Authentication

**File:** `src/app/page.tsx`

```tsx
// User authenticated, has pending form data
if (showPostRequest && currentUser && pendingFormData) {
  return (
    <PostRequestForm 
      initialDescription={pendingFormData.description}
      initialCategory={pendingFormData.category}
      initialBudget={pendingFormData.budget}
      isGuest={false}
    />
  );
}
```

**What happens:**
- PostRequestForm shown again
- All fields pre-filled from saved data
- User now authenticated
- Form auto-submits OR user clicks submit

---

### 10. Project Created

```tsx
const response = await fetch('/api/projects', {
  method: 'POST',
  body: JSON.stringify({
    buyerId: currentUser.id,
    title: "I need a website for my restaurant",
    description: "I need a website for my restaurant",
    category: "Web Development",
    budget: 500
  })
});
```

**What happens:**
- Project created in database
- Matching algorithm runs
- Freelancers matched based on:
  - Category fit
  - Availability
  - Rating
  - Skills

---

### 11. Success Screen

**User sees:**
```
✅ Request Posted Successfully!

We've matched you with 3 qualified freelancers!

[View Matches] [Post Another Request]
```

---

## Complete Flow Diagram

```
Landing Page Input
"I need a website for my restaurant"
        ↓
[Get Matched] clicked
        ↓
PostRequestForm (Guest)
✅ Description: Pre-filled
⚠️ Category: Empty
⚠️ Budget: Empty
        ↓
User fills Category + Budget
        ↓
[Post Request] clicked
        ↓
Form data saved
        ↓
Auth Page (Register/Login)
        ↓
User authenticates
        ↓
PostRequestForm (Authenticated)
✅ All fields pre-filled
        ↓
Auto-submit OR user confirms
        ↓
API: POST /projects
        ↓
Matching algorithm runs
        ↓
Success! Matches created
```

## Key Features

### 1. Smart Pre-filling
- Description from landing page → Pre-filled in form
- User doesn't lose their input
- Seamless experience

### 2. Guest Flow
- Users can start without account
- Form data saved during auth
- Returned to form after login

### 3. Required Fields
- ✅ Description (from landing page)
- ⚠️ Category (user selects)
- ⚠️ Budget (user enters - REQUIRED)

### 4. Matching
- Automatic after project creation
- Based on category, skills, availability
- Results shown immediately

## Files Involved

1. `src/components/landing/LandingPage.tsx` - Input box
2. `src/app/page.tsx` - Flow orchestration
3. `src/components/matching/PostRequestForm.tsx` - Form
4. `src/components/auth/AuthPage.tsx` - Authentication
5. `src/app/api/[[...route]]/route.ts` - API endpoint

## API Endpoint

**POST /api/projects**

Creates project and triggers matching:
```json
{
  "buyerId": "user-123",
  "title": "I need a website for my restaurant",
  "description": "I need a website for my restaurant",
  "category": "Web Development",
  "budget": 500
}
```

Returns:
```json
{
  "projectId": "project-456",
  "matchingResult": {
    "matchesCreated": 3,
    "freelancersAvailable": 15
  }
}
```

## Summary

**Landing Page Input → PostRequestForm → Auth → Project Created → Matches Found**

The description from landing page is preserved throughout the entire flow, making it seamless for buyers to get started!
