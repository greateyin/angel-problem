'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import {
  getPossibleMoves,
  posToKey,
  makeDemonMoveAI,
  makeAngelMoveAI,
} from './gameLogic';
import GameScene from './components/GameScene';

export default function AngelProblemGame() {
  const [gameStarted, setGameStarted] = useState(false);
  const [mode, setMode] = useState('human_vs_human');
  const [K, setK] = useState(2);
  const [angelPos, setAngelPos] = useState({ x: 0, y: 0 });
  const [roadblocks, setRoadblocks] = useState(new Set());
  const [turn, setTurn] = useState('demon');
  const [message, setMessage] = useState('Select a mode. Demon places a block first.');
  const [isGameActive, setIsGameActive] = useState(true);

  const isDemonAI = mode === 'ai_vs_human' || mode === 'ai_vs_ai';
  const isAngelAI = mode === 'human_vs_ai' || mode === 'ai_vs_ai';

  const possibleMoves = useMemo(() => {
    if (!isGameActive) return [];
    return getPossibleMoves(angelPos, K, roadblocks);
  }, [angelPos, K, roadblocks, isGameActive]);

  const angelPosKey = posToKey(angelPos);

  const endGame = useCallback((text) => {
    setIsGameActive(false);
    setTurn('game_over');
    setMessage(text);
  }, []);

  const handlePlaceRoadblock = useCallback(
    (x, y, isAI = false) => {
      if (!isGameActive || (!isAI && isDemonAI)) return;
      if (turn !== 'demon') {
        if (!isAI) setMessage("It's not the Demon's turn.");
        return;
      }

      const targetKey = `${x},${y}`;
      if (targetKey === angelPosKey) {
        if (!isAI) setMessage('Demon cannot place a block on the Angel!');
        return;
      }
      if (roadblocks.has(targetKey)) {
        if (!isAI) setMessage('There is already a block here.');
        return;
      }

      setRoadblocks((prev) => new Set(prev).add(targetKey));
      setTurn('angel');
      setMessage(`${isAI ? '😈 AI' : '😈 Human'} Demon placed a block at (${x}, ${y}). Angel's turn.`);
    },
    [angelPosKey, isDemonAI, isGameActive, roadblocks, turn]
  );

  const handleMoveAngel = useCallback(
    (x, y, isAI = false) => {
      if (!isGameActive || (!isAI && isAngelAI)) return;
      if (turn !== 'angel') {
        if (!isAI) setMessage("It's not the Angel's turn.");
        return;
      }

      if (possibleMoves.length === 0) {
        endGame('Angel is failing to escape.');
        setTimeout(handleReset, 3000);
        return;
      }

      const targetKey = posToKey({ x, y });
      const isPossible = possibleMoves.some((p) => p.x === x && p.y === y);
      if (!isPossible) {
        if (!isAI) setMessage(`Angel cannot move to (${x}, ${y}). Too far (K=${K}) or blocked.`);
        return;
      }

      setAngelPos({ x, y });

      if (Math.max(Math.abs(x), Math.abs(y)) >= 25) {
        endGame('The Angel has escaped the Demon\'s trap! Angel Wins!');
        return;
      }

      setTurn('demon');
      setMessage(`${isAI ? '😇 AI' : '😇 Human'} Angel moved to (${x}, ${y}). Demon's turn.`);
    },
    [endGame, isAngelAI, isGameActive, possibleMoves, turn]
  );

  useEffect(() => {
    if (!isGameActive || turn === 'game_over') return;

    const delay = 800; // Slightly slower for better readability

    if (turn === 'demon' && isDemonAI) {
      const timer = setTimeout(() => {
        const next = makeDemonMoveAI(angelPos, K, roadblocks);
        if (next) {
          handlePlaceRoadblock(next.x, next.y, true);
        } else {
          setMessage('Demon AI cannot find a move.');
        }
      }, delay);
      return () => clearTimeout(timer);
    }

    if (turn === 'angel' && isAngelAI) {
      const timer = setTimeout(() => {
        if (possibleMoves.length === 0) {
          endGame('Angel is failing to escape.');
          setTimeout(handleReset, 3000);
          return;
        }

        const next = makeAngelMoveAI(possibleMoves, roadblocks);
        if (next) {
          handleMoveAngel(next.x, next.y, true);
        } else {
          setMessage('Angel AI cannot find a move.');
        }
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [angelPos, K, endGame, handleMoveAngel, handlePlaceRoadblock, isAngelAI, isDemonAI, isGameActive, possibleMoves, roadblocks, turn]);

  const handleReset = useCallback(() => {
    setMode('human_vs_human');
    setK(2);
    setAngelPos({ x: 0, y: 0 });
    setRoadblocks(new Set());
    setTurn('demon');
    setMessage('Select a mode. Demon places a block first.');
    setIsGameActive(true);
  }, []);

  const handleCellClick = (x, y) => {
    if (!isGameActive) return;
    if (turn === 'demon' && !isDemonAI) {
      handlePlaceRoadblock(x, y);
    } else if (turn === 'angel' && !isAngelAI) {
      handleMoveAngel(x, y);
    }
  };

  const styles = {
    container: {
      position: 'relative',
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      backgroundColor: '#000',
    },
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 100,
      color: 'white',
      padding: '40px',
      textAlign: 'center',
    },
    storyTitle: {
      fontSize: '3rem',
      marginBottom: '20px',
      color: '#fbbf24',
      textShadow: '0 0 20px rgba(251, 191, 36, 0.5)',
    },
    storyText: {
      fontSize: '1.2rem',
      lineHeight: '1.6',
      maxWidth: '800px',
      marginBottom: '40px',
      color: '#e5e7eb',
    },
    startButton: {
      padding: '15px 40px',
      fontSize: '1.5rem',
      backgroundColor: '#fbbf24',
      color: 'black',
      border: 'none',
      borderRadius: '50px',
      cursor: 'pointer',
      fontWeight: 'bold',
      transition: 'transform 0.2s, box-shadow 0.2s',
      boxShadow: '0 0 20px rgba(251, 191, 36, 0.5)',
    },
    controls: {
      position: 'absolute',
      top: '20px',
      left: '20px',
      zIndex: 10,
      backgroundColor: 'rgba(0, 0, 0, 0.85)', // Darker background
      padding: '24px',
      borderRadius: '16px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      maxWidth: '420px',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      color: 'white', // White text
    },
    buttonRow: {
      display: 'flex',
      gap: '10px',
      flexWrap: 'wrap',
      marginBottom: '16px',
    },
    modeButton: (isActive) => ({
      padding: '8px 12px',
      backgroundColor: isActive ? '#3b82f6' : 'rgba(255,255,255,0.1)',
      color: 'white',
      border: '1px solid rgba(255,255,255,0.2)',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '0.9rem',
    }),
    status: {
      fontSize: '1.2rem',
      fontWeight: 'bold',
      color: turn === 'demon' ? '#ef4444' : turn === 'angel' ? '#4ade80' : '#9ca3af', // Red for Demon, Green for Angel
      marginBottom: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },
    message: {
      marginTop: '16px',
      padding: '12px',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '8px',
      fontSize: '1rem',
      lineHeight: '1.4',
      borderLeft: `4px solid ${turn === 'demon' ? '#ef4444' : turn === 'angel' ? '#4ade80' : '#9ca3af'}`,
    },
    input: {
      backgroundColor: 'rgba(0,0,0,0.5)',
      border: '1px solid rgba(255,255,255,0.3)',
      color: 'white',
      padding: '4px 8px',
      borderRadius: '4px',
      width: '60px',
      marginLeft: '10px',
    }
  };

  return (
    <div style={styles.container}>
      {/* Story Intro Screen */}
      {!gameStarted && (
        <div style={styles.overlay}>
          <h1 style={styles.storyTitle}>
            The <a href="https://en.wikipedia.org/wiki/Angel_problem" target="_blank" rel="noopener noreferrer" style={{ color: '#fbbf24', textDecoration: 'underline' }}>Angel Problem</a>
          </h1>
          <div style={styles.storyText}>
            <p>In the infinite void of the mathematical universe, an Angel with power <strong>K</strong> attempts to escape.</p>
            <p>A Demon seeks to trap the Angel forever by placing roadblocks.</p>
            <br />
            <p><strong>The Rules:</strong></p>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li>😈 <strong>Demon:</strong> Places one block per turn to obstruct the path.</li>
              <li>😇 <strong>Angel:</strong> Jumps to any unblocked square within <strong>K</strong> steps. <strong>Escape by reaching distance 25!</strong></li>
            </ul>
            <br />
            <p>Can the Angel survive indefinitely? If trapped, the game restarts.</p>
          </div>
          <button
            style={styles.startButton}
            onClick={() => setGameStarted(true)}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            Enter the Void
          </button>
        </div>
      )}

      {/* Game Controls */}
      <div style={styles.controls}>
        <h1 style={{ margin: '0 0 20px 0', fontSize: '1.8rem', color: '#fbbf24' }}>Angel Problem</h1>

        <div style={styles.buttonRow}>
          {['human_vs_human', 'human_vs_ai', 'ai_vs_human', 'ai_vs_ai'].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              disabled={!isGameActive || mode === m}
              style={styles.modeButton(mode === m)}
            >
              {m.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
        </div>

        <div style={styles.status}>
          {turn === 'demon' ? '😈 Demon\'s Turn' : turn === 'angel' ? '😇 Angel\'s Turn' : '🏁 Game Over'}
          <span style={{ fontSize: '0.9rem', fontWeight: 'normal', color: '#ccc' }}>
            {turn === 'demon' && isDemonAI ? '(AI)' : turn === 'angel' && isAngelAI ? '(AI)' : '(Human)'}
          </span>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>
            Angel Power (K):
            <input
              type="number"
              value={K}
              onChange={(e) => setK(Math.max(1, Number(e.target.value) || 1))}
              min="1"
              max="10"
              disabled={!isGameActive}
              style={styles.input}
            />
          </label>
        </div>

        <div style={styles.message}>{message}</div>

        <button
          onClick={handleReset}
          style={{
            marginTop: '20px',
            width: '100%',
            padding: '12px',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '1rem'
          }}
        >
          Restart Game
        </button>
      </div>

      <Canvas shadows camera={{ position: [0, 15, 15], fov: 45 }}>
        <GameScene
          angelPos={angelPos}
          roadblocks={roadblocks}
          possibleMoves={possibleMoves}
          onCellClick={handleCellClick}
          angelLabel={
            mode === 'human_vs_human' ? 'Angel (Player 1)' :
              mode === 'human_vs_ai' ? 'Angel (YOU)' :
                'Angel (AI)'
          }
        />
      </Canvas>
    </div>
  );
}
