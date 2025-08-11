import 'dotenv/config'
import pg from 'pg'
import mysql from 'mysql2/promise'

let pool

const isProd = process.env.NODE_ENV === 'production'

console.log(`Running in ${process.env.NODE_ENV} mode.`)

if (isProd) {
    console.log('Initializing PostgreSQL connection pool for production...')
    pool = new pg.Pool({
        connectionString: process.env.PROD_DB_URL,
        ssl: {
            rejectUnauthorized: false,
        },
        connectionTimeoutMillis: 5000,
    })
} else {
    console.log('Initializing MySQL connection pool for development...')
    pool = mysql.createPool({
        host: process.env.LOCAL_DB_HOST,
        port: process.env.LOCAL_DB_PORT,
        user: process.env.LOCAL_DB_USER,
        password: process.env.LOCAL_DB_PASS,
        database: process.env.LOCAL_DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
    })
}

function convertPlaceholders(query) {
    let index = 1
    return query.replace(/\?/g, () => `$${index++}`)
}

export async function query(sql, params) {
    if (isProd) {
        const convertedSql = convertPlaceholders(sql)
        const res = await pool.query(convertedSql, params)
        return {
            rows: res.rows,
            rowCount: res.rowCount,
        }
    } else {
        const [rows] = await pool.query(sql, params)
        return rows
    }
}
