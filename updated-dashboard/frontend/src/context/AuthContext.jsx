import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tryLogin = async () => {
      try {
        const stored = localStorage.getItem("studentUser");
        if (stored) {
          const parsed = JSON.parse(stored);
          axios.defaults.headers.common["Authorization"] = `Bearer ${parsed.token}`;
          setUser(parsed);
          setLoading(false);
          return;
        }

        // Default auto-login as ADMIN so both / and /admin work
        const { data } = await axios.post("/api/auth/login", {
          email: "admin@studentiq.com",
          password: "password123",
        });
        localStorage.setItem("studentUser", JSON.stringify(data));
        axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
        setUser(data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    tryLogin();
  }, []);

  const login = async (email, password) => {
    const { data } = await axios.post("/api/auth/login", { email, password });
    localStorage.setItem("studentUser", JSON.stringify(data));
    axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
    setUser(data);
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await axios.post("/api/auth/register", { name, email, password });
    localStorage.setItem("studentUser", JSON.stringify(data));
    axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
    setUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("studentUser");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
    window.location.href = "/";
  };

  const updateUser = (updatedData) => {
    const merged = { ...user, ...updatedData };
    localStorage.setItem("studentUser", JSON.stringify(merged));
    setUser(merged);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);