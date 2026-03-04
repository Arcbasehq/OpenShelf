import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/** Create a new user with email/password credentials. */
export const signUp = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    passwordHash: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if email already exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (existing) {
      throw new Error("An account with this email already exists.");
    }

    const userId = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      provider: "email",
      tokenIdentifier: `email:${args.email}`,
      passwordHash: args.passwordHash,
    });

    return { userId };
  },
});

/** Verify credentials and return user info. */
export const signIn = mutation({
  args: {
    email: v.string(),
    passwordHash: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (!user) {
      throw new Error("No account found with this email.");
    }

    if (user.passwordHash !== args.passwordHash) {
      throw new Error("Incorrect password.");
    }

    return { userId: user._id, name: user.name, email: user.email };
  },
});

/** Get user by ID (for token validation). */
export const getUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

/** Update user profile (display name). */
export const updateProfile = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found.");
    await ctx.db.patch(args.userId, { name: args.name });
    return { success: true };
  },
});

/** Change password for email-provider users. */
export const changePassword = mutation({
  args: {
    userId: v.id("users"),
    currentPasswordHash: v.string(),
    newPasswordHash: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found.");
    if (user.provider !== "email") {
      throw new Error("Password change is only available for email accounts.");
    }
    if (user.passwordHash !== args.currentPasswordHash) {
      throw new Error("Current password is incorrect.");
    }
    await ctx.db.patch(args.userId, { passwordHash: args.newPasswordHash });
    return { success: true };
  },
});

/** Delete user account and all associated data. */
export const deleteAccount = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found.");

    const favorites = await ctx.db
      .query("favorites")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    for (const fav of favorites) {
      await ctx.db.delete(fav._id);
    }

    await ctx.db.delete(args.userId);
    return { success: true };
  },
});
