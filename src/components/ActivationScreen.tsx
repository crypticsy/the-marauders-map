import React, { useState } from "react";
import { IoFootsteps } from "react-icons/io5";
import { FaWandMagicSparkles } from "react-icons/fa6";
import { IoSparkles } from "react-icons/io5";
import { Toaster } from "react-hot-toast";
import { useCustomToast } from "../hooks/useCustomToast";

interface ActivationScreenProps {
  onActivate: () => void;
}

export const ActivationScreen: React.FC<ActivationScreenProps> = ({
  onActivate,
}) => {
  const [phrase, setPhrase] = useState("");
  const [isActivating, setIsActivating] = useState(false);
  const { showToast } = useCustomToast();
  const correctPhrases = [
    "i solemnly swear that i am up to no good",
    "i solemnly swear that i am upto no good"
  ];

  // Array of error messages
  const errorMessages = [
    "The Marauders would like to inform you that you clearly don't know what you're doing.",
    "Nice try, but incorrect incantation. Do behave yourself.",
    "We are not impressed. Come back when you know the proper words.",
    "Mischief managed… or rather, mischief attempted and failed.",
    "The Map refuses to reveal its secrets to someone so hopelessly confused.",
    "Try again, unless you're afraid the correct phrase might tax your memory.",
    "The Map is currently unavailable due to user incompetence.",
    "Wrong again. One might think you're not much of a mischief-maker at all.",
  ];

  // Check if the current phrase matches any of the correct ones
  const isPhraseCorrect = correctPhrases.includes(phrase.toLowerCase().trim());

  // Play error sound effect
  const playErrorSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    // Create a more ominous, magical error sound
    const playTone = (frequency: number, startTime: number, duration: number, volume: number = 0.3) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'triangle'; // Softer, more magical sound

      gainNode.gain.setValueAtTime(volume, audioContext.currentTime + startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + startTime + duration);

      oscillator.start(audioContext.currentTime + startTime);
      oscillator.stop(audioContext.currentTime + startTime + duration);
    };

    // Dark, ominous descending chord sequence
    playTone(330, 0, 0.15, 0.2);    // E (ominous start)
    playTone(277, 0.08, 0.15, 0.2); // C# (dissonant)
    playTone(220, 0.16, 0.25, 0.25); // A (final low tone)
  };

  // Play success sound effect
  const playSuccessSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    // Create magical, uplifting success sound
    const playTone = (frequency: number, startTime: number, duration: number, volume: number = 0.25, type: OscillatorType = 'sine') => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = type;

      gainNode.gain.setValueAtTime(volume, audioContext.currentTime + startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + startTime + duration);

      oscillator.start(audioContext.currentTime + startTime);
      oscillator.stop(audioContext.currentTime + startTime + duration);
    };

    // Magical ascending arpeggio (like a successful spell)
    playTone(523, 0, 0.2, 0.15, 'sine');      // C5 (magical start)
    playTone(659, 0.08, 0.2, 0.18, 'sine');   // E5 (rising)
    playTone(784, 0.16, 0.25, 0.2, 'sine');   // G5 (ascending)
    playTone(1047, 0.24, 0.4, 0.15, 'triangle'); // C6 (triumphant high note with shimmer)
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPhraseCorrect) {
      // Play success sound
      playSuccessSound();

      setIsActivating(true);
      setTimeout(() => {
        onActivate();
      }, 2000);
    } else {
      // Play error sound
      playErrorSound();

      // Show random error message
      const randomMessage = errorMessages[Math.floor(Math.random() * errorMessages.length)];
      showToast({
        message: randomMessage,
        type: "error",
        duration: 4000,
      });
    }
  };

  return (
    <div className="w-screen h-screen bg-[#e8dcc4] parchment-texture flex items-center justify-center overflow-hidden relative pb-8 md:pb-20">
      <Toaster position="top-center" reverseOrder={false} />
      {/* Magical ink blot effect */}
      {isActivating && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="ink-blot-expand"></div>
        </div>
      )}

      {/* Ink splotches decoration */}
      <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-black/5 blur-xl"></div>
      <div className="absolute bottom-20 right-20 w-32 h-32 rounded-full bg-black/5 blur-2xl"></div>
      <div className="absolute top-1/4 right-1/3 w-16 h-16 rounded-full bg-black/5 blur-lg"></div>

      <div
        className={`max-w-3xl w-full px-6 sm:px-12 transition-all duration-1000 ${
          isActivating ? "opacity-0 scale-110" : "opacity-100"
        }`}
      >
        {/* Main Content */}
        <div className="relative">
          {/* Top decorative line */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-black/30 to-transparent mb-10"></div>

          {/* Subtitle */}
          <div className="text-center mb-8 gap-2 flex flex-col">
            <p
              className="text-xl sm:text-2xl text-black/80 italic leading-relaxed"
              style={{ fontFamily: "'IM Fell English', serif" }}
            >
              Messrs
            </p>
            <p
              className="text-sm sm:text-base text-black/80 italic leading-relaxed"
              style={{ fontFamily: "'IM Fell English', serif" }}
            >
              Moony, Wormtail, Padfoot & Prongs
            </p>
            <p className="text-xs sm:text-sm block">are proud to present</p>
          </div>

          {/* Title */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-3 mb-3">
              <h1
                className="text-4xl sm:text-5xl md:text-6xl text-black tracking-wider"
                style={{
                  fontFamily: "'IM Fell English', serif",
                  fontStyle: "italic",
                }}
              >
                The Marauder's Map
              </h1>
            </div>
          </div>

          {/* Decorative separator */}
          <div className="flex items-center justify-center my-10">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-black/20"></div>
            <IoFootsteps className="text-xl text-black/50 mx-4" />
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-black/20"></div>
          </div>

          {/* Input form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <input
                type="text"
                value={phrase}
                onChange={(e) => setPhrase(e.target.value)}
                placeholder="Enter Your Incantation"
                className="w-full px-6 py-4 bg-transparent border-2 border-black/10 border-dashed rounded text-center text-black placeholder-black/40 focus:outline-none focus:border-black/60 transition-all shadow-inner"
                style={{
                  fontFamily: "'Shadows Into Light', cursive",
                  fontSize: "1.1rem",
                  letterSpacing: "0.02em",
                }}
                autoFocus
              />
            </div>

            <button
              type="submit"
              className={`w-full py-4 border-2 rounded transition-all hover:shadow-xl relative overflow-hidden flex items-center justify-center gap-2 ${
                isPhraseCorrect
                  ? "bg-black/90 hover:bg-black border-black/90 text-[#e8dcc4]"
                  : "bg-transparent hover:bg-black/5 border-black/30 text-black"
              }`}
              style={{
                fontFamily: "'IM Fell English', serif",
                fontSize: "1.1rem",
                letterSpacing: "0.1em",
              }}
            >
              {/* Magical glow effect when correct */}
              {isPhraseCorrect && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
              )}
              {isPhraseCorrect ? (
                <>
                  <IoSparkles className="text-xl relative z-10" />
                  <span className="relative z-10">Reveal the Map</span>
                  <IoSparkles className="text-xl relative z-10" />
                </>
              ) : (
                <>
                  <span className="relative z-10">Use your magic wand</span>
                  <FaWandMagicSparkles className="text-lg relative z-10" />
                </>
              )}
            </button>
          </form>

          {/* Hint */}
          <div className="mt-6 text-center">
            <p
              className="text-xs text-black/50"
              style={{ fontFamily:  "'IM Fell English', serif"}}
            >
              Hint: “I solemnly swear that I am up to no good"
            </p>
          </div>

          {/* Bottom decorative line */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-black/30 to-transparent mt-10"></div>

          {/* Corner decorations */}
          <div className="absolute -top-4 -left-4 w-12 h-12 border-l-2 border-t-2 border-black/20 rounded-tl-lg"></div>
          <div className="absolute -top-4 -right-4 w-12 h-12 border-r-2 border-t-2 border-black/20 rounded-tr-lg"></div>
          <div className="absolute -bottom-4 -left-4 w-12 h-12 border-l-2 border-b-2 border-black/20 rounded-bl-lg"></div>
          <div className="absolute -bottom-4 -right-4 w-12 h-12 border-r-2 border-b-2 border-black/20 rounded-br-lg"></div>
        </div>
      </div>

      {/* Footer */}
      <div
        className={`absolute bottom-0 left-0 right-0 pb-4 sm:pb-6 
          ${isActivating ? "opacity-0 scale-110" : "opacity-100"} `}
      >
        <p
          className="text-center text-black/40 tracking-wide text-xs sm:text-sm select-none"
          style={{ fontFamily: "'IM Fell English', serif" }}
        >
          -- &nbsp; Created by{" "}
          <a
            href="https://github.com/crypticsy"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-black/60 hover:text-black inline-flex items-center gap-2 hover:underline transition-colors"
          >
            Crypticsy
            <img
              src="https://github.com/crypticsy.png"
              alt="Crypticsy GitHub Profile"
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 border-black/20 hover:border-black/40 transition-colors"
            />
          </a>{" "}
          &nbsp; --
        </p>
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

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .ink-blot-expand {
          width: 100px;
          height: 100px;
          background: radial-gradient(circle, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 70%);
          border-radius: 50%;
          animation: inkBlotExpand 2s ease-out forwards;
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }

        /* Enhanced parchment texture */
        .parchment-texture {
          background-color: #e8dcc4;
          background-image:
            radial-gradient(circle at 20% 30%, rgba(139, 111, 71, 0.03) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(101, 67, 33, 0.03) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(139, 111, 71, 0.02) 0%, transparent 40%),
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(139, 111, 71, 0.02) 2px,
              rgba(139, 111, 71, 0.02) 4px
            );
        }
      `}</style>
    </div>
  );
};
