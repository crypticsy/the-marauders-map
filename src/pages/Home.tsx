import React, { useState } from 'react';
import { ActivationScreen } from '../components/ActivationScreen';
import { MaraudersMap3D } from '../components/Map3DScene';

export function Home() {
  const [isActivated, setIsActivated] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleActivate = () => {
    setIsActivated(true);
    setTimeout(() => {
      setShowMap(true);
    }, 100);
  };

  const handleClose = () => {
    setShowMap(false);
    setIsClosing(true);
    setTimeout(() => {
      setIsActivated(false);
      setIsClosing(false);
    }, 2000); // Wait for ink blot animation
  };

  if (!isActivated) {
    return <ActivationScreen onActivate={handleActivate} />;
  }

  return <MaraudersMap3D isActive={showMap} isClosing={isClosing} onClose={handleClose} />;
}
