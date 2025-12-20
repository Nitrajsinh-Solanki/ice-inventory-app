# Ice Inventory Delivery Partner App

A comprehensive React Native mobile application for ice delivery partners, built with Expo and TypeScript.

## Features

### Authentication
- Partner registration with admin approval workflow
- Email + Password + OTP verification
- Secure session management
- Auto-logout for deleted/rejected accounts

### Order Management
- **Pending Orders**: View and manage all pending deliveries
- **Order Details**: Complete customer information with call and navigation actions
- **Status Updates**: Change order status (Pending → On the Way → Delivered)
- **Delivered Orders**: Auto-grouped by Today, Yesterday, This Week, and Older

### Navigation & Search
- **Go To Feature**: Search customers by name, shop, or address
- Customer details with call and maps integration
- Search history for quick access
- Real-time customer search with suggestions

### Sticky Notes
- Create custom orders visible on manager dashboard
- Auto-suggest for customer and product names
- Additional notes support

### Real-time Location Tracking
- GPS tracking every 3-5 seconds
- Background location updates
- Live tracking visible on manager dashboard
- Automatic permission handling

### Profile Management
- View partner information
- App version and details
- Secure logout functionality

## Tech Stack

- **Framework**: React Native (Expo)
- **Language**: TypeScript
- **Navigation**: Expo Router (file-based routing)
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Storage**: AsyncStorage
- **Location**: Expo Location with Background Tasks
- **UI Components**: Custom components with Ionicons

## Project Structure

```
├── app/
│   ├── (auth)/              # Authentication screens
│   │   ├── home.tsx         # Landing page
│   │   ├── login.tsx        # Login screen
│   │   ├── register.tsx     # Registration screen
│   │   └── verify-otp.tsx   # OTP verification
│   ├── (tabs)/              # Main app tabs
│   │   ├── orders.tsx       # Pending orders list
│   │   ├── delivered.tsx    # Delivered orders (grouped)
│   │   ├── goto.tsx         # Customer search & navigation
│   │   ├── sticky-note.tsx  # Create sticky note orders
│   │   ├── profile.tsx      # Profile screen
│   │   └── order-details/   # Order details screens
│   └── index.tsx            # Splash screen
├── src/
│   ├── constants/
│   │   └── config.ts        # App configuration
│   ├── contexts/
│   │   └── AuthContext.tsx  # Authentication context
│   ├── services/
│   │   ├── api.ts           # API service layer
│   │   ├── storage.ts       # AsyncStorage wrapper
│   │   └── location.ts      # Location tracking service
│   └── types/
│       └── index.ts         # TypeScript definitions
└── package.json
```

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (for Mac) or Android Studio (for Android development)
- Physical device with Expo Go app (recommended for testing)

## Installation

1. **Clone or extract the project**

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure API endpoint**
   
   Update `src/constants/config.ts` with your backend URL:
   ```typescript
   export const API_BASE_URL = "https://your-backend-url.vercel.app/api"
   ```

4. **Start the development server**
   ```bash
   npx expo start
   ```

5. **Run on device/simulator**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on physical device

## Building for Production

### Build APK for Android

1. **Install EAS CLI**
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo**
   ```bash
   eas login
   ```

3. **Configure build**
   ```bash
   eas build:configure
   ```

4. **Build APK**
   ```bash
   eas build --platform android --profile preview
   ```

   This will create an APK file that you can share and install directly on Android devices.

### Alternative: Local Build

For a completely local build without Expo services:

```bash
# Generate native Android project
npx expo prebuild --platform android

# Build APK
cd android
./gradlew assembleRelease

# APK will be in: android/app/build/outputs/apk/release/
```

## Backend API Endpoints

The app connects to the following backend endpoints:

### Authentication
- `POST /api/delivery/register` - Partner registration
- `POST /api/delivery/login-otp` - Login and send OTP
- `POST /api/delivery/verify-otp` - Verify OTP
- `GET /api/delivery/profile` - Get partner profile

### Orders
- `GET /api/delivery/orders` - Get pending orders
- `GET /api/delivery/delivered-orders` - Get delivered orders (grouped)
- `POST /api/delivery/update-order-status` - Update order status

### Customers
- `GET /api/delivery/search-customers` - Search customers
- `GET /api/delivery/customer-details` - Get customer details
- `POST /api/delivery/search-history` - Save search history
- `GET /api/delivery/search-history` - Get search history

### Sticky Notes
- `POST /api/delivery/sticky-notes` - Create sticky note order
- `GET /api/delivery/search-products` - Search products

### Location Tracking
- `POST /api/delivery/update-location` - Update GPS location

## Configuration Options

### Location Tracking Interval

Adjust in `src/constants/config.ts`:
```typescript
export const LOCATION_UPDATE_INTERVAL = 3000 // milliseconds (default: 3 seconds)
```

### Colors and Theme

Customize app colors in `src/constants/config.ts`:
```typescript
export const COLORS = {
  primary: "#1e40af",
  secondary: "#3b82f6",
  success: "#10b981",
  // ... more colors
}
```

## Permissions

The app requires the following permissions:

- **Location** (Always): For real-time GPS tracking
- **Internet**: For API communication
- **Background Tasks**: For location updates when app is in background

Permissions are requested automatically on first use.

## Troubleshooting

### Location not tracking
- Ensure location permissions are granted
- Check that background location is enabled
- Verify API endpoint is correct

### Login/OTP issues
- Verify backend is running and accessible
- Check network connectivity
- Ensure partner account is approved

### Build errors
- Clear cache: `npx expo start -c`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check Node.js version

## Key Features Implementation

### Auto Logout
The app automatically logs out partners if their account status changes to `deleted` or `rejected`. This check happens:
- On app startup
- When refreshing partner data
- On API calls that return 403/404

### Background Location
Location tracking continues even when the app is in background or screen is locked. The app sends GPS coordinates every 3-5 seconds to the backend.

### Order Status Flow
```
Pending → On the Way → Delivered
```

Each status change is tracked with timestamps and partner information.

## Development Tips

1. **Hot Reload**: Changes to code will automatically reload the app
2. **Debugging**: Shake device or press `Cmd+D` (iOS) / `Cmd+M` (Android) for dev menu
3. **Console Logs**: Use React Native Debugger or view logs in terminal
4. **Network Inspection**: Enable network inspector in Expo dev tools

## Support

For issues or questions:
- Check backend API is running correctly
- Verify all environment variables are set
- Review console logs for detailed error messages

## License

Private build for internal use only.

---

Built with React Native + Expo + TypeScript
