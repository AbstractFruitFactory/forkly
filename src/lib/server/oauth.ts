import { Google } from "arctic"
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from "$env/static/private"

const redirectUri = import.meta.env.MODE === "development"
    ? "http://localhost:5173/login/google/callback"
    : "https://forkly.vercel.app/login/google/callback"

console.log("[OAUTH] Google redirect URI:", redirectUri)

export const google = new Google(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    redirectUri
) 