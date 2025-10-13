import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import Login from "./pages/login";

export default function App() {
    const router = createBrowserRouter([
        {
            path: "/login",
            Component: Login,
        },
    ]);

    return <RouterProvider router={router} />;
}
