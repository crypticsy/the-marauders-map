import React, { Suspense, useMemo, useState, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree, ThreeEvent } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { IoCloseCircleOutline, IoFootsteps } from 'react-icons/io5';
import * as THREE from 'three';
import { Room } from '../map/Room';
import { Corridor } from '../map/Corridor';
import { Character } from '../map/Character';
import { PlayerCharacter } from '../map/PlayerCharacter';
import { ROOMS, CORRIDORS, CHARACTERS } from '../map/MapData';
import { Room3D } from './Room3D';
import { Corridor3D } from './Corridor3D';
import { Character3D } from './Character3D';
import { MagicParticles } from './Particles3D';
import { Obstacle3D } from './Obstacle3D';

// Camera Follow Component
interface CameraFollowProps {
  character: Character | PlayerCharacter | null;
  controlsRef: React.MutableRefObject<any>;
}

const CameraFollow: React.FC<CameraFollowProps> = ({ character, controlsRef }) => {
  const { camera } = useThree();
  const isResettingRef = useRef(false);
  const previousCharacterRef = useRef<Character | PlayerCharacter | null>(null);

  useFrame(() => {
    if (controlsRef.current) {
      if (character) {
        // Follow character mode
        const pos = character.getPosition2D();
        const targetPos = new THREE.Vector3(pos.x, 0, pos.z);

        // Smoothly move camera target to character position
        const currentTarget = controlsRef.current.target;
        currentTarget.lerp(targetPos, 0.05);

        // Update camera position to maintain viewing angle
        const offset = new THREE.Vector3(0, 15, 15);
        const cameraTarget = new THREE.Vector3().copy(currentTarget).add(offset);
        camera.position.lerp(cameraTarget, 0.05);

        controlsRef.current.update();
        previousCharacterRef.current = character;
        isResettingRef.current = false;
      } else if (previousCharacterRef.current !== null && !isResettingRef.current) {
        // Just switched to Overview mode - reset once
        const defaultTarget = new THREE.Vector3(0, 0, 0);
        const defaultCameraPos = new THREE.Vector3(0, 85, 85);

        // Check if we're close enough to default position
        const distanceToDefault = camera.position.distanceTo(defaultCameraPos);
        if (distanceToDefault > 0.5) {
          // Still resetting - smoothly return to default view
          const currentTarget = controlsRef.current.target;
          currentTarget.lerp(defaultTarget, 0.05);
          camera.position.lerp(defaultCameraPos, 0.05);
          controlsRef.current.update();
        } else {
          // Reset complete - allow free camera control
          isResettingRef.current = true;
          previousCharacterRef.current = null;
        }
      }
    }
  });

  return null;
};

// Component to handle keyboard controls
interface KeyboardControlsProps {
  enabled: boolean;
  player: PlayerCharacter | null;
}

const KeyboardControls: React.FC<KeyboardControlsProps> = ({ enabled, player }) => {
  const keysPressed = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        e.preventDefault();
        keysPressed.current.add(key);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysPressed.current.delete(key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      keysPressed.current.clear();
    };
  }, [enabled]);

  useFrame((_state, delta) => {
    if (!enabled || !player) return;

    const direction = { x: 0, z: 0 };

    // WASD controls
    if (keysPressed.current.has('w') || keysPressed.current.has('arrowup')) {
      direction.z -= 1; // Move forward (negative Z)
    }
    if (keysPressed.current.has('s') || keysPressed.current.has('arrowdown')) {
      direction.z += 1; // Move backward (positive Z)
    }
    if (keysPressed.current.has('a') || keysPressed.current.has('arrowleft')) {
      direction.x -= 1; // Move left (negative X)
    }
    if (keysPressed.current.has('d') || keysPressed.current.has('arrowright')) {
      direction.x += 1; // Move right (positive X)
    }

    // Only move if at least one key is pressed
    if (direction.x !== 0 || direction.z !== 0) {
      player.moveInDirection(direction, delta);
    }
  });

  return null;
};

// Component to handle click-to-move
interface ClickToMoveProps {
  enabled: boolean;
  player: PlayerCharacter | null;
}

const ClickToMove: React.FC<ClickToMoveProps> = ({ enabled, player }) => {
  const handleMapClick = (event: ThreeEvent<MouseEvent>) => {
    if (!enabled || !player) return;

    // Get the clicked point in 3D space
    const point = event.point;

    // Set target position for player (convert 3D to 2D)
    player.setTargetPosition({ x: point.x, z: point.z });
  };

  if (!enabled) return null;

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0.01, 0]}
      onClick={handleMapClick}
    >
      <planeGeometry args={[100, 100]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  );
};

// Main 3D Scene
interface MaraudersMap3DProps {
  isActive: boolean;
  isClosing: boolean;
  onClose: () => void;
}

export const MaraudersMap3D: React.FC<MaraudersMap3DProps> = ({ isActive, isClosing, onClose }) => {
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);
  const [playerMode, setPlayerMode] = useState<boolean>(false);
  const [playerCharacter, setPlayerCharacter] = useState<PlayerCharacter | null>(null);
  const controlsRef = useRef<any>(null);

  // Load old paper texture from local assets
  const parchmentTexture = useMemo(() => {
    const loader = new THREE.TextureLoader();
    const texture = loader.load(`${import.meta.env.BASE_URL}textures/old-paper.jpg`);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    // No repeat - texture covers the entire map once
    return texture;
  }, []);

  // Initialize map objects
  const { rooms, corridors, characters } = useMemo(() => {
    // Create room instances
    const roomMap = new Map<string, Room>();
    ROOMS.forEach((config) => {
      roomMap.set(config.id, new Room(config));
    });

    // Create corridor instances
    const corridorMap = new Map<string, Corridor>();
    CORRIDORS.forEach((config) => {
      corridorMap.set(config.id, new Corridor(config));
    });

    // Create character instances
    const characterInstances = CHARACTERS.map((config) => {
      const character = new Character(config);
      character.initializePath(roomMap, corridorMap);
      return character;
    });

    return {
      rooms: Array.from(roomMap.values()),
      corridors: Array.from(corridorMap.entries()),
      characters: characterInstances,
    };
  }, []);

  // Get room lookup map
  const roomMap = useMemo(() => {
    const map = new Map<string, Room>();
    rooms.forEach((room) => map.set(room.id, room));
    return map;
  }, [rooms]);

  // Initialize player character when entering player mode
  useEffect(() => {
    if (playerMode && !playerCharacter) {
      const player = new PlayerCharacter('You', '#ff0000', 8);
      player.initialize(roomMap, new Map(corridors));
      setPlayerCharacter(player);
    } else if (!playerMode && playerCharacter) {
      setPlayerCharacter(null);
    }
  }, [playerMode, roomMap, corridors, playerCharacter]);

  // Toggle player mode
  const handleTogglePlayerMode = () => {
    setPlayerMode(!playerMode);
    if (!playerMode) {
      // Entering player mode - clear character selection
      setSelectedCharacterId(null);
    }
  };

  // Get selected character for camera following
  const selectedCharacter = selectedCharacterId
    ? characters.find(c => c.id === selectedCharacterId) || null
    : null;

  // Determine which character/player to follow
  const followTarget = playerMode && playerCharacter
    ? playerCharacter
    : selectedCharacter;

  return (
    <div className="w-screen h-screen bg-[#e8dcc4] parchment-texture overflow-hidden relative">
      {/* Magical ink blot effect when closing */}
      {isClosing && (
        <div className="absolute inset-0 flex items-center justify-center z-50">
          <div className="ink-blot-expand"></div>
        </div>
      )}

      {/* Main map content - fade out when closing */}
      <div className={`w-full h-full transition-opacity duration-1000 ${isClosing ? 'opacity-0' : 'opacity-100'}`}>
        {/* Ink splotches decoration - hidden on mobile */}
        <div className="hidden sm:block absolute top-10 left-10 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-black/5 blur-xl"></div>
        <div className="hidden md:block absolute bottom-20 right-20 w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-black/5 blur-2xl"></div>
        <div className="hidden lg:block absolute top-1/4 right-1/3 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-black/5 blur-lg"></div>

        {/* Help panel - left side bottom */}
        {playerMode && (
          <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 md:bottom-6 md:left-6 z-50 px-4 py-3 sm:px-5 sm:py-4 md:px-6 md:py-5 bg-black/90 backdrop-blur-sm rounded shadow-xl text-[#e8dcc4]"
            style={{
              fontFamily: "'IM Fell English', serif",
              letterSpacing: '0.05em',
            }}
          >
            <div className="font-semibold mb-3 sm:mb-4 text-xs sm:text-sm md:text-base text-center">Controls</div>

            {/* Keyboard layouts */}
            <div className="flex items-center gap-4 sm:gap-6 mb-2">
              {/* WASD Layout */}
              <div className="flex flex-col items-center gap-1">
                <div className="flex justify-center">
                  <div className="w-5 h-5 sm:w-8 sm:h-8 bg-black/40 rounded flex items-center justify-center font-mono text-xs sm:text-sm font-semibold">
                    W
                  </div>
                </div>
                <div className="flex gap-1">
                  <div className="w-5 h-5 sm:w-8 sm:h-8 bg-black/40 rounded flex items-center justify-center font-mono text-xs sm:text-sm font-semibold">
                    A
                  </div>
                  <div className="w-5 h-5 sm:w-8 sm:h-8 bg-black/40 rounded flex items-center justify-center font-mono text-xs sm:text-sm font-semibold">
                    S
                  </div>
                  <div className="w-5 h-5 sm:w-8 sm:h-8 bg-black/40 rounded flex items-center justify-center font-mono text-xs sm:text-sm font-semibold">
                    D
                  </div>
                </div>
              </div>

              <div className="opacity-50 text-xs sm:text-sm">or</div>

              {/* Arrow Keys Layout */}
              <div className="flex flex-col items-center gap-1">
                <div className="flex justify-center">
                  <div className="w-5 h-5 sm:w-8 sm:h-8 bg-black/40 rounded flex items-center justify-center text-sm sm:text-base">
                    ↑
                  </div>
                </div>
                <div className="flex gap-1">
                  <div className="w-5 h-5 sm:w-8 sm:h-8 bg-black/40 rounded flex items-center justify-center text-sm sm:text-base">
                    ←
                  </div>
                  <div className="w-5 h-5 sm:w-8 sm:h-8 bg-black/40 rounded flex items-center justify-center text-sm sm:text-base">
                    ↓
                  </div>
                  <div className="w-5 h-5 sm:w-8 sm:h-8 bg-black/40 rounded flex items-center justify-center text-sm sm:text-base">
                    →
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* All buttons on right side */}
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 md:top-6 md:right-6 z-50 flex flex-col gap-2 sm:gap-3" style={{ minWidth: '180px' }}>
          {/* Mischief Managed button */}
          <button
            onClick={onClose}
            className="px-3 py-2 sm:px-4 sm:py-2 md:px-6 md:py-3 bg-black/90 hover:bg-black backdrop-blur-sm border-2 border-black/90 rounded text-[#e8dcc4] transition-all shadow-xl flex items-center justify-center gap-1 sm:gap-2 hover:scale-105 text-2xs sm:text-xs md:text-sm w-full"
            style={{
              fontFamily: "'IM Fell English', serif",
              letterSpacing: '0.05em',
            }}
          >
            <IoCloseCircleOutline className="text-base sm:text-lg md:text-xl" />
            <span className="hidden xs:inline sm:inline">Mischief Managed</span>
            <span className="xs:hidden sm:hidden">Close</span>
          </button>

          {/* Player Mode Button */}
          <button
            onClick={handleTogglePlayerMode}
            className={`px-3 py-2 sm:px-4 sm:py-2 md:px-6 md:py-3 backdrop-blur-sm border-2 rounded shadow-xl flex items-center justify-center gap-1 sm:gap-2 hover:scale-105 transition-all text-2xs sm:text-xs md:text-sm w-full ${
              playerMode
                ? 'bg-red-900/90 border-red-700 text-[#e8dcc4] hover:bg-red-800/90'
                : 'bg-black/90 border-black/90 text-[#e8dcc4] hover:bg-black'
            }`}
            style={{
              fontFamily: "'IM Fell English', serif",
              letterSpacing: '0.05em',
            }}
          >
            <IoFootsteps className="text-base sm:text-lg md:text-xl" />
            <span>{playerMode ? 'Exit Map' : 'Enter Map'}</span>
          </button>

          {/* Character Selector - only show when not in player mode */}
          {!playerMode && (
            <div className="relative" style={{ minWidth: '180px' }}>
              {/* Selected value display */}
              <button
                onClick={() => {
                  const dropdown = document.getElementById('character-dropdown');
                  if (dropdown) {
                    dropdown.classList.toggle('hidden');
                  }
                }}
                className="px-3 py-2 sm:px-4 sm:py-2 md:px-6 md:py-3 bg-black/90 backdrop-blur-sm rounded text-[#e8dcc4] shadow-xl text-2xs sm:text-xs md:text-sm cursor-pointer border-0 outline-none focus:outline-none focus:ring-0 hover:scale-105 transition-transform whitespace-nowrap w-full"
                style={{
                  fontFamily: "'IM Fell English', serif",
                  letterSpacing: '0.05em',
                }}
              >
                {selectedCharacterId
                  ? `Follow ${characters.find(c => c.id === selectedCharacterId)?.name}`
                  : 'Overview'}
                <span className="ml-2">▼</span>
              </button>

              {/* Dropdown options */}
              <div
                id="character-dropdown"
                className="hidden absolute top-full right-0 mt-1 bg-black/90 backdrop-blur-sm rounded shadow-xl overflow-y-auto border-0"
                style={{
                  maxHeight: 'calc(2.5rem * 4)',
                  fontFamily: "'IM Fell English', serif",
                  letterSpacing: '0.05em',
                }}
              >
                <div
                  onClick={() => {
                    setSelectedCharacterId(null);
                    document.getElementById('character-dropdown')?.classList.add('hidden');
                  }}
                  className="px-3 py-2 sm:px-4 sm:py-2 md:px-6 md:py-3 text-[#e8dcc4] cursor-pointer hover:bg-black/50 text-2xs sm:text-xs md:text-sm whitespace-nowrap"
                >
                  Overview
                </div>
                {characters.map((char) => (
                  <div
                    key={char.id}
                    onClick={() => {
                      setSelectedCharacterId(char.id);
                      document.getElementById('character-dropdown')?.classList.add('hidden');
                    }}
                    className="px-3 py-2 sm:px-4 sm:py-2 md:px-6 md:py-3 text-[#e8dcc4] cursor-pointer hover:bg-black/50 text-2xs sm:text-xs md:text-sm whitespace-nowrap"
                  >
                    Follow {char.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Title - left side */}
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 md:top-6 md:left-6 z-50 pointer-events-none">
          <h1
            className="text-base sm:text-xl md:text-2xl lg:text-3xl text-black tracking-wider leading-tight"
            style={{ fontFamily: "'IM Fell English', serif", fontStyle: 'italic' }}
          >
            The Marauder's Map
          </h1>
        </div>

      {/* 3D Canvas */}
      <Canvas shadows>
        <Suspense>
          <PerspectiveCamera makeDefault position={[0, 85, 85]} fov={60} />
          <OrbitControls
            ref={controlsRef}
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            maxPolarAngle={Math.PI / 2.1}
            minPolarAngle={Math.PI / 6}
            minDistance={15}
            maxDistance={120}
          />

          {/* Camera follow for selected character or player */}
          <CameraFollow character={followTarget} controlsRef={controlsRef} />

          {/* Keyboard controls for player */}
          <KeyboardControls enabled={playerMode} player={playerCharacter} />

          {/* Click-to-move handler */}
          <ClickToMove enabled={playerMode} player={playerCharacter} />

          {/* Lighting - Bright and clean */}
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 10, 5]} intensity={0.2} castShadow />
          <directionalLight position={[-10, 5, -5]} intensity={0.5} />
          <pointLight position={[0, 15, 0]} intensity={0.4} color="#ffd700" />

          {/* Modern minimal map base - clean plain surface */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
            <planeGeometry args={[100, 100]} />
            <meshStandardMaterial
              map={parchmentTexture}
              color="#d9cab3"
              roughness={0.85}
              metalness={0.02}
            />
          </mesh>

          {/* Render all corridors (hand-drawn style, no grids) */}
          {corridors.map(([id, corridor]) => {
            const roomA = roomMap.get(corridor.roomAId);
            const roomB = roomMap.get(corridor.roomBId);
            if (!roomA || !roomB) return null;

            return (
              <Corridor3D
                key={id}
                corridor={corridor}
                roomA={roomA}
                roomB={roomB}
                isActive={isActive}
              />
            );
          })}

          {/* Render all rooms */}
          {rooms.map((room) => (
            <Room3D key={room.id} room={room} isActive={isActive} />
          ))}

          {/* Render all obstacles in rooms */}
          {rooms.map((room) =>
            room.obstacles.map((obstacle) => (
              <Obstacle3D
                key={obstacle.id}
                obstacle={obstacle}
                isActive={isActive}
              />
            ))
          )}

          {/* Render all characters with animated footsteps */}
          {characters.map((character) => (
            <Character3D key={character.id} character={character} isActive={isActive} />
          ))}

          {/* Render player character */}
          {playerMode && playerCharacter && (
            <Character3D
              key="player"
              character={playerCharacter}
              isActive={isActive}
            />
          )}

          {/* Magical Particles */}
          <MagicParticles count={150} isActive={isActive} />
        </Suspense>
      </Canvas>
      </div>

      <style>{`
        /* Custom scrollbar for dropdown */
        #character-dropdown::-webkit-scrollbar {
          width: 6px;
        }

        #character-dropdown::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 3px;
        }

        #character-dropdown::-webkit-scrollbar-thumb {
          background: rgba(232, 220, 196, 0.5);
          border-radius: 3px;
        }

        #character-dropdown::-webkit-scrollbar-thumb:hover {
          background: rgba(232, 220, 196, 0.7);
        }

        @keyframes inkBlotExpand {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          100% {
            transform: scale(50);
            opacity: 0;
          }
        }

        .ink-blot-expand {
          width: 100px;
          height: 100px;
          background: radial-gradient(circle, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 70%);
          border-radius: 50%;
          animation: inkBlotExpand 2s ease-out forwards;
        }

        @keyframes footstepAppear {
          0% {
            opacity: 0;
            transform: scale(0.5);
          }
          50% {
            opacity: 0.8;
          }
          100% {
            opacity: 0.6;
            transform: scale(1);
          }
        }

        .footstep-left {
          animation: footstepAppear 0.8s ease-out forwards;
        }

        .footstep-left:nth-child(1) {
          animation-delay: 0s;
        }

        .footstep-right:nth-child(2) {
          animation-delay: 0.3s;
        }

        .footstep-left:nth-child(3) {
          animation-delay: 0.6s;
        }

        .footstep-right:nth-child(4) {
          animation-delay: 0.9s;
        }

        .footstep-right {
          animation: footstepAppear 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
