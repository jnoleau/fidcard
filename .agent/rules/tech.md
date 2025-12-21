---
trigger: model_decision
description: Tech stack
---


The app uses **React Native** with **Expo**.

It utilizes **Expo Router** for navigation and **NativeWind** for styling, allowing for a utility-first CSS approach similar to Tailwind CSS.

## Tech Stack
- **Framework**: [Expo](https://expo.dev/) (~54.0.26)
- **Core**: React Native (0.81.5)
- **Language**: TypeScript
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Navigation**: Expo Router (~6.0.16)
- **Styling**: NativeWind (^4.2.1) / Tailwind CSS
- **Icons**: @expo/vector-icons

## Package Management
- Always use `expo install [package]` when installing new packages to ensure compatibility with the current Expo version.

## Project Structure
- **`app/`**: Contains the application's routes and layout (Expo Router file-based routing).
  - `_layout.tsx`: The root layout file.
  - `index.tsx`: The entry screen.
- **`store/`**: Contains Zustand stores for state management.
- **`assets/`**: Stores static assets like images and fonts.
- **`components/`**: (Intended) Reusable UI components.
- **Configuration Files**:
  - `tailwind.config.js`: Tailwind CSS configuration.
  - `babel.config.js`: Babel configuration (includes NativeWind preset).
  - `metro.config.js`: Metro bundler configuration (with NativeWind support).
  - `tsconfig.json`: TypeScript configuration.
