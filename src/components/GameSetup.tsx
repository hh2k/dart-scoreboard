import { useState } from 'react'
import { GameMode } from '../App'
import './GameSetup.css'

interface GameSetupProps {
  onStartGame: (playerNames: string[], mode: GameMode) => void
}

function GameSetup({ onStartGame }: GameSetupProps) {
  const [playerNames, setPlayerNames] = useState<string[]>([''])
  const [gameMode, setGameMode] = useState<GameMode>('501')

  const addPlayer = () => {
    setPlayerNames([...playerNames, ''])
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

  const handleStart = () => {
    const validNames = playerNames.filter((name) => name.trim() !== '')
    if (validNames.length >= 1) {
      onStartGame(validNames, gameMode)
    }
  }

  return (
    <div className="game-setup">
      <div className="setup-card">
        <h2>Game Setup</h2>

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
                <input
                  type="text"
                  className="player-input"
                  placeholder={`Player ${index + 1}`}
                  value={name}
                  onChange={(e) => updatePlayerName(index, e.target.value)}
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

