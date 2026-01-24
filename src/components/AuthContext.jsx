import React, { createContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check localStorage on mount
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Mock Login Logic
                if (email === 'student@test.com' && password === 'Password123!') {
                    const userData = { name: 'Test Student', email, role: 'Student' };
                    setUser(userData);
                    localStorage.setItem('user', JSON.stringify(userData));
                    resolve(userData);
                } else if (email === 'teacher@test.com' && password === 'Password123!') {
                    const userData = { name: 'Test Teacher', email, role: 'Teacher' };
                    setUser(userData);
                    localStorage.setItem('user', JSON.stringify(userData));
                    resolve(userData);
                } else {
                    reject('Invalid email or password');
                }
            }, 1000); // Simulate network delay
        });
    };

    const register = async (data) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Mock Register Logic - automatically logs in
                const userData = { name: data.name, email: data.email, role: data.role };
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
                resolve(userData);
            }, 1000);
        });
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    const value = {
        user,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
