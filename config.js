// Fill these from Supabase > Project Settings > API.
// The key is the "anon" / "publishable" key (safe to put in a web page).
// Never put the "service_role" / secret key here.
window.FAMILY_CONFIG = {
  supabaseUrl: "https://jybmjogxktvrgykiqyse.supabase.co",
  supabaseKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5Ym1qb2d4a3R2cmd5a2lxeXNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUyNDEyMTUsImV4cCI6MjExMDgxNzIxNX0.jB2k4pF7kjJvaGfEi6fwZvDayTodUfsQvh2d-4ELZN8",
  // Optional, for daily reminders: the PUBLIC key from `npx @pushforge/builder vapid`.
  // Leave empty to turn reminders off.
  vapidPublicKey: ""
};
