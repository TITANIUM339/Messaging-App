import type { Friends } from "@lib/schema";
import { createContext } from "react";
import type * as z from "zod";

export const ConnectedFriendsContext = createContext<z.infer<typeof Friends>>(
    [],
);
