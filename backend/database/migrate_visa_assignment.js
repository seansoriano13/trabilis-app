import 'dotenv/config'
import pg from 'pg'

async function migrateVisaAssignment() {
    let client
    
    try {
        // Connect to PostgreSQL database
        client = new pg.Client({
            connectionString: process.env.LOCAL_DB_URL || `postgresql://${process.env.LOCAL_DB_USER}:${process.env.LOCAL_DB_PASS}@${process.env.LOCAL_DB_HOST}:${process.env.LOCAL_DB_PORT}/${process.env.LOCAL_DB_NAME}`
        })

        await client.connect()
        console.log('Connected to PostgreSQL database')

        // Check if columns already exist
        const result = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'visa_inquiries' AND column_name = 'assigned_to'
        `)

        if (result.rows.length > 0) {
            console.log('Assignment columns already exist, skipping migration')
            return
        }

        // Add assignment columns
        console.log('Adding assignment columns to visa_inquiries table...')
        
        await client.query(`
            ALTER TABLE visa_inquiries 
            ADD COLUMN assigned_to VARCHAR(50) NULL,
            ADD COLUMN assigned_by VARCHAR(50) NULL,
            ADD COLUMN assigned_at TIMESTAMP NULL,
            ADD COLUMN assignment_status VARCHAR(20) DEFAULT 'pending' CHECK (assignment_status IN ('pending', 'in_progress', 'completed'))
        `)

        console.log('✅ Added assignment columns')

        // Add indexes
        console.log('Adding indexes...')
        
        await client.query(`
            CREATE INDEX idx_visa_inquiries_assigned_to ON visa_inquiries(assigned_to)
        `)
        
        await client.query(`
            CREATE INDEX idx_visa_inquiries_assignment_status ON visa_inquiries(assignment_status)
        `)
        
        await client.query(`
            CREATE INDEX idx_visa_inquiries_assigned_at ON visa_inquiries(assigned_at)
        `)

        console.log('✅ Added indexes')

        // Update existing records
        console.log('Updating existing records...')
        
        await client.query(`
            UPDATE visa_inquiries 
            SET assignment_status = 'pending' 
            WHERE assignment_status IS NULL
        `)

        console.log('✅ Updated existing records')
        console.log('🎉 Migration completed successfully!')

    } catch (error) {
        console.error('❌ Migration failed:', error.message)
        process.exit(1)
    } finally {
        if (client) {
            await client.end()
            console.log('Database connection closed')
        }
    }
}

// Run migration
migrateVisaAssignment()
