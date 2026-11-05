import {useStateFromStores} from "./useStateFromStores.ts";
import {AuthenticationStore} from "../stores/AuthStore.ts";

export function useAuth() {
    const { user, loading } = useStateFromStores(AuthenticationStore, () => {
        return {
            user: AuthenticationStore.getCurrentUser(),
            loading: false,
        };
    });

    return { user, loading };
}