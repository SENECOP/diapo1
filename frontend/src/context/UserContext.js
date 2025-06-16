import { createContext, useState, useEffect, useContext } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) setUser(storedUser);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const updateUser = (newData) => {
    setUser(newData);
    localStorage.setItem("user", JSON.stringify(newData)); // corrige ici aussi le nom "user" au lieu de "userConnected"
  };

  return (
    <UserContext.Provider value={{ user, login, logout, updateUser, conversations, setConversations }}>
      {children}
    </UserContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte facilement
export const useUserContext = () => useContext(UserContext);
