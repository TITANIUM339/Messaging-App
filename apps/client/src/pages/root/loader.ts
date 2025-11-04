import { redirect } from "react-router";
import api from "../../lib/api";

export default function loader() {
    if (!api.isLoggedIn) {
        return redirect("/login");
    }
}
