import React, { createContext, useContext, useState, useEffect } from 'react';
import { gql, useQuery } from '@apollo/client';
import { jwtDecode } from "jwt-decode";

interface User {
  _id: string;
  name: string;
  email: string;
}

interface JwtPayload {
  exp: number;
  iat: number;
  userId: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: () => {},
  logout: () => {},
});

const ME_QUERY = gql`
  query Me {
    me {
      _id
      name
      email
    }
  }
`;

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const { data, refetch } = useQuery(ME_QUERY, {
    skip: !isAuthenticated,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        if (decoded && decoded.exp * 1000 > Date.now()) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error('Invalid token:', error);
        localStorage.removeItem('token');
      }
    }
  }, []);

  useEffect(() => {
    if (data?.me) {
      setUser(data.me);
    }
  }, [data]);

  const login = (token: string) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
    refetch();
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

export { AuthProvider, useAuth }; 