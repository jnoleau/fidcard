const IS_DEV = process.env.APP_VARIANT === 'development';
const IS_PREVIEW = process.env.APP_VARIANT === 'preview';

const getAppName = () => {
  if (IS_DEV) return 'D Fidcard';
  if (IS_PREVIEW) return 'P Fidcard';
  return 'Fidcard';
};

const getUniqueIdentifier = () => {
  if (IS_DEV) return 'com.devanco.basic.fidcard.dev';
  if (IS_PREVIEW) return 'com.devanco.basic.fidcard.preview';
  return 'com.devanco.basic.fidcard';
};

export default {
  expo: {
    name: getAppName(),
    slug: 'fidcard',
    version: '1.0.3',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'fidcard',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      supportsTablet: false,
      bundleIdentifier: getUniqueIdentifier(),
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        CFBundleAllowMixedLocalizations: true,
        CFBundleDevelopmentRegion: 'en',
      },
    },
    android: {
      package: getUniqueIdentifier(),
      adaptiveIcon: {
        backgroundColor: '#FF4E6A',
        foregroundImage: './assets/images/android-icon-foreground.png',
        backgroundImage: './assets/images/android-icon-background.png',
        monochromeImage: './assets/images/android-icon-monochrome.png',
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      permissions: ['android.permission.CAMERA'],
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash-icon.png',
          imageWidth: 220,
          resizeMode: 'contain',
          backgroundColor: '#FF4E6A',
        },
      ],
      'expo-web-browser',
      [
        'expo-camera',
        {
          cameraPermission: 'Allow Fidcard to access your camera to scan loyalty cards.',
        },
      ],
      'expo-localization',
      'expo-font',
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    platforms: ['ios', 'android'],
    extra: {
      router: {},
      eas: {
        projectId: 'd43d4a89-0065-4d38-b54d-ecc1d5394cc7',
      },
    },
    owner: 'devanco',
  },
};
