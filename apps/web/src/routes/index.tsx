import {useAuth} from "../hooks/useAuth.ts";
import type {Community} from "../types/community.ts";
import Endpoints from "@web/api/index.ts";
import {useRef, useState} from "react";
import {useLoaderData} from "react-router-dom";

/**
 * Deprecated. This is only for testing.
 */
export default function AuthenticationBar() {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;

    return user ? <div>Welcome! {user.username}</div> : <div>Not logged in</div>
}

export function DynamicCommunity() {
    const community = useLoaderData() as Community;
    const fileRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleUpload() {
        const file = fileRef.current?.files?.[0];
        if (!file) return;

        const form = new FormData();
        form.append("file", file);
        form.append("name", "test");

        setUploading(true);
        const res = await fetch(Endpoints.uploadModToCommunity(community.id), {
            method: "POST",
            body: form,
            credentials: "include",
        });
        setUploading(false);
        if (!res.ok) setError(await res.text());
    }

    return <>
        <AuthenticationBar />
        <h1>Community: {community.name}</h1>

        <input ref={fileRef} type="file" />
        <button onClick={handleUpload} disabled={uploading}>
            {uploading ? "Uploading..." : "upload"}
        </button>
        {error && <div>{error}</div>}

        {community.tags.map(tag => (
            <span key={tag.name}>{tag.name}</span>
        ))}
    </>;
}