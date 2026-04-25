import { createContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { supabase } from '../supabaseClient';

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null);

const getErrorMessage = (error) => {
    if (!error) return 'Unknown error';
    if (typeof error === 'string') return error;
    return error.message ?? JSON.stringify(error);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser]       = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pendingInvite, setPendingInvite] = useState(false);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
            } else {
                setLoading(false);
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
                const hash = window.location.hash;
                const isInviteFlow =
                    hash.includes('type=invite') ||
                    hash.includes('type=signup') ||
                    session.user.user_metadata?.invited === true ||
                    !session.user.last_sign_in_at;

                if (isInviteFlow && window.location.pathname !== '/accept-invite') {
                    setPendingInvite(true);
                    setUser(session.user);
                    setLoading(false);
                    return;
                }
            }

            if (event === 'USER_UPDATED') {
                setPendingInvite(false);
            }

            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
            } else {
                setProfile(null);
                setPendingInvite(false);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchProfile = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error || !data) {
                // No profile — sign out and redirect
                console.warn('No profile found — signing out:', userId);
                await supabase.auth.signOut();
                setUser(null);
                setProfile(null);
                setLoading(false);
                window.location.href = '/login';
                return;
            }

            setProfile(data);
        } catch (err) {
            console.error('Error in fetchProfile:', err);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw getErrorMessage(error);
        return data.user;
    };

    const register = async (userData) => {
        const { data, error } = await supabase.auth.signUp({
            email: userData.email,
            password: userData.password,
            options: { data: { name: userData.name, role: userData.role } }
        });
        if (error) throw getErrorMessage(error);
        return data.user;
    };

    const logout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw getErrorMessage(error);
        setPendingInvite(false);
        window.location.href = '/';
    };

    const value = {
        user, profile,
        isAuthenticated: !!user,
        pendingInvite,
        loading,
        login, register, logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
