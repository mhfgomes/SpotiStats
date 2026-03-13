import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Full sync (top tracks + artists + recently played) every 24 hours
crons.interval(
  "full-sync-all-users",
  { hours: 24 },
  internal.spotify.sync.fullSyncAllUsers
);

export default crons;
