
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
    <div className="flex flex-wrap justify-center my-6 gap-1.5">
      {alphabet.map((letter) => (
        <Button
          key={letter}
          variant={activeLetter === letter ? "default" : "outline"}
          size="sm"
          className={`min-w-[2.2rem] rounded-full transition-all duration-300 hover:scale-110 ${
            activeLetter === letter 
              ? 'bg-gradient-to-r from-blue-400 to-blue-500 shadow-md border-0' 
              : 'hover:bg-blue-50 dark:hover:bg-blue-900/30 border'
          }`}
          onClick={() => onLetterChange(letter)}
        >
          {letter}
        </Button>
      ))}
      <Button
        variant={activeLetter === '' ? "default" : "outline"}
        size="sm"
        className={`min-w-[4.5rem] rounded-full transition-all duration-300 hover:scale-110 ${
          activeLetter === '' 
            ? 'bg-gradient-to-r from-blue-400 to-blue-500 shadow-md border-0' 
            : 'hover:bg-blue-50 dark:hover:bg-blue-900/30 border'
        }`}
        onClick={() => onLetterChange('')}
      >
        Tous
      </Button>
    </div>
  );
};

export default AlphabetFilter;
