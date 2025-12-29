import React, { createContext, useContext, useState, useEffect } from "react";

// Criação do contexto
const TokenContext = createContext();

// Provedor do contexto
export const TokenProvider = ({ children }) => {
  const [token, setTokenState] = useState(() => {
    // Inicializa o token a partir do localStorage, se disponível
    return localStorage.getItem("access_token") || null;
  });

  // Atualiza o token no estado e no localStorage
  const setToken = (newToken) => {
    setTokenState(newToken);
    if (newToken) {
      localStorage.setItem("access_token", newToken);
    } else {
      localStorage.removeItem("access_token");
    }
  };

  return (
    <TokenContext.Provider value={{ token, setToken }}>
      {children}
    </TokenContext.Provider>
  );
};

// Hook personalizado para acessar o contexto
export const useToken = () => useContext(TokenContext);
