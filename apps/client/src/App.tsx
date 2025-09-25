import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";

export default function App() {
    const router = createBrowserRouter([
        {
            path: "/",
            element: <h1 className="text-3xl text-amber-500">Hello, World!</h1>,
        },
    ]);

    return <RouterProvider router={router} />;
}
