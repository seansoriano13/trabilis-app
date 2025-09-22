-- Add assignment columns to visa_inquiries table for PostgreSQL
-- Run this script on your local PostgreSQL database

-- Add assignment columns to visa_inquiries table
ALTER TABLE visa_inquiries 
ADD COLUMN assigned_to VARCHAR(50) NULL,
ADD COLUMN assigned_by VARCHAR(50) NULL,
ADD COLUMN assigned_at TIMESTAMP NULL,
ADD COLUMN assignment_status VARCHAR(20) DEFAULT 'pending' CHECK (assignment_status IN ('pending', 'in_progress', 'completed'));

-- Add indexes for better performance
CREATE INDEX idx_visa_inquiries_assigned_to ON visa_inquiries(assigned_to);
CREATE INDEX idx_visa_inquiries_assignment_status ON visa_inquiries(assignment_status);
CREATE INDEX idx_visa_inquiries_assigned_at ON visa_inquiries(assigned_at);

-- Update existing records to have default assignment status
UPDATE visa_inquiries 
SET assignment_status = 'pending' 
WHERE assignment_status IS NULL;
