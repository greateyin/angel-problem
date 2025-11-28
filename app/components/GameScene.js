'use client';

import React, { useRef, useMemo, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Text, Html } from '@react-three/drei';
import * as THREE from 'three';

function AngelPiece({ position, label }) {
    const ref = useRef();

    useFrame((state) => {
        if (ref.current) {
            ref.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.05;
            ref.current.rotation.y += 0.005;
        }
    });

    const points = useMemo(() => {
        const p = [];
        for (let i = 0; i <= 10; i++) {
            p.push(new THREE.Vector2(Math.sin(i * 0.2) * 0.3 + 0.1, i * 0.15));
        }
        return p;
    }, []);

    const wingGeometry = useMemo(() => {
        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.quadraticCurveTo(0.5, 0.5, 1, 1);
        shape.quadraticCurveTo(1.2, 0.5, 1, 0);
        shape.quadraticCurveTo(0.5, -0.2, 0, 0);

        const extrudeSettings = {
            steps: 1,
            depth: 0.05,
            bevelEnabled: true,
            bevelThickness: 0.02,
            bevelSize: 0.02,
            bevelSegments: 2
        };

        return new THREE.ExtrudeGeometry(shape, extrudeSettings);
    }, []);

    return (
        <group position={[position.x, 0, position.y]} ref={ref}>
            <mesh position={[0, 0.8, 0]} castShadow>
                <latheGeometry args={[points, 32]} />
                <meshStandardMaterial color="#fbbf24" metalness={0.6} roughness={0.2} />
            </mesh>

            {/* Wings */}
            <group position={[0, 1.2, -0.1]}>
                <mesh geometry={wingGeometry} rotation={[0, -0.5, 0]} position={[0.1, 0, 0]}>
                    <meshStandardMaterial color="#fef3c7" metalness={0.3} roughness={0.1} transparent opacity={0.9} />
                </mesh>
                <mesh geometry={wingGeometry} rotation={[0, 0.5, 0]} position={[-0.1, 0, 0]} scale={[-1, 1, 1]}>
                    <meshStandardMaterial color="#fef3c7" metalness={0.3} roughness={0.1} transparent opacity={0.9} />
                </mesh>
            </group>

            {/* Halo */}
            <mesh position={[0, 1.8, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.3, 0.05, 16, 32]} />
                <meshBasicMaterial color="#fef3c7" toneMapped={false} />
            </mesh>

            <pointLight position={[0, 1.5, 0]} intensity={1.5} distance={4} color="#fbbf24" />

            <Html position={[0, 2.5, 0]} center>
                <div style={{
                    color: '#fbbf24',
                    fontWeight: 'bold',
                    textShadow: '0 0 10px black',
                    fontFamily: 'serif',
                    fontSize: '1.2rem',
                    whiteSpace: 'nowrap'
                }}>{label || 'Angel'}</div>
            </Html>
        </group>
    );
}

function DemonPiece({ position }) {
    const [scale, setScale] = useState(0);
    useFrame((state, delta) => {
        if (scale < 1) setScale(Math.min(1, scale + delta * 4));
    });

    return (
        <group position={[position.x, 0, position.y]} scale={[scale, scale, scale]}>
            {/* Base */}
            <mesh position={[0, 0.1, 0]}>
                <cylinderGeometry args={[0.45, 0.5, 0.2, 6]} />
                <meshStandardMaterial color="#facc15" roughness={0.3} metalness={0.8} />
            </mesh>
            {/* Body */}
            <mesh position={[0, 0.5, 0]}>
                <cylinderGeometry args={[0.35, 0.4, 0.8, 6]} />
                <meshStandardMaterial color="#facc15" roughness={0.3} metalness={0.8} />
            </mesh>
            {/* Top (Rook-like battlements) */}
            <mesh position={[0, 1.0, 0]}>
                <cylinderGeometry args={[0.4, 0.35, 0.3, 6]} />
                <meshStandardMaterial color="#facc15" roughness={0.3} metalness={0.8} />
            </mesh>
            {/* Glowing Core */}
            <mesh position={[0, 0.6, 0]}>
                <cylinderGeometry args={[0.1, 0.1, 0.6, 8]} />
                <meshStandardMaterial color="#fef08a" emissive="#facc15" emissiveIntensity={2} />
            </mesh>

            <pointLight position={[0, 0.8, 0]} intensity={1} distance={3} color="#facc15" />
        </group>
    );
}

function Grid({ onCellClick, possibleMoves, angelPos, roadblocks }) {
    const [hoveredCell, setHoveredCell] = useState(null);

    // Create a large invisible plane for raycasting
    const planeSize = 100;

    const handlePointerMove = (e) => {
        // Calculate grid coordinates
        const x = Math.round(e.point.x);
        const z = Math.round(e.point.z);
        setHoveredCell({ x, y: z }); // In 3D, z is the y in our 2D logic
    };

    const handleClick = (e) => {
        e.stopPropagation();
        const x = Math.round(e.point.x);
        const z = Math.round(e.point.z);
        onCellClick(x, z);
    };

    // Visualize possible moves
    const possibleMoveMeshes = useMemo(() => {
        return possibleMoves.map((pos, i) => (
            <mesh key={`move-${i}`} position={[pos.x, 0.02, pos.y]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.9, 0.9]} />
                <meshBasicMaterial color="#4ade80" transparent opacity={0.3} />
            </mesh>
        ));
    }, [possibleMoves]);

    return (
        <group>
            {/* Infinite Grid Helper */}
            <gridHelper args={[100, 100, 0x444444, 0x222222]} position={[0, 0.01, 0]} />

            {/* Interaction Plane */}
            <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, 0, 0]}
                onPointerMove={handlePointerMove}
                onClick={handleClick}
                visible={false} // Invisible but interactive
            >
                <planeGeometry args={[planeSize, planeSize]} />
                <meshBasicMaterial />
            </mesh>

            {/* Hover Highlight */}
            {hoveredCell && (
                <mesh position={[hoveredCell.x, 0.02, hoveredCell.y]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[1, 1]} />
                    <meshBasicMaterial color="white" transparent opacity={0.2} />
                </mesh>
            )}

            {/* Possible Moves Highlights */}
            {possibleMoveMeshes}
        </group>
    );
}

function CameraController({ target }) {
    const { camera, controls } = useThree();
    const vec = new THREE.Vector3();

    useFrame(() => {
        // Smoothly follow the target
        const targetPos = new THREE.Vector3(target.x, 0, target.y);

        // Maintain relative offset? Or just look at target?
        // Let's just update the controls target to look at the Angel
        if (controls) {
            controls.target.lerp(targetPos, 0.1);
            controls.update();

            // Optionally move camera too if it gets too far?
            // For now, let OrbitControls handle the camera position, just update target.
        }
    });
    return null;
}

export default function GameScene({ angelPos, roadblocks, possibleMoves, onCellClick }) {
    const roadblockArray = useMemo(() => {
        return Array.from(roadblocks).map(key => {
            const [x, y] = key.split(',').map(Number);
            return { x, y, key };
        });
    }, [roadblocks]);

    return (
        <>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} castShadow />
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

            <AngelPiece position={angelPos} />

            {roadblockArray.map(rb => (
                <DemonPiece key={rb.key} position={rb} />
            ))}

            <Grid
                onCellClick={onCellClick}
                possibleMoves={possibleMoves}
                angelPos={angelPos}
                roadblocks={roadblocks}
            />

            <OrbitControls makeDefault minDistance={5} maxDistance={50} />
            <CameraController target={angelPos} />
        </>
    );
}
