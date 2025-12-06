-- Add company_name column to users table for employers
ALTER TABLE t_p86122027_youth_job_portal.users 
ADD COLUMN company_name VARCHAR(255);