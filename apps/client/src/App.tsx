import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import Login from "./pages/login";
import Signup from "./pages/signup";

export default function App() {
    const router = createBrowserRouter([
        {
            path: "/login",
            Component: Login,
        },
        {
            path: "/signup",
            Component: Signup,
        },
    ]);

    return <RouterProvider router={router} />;
}
