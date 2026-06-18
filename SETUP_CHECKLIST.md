# ✅ AI Support Chat - Setup Checklist

## Pre-Requisites ✓

- [x] Node.js 16+ installed
- [x] React + Vite project running
- [x] npm or yarn available
- [x] Browser with JavaScript enabled

## Installation Steps

### Step 1: Install Dependencies
```bash
cd frontend
npm install
```
**What it does**: Installs the new `@google/generative-ai` package + ensures all deps are up to date  
**Time**: ~15-30 seconds  
**Success indicator**: No red errors, just yellow warnings (OK to ignore)

### Step 2: Get Gemini API Key
1. Open https://aistudio.google.com in your browser
2. Click blue **"Get API key"** button
3. Click **"Create new API key"** 
4. Select your project (Create new if needed)
5. Copy the generated API key (long string of characters)
6. ⚠️ **Never share this key!**

**Time**: ~2 minutes

### Step 3: Create Environment File
Create a new file: `frontend/.env.local`

**File content** (replace with your key):
```env
VITE_GEMINI_API_KEY=AIza....(your very long key)....
```

**Important**:
- File must be named exactly `.env.local`
- File must be in `frontend/` directory
- File should NOT be committed to git

**Verify**: 
```bash
cat .env.local
# Should show: VITE_GEMINI_API_KEY=AIza...
```

**Time**: ~1 minute

### Step 4: Verify Setup
```bash
cd frontend
npm run build
```

**What it checks**:
- All TypeScript/JSX syntax is correct
- All imports resolve properly
- No missing dependencies
- Build successful

**Success looks like**:
```
✓ 2442 modules transformed.
dist/index.html                            0.46 kB
dist/assets/index-CravxSZQ.js            648.05 kB
✓ built in 12.96s
```

**Time**: ~15-30 seconds

### Step 5: Start Development Server
```bash
npm run dev
```

**What it does**:
- Starts local dev server
- Usually runs on http://localhost:5173

**What you should see**:
```
  VITE v5.4.21  ready in XX ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

**Success**: Open browser to shown URL

**Time**: ~5 seconds

### Step 6: Test the Chat
1. Open your app in browser at http://localhost:5173
2. Scroll to bottom-right corner
3. Click **"Get expert help"** button (green with avatar)
4. Click **"Start a chat"** option
5. Type: "Hi, what cities do you operate in?"
6. Press Enter
7. 💬 Watch AI respond!

**Time**: ~10 seconds

---

## ✅ Completion Checklist

### Before Testing
- [ ] Dependencies installed (`npm install` ran successfully)
- [ ] Gemini API key obtained from Google AI Studio
- [ ] `.env.local` file created in frontend folder
- [ ] API key pasted in `.env.local`
- [ ] `.env.local` added to `.gitignore`
- [ ] Build succeeded (`npm run build`)
- [ ] Dev server started (`npm run dev`)

### After Testing
- [ ] Chat window opens smoothly
- [ ] Welcome message appears
- [ ] Can type and send messages
- [ ] AI responds with relevant answers
- [ ] Messages are formatted nicely
- [ ] Chat closes when clicking X
- [ ] No errors in browser console (F12)

---

## 🐛 Quick Troubleshooting

### Chat doesn't open?
```
❌ Problem: Click "Start a chat" does nothing
✅ Solution: 
   - Check .env.local exists in frontend/ folder
   - Verify VITE_GEMINI_API_KEY is set
   - Hard refresh browser (Ctrl+Shift+R)
   - Restart dev server (npm run dev)
```

### "AI is currently unavailable"?
```
❌ Problem: Chat opens but AI shows error
✅ Solution:
   - Verify your Gemini API key is correct
   - Check it's the full key (AIza...something)
   - Try a simple message first
   - Check: https://aistudio.google.com/apikey still valid
```

### Messages won't send?
```
❌ Problem: Can type but send button doesn't work
✅ Solution:
   - Check internet connection
   - Verify API key is valid
   - Open Developer Console (F12)
   - Check for red errors
   - Try restarting dev server
```

### Build failing?
```
❌ Problem: npm run build shows errors
✅ Solution:
   - Run npm install again
   - Delete node_modules folder
   - Run npm install fresh
   - Then npm run build
```

---

## 📹 What You'll See

### 1. Initial State
- Green "Get expert help" button in bottom-right
- Contains AI avatar and label

### 2. After Clicking Button
- Dropdown menu appears above the button
- Shows "Start a chat" and "Book a call" options

### 3. After Clicking "Start a Chat"
- New window slides in from bottom-right
- Has green header with AI avatar
- Shows welcome message
- Input field ready for typing

### 4. After Sending Message
- Your message appears on right side (green)
- Three animated dots appear on left (typing indicator)
- AI response appears after ~2-5 seconds

### 5. Conversation Continues
- More messages can be sent
- Previous messages stay visible
- Chat scrolls automatically

---

## 🎯 Next Steps After Setup

### Customize the Chat
1. Change header color: Edit `supportChat.css`
2. Modify AI personality: Edit `geminiService.js` system prompt
3. Adjust response style: Change model temperature

### Optional Enhancements
1. Add user feedback buttons
2. Implement chat history
3. Add suggested replies
4. Custom avatar image
5. Dark mode support

### Deployment
1. Set `VITE_GEMINI_API_KEY` in your hosting platform
2. Run `npm run build`
3. Deploy the `dist/` folder

---

## 📞 FAQ

**Q: Is the API key safe?**  
A: Yes! It's stored in `.env.local` which is not committed to git

**Q: Will this slow down my app?**  
A: No! Chat only loads when user clicks it

**Q: Can I customize the chat?**  
A: Yes! See SUPPORT_CHAT_SETUP.md for customization options

**Q: Does it work on mobile?**  
A: Yes! Full responsive support

**Q: What if I have multiple apps?**  
A: Create separate API keys for each

**Q: Can I change the AI personality?**  
A: Yes! Edit the system prompt in geminiService.js

---

## 📊 Success Indicators

✅ **Chat System is Ready When:**
- [x] Build completes without errors
- [x] Dev server runs without errors
- [x] "Get expert help" widget visible
- [x] Chat opens when clicked
- [x] Welcome message appears
- [x] Can send messages
- [x] AI responds within 5 seconds
- [x] No errors in browser console

---

## ⏱️ Time Estimates

| Step | Time |
|------|------|
| npm install | 30 sec |
| Get API key | 2 min |
| Create .env.local | 1 min |
| Build verification | 30 sec |
| Start dev server | 5 sec |
| Manual testing | 10 sec |
| **Total** | **~4 minutes** |

---

## 🎉 You're Done!

Your MessDekho app now has a premium AI support chat system!

Next: Share your app and let users experience the modern AI support! 🚀

---

**Questions?** Check the detailed guides:
- `SUPPORT_CHAT_SETUP.md` - Complete reference
- `SUPPORT_CHAT_QUICKSTART.md` - Quick reference
- `BUILD_SUMMARY.md` - What was built
- `VISUAL_GUIDE.md` - UI/UX guide
