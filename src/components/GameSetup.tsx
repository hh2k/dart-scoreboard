import { useState, useRef } from 'react'
import { GameMode } from '../App'
import './GameSetup.css'

interface GameSetupProps {
  onStartGame: (playerNames: string[], mode: GameMode) => void
}

function GameSetup({ onStartGame }: GameSetupProps) {
  const [playerNames, setPlayerNames] = useState<string[]>([''])
  const [gameMode, setGameMode] = useState<GameMode>('501')
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const addPlayer = () => {
    setPlayerNames((prev) => {
      const updated = [...prev, '']
      // Focus new input on next tick
      setTimeout(() => inputRefs.current[updated.length - 1]?.focus(), 0)
      return updated
    })
  }

  const removePlayer = (index: number) => {
    if (playerNames.length > 1) {
      setPlayerNames(playerNames.filter((_, i) => i !== index))
    }
  }

  const updatePlayerName = (index: number, name: string) => {
    const updated = [...playerNames]
    updated[index] = name
    setPlayerNames(updated)
  }

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const validNames = playerNames.filter((n) => n.trim())
      if (index < playerNames.length - 1) {
        inputRefs.current[index + 1]?.focus()
      } else if (validNames.length >= 1) {
        onStartGame(validNames, gameMode)
      } else {
        addPlayer()
      }
    }
  }

  const handleStart = () => {
    const validNames = playerNames.filter((name) => name.trim() !== '')
    if (validNames.length >= 1) {
      onStartGame(validNames, gameMode)
    }
  }

  return (
    <div className="game-setup">
      <div className="setup-card">
        <div className="setup-heading">
          <span className="setup-heading-label">New Match</span>
          <h2>Game Setup</h2>
          <div className="setup-divider" />
        </div>

        <div className="setup-section">
          <label className="setup-label">Game Mode</label>
          <div className="mode-selector">
            {(['501', '301'] as const).map((mode) => (
              <button
                key={mode}
                className={`mode-button ${gameMode === mode ? 'active' : ''}`}
                onClick={() => setGameMode(mode)}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <div className="setup-section">
          <label className="setup-label">Players</label>
          <div className="players-list">
            {playerNames.map((name, index) => (
              <div key={index} className="player-input-row">
                <span className="player-number">{index + 1}</span>
                <input
                  ref={(el) => { inputRefs.current[index] = el }}
                  type="text"
                  className="player-input"
                  placeholder={`Player ${index + 1}`}
                  value={name}
                  autoFocus={index === 0}
                  onChange={(e) => updatePlayerName(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                />
                {playerNames.length > 1 && (
                  <button
                    className="remove-button"
                    onClick={() => removePlayer(index)}
                    aria-label="Remove player"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
          <button className="add-player-button" onClick={addPlayer}>
            + Add Player
          </button>
        </div>

        <button
          className="start-button"
          onClick={handleStart}
          disabled={playerNames.filter((n) => n.trim()).length < 1}
        >
          Start Game
        </button>
      </div>
    </div>
  )
}

export default GameSetup
