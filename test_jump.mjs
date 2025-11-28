console.log('Starting Jump Logic Test...');
import { getPossibleMoves, posToKey } from './app/gameLogic.js';

const runTest = () => {
    console.log('Testing Jump Logic...');

    // Case: Jump over a wall
    // Angel at 0,0. K=2.
    // Wall at y=1 (0,1), (-1,1), (1,1).
    // Target (0,2) should be reachable.

    const angelPos = { x: 0, y: 0 };
    const K = 2;
    const roadblocks = new Set();

    roadblocks.add(posToKey({ x: 0, y: 1 }));
    roadblocks.add(posToKey({ x: -1, y: 1 }));
    roadblocks.add(posToKey({ x: 1, y: 1 }));

    const moves = getPossibleMoves(angelPos, K, roadblocks);

    const canReachTarget = moves.some(m => m.x === 0 && m.y === 2);

    console.log(`Jump check (K=2): Can reach (0,2) over wall at y=1? ${canReachTarget}. Expected true.`);

    if (canReachTarget) {
        console.log('PASSED: Jump check.');
    } else {
        console.error('FAILED: Jump check (blocked by wall).');
    }
};

runTest();
