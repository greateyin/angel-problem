console.log('Starting test script...');
import { getPossibleMoves, posToKey } from './app/gameLogic.js';

const runTest = () => {
    console.log('Testing BFS Logic...');

    // Case 1: Open field, K=1
    const angelPos = { x: 0, y: 0 };
    const K = 1;
    const roadblocks = new Set();
    const moves = getPossibleMoves(angelPos, K, roadblocks);
    console.log(`Open field (K=1): Found ${moves.length} moves. Expected 8.`);
    if (moves.length !== 8) console.error('FAILED: Open field check.');

    // Case 2: Surrounded
    const roadblocksTrap = new Set();
    // Surround (0,0)
    const traps = [
        { x: 0, y: 1 }, { x: 0, y: -1 }, { x: 1, y: 0 }, { x: -1, y: 0 },
        { x: 1, y: 1 }, { x: 1, y: -1 }, { x: -1, y: 1 }, { x: -1, y: -1 }
    ];
    traps.forEach(p => roadblocksTrap.add(posToKey(p)));

    const movesTrap = getPossibleMoves(angelPos, K, roadblocksTrap);
    console.log(`Trapped (K=1): Found ${movesTrap.length} moves. Expected 0.`);
    if (movesTrap.length !== 0) console.error('FAILED: Trap check.');
    else console.log('PASSED: Trap check.');

    // Case 3: Blocked path (K=2)
    // Angel at 0,0. Block at 1,0. Target 2,0 should be unreachable if we can't jump.
    const roadblocksWall = new Set();
    roadblocksWall.add(posToKey({ x: 1, y: 0 }));
    roadblocksWall.add(posToKey({ x: 1, y: 1 }));
    roadblocksWall.add(posToKey({ x: 1, y: -1 }));

    const movesWall = getPossibleMoves(angelPos, 2, roadblocksWall);
    const canReachTwoZero = movesWall.some(m => m.x === 2 && m.y === 0);
    console.log(`Wall check (K=2): Can reach (2,0)? ${canReachTwoZero}. Expected false.`);
    if (canReachTwoZero) console.error('FAILED: Wall check (jumped over block).');
    else console.log('PASSED: Wall check.');

};

runTest();
