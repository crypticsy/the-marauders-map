import React, { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Html } from '@react-three/drei';
import { IoCloseCircleOutline } from 'react-icons/io5';
import * as THREE from 'three';
import { Room } from '../map/Room';
import { Corridor } from '../map/Corridor';
import { Character } from '../map/Character';
import { ROOMS, CORRIDORS, CHARACTERS } from '../map/MapData';
import { Room3D } from './Room3D';
import { Corridor3D } from './Corridor3D';
import { Character3D } from './Character3D';
import { MagicParticles } from './Particles3D';
import { Obstacle3D } from './Obstacle3D';

// Loading Animation Component
const MapLoadingAnimation = () => {
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center gap-6 p-8">
        {/* Animated Footsteps */}
        <div className="relative w-48 h-32">
          {/* Left footsteps */}
          <div className="footstep-left absolute" style={{ left: '20%', top: '0%' }}>
            <svg width="30" height="40" viewBox="0 0 30 40" fill="none">
              <ellipse cx="15" cy="32" rx="8" ry="5" fill="#3d2817" opacity="0.6"/>
              <circle cx="10" cy="20" r="3" fill="#3d2817" opacity="0.6"/>
              <circle cx="14" cy="18" r="3" fill="#3d2817" opacity="0.6"/>
              <circle cx="18" cy="17" r="3" fill="#3d2817" opacity="0.6"/>
              <circle cx="22" cy="19" r="3" fill="#3d2817" opacity="0.6"/>
            </svg>
          </div>
          <div className="footstep-right absolute" style={{ right: '20%', top: '20%' }}>
            <svg width="30" height="40" viewBox="0 0 30 40" fill="none">
              <ellipse cx="15" cy="32" rx="8" ry="5" fill="#3d2817" opacity="0.6"/>
              <circle cx="20" cy="20" r="3" fill="#3d2817" opacity="0.6"/>
              <circle cx="16" cy="18" r="3" fill="#3d2817" opacity="0.6"/>
              <circle cx="12" cy="17" r="3" fill="#3d2817" opacity="0.6"/>
              <circle cx="8" cy="19" r="3" fill="#3d2817" opacity="0.6"/>
            </svg>
          </div>
          <div className="footstep-left absolute" style={{ left: '25%', top: '40%' }}>
            <svg width="30" height="40" viewBox="0 0 30 40" fill="none">
              <ellipse cx="15" cy="32" rx="8" ry="5" fill="#3d2817" opacity="0.6"/>
              <circle cx="10" cy="20" r="3" fill="#3d2817" opacity="0.6"/>
              <circle cx="14" cy="18" r="3" fill="#3d2817" opacity="0.6"/>
              <circle cx="18" cy="17" r="3" fill="#3d2817" opacity="0.6"/>
              <circle cx="22" cy="19" r="3" fill="#3d2817" opacity="0.6"/>
            </svg>
          </div>
          <div className="footstep-right absolute" style={{ right: '25%', top: '60%' }}>
            <svg width="30" height="40" viewBox="0 0 30 40" fill="none">
              <ellipse cx="15" cy="32" rx="8" ry="5" fill="#3d2817" opacity="0.6"/>
              <circle cx="20" cy="20" r="3" fill="#3d2817" opacity="0.6"/>
              <circle cx="16" cy="18" r="3" fill="#3d2817" opacity="0.6"/>
              <circle cx="12" cy="17" r="3" fill="#3d2817" opacity="0.6"/>
              <circle cx="8" cy="19" r="3" fill="#3d2817" opacity="0.6"/>
            </svg>
          </div>
        </div>

        {/* Loading Text */}
        <p
          className="text-lg md:text-xl text-black/70 italic animate-pulse"
          style={{ fontFamily: "'IM Fell English', serif" }}
        >
          The map is revealing itself...
        </p>
      </div>
    </Html>
  );
};

// Main 3D Scene
interface MaraudersMap3DProps {
  isActive: boolean;
  isClosing: boolean;
  onClose: () => void;
}

export const MaraudersMap3D: React.FC<MaraudersMap3DProps> = ({ isActive, isClosing, onClose }) => {
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

        {/* Mischief Managed button - mobile responsive */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 md:top-6 md:right-6 z-50 px-3 py-2 sm:px-4 sm:py-2 md:px-6 md:py-3 bg-black/90 hover:bg-black backdrop-blur-sm border-2 border-black/90 rounded text-[#e8dcc4] transition-all shadow-xl flex items-center gap-1 sm:gap-2 hover:scale-105 text-2xs sm:text-xs md:text-sm"
          style={{
            fontFamily: "'IM Fell English', serif",
            letterSpacing: '0.05em',
          }}
        >
          <IoCloseCircleOutline className="text-base sm:text-lg md:text-xl" />
          <span className="hidden xs:inline sm:inline">Mischief Managed</span>
          <span className="xs:hidden sm:hidden">Close</span>
        </button>

        {/* Title with decorative elements - mobile responsive */}
        <div className="absolute top-3 sm:top-4 md:top-8 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none px-2 sm:px-4 w-full max-w-xs sm:max-w-md md:max-w-lg">
          <div className="text-center relative">
            <h1
              className="text-base sm:text-xl md:text-2xl lg:text-3xl text-black tracking-wider leading-tight"
              style={{ fontFamily: "'IM Fell English', serif", fontStyle: 'italic' }}
            >
              The Marauder's Map
            </h1>
          </div>
        </div>

      {/* Instructions hint - mobile responsive */}
      <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none px-2 sm:px-4 max-w-xs sm:max-w-md">
        <p
          className="text-3xs sm:text-2xs md:text-xs text-black/40 text-center italic leading-tight"
          style={{ fontFamily: "'Shadows Into Light', cursive" }}
        >
          <span className="hidden sm:inline">Drag to rotate • Scroll to zoom • Click rooms to explore</span>
          <span className="sm:hidden">Drag • Pinch • Tap</span>
        </p>
      </div>

      {/* 3D Canvas */}
      <Canvas shadows>
        <Suspense fallback={<MapLoadingAnimation />}>
          <PerspectiveCamera makeDefault position={[0, 85, 85]} fov={60} />
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            maxPolarAngle={Math.PI / 2.1}
            minPolarAngle={Math.PI / 6}
            minDistance={15}
            maxDistance={120}
          />

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

          {/* Magical Particles */}
          <MagicParticles count={150} isActive={isActive} />
        </Suspense>
      </Canvas>
      </div>

      <style>{`
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
