import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table — populated on sign-up / first login
  users: defineTable({
    name: v.string(),
    email: v.string(),
    // "email" | "google"
    provider: v.string(),
    avatarUrl: v.optional(v.string()),
    tokenIdentifier: v.string(),
    passwordHash: v.optional(v.string()),
  })
    .index("by_token", ["tokenIdentifier"])
    .index("by_email", ["email"]),

  // Cached book metadata from Google Books API
  books: defineTable({
    googleId: v.string(),
    title: v.string(),
    authors: v.array(v.string()),
    description: v.optional(v.string()),
    thumbnail: v.optional(v.string()),
    publishedDate: v.optional(v.string()),
    pageCount: v.optional(v.number()),
    categories: v.optional(v.array(v.string())),
  }).index("by_googleId", ["googleId"]),

  // Many-to-many: user ↔ book
  favorites: defineTable({
    userId: v.id("users"),
    bookId: v.id("books"),
  })
    .index("by_user", ["userId"])
    .index("by_user_book", ["userId", "bookId"]),
});
