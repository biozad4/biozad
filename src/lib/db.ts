import mongoose from "mongoose";
import dns from "node:dns";

// ⚠️ تجاوز وحل مشكلة الـ DNS الخاصة بالموزعين المحليين بالمغرب ⚠️
// نجبر تطبيق Node.js على استخدام سيرفرات DNS العالمية لحل سجلات الـ SRV بنجاح
try {
  dns.setServers(["1.1.1.1", "8.8.8.8"]);
} catch (dnsError) {
  console.warn("DNS Override failed, proceeding with default resolver:", dnsError);
}

const MONGODB_URI = process.env.MONGODB_URI;

// MONGODB_URI is deprecated in favor of Supabase (PostgreSQL)


interface GlobalMongoose {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseGlobal: GlobalMongoose | undefined;
}

let cached = globalThis.mongooseGlobal || { conn: null, promise: null };

if (!globalThis.mongooseGlobal) {
  globalThis.mongooseGlobal = cached;
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongooseInstance) => {
      console.log("✓ Connected directly to MongoDB Atlas!");
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}