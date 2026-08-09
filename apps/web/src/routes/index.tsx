import {useAuth} from "../hooks/useAuth.ts";

export default function Home() {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;

    console.log(user)
    return (
        <div>
            <h1>Welcome</h1>
            {user ? <div>Welcome! {user.username}</div> : <div>Not logged in</div>}
        </div>
    );
}