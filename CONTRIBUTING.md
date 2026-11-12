# Contributing to AppLocker

Thank you for considering contributing! 🙌

## Getting Started

1. **Fork** this repository
2. **Clone** your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/AppLocker.git
   cd AppLocker
   npm install
   ```
3. **Create a branch**:
   ```bash
   git checkout -b feat/your-feature-name
   ```

## Development

```bash
# Start Expo dev server
npx expo start

# Run unit tests
npm test

# Run tests with coverage
npm test -- --coverage --watchAll=false
```

## Project Structure

```
src/
├── components/     # Reusable UI atoms (PinPad, Toggle, AppIcon)
├── context/        # Global state via useReducer (AppContext)
├── navigation/     # Stack + Tab navigator
├── screens/        # Screen-level components
└── utils/          # Theme tokens, storage helpers, PIN logic
```

## Code Style

- Use functional components and hooks
- Keep business logic out of screen components (extract to `utils/`)
- Write a test for any new pure function you add under `utils/`
- Match the existing dark theme tokens from `theme.js`

## Submitting a Pull Request

1. Push your branch to your fork
2. Open a PR against `main`
3. Fill in the PR template
4. Wait for CI to pass

## Reporting Bugs

Use the **Bug Report** issue template. Include:
- Steps to reproduce
- Expected vs actual behaviour
- Platform (iOS / Android) and app version

## Code of Conduct

Be kind and respectful. We follow the [Contributor Covenant](https://www.contributor-covenant.org/).

