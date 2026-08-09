import { useEffect, useState } from "react";

export function useAuth() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("http://localhost:3001/api/auth/me", { credentials: "include" })
            .then((r) => (r.ok ? r.json() : null))
            .then((d) => setUser(d))
            .finally(() => setLoading(false));
    }, []);

    return { user, loading };
}