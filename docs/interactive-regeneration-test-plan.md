# Interactive Report Regeneration - Test Plan

## 🎯 Feature Overview
Users can iteratively refine AI-generated investor reports through conversational feedback. The AI discusses specific changes in chat, asks for confirmation, then silently updates the full report draft.

---

## ✅ Tests I Can Perform (Code Analysis)

### 1. **Code Structure Validation** ✓
- [x] Confirmation detection regex exists
- [x] `handleRegenerateReport` function implemented
- [x] `pendingRegeneration` state management present
- [x] Feedback pattern detection in API route
- [x] Conversation history passing enabled

### 2. **Flow Logic Review** ✓
```typescript
// Confirmation Detection (lines 74-84)
const isConfirmingRegeneration = pendingRegeneration && 
  (userMessage.toLowerCase().includes('yes') || 
   userMessage.toLowerCase().includes('update') ||
   userMessage.toLowerCase().includes('regenerate'));

if (isConfirmingRegeneration && pendingRegeneration) {
  await handleRegenerateReport(pendingRegeneration.feedback, pendingRegeneration.context);
  setPendingRegeneration(null);
  return; // Early return - doesn't call ask-question API
}
```

**Status:** ✅ Correctly implemented

### 3. **Feedback Pattern Detection** ✓
```typescript
// API Route (ask-question/route.ts, line 23)
const isFeedbackPattern = /add|include|change|update|modify|remove|improve|enhance|focus|emphasize|mention|discuss|make.*more|make.*less|shorten|expand|succinct/i;
const suggestRegeneration = hasExistingDraft && isFeedbackPattern.test(question);
```

**Detected keywords:**
- add, include, change, update, modify, remove
- improve, enhance, focus, emphasize, mention, discuss
- make more/less, shorten, expand, **succinct** (your addition!)

**Status:** ✅ Comprehensive pattern matching

### 4. **Conversation History Enhancement** ✓
Your recent improvements:
```typescript
// Increased from 10 to 15 messages
const recentMessages = request.conversationHistory.slice(-15);

// Increased truncation threshold from 500 to 2000 chars
const content = msg.content.length > 2000 
  ? msg.content.substring(0, 2000) + '... [truncated]'
  : msg.content;
```

**Benefit:** Preserves more context for iterative refinement

**Status:** ✅ Smart improvement!

---

## 🧪 Tests You Need to Perform (Manual)

### **TEST 1: Initial Report Generation**
**Steps:**
1. Navigate to AI Copilot module
2. Click "Generate Report"
3. Wait for generation to complete

**Expected:**
- ✅ Report appears in "Report Draft" section (right panel)
- ✅ Confirmation message in chat: "I've generated a draft report for you..."
- ✅ NO full report shown in chat bubbles

**Why it matters:** Establishes baseline - chat and draft are separate

---

### **TEST 2: Simple Feedback Request**
**Steps:**
1. After report generated, type: "Can you make this more succinct?"
2. Send message

**Expected:**
- ✅ AI responds discussing HOW to make it succinct (e.g., "I would shorten the Executive Summary by focusing on...")
- ✅ AI does NOT output full report in chat
- ✅ AI asks: "Would you like me to refine this further, or shall I update the draft?"
- ✅ `suggestRegeneration` triggered (check network tab)

**Actual test on your system:**
```
User: Can you make this more succinct?

AI expected response:
"I can make the report more succinct by:
1. Condensing the Executive Summary to 2-3 key bullet points
2. Shortening the Macro Overview to focus only on the top 2 market developments
3. Streamlining the Holdings section to highlight only the critical metrics

For example, the Executive Summary would become:
[Shows ONLY the new concise summary paragraph]

Would you like me to update the draft with these changes?"
```

---

### **TEST 3: Specific Addition Request**
**Steps:**
1. Type: "Add commentary on the recent Bitcoin liquidation event"
2. Send message

**Expected:**
- ✅ AI shows ONLY the new paragraph/section to be added
- ✅ AI explains WHERE it would go (e.g., "I would add this to the Macro Overview section, right after the ETH treasury discussion:")
- ✅ Shows draft of new content:
  ```
  Recent Market Event: Bitcoin Liquidation
  On [date], approximately $X million in BTC long positions were liquidated...
  [2-3 sentences of analysis]
  ```
- ✅ Asks: "Would you like me to refine this further, or shall I update the draft?"
- ✅ NO full report in chat

---

### **TEST 4: Confirmation and Regeneration**
**Steps:**
1. After receiving AI's proposed change, type: "Yes, update the draft"
2. Send message

**Expected:**
- ✅ `isConfirmingRegeneration` triggers (contains "yes" and "update")
- ✅ `handleRegenerateReport` called silently
- ✅ Loading indicator appears on Report Draft box (pulsing green border with "Updating..." label)
- ✅ AI responds in chat: "✅ Report draft has been updated!"
- ✅ NO full report shown in chat
- ✅ Report Draft section updates with new content
- ✅ New changes are visible in the draft (check for your requested addition)

**Check Network Tab:**
- Should see POST to `/api/ai-copilot/generate-report` (not ask-question)
- Request body includes full conversation history

---

### **TEST 5: Alternative Confirmation Phrases**
Test these variations trigger regeneration:
- "yes"
- "update it"
- "regenerate"
- "regenerate the report"
- "yes please update"

**Expected:** All should trigger `handleRegenerateReport`

---

### **TEST 6: Iterative Refinement (Multi-Round)**
**Steps:**
1. Generate initial report
2. Request change #1: "Make it more succinct"
3. Confirm: "Yes, update"
4. Wait for draft to update
5. Request change #2: "Add more detail on ETH holdings"
6. Confirm: "Update it"
7. Wait for draft to update

**Expected:**
- ✅ Each round preserves previous changes
- ✅ Conversation history grows (check network tab - should see up to 15 messages)
- ✅ Final draft includes BOTH changes (succinct + ETH detail)

---

### **TEST 7: Rejection/Iteration on Proposed Change**
**Steps:**
1. Request change: "Add Bitcoin commentary"
2. AI proposes paragraph
3. Instead of confirming, say: "Can you make that commentary more bullish?"
4. AI revises the proposed content
5. Confirm: "Yes, update"

**Expected:**
- ✅ AI refines the SAME section without regenerating draft yet
- ✅ Only after "yes, update" does draft get updated
- ✅ Final draft contains the revised (bullish) version

---

### **TEST 8: Edge Case - Conversation Without Confirmation**
**Steps:**
1. Request change: "Add macro commentary"
2. AI proposes content
3. DON'T confirm - instead ask: "What's the current portfolio value?"

**Expected:**
- ✅ AI answers the question conversationally
- ✅ Draft is NOT updated (no regeneration triggered)
- ✅ Previous proposed change is still "pending"

---

### **TEST 9: Multiple Changes Before Confirmation**
**Steps:**
1. Request: "Make it more succinct"
2. AI responds
3. DON'T confirm - instead say: "Also add Bitcoin commentary"
4. AI responds
5. Confirm: "Yes, update the draft"

**Expected:**
- ✅ Regeneration includes BOTH instructions (succinct + Bitcoin commentary)
- ✅ Conversation history captures both requests
- ✅ Draft reflects both changes

---

### **TEST 10: Performance - Long Conversation**
**Steps:**
1. Have 10+ exchanges with the AI (mix of feedback and questions)
2. Request a change
3. Confirm update

**Expected:**
- ✅ Regeneration uses last 15 messages only (check network tab)
- ✅ Messages up to 2000 chars preserved
- ✅ No 429 rate limit errors
- ✅ Draft updates successfully

---

### **TEST 11: UI/UX Polish**
**Visual checks:**
- ✅ AI bubbles: `bg-gray-700 text-gray-100` (good contrast)
- ✅ User bubbles: `bg-green-600 text-white` (good contrast)
- ✅ Input field: `bg-gray-800 text-gray-100 placeholder-gray-500` (readable)
- ✅ Pulsing green border appears during regeneration
- ✅ "Updating..." label visible during regeneration
- ✅ Copy button shows "Copied!" feedback (2 seconds)
- ✅ Download button works

---

### **TEST 12: Error Handling**
**Test scenarios:**

**12a. API Failure During Regeneration**
- Simulate: Disconnect internet, then confirm update
- Expected: "Sorry, I encountered an error while updating the report. Please try again."

**12b. Rate Limit During Feedback**
- Simulate: Hit Gemini rate limit
- Expected: "🚫 API quota exceeded. Please try again later."

**12c. Empty/Invalid Response**
- Expected: Graceful error message, no app crash

---

## 📊 Test Results Template

Copy this to track your results:

```markdown
## Test Results - [Date]

| Test # | Test Name | Status | Notes |
|--------|-----------|--------|-------|
| 1 | Initial Report Generation | ⏳ | |
| 2 | Simple Feedback Request | ⏳ | |
| 3 | Specific Addition Request | ⏳ | |
| 4 | Confirmation & Regeneration | ⏳ | |
| 5 | Alternative Confirmation Phrases | ⏳ | |
| 6 | Iterative Refinement | ⏳ | |
| 7 | Rejection/Iteration | ⏳ | |
| 8 | Conversation Without Confirmation | ⏳ | |
| 9 | Multiple Changes Before Confirmation | ⏳ | |
| 10 | Performance - Long Conversation | ⏳ | |
| 11 | UI/UX Polish | ⏳ | |
| 12a | Error - API Failure | ⏳ | |
| 12b | Error - Rate Limit | ⏳ | |

Legend: ✅ Pass | ❌ Fail | ⏳ Not Tested | ⚠️ Partial
```

---

## 🔍 What to Monitor

### Browser DevTools - Network Tab
- `/api/ai-copilot/ask-question` calls (for feedback discussion)
- `/api/ai-copilot/generate-report` calls (for regeneration)
- Request bodies (check conversation history length)
- Response times

### Browser DevTools - Console
- Any errors or warnings
- State updates (`pendingRegeneration`, `reportDraft`)
- Token usage logs

### Visual Indicators
- Loading states
- Border pulsing during regeneration
- "Updating..." label visibility
- Chat bubble contrast/readability

---

## ✨ Success Criteria

**Feature is ready to merge if:**
1. ✅ All 12 tests pass
2. ✅ No console errors during normal flow
3. ✅ Draft updates reflect all requested changes
4. ✅ Chat remains conversational (no full reports in bubbles)
5. ✅ UI is responsive and provides clear feedback
6. ✅ Error handling is graceful

---

## 🚀 Next Steps After Testing

1. Document any bugs found
2. If all tests pass → Merge to main
3. Update user documentation
4. Add to backlog:
   - Portfolio summary use case (from memory)
   - Save/load draft history
   - Export to PDF with formatting

