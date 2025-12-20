# Quick Start Guide

Get the Ice Delivery Partner app running in 5 minutes.

## 1. Install Dependencies (2 minutes)

```bash
npm install
```

## 2. Configure Backend URL (30 seconds)

Open `src/constants/config.ts` and update:

```typescript
export const API_BASE_URL = "https://YOUR-BACKEND-URL.vercel.app/api"
```

## 3. Start Development Server (30 seconds)

```bash
npx expo start
```

## 4. Test on Device (2 minutes)

### Using Phone (Recommended)

1. Install Expo Go app on your phone
2. Scan QR code shown in terminal
3. App will open on your phone

### Using Emulator

- Press `a` for Android
- Press `i` for iOS (Mac only)

## 5. Test the Flow

1. **Register**: Create a partner account
2. **Approve**: Approve from backend dashboard
3. **Login**: Login with approved account
4. **Test Features**: Try orders, navigation, etc.

## Build APK (Optional)

If you need an APK to share:

```bash
# Install EAS
npm install -g eas-cli

# Login
eas login

# Build
eas build --platform android --profile preview
```

Wait 10-20 minutes, then download APK from the provided link.

## File Structure

```
app/
├── (auth)/          # Login, Register, OTP
├── (tabs)/          # Main app screens
│   ├── orders.tsx
│   ├── delivered.tsx
│   ├── goto.tsx
│   ├── sticky-note.tsx
│   └── profile.tsx
└── index.tsx        # Splash screen

src/
├── services/        # API, Location, Storage
├── contexts/        # Auth context
├── types/           # TypeScript types
└── constants/       # Config & colors
```

## Key Features

- ✅ Registration & OTP verification
- ✅ Order management with status updates
- ✅ Real-time location tracking (3-5 sec intervals)
- ✅ Customer search & navigation
- ✅ Sticky note orders
- ✅ Delivered orders (auto-grouped)
- ✅ Profile & logout

## Need More Help?

- See `SETUP_GUIDE.md` for detailed instructions
- See `README.md` for comprehensive documentation
- See `API_DOCUMENTATION.md` for API details

## Troubleshooting

**Can't connect to backend?**
- Check URL in config.ts
- Verify backend is running

**Location not working?**
- Grant location permissions
- Enable "Allow all the time" on Android

**Build failing?**
- Run `npm install` again
- Clear cache: `npx expo start -c`

## That's It!

You now have a fully functional delivery partner app. Happy coding!
