import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import Auth from "./layouts/Auth";
import Add, { addAction } from "./pages/add";
import Friends from "./pages/friends";
import Login, { loginAction } from "./pages/login";
import Pending, { pendingAction, pendingLoader } from "./pages/pending";
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
                            action: addAction,
                        },
                        {
                            path: "pending",
                            loader: pendingLoader,
                            Component: Pending,
                            action: pendingAction,
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
