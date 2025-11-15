import React, { useState } from "react";
import { IoFootsteps } from "react-icons/io5";
import { FaWandMagicSparkles } from "react-icons/fa6";
import { IoSparkles } from "react-icons/io5";

interface ActivationScreenProps {
  onActivate: () => void;
}

export const ActivationScreen: React.FC<ActivationScreenProps> = ({
  onActivate,
}) => {
  const [phrase, setPhrase] = useState("");
  const [isActivating, setIsActivating] = useState(false);
  const correctPhrase = "i solemnly swear that i am up to no good";

  // Check if the current phrase matches the correct one
  const isPhraseCorrect = phrase.toLowerCase().trim() === correctPhrase;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPhraseCorrect) {
      setIsActivating(true);
      setTimeout(() => {
        onActivate();
      }, 2000);
    } else {
      // Shake animation for wrong phrase
      setPhrase("");
    }
  };

  return (
    <div className="w-screen h-screen bg-[#e8dcc4] parchment-texture flex items-center justify-center overflow-hidden relative">
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
                placeholder="I solemnly swear..."
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
              className="text-xs text-black/50 italic"
              style={{ fontFamily: "'Shadows Into Light', cursive" }}
            >
              Hint: "I solemnly swear that I am up to no good"
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
