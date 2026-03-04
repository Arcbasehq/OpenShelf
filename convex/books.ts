import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Upsert a book into the database using its Google Books ID.
 * Returns the Convex document ID (existing or newly created).
 */
export const upsert = mutation({
  args: {
    googleId: v.string(),
    title: v.string(),
    authors: v.array(v.string()),
    description: v.optional(v.string()),
    thumbnail: v.optional(v.string()),
    publishedDate: v.optional(v.string()),
    pageCount: v.optional(v.number()),
    categories: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("books")
      .withIndex("by_googleId", (q) => q.eq("googleId", args.googleId))
      .unique();

    if (existing) return existing._id;

    return await ctx.db.insert("books", {
      googleId: args.googleId,
      title: args.title,
      authors: args.authors,
      description: args.description,
      thumbnail: args.thumbnail,
      publishedDate: args.publishedDate,
      pageCount: args.pageCount,
      categories: args.categories,
    });
  },
});

/** Get a single book by its Google Books ID. */
export const getByGoogleId = query({
  args: { googleId: v.string() },
  handler: async (ctx, { googleId }) => {
    return await ctx.db
      .query("books")
      .withIndex("by_googleId", (q) => q.eq("googleId", googleId))
      .unique();
  },
});

/** Get a book by its Convex document ID. */
export const get = query({
  args: { id: v.id("books") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});
