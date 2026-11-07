import { createBrowserRouter } from "react-router-dom";
import Layout from "@routes/layout";
import { DynamicCommunity } from "@routes/index.tsx";
import Home from "@routes/home";
import OopsesWhoopsiesWeMadeAFuckyWucky from "@routes/error/404.tsx";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        errorElement: <OopsesWhoopsiesWeMadeAFuckyWucky />,
        children: [
            { index: true, element: <Home /> },
            {
                path: "c/:communityId",
                element: <DynamicCommunity />,
                loader: async ({ params }) => {
                    const res = await fetch(`/api/communities/${encodeURIComponent(params.communityId!)}`);
                    if (!res.ok) throw new Response("Not found", { status: 404 });
                    return res.json();
                },
            },
            { path: "*", element: <OopsesWhoopsiesWeMadeAFuckyWucky /> },
        ],
    },
]);