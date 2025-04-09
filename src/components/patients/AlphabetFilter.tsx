
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
          className={`min-w-[2rem] transition-all duration-300 hover:scale-110 ${activeLetter === letter ? 'bg-gradient-to-r from-blue-600 to-blue-700 shadow-md' : 'hover:bg-blue-50 dark:hover:bg-blue-900/30'}`}
          onClick={() => onLetterChange(letter)}
        >
          {letter}
        </Button>
      ))}
      <Button
        variant={activeLetter === '' ? "default" : "outline"}
        size="sm"
        className={`min-w-[4rem] transition-all duration-300 hover:scale-110 ${activeLetter === '' ? 'bg-gradient-to-r from-blue-600 to-blue-700 shadow-md' : 'hover:bg-blue-50 dark:hover:bg-blue-900/30'}`}
        onClick={() => onLetterChange('')}
      >
        Tous
      </Button>
    </div>
  );
};

export default AlphabetFilter;
