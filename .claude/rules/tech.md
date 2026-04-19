---
trigger: model_decision
description: Tech stack
---

The app uses **React Native** with **Expo**.

It utilizes **Expo Router** for navigation and **NativeWind** for styling, allowing for a utility-first CSS approach similar to Tailwind CSS.

## Tech Stack

- **Framework**: [Expo](https://expo.dev/)
- **Core**: React Native
- **Language**: TypeScript
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Navigation**: Expo Router
- **Styling**: NativeWind / Tailwind CSS
- **Icons**: @expo/vector-icons

## Package Management

- Always use `expo install [package]` when installing new packages to ensure compatibility with the current Expo version.

## Project Structure

- **`app/`**: Contains the application's routes and layout (Expo Router file-based routing).
  - `_layout.tsx`: The root layout file.
  - `index.tsx`: The entry screen.
- **`store/`**: Contains Zustand stores for state management.
- **`assets/`**: Stores static assets like images and fonts (shipped with the build).
- **`design/`**: Design sources (SVGs used to generate PNG assets). Excluded from EAS uploads via `.easignore`.
- **`components/`**: (Intended) Reusable UI components.
- **Configuration Files**:
  - `tailwind.config.js`: Tailwind CSS configuration.
  - `babel.config.js`: Babel configuration (includes NativeWind preset).
  - `metro.config.js`: Metro bundler configuration (with NativeWind support).
  - `tsconfig.json`: TypeScript configuration.
  - `.easignore`: Fully **replaces** `.gitignore` for EAS Build uploads (EAS does not merge them). Any new `.gitignore` rule must be duplicated here.

  ## Code Style
  - Always use `pnpm lint` to check for linting errors before committing code.
