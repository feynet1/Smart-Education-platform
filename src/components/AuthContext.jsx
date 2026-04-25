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
                fetchProfile(session.user);
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
                fetchProfile(session.user);
            } else {
                setProfile(null);
                setPendingInvite(false);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchProfile = async (authUser) => {
        try {
            const userId = authUser.id;
            const userEmail = authUser.email;

            // 1. Try by id first (email/password users)
            let { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (!data && userEmail) {
                // 2. Google user — look up by email
                const { data: byEmail } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('email', userEmail)
                    .single();

                if (byEmail) {
                    // Found by email — this is an existing user signing in via Google
                    // Update the profile id to match the Google auth id
                    await supabase
                        .from('profiles')
                        .update({ id: userId })
                        .eq('email', userEmail);
                    data = { ...byEmail, id: userId };
                }
            }

            if (!data) {
                // No profile found — new Google user with no existing account
                // Sign them out and redirect to register
                await supabase.auth.signOut();
                setUser(null);
                setProfile(null);
                setLoading(false);
                window.location.href = '/register?error=no_account';
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

    const loginWithGoogle = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: `${window.location.origin}/login` }
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
        window.location.href = '/';
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
