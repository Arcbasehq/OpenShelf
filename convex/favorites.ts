import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Add a book to a user's favorites.
 * The book is upserted first (stored if not already in the DB).
 */
export const add = mutation({
  args: {
    userId: v.id("users"),
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
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found.");

    // Upsert the book
    let book = await ctx.db
      .query("books")
      .withIndex("by_googleId", (q) => q.eq("googleId", args.googleId))
      .unique();

    if (!book) {
      const bookId = await ctx.db.insert("books", {
        googleId: args.googleId,
        title: args.title,
        authors: args.authors,
        description: args.description,
        thumbnail: args.thumbnail,
        publishedDate: args.publishedDate,
        pageCount: args.pageCount,
        categories: args.categories,
      });
      book = (await ctx.db.get(bookId))!;
    }

    // Check if already favorited
    const existing = await ctx.db
      .query("favorites")
      .withIndex("by_user_book", (q) =>
        q.eq("userId", user._id).eq("bookId", book!._id),
      )
      .unique();

    if (existing) return existing._id;

    return await ctx.db.insert("favorites", {
      userId: user._id,
      bookId: book._id,
    });
  },
});

/** Remove a book from a user's favorites. */
export const remove = mutation({
  args: {
    userId: v.id("users"),
    bookId: v.id("books"),
  },
  handler: async (ctx, { userId, bookId }) => {
    const fav = await ctx.db
      .query("favorites")
      .withIndex("by_user_book", (q) =>
        q.eq("userId", userId).eq("bookId", bookId),
      )
      .unique();

    if (fav) await ctx.db.delete(fav._id);
  },
});

/** List all favorite books for a user (with full book data). */
export const list = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const favs = await ctx.db
      .query("favorites")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const books = await Promise.all(
      favs.map(async (fav) => {
        const book = await ctx.db.get(fav.bookId);
        return book ? { ...book, favoriteId: fav._id } : null;
      }),
    );

    return books.filter(Boolean);
  },
});

/** Check if a specific book is in a user's favorites. */
export const isFavorite = query({
  args: {
    userId: v.id("users"),
    googleId: v.string(),
  },
  handler: async (ctx, { userId, googleId }) => {
    const book = await ctx.db
      .query("books")
      .withIndex("by_googleId", (q) => q.eq("googleId", googleId))
      .unique();
    if (!book) return false;

    const fav = await ctx.db
      .query("favorites")
      .withIndex("by_user_book", (q) =>
        q.eq("userId", userId).eq("bookId", book._id),
      )
      .unique();

    return fav !== null;
  },
});
