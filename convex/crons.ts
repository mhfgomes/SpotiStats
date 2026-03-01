import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Full sync (top tracks + artists + recently played) every 30 minutes
crons.interval(
  "full-sync-all-users",
  { minutes: 30 },
  internal.spotify.sync.fullSyncAllUsers
);

export default crons;
