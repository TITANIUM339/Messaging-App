import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import Login, { loginAction } from "./pages/login";
import Signup, { signupAction } from "./pages/signup";

export default function App() {
    const router = createBrowserRouter([
        {
            path: "/login",
            Component: Login,
            action: loginAction,
        },
        {
            path: "/signup",
            Component: Signup,
            action: signupAction,
        },
    ]);

    return <RouterProvider router={router} />;
}
