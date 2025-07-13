import React, { createContext, useContext, useState, useCallback } from 'react';

interface PrivacyContextType {
  isNumbersBlurred: boolean;
  toggleNumbersBlur: () => void;
}

const PrivacyContext = createContext<PrivacyContextType | undefined>(undefined);

export const usePrivacy = () => {
  const context = useContext(PrivacyContext);
  if (context === undefined) {
    throw new Error('usePrivacy must be used within a PrivacyProvider');
  }
  return context;
};

interface PrivacyProviderProps {
  children: React.ReactNode;
}

export const PrivacyProvider: React.FC<PrivacyProviderProps> = ({ children }) => {
  const [isNumbersBlurred, setIsNumbersBlurred] = useState(true);

  const toggleNumbersBlur = useCallback(() => {
    setIsNumbersBlurred(prev => !prev);
  }, []);

  return (
    <PrivacyContext.Provider value={{ isNumbersBlurred, toggleNumbersBlur }}>
      {children}
    </PrivacyContext.Provider>
  );
};