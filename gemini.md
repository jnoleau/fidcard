# Project: Fidcard

## Overview
Fidcard is a mobile application built using **React Native** with **Expo**. It utilizes **Expo Router** for navigation and **NativeWind** for styling, allowing for a utility-first CSS approach similar to Tailwind CSS.

## Tech Stack
- **Framework**: [Expo](https://expo.dev/) (~54.0.26)
- **Core**: React Native (0.81.5)
- **Language**: TypeScript
- **Navigation**: Expo Router (~6.0.16)
- **Styling**: NativeWind (^4.2.1) / Tailwind CSS
- **Icons**: @expo/vector-icons

## Project Structure
- **`app/`**: Contains the application's routes and layout (Expo Router file-based routing).
  - `_layout.tsx`: The root layout file.
  - `index.tsx`: The entry screen.
- **`assets/`**: Stores static assets like images and fonts.
- **`components/`**: (Intended) Reusable UI components.
- **Configuration Files**:
  - `tailwind.config.js`: Tailwind CSS configuration.
  - `babel.config.js`: Babel configuration (includes NativeWind preset).
  - `metro.config.js`: Metro bundler configuration (with NativeWind support).
  - `tsconfig.json`: TypeScript configuration.

## Getting Started
1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Start the development server**:
   ```bash
   npm run start
   ```
   - Press `a` for Android emulator
   - Press `i` for iOS simulator
   - Press `w` for Web
