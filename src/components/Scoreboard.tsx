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

// Common dart checkouts
const CHECKOUTS: Record<number, string> = {
  170: 'T20 T20 DB', 167: 'T20 T19 DB', 164: 'T20 T18 DB', 161: 'T20 T17 DB',
  160: 'T20 T20 D20', 158: 'T20 T20 D19', 157: 'T20 T19 D20', 156: 'T20 T20 D18',
  155: 'T20 T19 D19', 154: 'T20 T18 D20', 153: 'T20 T19 D18', 152: 'T20 T20 D16',
  151: 'T20 T17 D20', 150: 'T20 T18 D18', 149: 'T20 T19 D16', 148: 'T20 T20 D14',
  147: 'T20 T17 D18', 146: 'T20 T18 D16', 145: 'T20 T19 D14', 144: 'T20 T20 D12',
  143: 'T20 T17 D16', 142: 'T20 T14 D20', 141: 'T20 T19 D12', 140: 'T20 T20 D10',
  139: 'T20 T13 D20', 138: 'T20 T18 D12', 137: 'T20 T19 D10', 136: 'T20 T20 D8',
  135: 'T20 T17 D12', 134: 'T20 T14 D16', 133: 'T20 T19 D8', 132: 'T20 T16 D12',
  131: 'T20 T13 D16', 130: 'T20 T18 D8', 129: 'T19 T16 D12', 128: 'T18 T14 D16',
  127: 'T20 T17 D8', 126: 'T19 T19 D6', 125: 'DB T20 D15', 124: 'T20 T16 D8',
  123: 'T19 T16 D9', 122: 'T18 T18 D7', 121: 'T20 T11 D14', 120: 'T20 S20 D20',
  119: 'T19 T12 D13', 118: 'T20 S18 D20', 117: 'T20 S17 D20', 116: 'T20 S16 D20',
  115: 'T20 S15 D20', 114: 'T20 S14 D20', 113: 'T20 S13 D20', 112: 'T20 S12 D20',
  111: 'T20 S11 D20', 110: 'T20 S10 D20', 109: 'T20 S9 D20', 108: 'T20 S8 D20',
  107: 'T20 S7 D20', 106: 'T20 S6 D20', 105: 'T20 S5 D20', 104: 'T20 S4 D20',
  103: 'T20 S3 D20', 102: 'T20 S2 D20', 101: 'T20 S1 D20', 100: 'T20 D20',
  99: 'T19 S10 D16', 98: 'T20 D19', 97: 'T19 D20', 96: 'T20 D18',
  95: 'T19 D19', 94: 'T18 D20', 93: 'T19 D18', 92: 'T20 D16',
  91: 'T17 D20', 90: 'T18 D18', 89: 'T19 D16', 88: 'T20 D14',
  87: 'T17 D18', 86: 'T18 D16', 85: 'T15 D20', 84: 'T20 D12',
  83: 'T17 D16', 82: 'T14 D20', 81: 'T19 D12', 80: 'T20 D10',
  79: 'T13 D20', 78: 'T18 D12', 77: 'T19 D10', 76: 'T20 D8',
  75: 'T17 D12', 74: 'T14 D16', 73: 'T19 D8', 72: 'T16 D12',
  71: 'T13 D16', 70: 'T18 D8', 69: 'T19 D6', 68: 'T20 D4',
  67: 'T17 D8', 66: 'T10 D18', 65: 'T19 D4', 64: 'T16 D8',
  63: 'T13 D12', 62: 'T10 D16', 61: 'T15 D8', 60: 'S20 D20',
  59: 'S19 D20', 58: 'S18 D20', 57: 'S17 D20', 56: 'T16 D4',
  55: 'S15 D20', 54: 'S14 D20', 53: 'S13 D20', 52: 'T12 D8',
  51: 'S11 D20', 50: 'DB', 49: 'S9 D20', 48: 'S16 D16',
  47: 'S15 D16', 46: 'S6 D20', 45: 'S13 D16', 44: 'S4 D20',
  43: 'S3 D20', 42: 'S10 D16', 41: 'S9 D16', 40: 'D20',
  38: 'D19', 36: 'D18', 34: 'D17', 32: 'D16', 30: 'D15',
  28: 'D14', 26: 'D13', 24: 'D12', 22: 'D11', 20: 'D10',
  18: 'D9', 16: 'D8', 14: 'D7', 12: 'D6', 10: 'D5',
  8: 'D4', 6: 'D3', 4: 'D2', 2: 'D1',
}

function Scoreboard({ players, setPlayers, gameMode, onReset }: ScoreboardProps) {
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
    return { currentPlayerIndex: 0, gameOver: false, winnerId: null }
  }

  const initialState = loadScoreboardState()
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

  useEffect(() => {
    if (players.length > 0 && initialState.currentPlayerIndex !== undefined) {
      const validIndex = getValidPlayerIndex(initialState.currentPlayerIndex)
      setCurrentPlayerIndex(validIndex)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [players.length])

  useEffect(() => {
    const stateToSave = {
      currentPlayerIndex,
      gameOver,
      winnerId: winner?.id ?? null,
    }
    localStorage.setItem(SCOREBOARD_STATE_KEY, JSON.stringify(stateToSave))
  }, [currentPlayerIndex, gameOver, winner])

  useEffect(() => {
    if (initialState.winnerId && !winner && players.length > 0) {
      const foundWinner = players.find((p) => p.id === initialState.winnerId)
      if (foundWinner) setWinner(foundWinner)
    }
  }, [players, initialState.winnerId, winner])

  const currentPlayer = players[currentPlayerIndex]

  const calculateScore = (darts: number[]): number =>
    darts.reduce((sum, dart) => sum + dart, 0)

  const handleDartInput = (value: string) => {
    if (value === '' || /^\d*$/.test(value)) {
      setDartInput(value)
    }
  }

  const addDart = (value: number) => {
    if (gameOver) return
    const newPlayers = [...players]
    const player = newPlayers[currentPlayerIndex]
    if (player.currentTurn.length >= 3) return

    const newTurn = [...player.currentTurn, value]
    const turnScore = calculateScore(newTurn)
    const newScore = player.score - turnScore

    if (newScore < 0 || (newScore === 0 && newTurn.length < 3)) {
      player.currentTurn = []
      player.scores.push([0, 0, 0])
      setPlayers(newPlayers)
      nextPlayer()
      return
    }

    player.currentTurn = newTurn
    const turnTotal = calculateScore(newTurn)
    const isMaxScore = value === 180 || turnTotal === 180

    if (newTurn.length === 3 || newScore === 0 || isMaxScore) {
      if (newScore === 0) {
        const lastDart = newTurn[newTurn.length - 1]
        if (lastDart % 2 === 0 || lastDart === 50) {
          player.score = 0
          player.scores.push([...newTurn])
          player.currentTurn = []
          setGameOver(true)
          setWinner(player)
          setPlayers(newPlayers)
          return
        } else {
          player.currentTurn = []
          player.scores.push([0, 0, 0])
          setPlayers(newPlayers)
          nextPlayer()
          return
        }
      }

      if (isMaxScore && newTurn.length < 3) {
        const paddedTurn = [...newTurn, ...Array(3 - newTurn.length).fill(0)]
        player.scores.push(paddedTurn)
        player.score = newScore
        player.currentTurn = []
        setPlayers(newPlayers)
        nextPlayer()
      } else {
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
    if (e.key === 'Enter') submitDart()
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

    if (newScore < 0) {
      const paddedTurn = [...currentTurn, ...Array(3 - currentTurn.length).fill(0)]
      player.scores.push(paddedTurn)
      player.currentTurn = []
      nextPlayer()
      setPlayers(newPlayers)
      return
    }

    if (newScore === 0) {
      const lastDart = currentTurn[currentTurn.length - 1]
      if (lastDart % 2 === 0 || lastDart === 50) {
        player.score = 0
        const paddedTurn = [...currentTurn, ...Array(3 - currentTurn.length).fill(0)]
        player.scores.push(paddedTurn)
        player.currentTurn = []
        setGameOver(true)
        setWinner(player)
        setPlayers(newPlayers)
        return
      } else {
        const paddedTurn = [...currentTurn, ...Array(3 - currentTurn.length).fill(0)]
        player.scores.push(paddedTurn)
        player.currentTurn = []
        nextPlayer()
        setPlayers(newPlayers)
        return
      }
    }

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

  const getProjectedScore = (player: Player) => {
    if (player.currentTurn.length === 0) return null
    const turnTotal = calculateScore(player.currentTurn)
    const projected = player.score - turnTotal
    return projected
  }

  const getCheckoutHint = (score: number): string | null => {
    if (score <= 0 || score > 170) return null
    return CHECKOUTS[score] ?? null
  }

  const handlePrint = () => window.print()

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
          <h3>🎯 {winner.name} Wins!</h3>
          <p className="winner-sub">Checked out in {winner.scores.length} rounds</p>
          <button className="print-button" onClick={handlePrint}>
            Print Score Cards
          </button>
        </div>
      )}

      <div className="players-grid">
        {players.map((player, index) => {
          const isActive = index === currentPlayerIndex && !gameOver
          const projected = isActive ? getProjectedScore(player) : null
          const checkout = isActive ? getCheckoutHint(player.score) : null

          return (
            <div
              key={player.id}
              className={`player-card ${isActive ? 'active' : ''} ${
                gameOver && winner?.id === player.id ? 'winner' : ''
              }`}
            >
              <div className="player-header">
                <h3>{player.name}</h3>
                {isActive && <span className="active-badge">Now Playing</span>}
              </div>
              <div className="player-score">
                <div className="score-value">{getScoreDisplay(player.score)}</div>
                {projected !== null && projected >= 0 && (
                  <div className="score-projected">→ {projected} after turn</div>
                )}
                {projected !== null && projected < 0 && (
                  <div className="score-projected bust">BUST!</div>
                )}
                <div className="score-label">Remaining</div>
              </div>
              {checkout && (
                <div className="checkout-hint">
                  <span className="checkout-label">Checkout</span>
                  <span className="checkout-value">{checkout}</span>
                </div>
              )}
              <div className="score-history">
                <div className="history-label">
                  {gameOver ? 'All Rounds' : 'Recent Rounds'}
                </div>
                <div className="history-list">
                  {(gameOver ? player.scores : player.scores.slice(-6))
                    .map((turn, i, arr) => {
                      const roundNum = gameOver
                        ? player.scores.length - i
                        : player.scores.length - (arr.length - 1 - i)
                      return (
                        <div key={i} className="history-turn">
                          <span className="history-round">R{roundNum}</span>
                          {turn.map((dart, j) => (
                            <span key={j} className="history-dart">
                              {dart}
                            </span>
                          ))}
                          <span className="turn-total">
                            {turn.reduce((a, b) => a + b, 0)}
                          </span>
                        </div>
                      )
                    })
                    .reverse()}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {!gameOver && (
        <div className="input-section">
          <div className="turn-header">
            <span className="turn-player-name">{currentPlayer?.name}'s turn</span>
            <div className="dart-slots">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`dart-slot ${
                    currentPlayer?.currentTurn[i] !== undefined ? 'filled' : ''
                  } ${i === currentPlayer?.currentTurn.length ? 'next' : ''}`}
                >
                  {currentPlayer?.currentTurn[i] !== undefined
                    ? currentPlayer.currentTurn[i]
                    : '·'}
                </div>
              ))}
              {currentPlayer?.currentTurn.length > 0 && (
                <div className="dart-subtotal">
                  = {calculateScore(currentPlayer.currentTurn)}
                </div>
              )}
            </div>
          </div>

          <div className="input-container">
            <input
              type="number"
              className="dart-input"
              placeholder="0 – 180"
              value={dartInput}
              onChange={(e) => handleDartInput(e.target.value)}
              onKeyDown={handleKeyPress}
              min={0}
              max={180}
              autoFocus
            />
            <button className="submit-button" onClick={submitDart}>
              Add Dart
            </button>
            <button
              className="undo-button"
              onClick={undoLastDart}
              disabled={currentPlayer?.currentTurn.length === 0}
              title="Undo last dart"
            >
              Undo
            </button>
            <button
              className="end-turn-button"
              onClick={endTurn}
              disabled={currentPlayer?.currentTurn.length === 0}
            >
              End Turn
            </button>
          </div>

          <div className="score-selector">
            <div className="special-scores">
              <button className="score-button miss" onClick={() => addDart(0)}>
                Miss
              </button>
              <button className="score-button single-bull" onClick={() => addDart(25)}>
                Bull 25
              </button>
              <button className="score-button double-bull" onClick={() => addDart(50)}>
                Bull 50
              </button>
            </div>
            <div className="numbers-grid">
              {Array.from({ length: 20 }, (_, i) => 20 - i).map((num) => (
                <div key={num} className="number-group">
                  <div className="number-label">{num}</div>
                  <div className="score-options">
                    <button
                      className="score-button single"
                      onClick={() => addDart(num)}
                      title={`Single ${num}`}
                    >
                      S
                    </button>
                    <button
                      className="score-button double"
                      onClick={() => addDart(num * 2)}
                      title={`Double ${num} = ${num * 2}`}
                    >
                      D
                    </button>
                    <button
                      className="score-button triple"
                      onClick={() => addDart(num * 3)}
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
