# Ice Delivery Partner App - Complete Setup Guide

This guide will walk you through setting up and building the Ice Delivery Partner mobile app from scratch.

## Prerequisites Checklist

Before you begin, ensure you have:

- [ ] Node.js v18+ installed ([Download](https://nodejs.org/))
- [ ] npm or yarn package manager
- [ ] Git (optional, for version control)
- [ ] A code editor (VS Code recommended)
- [ ] Backend API URL ready

## Step 1: Install Dependencies

```bash
# Navigate to project directory
cd ice-delivery-partner-app

# Install all dependencies
npm install

# or with yarn
yarn install
```

This will install all required packages including:
- React Native
- Expo SDK
- Navigation libraries
- Location tracking
- AsyncStorage
- And more...

## Step 2: Configure Backend URL

1. Open `src/constants/config.ts`
2. Update the `API_BASE_URL` with your backend URL:

```typescript
export const API_BASE_URL = "https://your-actual-backend-url.vercel.app/api"
```

**Important**: Make sure to replace this with your actual backend URL!

## Step 3: Test in Development

### Option A: Using Expo Go (Recommended for Testing)

1. Install Expo Go on your phone:
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. Start the development server:
   ```bash
   npx expo start
   ```

3. Scan the QR code with:
   - **iOS**: Camera app
   - **Android**: Expo Go app

### Option B: Using Emulator/Simulator

**For Android:**
```bash
npx expo start --android
```
(Requires Android Studio and emulator installed)

**For iOS (Mac only):**
```bash
npx expo start --ios
```
(Requires Xcode and iOS Simulator)

## Step 4: Build APK for Distribution

### Method 1: Using EAS Build (Recommended)

This is the easiest way to build an APK you can share.

1. **Install EAS CLI:**
   ```bash
   npm install -g eas-cli
   ```

2. **Login or create Expo account:**
   ```bash
   eas login
   ```

3. **Configure project:**
   ```bash
   eas build:configure
   ```
   Select "All" when asked about platforms.

4. **Build APK:**
   ```bash
   eas build --platform android --profile preview
   ```

5. **Wait for build to complete** (usually 10-20 minutes)
   - You'll get a link to download the APK
   - Share this APK file with your users

### Method 2: Local Build (Advanced)

Only use this if you can't use EAS Build:

1. **Generate native Android project:**
   ```bash
   npx expo prebuild --platform android
   ```

2. **Build APK:**
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

3. **Find APK at:**
   ```
   android/app/build/outputs/apk/release/app-release.apk
   ```

## Step 5: Testing the App

### Test Checklist

1. **Registration Flow**
   - [ ] Register a new partner
   - [ ] Verify pending status message
   - [ ] Approve partner from backend dashboard
   - [ ] Login with approved account

2. **OTP Verification**
   - [ ] Enter email and password
   - [ ] Check email for OTP
   - [ ] Enter OTP to verify
   - [ ] Successfully login

3. **Orders**
   - [ ] View pending orders list
   - [ ] Search for orders
   - [ ] Pull to refresh orders
   - [ ] Open order details
   - [ ] Call customer
   - [ ] Open maps navigation
   - [ ] Update order status

4. **Delivered Orders**
   - [ ] View delivered orders
   - [ ] Check grouping (Today, Yesterday, etc.)
   - [ ] Refresh delivered list

5. **Go To (Navigation)**
   - [ ] Search for customers
   - [ ] View customer details
   - [ ] Call customer
   - [ ] Navigate to address
   - [ ] Check search history

6. **Sticky Notes**
   - [ ] Create new order
   - [ ] Use customer auto-suggest
   - [ ] Use product auto-suggest
   - [ ] Submit order
   - [ ] Verify on manager dashboard

7. **Location Tracking**
   - [ ] Grant location permissions
   - [ ] Verify location updates every 3-5 seconds
   - [ ] Check manager dashboard shows live location

8. **Profile**
   - [ ] View partner details
   - [ ] Check app version
   - [ ] Logout successfully

## Common Issues & Solutions

### Issue: "Network Error" or API not connecting

**Solution:**
1. Check backend URL in `config.ts` is correct
2. Ensure backend is running and accessible
3. Try accessing backend URL in browser
4. Check if you're on the same network (for local backend)

### Issue: Location not tracking

**Solution:**
1. Ensure location permissions are granted
2. Check app settings on device
3. For Android: Enable "Allow all the time" for location
4. Restart the app after granting permissions

### Issue: OTP not received

**Solution:**
1. Check spam/junk folder
2. Verify email service is configured on backend
3. Check backend logs for errors
4. Try resend OTP

### Issue: Build fails with EAS

**Solution:**
1. Clear cache: `npx expo start -c`
2. Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
3. Check EAS build logs for specific error
4. Ensure `eas.json` is properly configured

### Issue: App crashes on launch

**Solution:**
1. Check console logs for errors
2. Verify all dependencies are installed
3. Clear app data on device
4. Rebuild and reinstall app

## Environment-Specific Configuration

### Development
- Uses local/dev backend URL
- More verbose logging
- Hot reload enabled

### Production
- Uses production backend URL
- Minimal logging
- Optimized builds

## Updating the App

When you make changes to the code:

1. **During Development:**
   - Changes auto-reload with Expo Go
   - No need to rebuild

2. **For Production APK:**
   - Rebuild APK with `eas build`
   - Distribute new APK to users
   - Users uninstall old version and install new one

## Distribution

### Sharing the APK

1. After build completes, download APK from EAS
2. Share via:
   - Email
   - Cloud storage (Google Drive, Dropbox)
   - File sharing apps
   - Direct transfer

### Installing on Android Devices

1. Enable "Install from Unknown Sources" in device settings
2. Download APK file
3. Open APK file
4. Follow installation prompts
5. Open app and login

**Note:** This is not published to Play Store, so users must allow unknown sources.

## Backend API Requirements

Ensure your backend has these endpoints ready:

```
Authentication:
- POST /api/delivery/register
- POST /api/delivery/login-otp
- POST /api/delivery/verify-otp
- GET /api/delivery/profile

Orders:
- GET /api/delivery/orders
- GET /api/delivery/delivered-orders
- POST /api/delivery/update-order-status

Customers:
- GET /api/delivery/search-customers
- GET /api/delivery/customer-details
- POST /api/delivery/search-history
- GET /api/delivery/search-history

Sticky Notes:
- POST /api/delivery/sticky-notes
- GET /api/delivery/search-products

Location:
- POST /api/delivery/update-location
```

## Performance Optimization

### Tips for Smooth Performance

1. **Location Tracking:**
   - Default 3-second interval is optimal
   - Increase to 5 seconds for better battery life
   - Decrease to 1-2 seconds for more accuracy

2. **Image Loading:**
   - App uses icons (no heavy images)
   - Fast loading times

3. **API Calls:**
   - Implements caching where possible
   - Pull-to-refresh for manual updates

## Security Considerations

1. **API Keys:**
   - Never commit sensitive keys to git
   - Use environment variables for production

2. **User Data:**
   - Stored locally with AsyncStorage
   - Cleared on logout
   - No sensitive data in logs

3. **Location Privacy:**
   - Only tracked for approved partners
   - User controls permissions
   - Can be stopped by logout

## Support & Maintenance

### Regular Maintenance Tasks

- [ ] Update dependencies monthly
- [ ] Test on latest Android versions
- [ ] Monitor crash reports
- [ ] Update API endpoints if backend changes
- [ ] Review and optimize location tracking

### Getting Help

1. Check this guide thoroughly
2. Review backend API logs
3. Check mobile app console logs
4. Test individual features in isolation

## Version Management

Current Version: **1.0.0**

To update version:
1. Update in `app.json` under `expo.version`
2. Update in `src/constants/config.ts` under `APP_VERSION`
3. Rebuild APK

## Final Checklist Before Distribution

- [ ] Backend URL is set to production
- [ ] All features tested and working
- [ ] Location tracking tested
- [ ] APK built successfully
- [ ] APK tested on physical device
- [ ] Partners briefed on installation process
- [ ] Support contact information ready

## Congratulations!

Your Ice Delivery Partner app is ready to use. Partners can now:
- Register and get approved
- Receive and deliver orders
- Track deliveries in real-time
- Create sticky notes
- Navigate to customers
- And more!

---

**Need Help?** Review the troubleshooting section or check backend logs for detailed error messages.
