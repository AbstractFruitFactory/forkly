import { Google } from "arctic"
import { APP_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from "$env/static/private"

export const google = new Google(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    `${APP_URL}/login/google/callback`
) 