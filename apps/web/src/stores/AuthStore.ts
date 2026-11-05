import Store from "./base.ts";

interface User {
    username: string;
    email: string;
    avatar: string;
    createdAt: string;
    id: string;
}

export const AuthenticationStore = new class _AuthenticationStore extends Store {
    private isLoggedIn: boolean = false;
    private user: User = null;
    private loading: boolean = true;

    constructor() {
        super();
        this.scheduleUpdate();
    }

    private setLoading(loading: boolean) {
        this.loading = loading;
        this.emitChange();
    }

    scheduleUpdate() {
        fetch("http://localhost:3001/api/auth/me", {credentials: "include"})
            .then((r) => (r.ok ? r.json() : null))
            .then((d) => this.setCurrentUser(d))
            .finally(() => this.setLoading(false));
    }

    getCurrentUser() {
        return this.user;
    }

    isAuthed()
    {
        return this.isLoggedIn && this.user !== null;
    }

    setCurrentUser(user: User) {
        this.user = user;
        this.emitChange();
    }

    logout() {
        this.isLoggedIn = false;
        this.emitChange();
    }

    login() {
        this.isLoggedIn = true;
        this.emitChange();
    }
}