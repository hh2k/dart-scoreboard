import { useState, useEffect } from 'react'
import Scoreboard from './components/Scoreboard'
import GameSetup from './components/GameSetup'
import ConfirmDialog from './components/ConfirmDialog'
import './App.css'

export interface Player {
  id: string
  name: string
  score: number
  scores: number[][]
  currentTurn: number[]
}

export type GameMode = '501' | '301'

interface SavedGameState {
  players: Player[]
  gameMode: GameMode
  currentPlayerIndex: number
  gameOver: boolean
  winnerId: string | null
}

const STORAGE_KEY = 'dart-scoreboard-game-state'

function App() {
  const [players, setPlayers] = useState<Player[]>([])
  const [gameMode, setGameMode] = useState<GameMode>('501')
  const [gameStarted, setGameStarted] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  // Load game state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem(STORAGE_KEY)
    if (savedState) {
      try {
        const state: SavedGameState = JSON.parse(savedState)
        setPlayers(state.players)
        setGameMode(state.gameMode)
        setGameStarted(true)
      } catch (error) {
        console.error('Failed to load saved game state:', error)
        localStorage.removeItem(STORAGE_KEY)
      }
    }
  }, [])

  // Save game state to localStorage whenever it changes
  useEffect(() => {
    if (gameStarted && players.length > 0) {
      const stateToSave: SavedGameState = {
        players,
        gameMode,
        currentPlayerIndex: 0, // Will be updated by Scoreboard component
        gameOver: false, // Will be updated by Scoreboard component
        winnerId: null, // Will be updated by Scoreboard component
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [players, gameMode, gameStarted])

  // Warn user before leaving if game is active
  useEffect(() => {
    if (!gameStarted) return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = 'You have an active game in progress. Are you sure you want to leave?'
      return e.returnValue
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [gameStarted])

  const handleStartGame = (playerNames: string[], mode: GameMode) => {
    const initialScore = parseInt(mode)
    const newPlayers: Player[] = playerNames.map((name, index) => ({
      id: `player-${index}`,
      name,
      score: initialScore,
      scores: [],
      currentTurn: [],
    }))
    setPlayers(newPlayers)
    setGameMode(mode)
    setGameStarted(true)
  }

  const handleResetGame = () => {
    if (gameStarted) {
      setShowConfirmDialog(true)
      return
    }
    resetGame()
  }

  const resetGame = () => {
    setPlayers([])
    setGameStarted(false)
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem('dart-scoreboard-scoreboard-state')
    setShowConfirmDialog(false)
  }

  const handleCancelReset = () => {
    setShowConfirmDialog(false)
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Dart Scoreboard</h1>
      </header>
      <main className="app-main">
        {!gameStarted ? (
          <GameSetup onStartGame={handleStartGame} />
        ) : (
          <Scoreboard
            players={players}
            setPlayers={setPlayers}
            gameMode={gameMode}
            onReset={handleResetGame}
          />
        )}
      </main>
      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="Start New Game?"
        message="Are you sure you want to start a new game? This will reset all scores and progress."
        onConfirm={resetGame}
        onCancel={handleCancelReset}
        confirmText="New Game"
        cancelText="Cancel"
      />
    </div>
  )
}

export default App

