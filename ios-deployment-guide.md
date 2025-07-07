# iOS Deployment Guide for HabitFlow

This guide will help you build and deploy your React+Capacitor app to iOS devices and the App Store.

## Prerequisites

1. **macOS** with Xcode 14+ installed
2. **Node.js** 16+ and npm
3. **Capacitor CLI** installed globally: `npm install -g @capacitor/cli`
4. **iOS Simulator** or physical iOS device
5. **Apple Developer Account** (for device testing and App Store submission)

## Step 1: Install Dependencies

```bash
# Install all dependencies including Capacitor
npm install

# Install Capacitor iOS platform
npm run cap:add:ios
```

## Step 2: Build the React App

```bash
# Build the React app for production
npm run build:capacitor
```

This command:
- Creates an optimized production build in the `dist` folder
- Uses relative paths (base: './') for proper asset loading
- Splits code into chunks to reduce bundle size
- Minifies the code for better performance

## Step 3: Sync with Capacitor

```bash
# Sync the web assets with the iOS project
npm run cap:sync:ios
```

This command:
- Copies the built web assets to the iOS project
- Updates native dependencies
- Configures the iOS project with your app settings

## Step 4: Open in Xcode

```bash
# Open the iOS project in Xcode
npm run cap:open:ios
```

Or manually open: `ios/App/App.xcworkspace` (NOT the .xcodeproj file)

## Step 5: Configure iOS Project in Xcode

### 5.1 Basic Configuration
1. Select the **App** target in the project navigator
2. In **General** tab:
   - Set **Bundle Identifier**: `com.shivam.habitflow`
   - Set **Version**: `1.0.0`
   - Set **Build**: `1`
   - Set **Deployment Target**: `13.0` or higher
   - Choose your **Team** (Apple Developer Account)

### 5.2 App Icons and Launch Screen
1. In **App Icons and Launch Images**:
   - Add app icons (1024x1024 for App Store, various sizes for device)
   - Configure launch screen if needed

### 5.3 Capabilities and Permissions
1. In **Signing & Capabilities** tab:
   - Enable **Automatic Signing** (recommended)
   - Add capabilities if needed (Push Notifications, etc.)

### 5.4 Info.plist Configuration
Add these entries to `ios/App/App/Info.plist`:

```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
</dict>
<key>CFBundleDisplayName</key>
<string>HabitFlow</string>
<key>CFBundleShortVersionString</key>
<string>1.0.0</string>
<key>CFBundleVersion</key>
<string>1</string>
```

## Step 6: Test on Simulator

1. In Xcode, select **iOS Simulator** as the destination
2. Choose your preferred simulator (iPhone 14, iPad, etc.)
3. Click the **Play** button or press `Cmd+R`

### Common Simulator Issues:
- **White screen**: Check browser console in Simulator > Device > Web Inspector
- **Assets not loading**: Verify the build completed successfully
- **Firebase errors**: Check network connectivity and Firebase config

## Step 7: Test on Physical Device

1. Connect your iOS device via USB
2. In Xcode, select your device as the destination
3. Ensure your device is in **Developer Mode**:
   - Settings > Privacy & Security > Developer Mode > Enable
4. Click **Play** button to build and install

### Device Testing Issues:
- **Provisioning errors**: Ensure your Apple ID is added to the team
- **Trust issues**: Go to Settings > General > VPN & Device Management > Trust the developer
- **Network issues**: Ensure device has internet connectivity

## Step 8: Debug Common Issues

### White Screen on Launch
```bash
# Check if build was successful
ls -la dist/

# Rebuild and sync
npm run build:capacitor
npm run cap:sync:ios
```

### Firebase Connection Issues
1. Check `src/firebase/config.js` for correct configuration
2. Verify internet connectivity
3. Check Xcode console for Firebase errors

### Asset Loading Problems
1. Verify `vite.config.js` has `base: './'`
2. Check that all assets are in the `dist` folder after build
3. Ensure no absolute paths in your code

### Performance Issues
1. Check bundle size: `npm run build:capacitor` shows chunk sizes
2. Monitor memory usage in Xcode's Debug Navigator
3. Use iOS Simulator's Performance tools

## Step 9: Prepare for App Store

### 9.1 Archive the App
1. In Xcode, select **Any iOS Device** as destination
2. Go to **Product > Archive**
3. Wait for the archive to complete

### 9.2 Upload to App Store Connect
1. In the **Organizer** window that opens:
2. Select your archive
3. Click **Distribute App**
4. Choose **App Store Connect**
5. Follow the upload wizard

### 9.3 App Store Connect Configuration
1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Create a new app with your Bundle ID
3. Fill in app metadata:
   - App Name: "HabitFlow"
   - Subtitle: "Build & Break Habits"
   - Description: Your app description
   - Keywords: "habits, productivity, lifestyle"
   - Category: "Health & Fitness" or "Productivity"

### 9.4 Required Assets
- App Icon (1024x1024)
- Screenshots for different device sizes
- App Preview videos (optional but recommended)
- Privacy Policy URL
- Support URL

## Step 10: Automated Build Script

Create a build script for easier deployment:

```bash
#!/bin/bash
# build-ios.sh

echo "🚀 Building HabitFlow for iOS..."

# Clean previous builds
rm -rf dist/
rm -rf ios/App/App/public/

# Install dependencies
npm install

# Build React app
echo "📦 Building React app..."
npm run build:capacitor

# Sync with Capacitor
echo "🔄 Syncing with Capacitor..."
npm run cap:sync:ios

# Open Xcode
echo "📱 Opening Xcode..."
npm run cap:open:ios

echo "✅ Build complete! Ready for Xcode."
```

Make it executable: `chmod +x build-ios.sh`

## Troubleshooting Guide

### Issue: White screen on app launch
**Solution:**
1. Check browser console in iOS Simulator
2. Verify Firebase configuration
3. Ensure all assets are properly built

### Issue: "Module not found" errors
**Solution:**
1. Clear node_modules: `rm -rf node_modules && npm install`
2. Clear Capacitor cache: `npx cap sync --force`
3. Clean Xcode build: Product > Clean Build Folder

### Issue: App crashes on device
**Solution:**
1. Check Xcode console for crash logs
2. Verify iOS deployment target compatibility
3. Test on iOS Simulator first

### Issue: Firebase authentication not working
**Solution:**
1. Verify Firebase project configuration
2. Check iOS bundle ID matches Firebase settings
3. Ensure network permissions are set

### Issue: Large app size
**Solution:**
1. Check bundle analysis: `npm run build:capacitor`
2. Remove unused dependencies
3. Optimize images and assets
4. Enable code splitting in Vite config

## Performance Optimization

### Bundle Size Optimization
- Code splitting is already configured in `vite.config.js`
- Remove unused dependencies
- Use dynamic imports for large components
- Optimize images before including them

### Runtime Performance
- Use React.memo for expensive components
- Implement proper loading states
- Minimize re-renders with useCallback and useMemo
- Use iOS-specific optimizations in Capacitor config

### Memory Management
- Monitor memory usage in Xcode
- Implement proper cleanup in useEffect hooks
- Avoid memory leaks in Firebase listeners
- Use proper image sizing for iOS devices

## Continuous Integration (Optional)

For automated builds, you can set up GitHub Actions:

```yaml
# .github/workflows/ios-build.yml
name: iOS Build

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: macos-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build React app
      run: npm run build:capacitor
    
    - name: Sync Capacitor
      run: npx cap sync ios
    
    - name: Build iOS app
      run: |
        cd ios/App
        xcodebuild -workspace App.xcworkspace -scheme App -configuration Release -destination generic/platform=iOS build
```

## Final Checklist

Before submitting to App Store:

- [ ] App builds and runs on iOS Simulator
- [ ] App builds and runs on physical iOS device
- [ ] All features work correctly on iOS
- [ ] Firebase authentication and data sync work
- [ ] App icons and launch screen are configured
- [ ] App metadata is complete in App Store Connect
- [ ] Privacy policy and support URLs are set
- [ ] App has been tested on multiple iOS versions
- [ ] Performance is acceptable on older devices
- [ ] All required screenshots are uploaded

## Support

If you encounter issues:

1. Check the [Capacitor iOS documentation](https://capacitorjs.com/docs/ios)
2. Review [Firebase iOS setup guide](https://firebase.google.com/docs/ios/setup)
3. Check Xcode console for detailed error messages
4. Test on iOS Simulator first, then physical device
5. Verify all configuration files are correct

Remember: The key to successful iOS deployment is methodical testing at each step. Don't skip the simulator testing phase, and always check the Xcode console for errors.