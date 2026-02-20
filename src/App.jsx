import React, { useState, useEffect } from 'react';
import Game from './Game';
import './index.css';

const CHARACTERS = [
  { id: 'bird', emoji: '🐥', minScore: 0 },
  { id: 'robot', emoji: '🤖', minScore: 10 },
  { id: 'ninja', emoji: '🥷', minScore: 25 },
  { id: 'alien', emoji: '👽', minScore: 50 },
];

function App() {
  const [gameState, setGameState] = useState('START'); // START, PLAYING, GAME_OVER
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('flappyHighScore') || '0'));
  const [selectedChar, setSelectedChar] = useState(() => localStorage.getItem('flappyChar') || '🐥');
  const [theme, setTheme] = useState('day');

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('flappyHighScore', score.toString());
    }

    // Auto theme change every 15 points
    const themeIndex = Math.floor(score / 15) % 2;
    setTheme(themeIndex === 0 ? 'day' : 'night');
  }, [score, highScore]);

  const startGame = () => {
    setGameState('PLAYING');
  };

  const restartGame = () => {
    setGameState('START');
  };

  const selectCharacter = (emoji, minScore) => {
    if (highScore >= minScore) {
      setSelectedChar(emoji);
      localStorage.setItem('flappyChar', emoji);
      // Play select sound
      new Audio('https://assets.mixkit.co/sfx/preview/mixkit-positive-interface-click-1112.mp3').play().catch(() => { });
    }
  };

  return (
    <div className={`game-container ${theme}`}>
      <div className="score-display">{score}</div>

      {gameState === 'START' && (
        <div className="overlay">
          <h1>FLAPPY BIRD</h1>
          <p>Tap atau Press Space untuk Lompat</p>
          <div className="high-score">High Score: {highScore}</div>

          <div className="character-select">
            {CHARACTERS.map((char) => (
              <div
                key={char.id}
                className={`char-option ${selectedChar === char.emoji ? 'selected' : ''} ${highScore < char.minScore ? 'locked' : ''}`}
                onClick={() => selectCharacter(char.emoji, char.minScore)}
                title={highScore < char.minScore ? `Unlock at ${char.minScore} points` : ''}
              >
                {char.emoji}
              </div>
            ))}
          </div>

          <button className="btn" onClick={startGame}>START GAME</button>
        </div>
      )}

      {gameState === 'GAME_OVER' && (
        <div className="overlay">
          <h1>GAME OVER</h1>
          <div className="stats">
            <p>Score: {score}</p>
            <p>Best: {highScore}</p>
          </div>
          <button className="btn" onClick={restartGame}>RESTART</button>
        </div>
      )}

      <Game
        gameState={gameState}
        setGameState={setGameState}
        score={score}
        setScore={setScore}
        highScore={highScore}
        setHighScore={setHighScore}
        character={selectedChar}
        theme={theme}
      />
    </div>
  );
}

export default App;
