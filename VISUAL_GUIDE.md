# 🎨 AI Support Chat - Visual Guide

## Chat Window Layout

```
┌─────────────────────────────────────┐
│ 🟢 MessDekho AI Support         ✕  │  ← Green gradient header
│    Typically replies instantly      │  ← Takes full width
├─────────────────────────────────────┤
│                                     │
│  Welcome message                    │
│  "Hi 👋 Welcome to..."             │
│                                     │  ← Scrollable area
│  User message (right)               │     Auto-scrolls down
│  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━┓      │
│  ┃ Your question here       ┃      │
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━┛      │
│                                     │
│  ┌─────────────────────────────┐    │  ← AI message (left)
│  │ AI Response here            │    │     Gray background
│  └─────────────────────────────┘    │
│                                     │
│  ◉ ◉ ◉  (typing indicator)          │  ← Animated dots
│                                     │
├─────────────────────────────────────┤
│ [Type message...] [Send →]          │  ← Input field + button
└─────────────────────────────────────┘
```

## Color Palette

```
Header Background:
  Linear gradient: #10b981 → #059669
  
User Messages:
  Background: #059669 (Emerald-700)
  Text: white
  Alignment: Right
  
AI Messages:
  Background: #f3f4f6 (Gray-100)
  Text: #1f2937 (Gray-900)
  Alignment: Left
  
Input Field:
  Border Color: #e5e7eb
  Focus Ring: #10b981
  
Online Indicator:
  Color: #34d399 (Emerald-400)
  Animation: Pulse
```

## Responsive Sizes

### Desktop (≥ 481px)
```
Window: 360px wide × 520px tall
Position: Bottom-right corner
Padding: 1.5rem
Floating: Fixed position
```

### Tablet (600px - 480px)
```
Window: 360px wide × 400px tall
Reduced height to fit screen
Same position and styling
```

### Mobile (< 480px)
```
Window: 100% width × 100% height
Position: Bottom sheet style
Rounded top corners: 1.5rem
Full-screen immersive mode
Keyboard-aware layout
```

## Animation Timings

```
Chat Window Open:
  Duration: 0.3s spring
  Effect: Scale (0.9 → 1) + Fade
  
Message Appear:
  Duration: 0.3s ease-out
  Effect: Fade + Slide up
  Staggered per message
  
Typing Dots:
  Duration: 1.4s loop
  Effect: Vertical bounce
  Stagger: 0.2s between dots
  
Close Button:
  Hover: Scale up 5%
  Active: Scale down 5%
  Transition: 0.2s
  
Input Focus:
  Ring: 3px #10b981 opacity 8%
  Quick transition: 0.2s
```

## User Interactions

### Desktop/Web
```
1. Click "Get expert help" widget
   ↓ Opens dropdown
2. Click "Start a chat" button
   ↓ Chat window slides in
3. Type message in input
4. Press Enter or click Send
   ↓ Message appears on right
   ↓ Typing indicator appears
5. AI response appears on left
6. Repeat or click ✕ to close
```

### Mobile/Touch
```
1. Tap "Get expert help" widget
   ↓ Opens dropdown (same as web)
2. Tap "Start a chat"
   ↓ Chat full-screen slides up
3. Tap input field
   ↓ Keyboard opens
4. Type message and tap Send
   ↓ Same message flow as web
5. Tap X to close (dismiss keyboard)
```

## Avatar & Status

```
Avatar:
  Size: 40px diameter
  Border: 2px white ring
  Image: Professional AI assistant photo
  
Online Indicator (Dot):
  Size: 12px diameter
  Color: #34d399 (green)
  Border: 2px white
  Animation: Pulse (infinite)
  
Status Text:
  "Online · typically replies instantly"
  Font: 12px, weight 500
  Color: #10b981
```

## Message Bubbles

### User Message
```
┌─────────────────────────────┐
│  Your question here          │  ← White text on green
│                              │
└─────────────────────────────┘  ← Rounded bottom-right
  └─ Right aligned with padding
```

### AI Message
```
  ┌─────────────────────────────┐
  │  AI answer here              │  ← Dark text on light gray
  │                              │
  └─────────────────────────────┘  ← Rounded bottom-left
Left aligned with padding ─┘
```

### With Code
```
User can send:
  "What's your pricing?"
  
AI can respond with:
  "Basic plan: `₹8000/month`
   Premium: `₹12000/month`"
   
Inline code styled as:
  [Dark bg with red text]
```

## Loading States

### While User Types
```
✓ Input enabled
✓ Send button enabled
✓ Message immediately appears
```

### While Waiting for AI
```
✗ Input disabled (grayed out)
✗ Send button disabled (grayed out)
✓ Typing indicator shows (3 bouncing dots)
✓ Previous messages still visible
```

### Error State
```
✗ Input enabled (red border optional)
✓ Error message in place of AI response
✓ Can retry with new message
```

## Accessibility Features

```
Keyboard Navigation:
  Tab: Focus through elements
  Enter: Send message
  Shift+Enter: New line (future feature)
  Esc: Close chat
  
Screen Reader:
  aria-label on buttons
  aria-expanded on toggle
  Role markers (button, menuitem, etc.)
  
High Contrast:
  Colors meet WCAG AA standard
  Text contrast ratio > 4.5:1
  
Reduced Motion:
  Respects prefers-reduced-motion
  Removes animations if enabled
```

## State Diagrams

### Chat Visibility
```
[Closed]
   ↑ (click X or outside)
   |
[Open] ← (click "Start a chat")
   ↓
(120ms delay)
   ↓
[Ready to Close]
```

### Message States
```
User Types
  ↓
[User Input]
  ↓ (press Enter)
[Sending] → (disable input)
  ↓
[User Message Rendered]
  ↓
[Typing Indicator Shows]
  ↓
[API Request Pending]
  ↓ (response received)
[AI Message Rendered]
  ↓
[Input Re-enabled]
```

## Visual Hierarchy

```
1. Header (Most important)
   - AI avatar, name, status
   - Close button

2. Messages (Primary content)
   - Conversation history
   - Typing indicator
   - Auto-focus on newest

3. Input Field (Secondary)
   - Sticky at bottom
   - Always visible
   
4. Scrollbar (Tertiary)
   - Hidden by default
   - Appears on hover/scroll
   - Minimal styling
```

---

**This visual guide helps understand the chat interface design. The implementation follows these specifications exactly.**
