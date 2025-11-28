// Core game logic utilities for the Angel vs Demon game.

export const posToKey = (pos) => `${pos.x},${pos.y}`;

export const keyToPos = (key) => {
  const [x, y] = key.split(',').map(Number);
  return { x, y };
};

// Compute all reachable positions for the angel within K steps (Chebyshev distance).
// Official Rule: Angel can jump over blocks, but cannot land on them.
export const getPossibleMoves = (angelPos, K, roadblocks) => {
  const moves = [];
  const { x: ax, y: ay } = angelPos;

  for (let dx = -K; dx <= K; dx++) {
    for (let dy = -K; dy <= K; dy++) {
      if (dx === 0 && dy === 0) continue; // skip staying put

      const target = { x: ax + dx, y: ay + dy };
      const key = posToKey(target);

      if (!roadblocks.has(key)) {
        moves.push(target);
      }
    }
  }

  return moves;
};

// Demon AI: pick a random empty cell within K+1 distance of the angel (inclusive).
export const makeDemonMoveAI = (angelPos, K, roadblocks) => {
  const { x: ax, y: ay } = angelPos;
  const maxDistance = K + 1;
  const candidates = [];

  for (let dx = -maxDistance; dx <= maxDistance; dx++) {
    for (let dy = -maxDistance; dy <= maxDistance; dy++) {
      const target = { x: ax + dx, y: ay + dy };
      const key = posToKey(target);

      if (key === posToKey(angelPos)) continue;
      if (roadblocks.has(key)) continue;
      candidates.push(target);
    }
  }

  if (candidates.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * candidates.length);
  return candidates[randomIndex];
};

// Angel AI: choose the move that maximizes distance from the nearest roadblock (greedy).
export const makeAngelMoveAI = (possibleMoves, roadblocks) => {
  if (possibleMoves.length === 0) return null;
  if (roadblocks.size === 0) return possibleMoves[0];

  let best = null;
  let bestScore = -Infinity;

  for (const move of possibleMoves) {
    let minDistance = Infinity;

    roadblocks.forEach((key) => {
      const rb = keyToPos(key);
      const distance = Math.abs(move.x - rb.x) + Math.abs(move.y - rb.y);
      minDistance = Math.min(minDistance, distance);
    });

    if (minDistance > bestScore) {
      bestScore = minDistance;
      best = move;
    }
  }

  return best;
};
