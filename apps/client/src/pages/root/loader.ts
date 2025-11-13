import api from "@lib/api";
import { redirect } from "react-router";

export default function loader() {
    if (!api.isLoggedIn) {
        return redirect("/login");
    }
}
