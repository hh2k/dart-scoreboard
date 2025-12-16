import { useState, useEffect } from 'react'
import { Player, GameMode } from '../App'
import './Scoreboard.css'

interface ScoreboardProps {
  players: Player[]
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>
  gameMode: GameMode
  onReset: () => void
}

const SCOREBOARD_STATE_KEY = 'dart-scoreboard-scoreboard-state'

function Scoreboard({ players, setPlayers, gameMode, onReset }: ScoreboardProps) {
  // Load scoreboard state from localStorage
  const loadScoreboardState = () => {
    const saved = localStorage.getItem(SCOREBOARD_STATE_KEY)
    if (saved) {
      try {
        const state = JSON.parse(saved)
        return {
          currentPlayerIndex: state.currentPlayerIndex ?? 0,
          gameOver: state.gameOver ?? false,
          winnerId: state.winnerId ?? null,
        }
      } catch (error) {
        console.error('Failed to load scoreboard state:', error)
      }
    }
    return {
      currentPlayerIndex: 0,
      gameOver: false,
      winnerId: null,
    }
  }

  const initialState = loadScoreboardState()
  // Ensure currentPlayerIndex is valid when players are loaded
  const getValidPlayerIndex = (savedIndex: number) => {
    if (players.length > 0 && savedIndex >= 0 && savedIndex < players.length) {
      return savedIndex
    }
    return 0
  }
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(
    players.length > 0 ? getValidPlayerIndex(initialState.currentPlayerIndex) : 0
  )
  const [dartInput, setDartInput] = useState('')
  const [gameOver, setGameOver] = useState(initialState.gameOver)
  const [winner, setWinner] = useState<Player | null>(
    initialState.winnerId
      ? players.find((p) => p.id === initialState.winnerId) ?? null
      : null
  )

  // Update currentPlayerIndex when players are loaded from saved state
  useEffect(() => {
    if (players.length > 0 && initialState.currentPlayerIndex !== undefined) {
      const validIndex = getValidPlayerIndex(initialState.currentPlayerIndex)
      setCurrentPlayerIndex(validIndex)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [players.length])

  // Save scoreboard state to localStorage
  useEffect(() => {
    const stateToSave = {
      currentPlayerIndex,
      gameOver,
      winnerId: winner?.id ?? null,
    }
    localStorage.setItem(SCOREBOARD_STATE_KEY, JSON.stringify(stateToSave))
  }, [currentPlayerIndex, gameOver, winner])

  // Update winner if players change (e.g., after reload)
  useEffect(() => {
    if (initialState.winnerId && !winner && players.length > 0) {
      const foundWinner = players.find((p) => p.id === initialState.winnerId)
      if (foundWinner) {
        setWinner(foundWinner)
      }
    }
  }, [players, initialState.winnerId, winner])

  const currentPlayer = players[currentPlayerIndex]

  const calculateScore = (darts: number[]): number => {
    return darts.reduce((sum, dart) => sum + dart, 0)
  }

  const handleDartInput = (value: string) => {
    // Allow numbers, empty string, and common dart inputs
    if (value === '' || /^\d*$/.test(value)) {
      setDartInput(value)
    }
  }

  const addDart = (value: number) => {
    if (gameOver) return

    const newPlayers = [...players]
    const player = newPlayers[currentPlayerIndex]
    
    // Check if turn already has 3 darts
    if (player.currentTurn.length >= 3) return
    
    const newTurn = [...player.currentTurn, value]
    const turnScore = calculateScore(newTurn)
    const newScore = player.score - turnScore

    // Check for bust (score goes below 0 or ends at 1)
    if (newScore < 0 || (newScore === 0 && newTurn.length < 3)) {
      // Bust - reset turn
      player.currentTurn = []
      player.scores.push([0, 0, 0])
      setPlayers(newPlayers)
      nextPlayer()
      return
    }

    player.currentTurn = newTurn

    // Check if the dart value is 180 (maximum possible turn score) - end turn automatically
    const turnTotal = calculateScore(newTurn)
    const isMaxScore = value === 180 || turnTotal === 180

    // If turn is complete (3 darts) or score is 0 or max score (180) reached
    if (newTurn.length === 3 || newScore === 0 || isMaxScore) {
      if (newScore === 0) {
        // Check if it's a valid finish (last dart must be double or bullseye)
        const lastDart = newTurn[newTurn.length - 1]
        if (lastDart % 2 === 0 || lastDart === 50) {
          // Game won!
          player.score = 0
          player.scores.push([...newTurn])
          player.currentTurn = []
          setGameOver(true)
          setWinner(player)
          setPlayers(newPlayers)
          return
        } else {
          // Invalid finish - bust
          player.currentTurn = []
          player.scores.push([0, 0, 0])
          setPlayers(newPlayers)
          nextPlayer()
          return
        }
      }

      // Normal turn complete (3 darts) or max score (180) reached
      if (isMaxScore && newTurn.length < 3) {
        // Max score reached - pad with zeros and end turn
        const paddedTurn = [...newTurn, ...Array(3 - newTurn.length).fill(0)]
        player.scores.push(paddedTurn)
        player.score = newScore
        player.currentTurn = []
        setPlayers(newPlayers)
        nextPlayer()
      } else {
        // Normal turn complete (3 darts)
        player.score = newScore
        player.scores.push([...newTurn])
        player.currentTurn = []
        setPlayers(newPlayers)
        nextPlayer()
      }
    } else {
      setPlayers(newPlayers)
    }
  }

  const nextPlayer = () => {
    setCurrentPlayerIndex((prev) => (prev + 1) % players.length)
    setDartInput('')
  }

  const submitDart = () => {
    const value = parseInt(dartInput)
    if (!isNaN(value) && value >= 0 && value <= 180) {
      addDart(value)
      setDartInput('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      submitDart()
    }
  }

  const quickAddDart = (value: number) => {
    addDart(value)
  }

  const undoLastDart = () => {
    if (gameOver) return
    const newPlayers = [...players]
    const player = newPlayers[currentPlayerIndex]
    if (player.currentTurn.length > 0) {
      player.currentTurn = player.currentTurn.slice(0, -1)
      setPlayers(newPlayers)
    }
  }

  const endTurn = () => {
    if (gameOver || currentPlayer.currentTurn.length === 0) return

    const newPlayers = [...players]
    const player = newPlayers[currentPlayerIndex]
    const currentTurn = [...player.currentTurn]
    const turnScore = calculateScore(currentTurn)
    const newScore = player.score - turnScore

    // Check for bust
    if (newScore < 0) {
      // Bust - pad the turn with zeros for display
      const paddedTurn = [...currentTurn, ...Array(3 - currentTurn.length).fill(0)]
      player.scores.push(paddedTurn)
      player.currentTurn = []
      nextPlayer()
      setPlayers(newPlayers)
      return
    }

    // Check if score is 0 (win condition)
    if (newScore === 0) {
      // Check if it's a valid finish (last dart must be double or bullseye)
      const lastDart = currentTurn[currentTurn.length - 1]
      if (lastDart % 2 === 0 || lastDart === 50) {
        // Game won!
        player.score = 0
        const paddedTurn = [...currentTurn, ...Array(3 - currentTurn.length).fill(0)]
        player.scores.push(paddedTurn)
        player.currentTurn = []
        setGameOver(true)
        setWinner(player)
        setPlayers(newPlayers)
        return
      } else {
        // Invalid finish - bust
        const paddedTurn = [...currentTurn, ...Array(3 - currentTurn.length).fill(0)]
        player.scores.push(paddedTurn)
        player.currentTurn = []
        nextPlayer()
        setPlayers(newPlayers)
        return
      }
    }

    // Normal turn end - save scores and update player score
    const paddedTurn = [...currentTurn, ...Array(3 - currentTurn.length).fill(0)]
    player.scores.push(paddedTurn)
    player.score = newScore
    player.currentTurn = []
    nextPlayer()
    setPlayers(newPlayers)
  }

  const getScoreDisplay = (score: number) => {
    if (score < 0) return 'BUST'
    if (score === 0) return 'WIN!'
    return score.toString()
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="scoreboard">
      <div className="scoreboard-header">
        <h2>{gameMode} Game</h2>
        <button className="reset-button" onClick={onReset}>
          New Game
        </button>
      </div>

      {gameOver && winner && (
        <div className="winner-banner">
          <h3>🎉 {winner.name} Wins! 🎉</h3>
          <button className="print-button" onClick={handlePrint}>
            Print Score Cards
          </button>
        </div>
      )}

      <div className="players-grid">
        {players.map((player, index) => {
          const isActive = index === currentPlayerIndex && !gameOver
          return (
            <div
              key={player.id}
              className={`player-card ${isActive ? 'active' : ''} ${
                gameOver && winner?.id === player.id ? 'winner' : ''
              }`}
            >
              <div className="player-header">
                <h3>{player.name}</h3>
                {isActive && <span className="active-badge">Current Turn</span>}
              </div>
              <div className="player-score">
                <div className="score-value">{getScoreDisplay(player.score)}</div>
                <div className="score-label">Remaining</div>
              </div>
              <div className="current-turn">
                {player.currentTurn.length > 0 && (
                  <div className="turn-darts">
                    {player.currentTurn.map((dart, i) => (
                      <span key={i} className="dart-value">
                        {dart}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="score-history">
                <div className="history-label">
                  {gameOver ? 'All Turns' : 'Recent Turns'}
                </div>
                <div className="history-list">
                  {(gameOver ? player.scores : player.scores.slice(-5))
                    .reverse()
                    .map((turn, i) => (
                      <div key={i} className="history-turn">
                        {turn.map((dart, j) => (
                          <span key={j} className="history-dart">
                            {dart}
                          </span>
                        ))}
                        <span className="turn-total">
                          ({turn.reduce((a, b) => a + b, 0)})
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {!gameOver && (
        <div className="input-section">
          <div className="input-container">
            <input
              type="text"
              className="dart-input"
              placeholder="Enter score (0-180)"
              value={dartInput}
              onChange={(e) => handleDartInput(e.target.value)}
              onKeyPress={handleKeyPress}
              autoFocus
            />
            <button className="submit-button" onClick={submitDart}>
              Add Dart
            </button>
            {currentPlayer.currentTurn.length > 0 && (
              <>
                <button className="undo-button" onClick={undoLastDart}>
                  Undo
                </button>
                <button className="end-turn-button" onClick={endTurn}>
                  End Turn
                </button>
              </>
            )}
          </div>
          <div className="score-selector">
            <div className="special-scores">
              <button
                className="score-button miss"
                onClick={() => quickAddDart(0)}
              >
                Miss (0)
              </button>
              <button
                className="score-button single-bull"
                onClick={() => quickAddDart(25)}
              >
                SB (25)
              </button>
              <button
                className="score-button double-bull"
                onClick={() => quickAddDart(50)}
              >
                DB (50)
              </button>
            </div>
            <div className="numbers-grid">
              {Array.from({ length: 20 }, (_, i) => i + 1)
                .reverse()
                .map((num) => (
                  <div key={num} className="number-group">
                    <div className="number-label">{num}</div>
                    <div className="score-options">
                      <button
                        className="score-button single"
                        onClick={() => quickAddDart(num)}
                        title={`Single ${num}`}
                      >
                        S
                      </button>
                      <button
                        className="score-button double"
                        onClick={() => quickAddDart(num * 2)}
                        title={`Double ${num} = ${num * 2}`}
                      >
                        D
                      </button>
                      <button
                        className="score-button triple"
                        onClick={() => quickAddDart(num * 3)}
                        title={`Triple ${num} = ${num * 3}`}
                      >
                        T
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Scoreboard

