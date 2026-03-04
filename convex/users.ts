import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Store or retrieve the current user based on their auth token.
 * Called after login to ensure the user exists in the database.
 */
export const store = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Called store without authentication.");
    }

    // Check if user already exists
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (user !== null) {
      return user._id;
    }

    // Create new user
    return await ctx.db.insert("users", {
      name: identity.name ?? identity.email ?? "Anonymous",
      email: identity.email ?? "",
      provider: identity.issuer?.includes("google") ? "google" : "email",
      avatarUrl: identity.pictureUrl,
      tokenIdentifier: identity.tokenIdentifier,
    });
  },
});

/** Get the currently authenticated user. */
export const me = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
  },
});
