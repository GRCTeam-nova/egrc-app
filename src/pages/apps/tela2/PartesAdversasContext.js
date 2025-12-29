import React, { createContext, useState, useContext } from 'react';
import { API_QUERY, API_COMMAND } from '../../../config';
import axios from 'axios';

const PartesAdversasContext = createContext();
const ResponsaveisContext = createContext();
const PartesContext = createContext();

export const usePartesAdversas = () => useContext(PartesAdversasContext);
export const useResponsaveis = () => useContext(ResponsaveisContext);
export const usePartes = () => useContext(PartesContext);

export const PartesAdversasProvider = ({ children }) => {
  const [partesAdversas, setPartesAdversas] = useState([]);
  const [responsaveis, setResponsaveis] = useState([]);
  const [partes, setPartes] = useState([]);

  const atualizarPartesAdversas = async () => {
    try {
      const gatewayResponsaveis = await axios.get(`${API_QUERY}/api/Usuario`);
      const gatewayPartes = await axios.get(`${API_QUERY}/api/Parte`);
      const gatewayPartesAdversas = await axios.get(`${API_QUERY}/api/ParteAdversa`);
      setPartesAdversas(gatewayPartesAdversas.data);
      setResponsaveis(gatewayResponsaveis.data)
      setPartes(gatewayPartes.data)
    } catch (error) {
    }
  };

  return (
    <PartesAdversasContext.Provider value={{ partesAdversas, responsaveis, partes, atualizarPartesAdversas }}>
      {children}
    </PartesAdversasContext.Provider>
  );
};
