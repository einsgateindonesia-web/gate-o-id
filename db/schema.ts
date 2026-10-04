import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull().default("Lainnya"),
  image: text("image").default(""),
  link: text("link").notNull(),
  badge: text("badge").default(""),
  desc: text("desc").default(""),
  clicks: integer("clicks").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow()
});
