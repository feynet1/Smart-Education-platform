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
    // True when the session came from an invite link — user must set password first
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
            // Detect invite acceptance — Supabase fires SIGNED_IN with user_metadata
            // containing an empty/unset password_hash, or we can check the URL hash type
            if (event === 'SIGNED_IN' && session?.user) {
                const hash = window.location.hash;
                const isInviteFlow =
                    hash.includes('type=invite') ||
                    hash.includes('type=signup') ||
                    session.user.user_metadata?.invited === true ||
                    !session.user.last_sign_in_at; // first ever sign-in = invite

                if (isInviteFlow && window.location.pathname !== '/accept-invite') {
                    // Mark as pending invite — ProtectedRoute will redirect to /accept-invite
                    setPendingInvite(true);
                    setUser(session.user);
                    setLoading(false);
                    return;
                }
            }

            if (event === 'USER_UPDATED') {
                // Password was set — clear pending invite flag
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
            if (error) {
                console.error('Error fetching profile:', error);
            } else {
                setProfile(data);
            }
        } catch (error) {
            console.error('Error in fetchProfile:', error);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw getErrorMessage(error);
        return data.user;
    };

    const loginWithGoogle = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: `${window.location.origin}/` }
        });
        if (error) throw getErrorMessage(error);
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
    };

    const value = {
        user, profile,
        isAuthenticated: !!user,
        pendingInvite,
        loading,
        login, loginWithGoogle, register, logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
