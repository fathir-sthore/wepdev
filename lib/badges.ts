const NEW_WINDOW_DAYS = 7;
const UPDATED_MIN_GAP_DAYS = 1;

function daysSince(dateStr: string) {
  return (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24);
}

export type ScriptBadge = "FREE" | "PREMIUM" | "NEW" | "UPDATED" | "HOT";

export function computeBadges(script: {
  is_premium: boolean;
  created_at: string;
  updated_at: string;
  hot?: boolean;
}): ScriptBadge[] {
  const badges: ScriptBadge[] = [];
  const isNew = daysSince(script.created_at) <= NEW_WINDOW_DAYS;
  const isUpdated =
    !isNew &&
    (new Date(script.updated_at).getTime() - new Date(script.created_at).getTime()) /
      (1000 * 60 * 60 * 24) >
      UPDATED_MIN_GAP_DAYS;

  if (isNew) badges.push("NEW");
  if (isUpdated) badges.push("UPDATED");
  if (script.hot) badges.push("HOT");
  badges.push(script.is_premium ? "PREMIUM" : "FREE");

  return badges;
}
