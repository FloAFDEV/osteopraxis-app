
import React from "react";
import { Button } from "@/components/ui/button";

interface AlphabetFilterProps {
  activeLetter: string;
  onLetterChange: (letter: string) => void;
}

const AlphabetFilter: React.FC<AlphabetFilterProps> = ({ 
  activeLetter, 
  onLetterChange 
}) => {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  
  return (
    <div className="flex flex-wrap justify-center my-4 gap-1">
      {alphabet.map((letter) => (
        <Button
          key={letter}
          variant={activeLetter === letter ? "default" : "outline"}
          size="sm"
          className={`min-w-[2rem] ${activeLetter === letter ? 'bg-blue-600' : ''}`}
          onClick={() => onLetterChange(letter)}
        >
          {letter}
        </Button>
      ))}
      <Button
        variant={activeLetter === '' ? "default" : "outline"}
        size="sm"
        className={`min-w-[4rem] ${activeLetter === '' ? 'bg-blue-600' : ''}`}
        onClick={() => onLetterChange('')}
      >
        Tous
      </Button>
    </div>
  );
};

export default AlphabetFilter;
