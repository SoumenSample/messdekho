# Support Chat System - Architecture & Documentation

## 📋 Overview
The Support Chat system is a modular, modern AI-powered chat interface for MessDekho. It integrates Google's Gemini AI to provide instant, context-aware customer support.

## 📦 Components

### 1. **SupportChat.jsx** (Coordinator)
**Purpose**: Main container that manages chat state and AI communication  
**Responsibilities**:
- Manages `isOpen` state for chat visibility
- Tracks conversation history
- Handles user message sending
- Calls Gemini Service for AI responses
- Manages loading state

**Props**:
- `isOpen` (boolean): Whether chat is visible
- `onClose` (function): Called when user closes chat

**Features**:
- Welcome message on first open
- Conversation history persistence
- Loading state during AI response
- Error handling

### 2. **ChatWindow.jsx** (UI Container)
**Purpose**: The visible chat interface with header, messages, and input  
**Features**:
- Header with AI avatar and status
- Scrollable messages area
- Input field with send button
- Close button with animations

**Props**:
- `onClose`: Close button handler
- `onSendMessage`: Send button handler
- `isLoading`: Show typing indicator
- `messages`: Array of chat messages

**Animations**:
- Spring animation on open
- Fade-in on close
- Auto-scroll to latest message

### 3. **ChatMessage.jsx** (Message Display)
**Purpose**: Individual message component with formatted content  
**Features**:
- User vs AI message styling
- Inline code formatting (backticks)
- Line break handling
- Smooth fade-in animation
- Max-width message bubbles

**Props**:
- `message` (string): Message text
- `isUser` (boolean): User vs AI message

**Styling**:
- User: Green background, white text, right-aligned
- AI: Gray background, dark text, left-aligned

### 4. **TypingIndicator.jsx** (Loading State)
**Purpose**: Animated 3-dot loader during AI response  
**Features**:
- Smooth bouncing animation
- Staggered dot animation
- Lightweight and performant

**Animation**: 1.4s loop with 0.2s stagger between dots

### 5. **geminiService.js** (AI Integration)
**Purpose**: Handles all Google Gemini API communication  
**Main Function**: `getAIResponse(message, conversationHistory)`

**Features**:
- Uses Gemini 2.5 Flash model
- Maintains conversation context (last 10 messages)
- MessDekho-focused system prompt
- Error handling and graceful fallbacks
- Rate limit handling

**Error Cases**:
- `401`: Authentication failed (bad API key)
- `429`: Rate limited (quota exceeded)
- Other: Generic error message

**Configuration**:
- Model: `gemini-2.5-flash`
- Max tokens: 256
- Temperature: 0.7
- API key from: `VITE_GEMINI_API_KEY` env var

### 6. **supportChat.css** (Styling)
**Purpose**: Modern, premium chat UI styles  

**Features**:
- Gradient green header
- Glassmorphism effects
- GPU-accelerated animations
- Custom scrollbar
- Responsive breakpoints
- Dark mode support ready

**Key Dimensions**:
- Desktop: 360px wide × 520px high
- Mobile: Full width, full height
- Real estate conscious

**Animations**:
- Spring entrance/exit
- Message fade-in + slide-up
- Typing dots bounce
- Hover effects on buttons

## 🔄 Data Flow

```
User Click
    ↓
ExpertHelpWidget (onOpenChat callback)
    ↓
App.jsx (setIsChatOpen(true))
    ↓
SupportChat renders ChatWindow
    ↓
User types message
    ↓
ChatWindow calls onSendMessage
    ↓
SupportChat:
  - Adds message to history
  - Sets isLoading = true
  - Calls geminiService.getAIResponse()
    ↓
geminiService:
  - Sends to Google Gemini API
  - Returns AI response
    ↓
SupportChat:
  - Adds AI response to history
  - Sets isLoading = false
    ↓
ChatWindow:
  - Re-renders with new messages
  - Auto-scrolls to bottom
```

## 📱 Responsive Behavior

### Desktop (> 480px)
- Fixed bottom-right position
- 360px width
- 520px max-height
- Standalone window

### Tablet (small: < 600px)
- Height reduced to 400px
- Same width and position

### Mobile (< 480px)
- Full screen (100% width/height)
- Rounded top corners
- Slide up from bottom
- Full viewport experience

## 🎨 Design System

### Colors
- Primary Green: `#10b981` / `#059669`
- Messages User: `#059669` (emerald-700)
- Messages AI: `#f3f4f6` (gray-100)
- Text: `#1f2937` (gray-900)
- Subtle: `#9ca3af` (gray-400)

### Typography
- Header: 0.875rem, weight 600, white
- Subtitle: 0.75rem, weight 500, rgba(white, 0.85)
- messages: 0.875rem, leading 1.5

### Spacing
- Header padding: 1rem
- Container gap: 0.75rem
- Button size: 2.25rem diameter
- Message max-width: 85%

## 🔌 Integration Points

### App.jsx
- Import SupportChat component
- Manage `isChatOpen` state
- Pass to ExpertHelpWidget callback

### ExpertHelpWidget.jsx
- Accept `onOpenChat` prop
- Call on "Start a chat" click
- Keep "Book a call" navigation

### Home.jsx & PGDetails.jsx
- Accept `onOpenChat` prop from App
- Pass to ExpertHelpWidget

## 🚀 Performance Optimizations

1. **Lazy Loading**: Chat component renders only when open
2. **GPU Acceleration**: CSS transforms use `translate3d`
3. **Efficient Animations**: Avoid layout thrashing
4. **Message History**: Limited to last 10 for context (not all)
5. **Debounced Close**: 120ms delay on hover leave prevents flicker

## 🛡️ Error Handling

### User-Facing Errors
- API unavailable → "AI is currently unavailable"
- Bad API key → "Authentication failed"
- Rate limited → "Getting a lot of requests right now"
- Generic → "Sorry, I encountered an error"

### Developer Errors
- Missing `VITE_GEMINI_API_KEY` → Console warning
- API failures → Logged to console
- Render errors → React error boundary compatible

## 🔐 Security

- API key stored in `.env.local` (never in code)
- No sensitive user data in requests
- API key never exposed in frontend bundle
- No data persistence (stateless chat)

## 🧪 Testing Notes

### Manual Testing Steps
1. Open app in browser
2. Click "Get expert help" widget
3. Click "Start a chat"
4. Type test message: "What cities do you serve?"
5. Verify AI responds with MessDekho info
6. Test close button
7. Reopen to verify history is kept

### Edge Cases to Test
- Very long messages
- Rapid message sending
- Mobile viewport resize
- Hover/click interactions on mobile
- API key missing (should show warning)
- Network disconnect during response

## 📚 Extending the System

### Adding Custom Commands
Edit system prompt in `geminiService.js`:
```javascript
const systemPrompt = "Your custom instructions...";
```

### Changing Chat Position
Edit `.chat-window` in `supportChat.css`:
```css
bottom: 5rem;  /* Move up/down */
right: 1.5rem; /* Move left/right */
```

### Adding Typing Delay
In `SupportChat.jsx`:
```javascript
// Add delay before AI response
setTimeout(() => {
  const aiResponse = await getAIResponse(...);
}, delayMs);
```

### Custom Message Formatting
Extend `ChatMessage.jsx` `renderMessageContent()` function for:
- Bold text (`**text**`)
- Italic text (`*text*`)
- More complex code blocks
- Links (safely)

## 🎯 Future Enhancements

Potential additions:
- [ ] User feedback (thumbs up/down) on responses
- [ ] Suggested quick replies
- [ ] Chat history export
- [ ] Multiple languages
- [ ] Avatar customization
- [ ] Sound notifications
- [ ] Mobile web app installation

---

**Built with React, Framer Motion, TailwindCSS, and Google Gemini AI**
