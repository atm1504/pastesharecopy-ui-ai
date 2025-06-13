import React, { createContext, useContext, useState, ReactNode } from "react";

interface GamePointsContextType {
  sessionGamePoints: number;
  setSessionGamePoints: React.Dispatch<React.SetStateAction<number>>;
  resetSessionGamePoints: () => void;
}

const GamePointsContext = createContext<GamePointsContextType | undefined>(
  undefined
);

export function GamePointsProvider({ children }: { children: ReactNode }) {
  const [sessionGamePoints, setSessionGamePoints] = useState<number>(0);

  const resetSessionGamePoints = () => {
    setSessionGamePoints(0);
  };

  return (
    <GamePointsContext.Provider
      value={{
        sessionGamePoints,
        setSessionGamePoints,
        resetSessionGamePoints,
      }}
    >
      {children}
    </GamePointsContext.Provider>
  );
}

export function useGamePoints() {
  const context = useContext(GamePointsContext);
  if (context === undefined) {
    throw new Error("useGamePoints must be used within a GamePointsProvider");
  }
  return context;
}
