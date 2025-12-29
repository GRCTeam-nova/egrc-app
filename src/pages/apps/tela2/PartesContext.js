import React, { createContext, useState, useContext } from 'react';
import { API_QUERY, API_COMMAND } from '../../../config';
import axios from 'axios';

const PartesContext = createContext();

export const usePartes = () => useContext(PartesContext);

export const PartesProvider = ({ children }) => {
  const [partes, setPartes] = useState([]);

  const atualizarPartes = async () => {
    try {
      const response = await axios.get(`${API_QUERY}/api/Parte`);
      setPartes(response.data);
    } catch (error) {
    }
  };

  return (
    <PartesContext.Provider value={{ partes, atualizarPartes }}>
      {children}
    </PartesContext.Provider>
  );
};
