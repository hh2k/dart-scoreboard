# 🎯 Dart Scoreboard

A modern, beautiful dart scoreboard web application built with React, Vite, and TypeScript.

## Features

- 🎮 Multiple game modes (501, 301)
- 👥 Support for 2+ players
- 📊 Real-time score tracking
- 🎨 Modern, dark-themed UI
- 📱 Responsive design
- ⚡ Fast and lightweight

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to the URL shown in the terminal (usually `http://localhost:5173`)

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## How to Use

1. **Setup**: Enter player names and select a game mode (501 or 301)
2. **Play**: Enter dart scores manually or use quick buttons
3. **Turn Management**: Each player gets 3 darts per turn
4. **Winning**: Finish on a double or bullseye (50) to win
5. **Bust**: Going below 0 or finishing incorrectly results in a bust

## Game Rules

- Players start with the selected score (501 or 301)
- Each turn consists of 3 darts
- To win, you must finish on a double (even number) or bullseye (50)
- If you go below 0 or finish incorrectly, your turn is busted and your score resets to the previous turn
- The game ends when a player reaches exactly 0 with a valid finish

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **CSS3** - Modern styling with CSS variables

## License

MIT
