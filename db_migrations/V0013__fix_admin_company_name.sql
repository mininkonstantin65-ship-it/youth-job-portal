UPDATE t_p86122027_youth_job_portal.users 
SET company_name = 'Тестовая Компания', updated_at = NOW()
WHERE email = 'mininkonstantin@gmail.com' AND company_name IS NULL;