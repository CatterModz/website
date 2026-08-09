import { createBrowserRouter } from "react-router-dom";
import Layout from "./layout.tsx";
import Home from "./index.tsx";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            { index: true, element: <Home /> },
            { path: "*", element: <div>nothing here ~uwu</div> },
        ],
    },
]);