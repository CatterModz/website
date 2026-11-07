import {useLocation} from "react-router-dom";

const routes = {
    "c": {
        "error": "Community not found.",
    },
    "u": {
        "error": "User not found.",
    },
    "*": {
        "error": "Page not found.",
    }
}

function useRouteData()
{
    const route = useLocation();
    const parsedRoute = route.pathname.split("/").filter(Boolean).splice(0, 2);

    return { route, type: routes[parsedRoute[0]] || routes["*"] };
}

export default function OopsesWhoopsiesWeMadeAFuckyWucky() {
    const { route, type } = useRouteData();

    return (
        <div>
            <h1>404 - {type?.error}</h1>
            <p>Sorry, the {type.error.split(" ")[0].toLowerCase()} you are looking for does not exist.</p>
        </div>
    );
}