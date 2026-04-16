import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'
import * as schema from './schema'

// Reuse connection pool across hot reloads in development
const globalForDb = global

if (!globalForDb._mysqlPool) {
  globalForDb._mysqlPool = mysql.createPool({
    uri: process.env.DATABASE_URL,
    waitForConnections: true,
    connectionLimit: 10,
  })
}

export const db = drizzle(globalForDb._mysqlPool, { schema, mode: 'default' })
