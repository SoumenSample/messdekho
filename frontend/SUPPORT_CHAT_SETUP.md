# AI Support Chat Setup Guide

## Overview
The MessDekho AI Support Chat system is now integrated into your React + Vite project. It provides a modern, premium chat interface powered by Google's Gemini AI.

## 📦 Installation

1. **Install Dependencies**
```bash
cd frontend
npm install
```

This installs the new `@google/generative-ai` package along with other dependencies.

## 🔑 Configuration

### Step 1: Get Your Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com)
2. Click **"Get API key"**
3. Create a new API key for a new project
4. Copy the API key

### Step 2: Add Environment Variable
Create a `.env.local` file in the frontend directory:

```env
VITE_GEMINI_API_KEY=your_api_key_here_12345...
```

**Important:**
- Never commit `.env.local` to Git
- Add `.env.local` to `.gitignore` (if not already there)
- Keep your API key private

### Step 3: Verify Setup
Run your development server:

```bash
npm run dev
```

## 🎯 Features

### User Experience
- **Smart Chat Opening**: Click "Start a chat" button in the Expert Help widget
- **Welcome Message**: First-time users see a friendly greeting
- **Typing Indicator**: Shows when AI is responding
- **Auto-scroll**: Chat automatically scrolls to latest message
- **Responsive Design**: Works on desktop and mobile

### Design
- Premium glassmorphic header with green gradient
- Smooth animations (fade-in, slide-up)
- Modern rounded corners and soft shadows
- Optimized for all screen sizes

### AI Features
- **Context-aware responses**: AI remembers conversation history (last 10 messages)
- **MessDekho-focused**: AI trained to help with PG bookings, pricing, and support
- **Error handling**: Graceful fallbacks if API fails
- **Rate limiting**: Smart handling of API quota limits

## 📂 Project Structure

```
src/components/support-chat/
├── SupportChat.jsx          # Main container & coordinator
├── ChatWindow.jsx           # Chat UI with header/input
├── ChatMessage.jsx          # Individual message component
├── TypingIndicator.jsx      # Animated 3-dot loader
├── geminiService.js         # Gemini API integration
└── supportChat.css          # All styles (modern design)
```

## 🔌 Integration Points

### App.jsx
- Global chat state management (`isChatOpen`)
- Coordinates chat opening/closing across the app

### ExpertHelpWidget.jsx
- Added `onOpenChat` prop callback
- Click "Start a chat" opens the AI support chat

### Home.jsx & PGDetails.jsx
- Accept `onOpenChat` prop from App.jsx
- Pass it to ExpertHelpWidget

## 🛠️ API Integration

### Gemini Service (geminiService.js)
```javascript
// Send a message and get AI response
const response = await getAIResponse(userMessage, conversationHistory);
```

**Features:**
- Uses `gemini-2.5-flash` model (fastest, optimized)
- Maintains conversation history context
- System prompt trains AI for MessDekho support
- Max 256 tokens per response
- Error handling for API failures

## 🎨 Customization

### Change Chat Position
Edit `supportChat.css`:
```css
.chat-window {
  bottom: 5rem;  /* Distance from bottom */
  right: 1.5rem; /* Distance from right */
}
```

### Adjust Chat Size
```css
.chat-window {
  width: 360px;  /* Width */
  max-height: 520px; /* Height */
}
```

### Change Header Color Gradient
```css
.chat-header {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  /* Use your own gradient here */
}
```

### Modify AI Personality
Edit the system prompt in `geminiService.js`:
```javascript
const systemPrompt = "Your custom AI personality here...";
```

## 🐛 Troubleshooting

### Chat doesn't open?
- Check if `VITE_GEMINI_API_KEY` is set in `.env.local`
- Verify the API key is correct and not expired
- Check browser console for errors

### AI responses are slow?
- This is normal for first response (API cold start)
- Network speed affects response time
- Consider using a faster model if available

### Chat window not responsive on mobile?
- Clear browser cache
- Check mobile viewport settings
- Review `supportChat.css` media queries

### API key errors?
```
"Authentication failed. Please check your API key configuration."
```
- Verify your `.env.local` file exists
- Your API key is correct
- The file path is exactly: `frontend/.env.local`

## 📱 Browser Support
- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Full responsive support

## 🔒 Security Notes
- API key is needed for Gemini integration
- The key is stored locally in `.env.local` (not in code)
- Requests are sent directly to Google's API
- No sensitive data is logged

## 🚀 Production Deployment

### Environment Variables
Set these in your deployment platform:
- Set `VITE_GEMINI_API_KEY` in your hosting environment variables
- Don't commit `.env.local` to version control

### Performance
- The chat component uses lazy loading
- Animations are GPU-accelerated
- No external CDN dependencies (except Google's API)

## 📝 Testing the Chat

1. Open your app homepage
2. Click the "Get expert help" button (bottom-right)
3. Click "Start a chat"
4. Type: "What PGs do you have in Mumbai?"
5. Watch the AI respond with MessDekho-focused information

## 🤝 Support

If you encounter issues:
1. Check the browser console (F12) for errors
2. Verify your `.env.local` setup
3. Ensure `npm install` completed successfully
4. Verify your Gemini API key is valid

---

**The Expert Help widget continues to work exactly as before. The AI chat is a modern addition that enhances user support without changing existing functionality.**
