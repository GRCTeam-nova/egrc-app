// Contexts/SelectedUnitContext.js
import React, { createContext, useState, useContext } from 'react';

const SelectedUnitContext = createContext();

export const useSelectedUnit = () => useContext(SelectedUnitContext);

export const SelectedUnitProvider = ({ children }) => {
  const [selectedUnidade, setSelectedUnidade] = useState('0b56014f-a62a-471a-ba1f-63f4dc9f4200');

  return (
    <SelectedUnitContext.Provider value={{ selectedUnidade, setSelectedUnidade }}>
      {children}
    </SelectedUnitContext.Provider>
  );
};
