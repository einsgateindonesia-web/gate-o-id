import type { Config } from "@netlify/functions";
import { db } from "../../db/index.js";
import { products } from "../../db/schema.js";
import { eq, sql } from "drizzle-orm";

export default async (req: Request) => {
  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/\.netlify\/functions\/api/, "").replace(/^\/api/, "");
  const method = req.method;

  // CORS headers
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Admin-Password"
  };

  if (method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  try {
    // GET /api/products or GET /api/stats
    if (method === "GET" && (path === "" || path === "/" || path === "/products")) {
      const allProducts = await db.select().from(products);
      return Response.json(allProducts, { status: 200, headers });
    }

    // POST /api/auth - Verify admin password
    if (method === "POST" && path === "/auth") {
      const body = await req.json().catch(() => ({}));
      const password = body.password;
      const adminPassword = process.env.ADMIN_PASSWORD || "gateo2025";

      if (password === adminPassword) {
        return Response.json({ success: true, token: "admin-session-token" }, { status: 200, headers });
      } else {
        return Response.json({ success: false, error: "Password salah" }, { status: 401, headers });
      }
    }

    // Helper for admin authorization check
    const checkAuth = (req: Request) => {
      const authHeader = req.headers.get("X-Admin-Password");
      const adminPassword = process.env.ADMIN_PASSWORD || "gateo2025";
      return authHeader === adminPassword;
    };

    // POST /api/products - Create product
    if (method === "POST" && (path === "" || path === "/" || path === "/products")) {
      if (!checkAuth(req)) {
        return Response.json({ error: "Unauthorized" }, { status: 401, headers });
      }

      const body = await req.json().catch(() => ({}));
      if (!body.title || !body.link) {
        return Response.json({ error: "Title and link are required" }, { status: 400, headers });
      }

      const newProduct = {
        id: body.id || "prod-" + Math.random().toString(36).substring(2, 9),
        title: String(body.title).trim(),
        category: String(body.category || "Umum").trim(),
        image: String(body.image || "").trim(),
        link: String(body.link).trim(),
        badge: String(body.badge || "").trim(),
        desc: String(body.desc || "").trim(),
        clicks: Number(body.clicks) || 0
      };

      await db.insert(products).values(newProduct);
      return Response.json({ success: true, product: newProduct }, { status: 201, headers });
    }

    // PUT /api/products - Update product or batch import
    if (method === "PUT" && path === "/products") {
      if (!checkAuth(req)) {
        return Response.json({ error: "Unauthorized" }, { status: 401, headers });
      }

      const body = await req.json().catch(() => ({}));
      
      // Batch sync (Import replace all)
      if (Array.isArray(body.products)) {
        await db.delete(products);
        if (body.products.length > 0) {
          const valuesToInsert = body.products.map((p: any) => ({
            id: String(p.id || "prod-" + Math.random().toString(36).substring(2, 9)),
            title: String(p.title || "").trim(),
            category: String(p.category || "Umum").trim(),
            image: String(p.image || "").trim(),
            link: String(p.link || "").trim(),
            badge: String(p.badge || "").trim(),
            desc: String(p.desc || "").trim(),
            clicks: Number(p.clicks) || 0
          }));
          await db.insert(products).values(valuesToInsert);
        }
        return Response.json({ success: true, count: body.products.length }, { status: 200, headers });
      }

      // Single update
      if (!body.id) {
        return Response.json({ error: "Product ID required" }, { status: 400, headers });
      }

      await db.update(products)
        .set({
          title: body.title,
          category: body.category,
          image: body.image,
          link: body.link,
          badge: body.badge,
          desc: body.desc,
          clicks: body.clicks !== undefined ? Number(body.clicks) : undefined
        })
        .where(eq(products.id, body.id));

      return Response.json({ success: true }, { status: 200, headers });
    }

    // POST /api/click - Increment click count
    if (method === "POST" && path === "/click") {
      const body = await req.json().catch(() => ({}));
      if (!body.id) {
        return Response.json({ error: "Product ID required" }, { status: 400, headers });
      }

      await db.update(products)
        .set({ clicks: sql`clicks + 1` })
        .where(eq(products.id, body.id));

      return Response.json({ success: true }, { status: 200, headers });
    }

    // DELETE /api/products - Delete product or clear all
    if (method === "DELETE" && path === "/products") {
      if (!checkAuth(req)) {
        return Response.json({ error: "Unauthorized" }, { status: 401, headers });
      }

      const urlParams = url.searchParams;
      const id = urlParams.get("id");
      const clearAll = urlParams.get("all");

      if (clearAll === "true") {
        await db.delete(products);
        return Response.json({ success: true }, { status: 200, headers });
      }

      if (!id) {
        return Response.json({ error: "ID required" }, { status: 400, headers });
      }

      await db.delete(products).where(eq(products.id, id));
      return Response.json({ success: true }, { status: 200, headers });
    }

    return Response.json({ error: "Not Found", path }, { status: 404, headers });
  } catch (err: any) {
    console.error("API error:", err);
    return Response.json({ error: err.message || "Internal Server Error" }, { status: 500, headers });
  }
};

export const config: Config = {
  path: ["/api/*", "/.netlify/functions/api/*"]
};
