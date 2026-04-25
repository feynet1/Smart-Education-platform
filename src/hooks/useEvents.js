import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

/**
 * Fetch upcoming events from Supabase filtered by target role.
 * @param {'all' | 'students' | 'teachers'} role
 */
const useEvents = (role) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const today = new Date().toISOString().split('T')[0];
                const { data, error } = await supabase
                    .from('events')
                    .select('*')
                    .gte('date', today)
                    .order('date', { ascending: true });
                if (error) throw error;
                // Filter by target: show 'all' events + role-specific ones
                const filtered = (data || []).filter(e =>
                    e.target === 'all' || e.target === role
                );
                setEvents(filtered);
            } catch (err) {
                console.error('Failed to fetch events:', err);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [role]);

    return { events, loading };
};

export default useEvents;
