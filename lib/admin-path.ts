// The admin panel is reachable only via this path — requests to the plain
// /admin path are blocked in middleware.ts (404), and this constant is what
// gets rewritten to the real /admin/** routes internally.
//
// To rotate this later: change the string below, redeploy, and use the new
// path going forward. Nothing else needs to change.
export const ADMIN_BASE_PATH = "admin-zo89do0f5s";
