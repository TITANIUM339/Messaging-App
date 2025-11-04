import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import Auth from "./layouts/Auth";
import Add from "./pages/add";
import Friends from "./pages/friends";
import Login, { loginAction } from "./pages/login";
import Root, { rootLoader } from "./pages/root";
import Signup, { signupAction } from "./pages/signup";

export default function App() {
    const router = createBrowserRouter([
        {
            path: "/",
            loader: rootLoader,
            Component: Root,
            children: [
                {
                    path: "friends",
                    Component: Friends,
                    children: [
                        {
                            path: "add",
                            Component: Add,
                        },
                    ],
                },
            ],
        },
        {
            Component: Auth,
            children: [
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
            ],
        },
    ]);

    return <RouterProvider router={router} />;
}
