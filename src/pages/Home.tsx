import React, { useState } from 'react';
import { IoFootsteps } from 'react-icons/io5';
import { ActivationScreen } from '../components/ActivationScreen';
import { MaraudersMap3D } from '../components/Map3DScene';

// Loading Screen Component
const MapLoadingScreen = () => {
  return (
    <div className="w-screen h-screen bg-[#e8dcc4] parchment-texture flex items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-8">
        {/* Animated Footsteps */}
        <div className="relative w-64 h-32">
          <IoFootsteps className="footstep absolute text-6xl text-[#3d2817] opacity-0" style={{ left: '10%', top: '10%', transform: 'rotate(-15deg)' }} />
          <IoFootsteps className="footstep absolute text-6xl text-[#3d2817] opacity-0" style={{ right: '15%', top: '30%', transform: 'rotate(15deg)' }} />
          <IoFootsteps className="footstep absolute text-6xl text-[#3d2817] opacity-0" style={{ left: '20%', top: '50%', transform: 'rotate(-10deg)' }} />
          <IoFootsteps className="footstep absolute text-6xl text-[#3d2817] opacity-0" style={{ right: '20%', top: '70%', transform: 'rotate(10deg)' }} />
        </div>

        {/* Loading Text */}
        <p
          className="text-lg md:text-xl text-black/70 italic animate-pulse"
          style={{ fontFamily: "'IM Fell English', serif" }}
        >
          The map is revealing itself...
        </p>
      </div>

      <style>{`
        @keyframes footstepAppear {
          0% {
            opacity: 0;
            transform: scale(0.5) rotate(var(--rotation));
          }
          50% {
            opacity: 0.8;
          }
          100% {
            opacity: 0.6;
            transform: scale(1) rotate(var(--rotation));
          }
        }

        .footstep {
          animation: footstepAppear 0.8s ease-out forwards;
        }

        .footstep:nth-child(1) {
          animation-delay: 0s;
          --rotation: -15deg;
        }

        .footstep:nth-child(2) {
          animation-delay: 0.3s;
          --rotation: 15deg;
        }

        .footstep:nth-child(3) {
          animation-delay: 0.6s;
          --rotation: -10deg;
        }

        .footstep:nth-child(4) {
          animation-delay: 0.9s;
          --rotation: 10deg;
        }
      `}</style>
    </div>
  );
};

// Closing Screen Component
const MapClosingScreen = () => {
  return (
    <div className="w-screen h-screen bg-[#e8dcc4] parchment-texture flex items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-8">
        {/* Fading Footsteps */}
        <div className="relative w-64 h-32">
          <IoFootsteps className="footstep-fade absolute text-6xl text-[#3d2817]" style={{ right: '20%', top: '10%', transform: 'rotate(10deg)' }} />
          <IoFootsteps className="footstep-fade absolute text-6xl text-[#3d2817]" style={{ left: '20%', top: '30%', transform: 'rotate(-10deg)' }} />
          <IoFootsteps className="footstep-fade absolute text-6xl text-[#3d2817]" style={{ right: '15%', top: '50%', transform: 'rotate(15deg)' }} />
          <IoFootsteps className="footstep-fade absolute text-6xl text-[#3d2817]" style={{ left: '10%', top: '70%', transform: 'rotate(-15deg)' }} />
        </div>

        {/* Closing Text */}
        <p
          className="text-lg md:text-xl text-black/70 italic animate-pulse"
          style={{ fontFamily: "'IM Fell English', serif" }}
        >
          The map is hiding its mysteries...
        </p>
      </div>

      <style>{`
        @keyframes footstepFade {
          0% {
            opacity: 0.6;
            transform: scale(1) rotate(var(--rotation));
          }
          100% {
            opacity: 0;
            transform: scale(0.5) rotate(var(--rotation));
          }
        }

        .footstep-fade {
          animation: footstepFade 0.8s ease-out forwards;
        }

        .footstep-fade:nth-child(1) {
          animation-delay: 0s;
          --rotation: 10deg;
        }

        .footstep-fade:nth-child(2) {
          animation-delay: 0.3s;
          --rotation: -10deg;
        }

        .footstep-fade:nth-child(3) {
          animation-delay: 0.6s;
          --rotation: 15deg;
        }

        .footstep-fade:nth-child(4) {
          animation-delay: 0.9s;
          --rotation: -15deg;
        }
      `}</style>
    </div>
  );
};

export function Home() {
  const [isActivated, setIsActivated] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleActivate = () => {
    setIsActivated(true);
    // Show map after a delay to allow loading screen to display
    setTimeout(() => {
      setShowMap(true);
    }, 1500); // Increased delay to show loading animation
  };

  const handleClose = () => {
    setShowMap(false);
    setIsClosing(true);
    // Show closing screen, then reset to activation screen
    setTimeout(() => {
      setIsActivated(false);
      setIsClosing(false);
    }, 1500); // Wait for closing animation
  };

  if (!isActivated) {
    return <ActivationScreen onActivate={handleActivate} />;
  }

  // Show closing screen when hiding the map
  if (isClosing) {
    return <MapClosingScreen />;
  }

  // Show loading screen while map is preparing
  if (!showMap) {
    return <MapLoadingScreen />;
  }

  return <MaraudersMap3D isActive={showMap} isClosing={isClosing} onClose={handleClose} />;
}
