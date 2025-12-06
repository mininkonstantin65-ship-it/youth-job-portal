import json
import os
import psycopg2
from typing import Dict, Any
from datetime import datetime

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Универсальное API для управления всеми сущностями: пользователи, вакансии, отклики, сообщения
    '''
    method: str = event.get('httpMethod', 'GET')
    path: str = event.get('path', '/')
    
    print(f"🟢 Handler START - Method: {method}, Path: {path}")
    
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With',
        'Access-Control-Max-Age': '86400'
    }
    
    if method == 'OPTIONS':
        print("⚪ OPTIONS request - returning CORS headers")
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': '',
            'isBase64Encoded': False
        }
    
    db_url = os.environ.get('DATABASE_URL')
    print(f"🔗 Connecting to DB...")
    
    try:
        conn = psycopg2.connect(db_url)
        cur = conn.cursor()
        print(f"✅ DB connected")
        
        # Определяем ресурс из query параметра: ?resource=users
        query_params = event.get('queryStringParameters') or {}
        resource = query_params.get('resource', 'users')
        print(f"📍 Resource: {resource}, Method: {method}")
        
        # === USERS API ===
        if resource == 'users':
            if method == 'GET':
                print("Fetching all users from database")
                cur.execute("""
                    SELECT id, email, full_name, 
                           EXTRACT(YEAR FROM AGE(date_of_birth))::int as age,
                           phone, test_result, role, company_name, created_at
                    FROM t_p86122027_youth_job_portal.users
                    ORDER BY created_at DESC
                """)
                
                rows = cur.fetchall()
                users = []
                for row in rows:
                    users.append({
                        'id': str(row[0]),
                        'email': row[1],
                        'name': row[2],
                        'age': row[3],
                        'phone': row[4],
                        'testResult': row[5],
                        'role': row[6] if row[6] else 'user',
                        'company_name': row[7],
                        'completedTest': bool(row[5]),
                        'password_hash': 'hidden',
                        'createdAt': row[8].isoformat() if row[8] else None
                    })
                
                return {
                    'statusCode': 200,
                    'headers': {**cors_headers, 'Content-Type': 'application/json'},
                    'body': json.dumps({'users': users}),
                    'isBase64Encoded': False
                }
            
            if method == 'POST':
                body_data = json.loads(event.get('body', '{}'))
                email = str(body_data.get('email', '')).replace("'", "''")
                password = str(body_data.get('password', '')).replace("'", "''")
                name = str(body_data.get('name', '')).replace("'", "''")
                age = body_data.get('age', 0)
                phone = str(body_data.get('phone', '')).replace("'", "''")
                role = str(body_data.get('role', 'user')).replace("'", "''")
                company_name = str(body_data.get('companyName', '')).replace("'", "''")
                
                print(f"Attempting registration for email: {email}, role: {role}, company: {company_name}")
                
                cur.execute(f"""
                    SELECT id FROM t_p86122027_youth_job_portal.users 
                    WHERE email = '{email}'
                """)
                existing = cur.fetchone()
                
                if existing:
                    print(f"Email {email} already exists in database")
                    conn.rollback()
                    return {
                        'statusCode': 400,
                        'headers': {**cors_headers, 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'Email already exists'}),
                        'isBase64Encoded': False
                    }
                
                print(f"Email {email} is unique, creating user...")
                
                birth_year = datetime.now().year - age
                date_of_birth = f'{birth_year}-01-01'
                
                cur.execute(f"""
                    INSERT INTO t_p86122027_youth_job_portal.users 
                    (email, password_hash, full_name, date_of_birth, phone, role, company_name, created_at, updated_at)
                    VALUES ('{email}', '{password}', '{name}', '{date_of_birth}', '{phone}', '{role}', '{company_name}', NOW(), NOW())
                    RETURNING id
                """)
                
                user_id = cur.fetchone()[0]
                conn.commit()
                
                print(f"User created successfully with id: {user_id}")
                
                return {
                    'statusCode': 201,
                    'headers': {**cors_headers, 'Content-Type': 'application/json'},
                    'body': json.dumps({
                        'id': str(user_id),
                        'email': email,
                        'name': name,
                        'age': age,
                        'phone': phone,
                        'role': role,
                        'company_name': company_name,
                        'completedTest': False
                    }),
                    'isBase64Encoded': False
                }
        
        # === JOBS API ===
        elif resource == 'jobs':
            if method == 'GET':
                print("Fetching all jobs from database")
                cur.execute("""
                    SELECT id, title, company, location, type, salary, 
                           description, requirements, employer_id, employer_email, created_at,
                           age_range, category, coordinates, is_premium, 
                           responsibilities, conditions, contact_phone, contact_email
                    FROM t_p86122027_youth_job_portal.jobs
                    ORDER BY created_at DESC
                """)
                
                rows = cur.fetchall()
                jobs = []
                for row in rows:
                    coords_str = row[13] or '[56.0184, 92.8672]'
                    try:
                        coordinates = json.loads(coords_str)
                    except:
                        coordinates = [56.0184, 92.8672]
                    
                    jobs.append({
                        'id': row[0],
                        'title': row[1],
                        'company': row[2],
                        'location': row[3],
                        'type': row[4],
                        'salary': row[5],
                        'description': row[6],
                        'requirements': row[7] or [],
                        'employerId': row[8],
                        'employerEmail': row[9],
                        'postedDate': row[10].isoformat() if row[10] else None,
                        'ageRange': row[11] or '14-17',
                        'category': row[12] or 'Работа с людьми',
                        'coordinates': coordinates,
                        'isPremium': row[14] or False,
                        'responsibilities': row[15] or [],
                        'conditions': row[16] or [],
                        'contact': {
                            'phone': row[17] or '+7 (391) 234-56-78',
                            'email': row[18] or 'hr@company.ru'
                        }
                    })
                
                print(f"Returning {len(jobs)} jobs")
                return {
                    'statusCode': 200,
                    'headers': {**cors_headers, 'Content-Type': 'application/json'},
                    'body': json.dumps({'jobs': jobs}),
                    'isBase64Encoded': False
                }
            
            if method == 'POST':
                print("🔵 POST /jobs - Starting job creation")
                raw_body = event.get('body', '{}')
                print(f"📥 Raw body length: {len(raw_body)} chars")
                
                try:
                    body_data = json.loads(raw_body)
                    print(f"✅ JSON parsed OK, keys: {list(body_data.keys())}")
                except Exception as parse_error:
                    print(f"❌ JSON PARSE ERROR: {parse_error}")
                    print(f"📄 Raw body (first 500 chars): {raw_body[:500]}")
                    raise
                
                job_id = str(body_data.get('id', '')).replace("'", "''")
                title = str(body_data.get('title', '')).replace("'", "''")
                company = str(body_data.get('company', '')).replace("'", "''")
                location = str(body_data.get('location', '')).replace("'", "''")
                job_type = str(body_data.get('type', '')).replace("'", "''")
                salary = str(body_data.get('salary', '')).replace("'", "''")
                description = str(body_data.get('description', '')).replace("'", "''")
                requirements = json.dumps(body_data.get('requirements', [])).replace("'", "''")
                employer_id = str(body_data.get('employerId', '')).replace("'", "''")
                employer_email = str(body_data.get('employerEmail', '')).replace("'", "''")
                age_range = str(body_data.get('ageRange', '14-17')).replace("'", "''")
                category = str(body_data.get('category', 'Работа с людьми')).replace("'", "''")
                
                coordinates = body_data.get('coordinates', [56.0184, 92.8672])
                coords_json = json.dumps(coordinates).replace("'", "''")
                
                is_premium = 'true' if body_data.get('isPremium', False) else 'false'
                
                responsibilities = json.dumps(body_data.get('responsibilities', [])).replace("'", "''")
                conditions = json.dumps(body_data.get('conditions', [])).replace("'", "''")
                
                contact = body_data.get('contact', {})
                contact_phone = str(contact.get('phone', '+7 (391) 234-56-78')).replace("'", "''")
                contact_email = str(contact.get('email', employer_email or 'hr@company.ru')).replace("'", "''")
                
                print(f"📝 Creating job: '{title}' for employer {employer_id} ({employer_email})")
                print(f"🔍 JSON data - requirements: {requirements[:100]}, coords: {coords_json}, responsibilities: {responsibilities[:100]}")
                
                cur.execute(f"""
                    INSERT INTO t_p86122027_youth_job_portal.jobs 
                    (id, title, company, location, type, salary, description, 
                     requirements, employer_id, employer_email, created_at, updated_at,
                     age_range, category, coordinates, is_premium, 
                     responsibilities, conditions, contact_phone, contact_email)
                    VALUES ('{job_id}', '{title}', '{company}', '{location}', '{job_type}', 
                            '{salary}', '{description}', '{requirements}'::jsonb, '{employer_id}', 
                            '{employer_email}', NOW(), NOW(), '{age_range}', '{category}', 
                            '{coords_json}'::jsonb, {is_premium}, '{responsibilities}'::jsonb, '{conditions}'::jsonb, 
                            '{contact_phone}', '{contact_email}')
                    RETURNING id
                """)
                
                result = cur.fetchone()
                conn.commit()
                
                print(f"Job created successfully: {result[0]}")
                return {
                    'statusCode': 201,
                    'headers': {**cors_headers, 'Content-Type': 'application/json'},
                    'body': json.dumps({'id': result[0]}),
                    'isBase64Encoded': False
                }
            
            if method == 'PUT':
                body_data = json.loads(event.get('body', '{}'))
                
                job_id = str(body_data.get('id', '')).replace("'", "''")
                title = str(body_data.get('title', '')).replace("'", "''")
                company = str(body_data.get('company', '')).replace("'", "''")
                location = str(body_data.get('location', '')).replace("'", "''")
                job_type = str(body_data.get('type', '')).replace("'", "''")
                salary = str(body_data.get('salary', '')).replace("'", "''")
                description = str(body_data.get('description', '')).replace("'", "''")
                requirements = json.dumps(body_data.get('requirements', [])).replace("'", "''")
                employer_id = str(body_data.get('employerId', '')).replace("'", "''")
                employer_email = str(body_data.get('employerEmail', '')).replace("'", "''")
                age_range = str(body_data.get('ageRange', '14-17')).replace("'", "''")
                category = str(body_data.get('category', 'Работа с людьми')).replace("'", "''")
                
                coordinates = body_data.get('coordinates', [56.0184, 92.8672])
                coords_json = json.dumps(coordinates).replace("'", "''")
                
                is_premium = 'true' if body_data.get('isPremium', False) else 'false'
                
                responsibilities = json.dumps(body_data.get('responsibilities', [])).replace("'", "''")
                conditions = json.dumps(body_data.get('conditions', [])).replace("'", "''")
                
                contact = body_data.get('contact', {})
                contact_phone = str(contact.get('phone', '+7 (391) 234-56-78')).replace("'", "''")
                contact_email = str(contact.get('email', employer_email or 'hr@company.ru')).replace("'", "''")
                
                print(f"Updating job: {job_id}")
                
                cur.execute(f"""
                    UPDATE t_p86122027_youth_job_portal.jobs 
                    SET title = '{title}', company = '{company}', location = '{location}', 
                        type = '{job_type}', salary = '{salary}', description = '{description}', 
                        requirements = '{requirements}', employer_id = '{employer_id}', 
                        employer_email = '{employer_email}', updated_at = NOW(),
                        age_range = '{age_range}', category = '{category}', 
                        coordinates = '{coords_json}', is_premium = {is_premium},
                        responsibilities = '{responsibilities}', conditions = '{conditions}', 
                        contact_phone = '{contact_phone}', contact_email = '{contact_email}'
                    WHERE id = '{job_id}'
                    RETURNING id
                """)
                
                result = cur.fetchone()
                if not result:
                    conn.rollback()
                    return {
                        'statusCode': 404,
                        'headers': {**cors_headers, 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'Job not found'}),
                        'isBase64Encoded': False
                    }
                
                conn.commit()
                
                print(f"Job updated successfully: {result[0]}")
                return {
                    'statusCode': 200,
                    'headers': {**cors_headers, 'Content-Type': 'application/json'},
                    'body': json.dumps({'id': result[0]}),
                    'isBase64Encoded': False
                }
            
            if method == 'DELETE':
                body_data = json.loads(event.get('body', '{}'))
                job_id = str(body_data.get('id', '')).replace("'", "''")
                
                if not job_id:
                    return {
                        'statusCode': 400,
                        'headers': {**cors_headers, 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'Job ID required'}),
                        'isBase64Encoded': False
                    }
                
                print(f"Deleting job: {job_id}")
                
                cur.execute(f"""
                    DELETE FROM t_p86122027_youth_job_portal.jobs 
                    WHERE id = '{job_id}'
                    RETURNING id
                """)
                
                result = cur.fetchone()
                if not result:
                    conn.rollback()
                    return {
                        'statusCode': 404,
                        'headers': {**cors_headers, 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'Job not found'}),
                        'isBase64Encoded': False
                    }
                
                conn.commit()
                
                print(f"Job deleted successfully: {result[0]}")
                return {
                    'statusCode': 200,
                    'headers': {**cors_headers, 'Content-Type': 'application/json'},
                    'body': json.dumps({'id': result[0], 'message': 'Job deleted'}),
                    'isBase64Encoded': False
                }
        
        # === APPLICATIONS API ===
        elif resource == 'applications':
            if method == 'GET':
                job_id = query_params.get('job_id', '')
                user_id = query_params.get('user_id', '')
                
                print(f"Fetching applications with filters - job_id: {job_id}, user_id: {user_id}")
                
                query = """
                    SELECT id, job_id, user_id, user_name, user_email, user_phone, 
                           user_age, cover_letter, status, created_at, updated_at
                    FROM t_p86122027_youth_job_portal.applications
                    WHERE 1=1
                """
                
                if job_id:
                    job_id_safe = str(job_id).replace("'", "''")
                    query += f" AND job_id = '{job_id_safe}'"
                
                if user_id:
                    user_id_safe = str(user_id).replace("'", "''")
                    query += f" AND user_id = '{user_id_safe}'"
                
                query += " ORDER BY created_at DESC"
                
                cur.execute(query)
                
                rows = cur.fetchall()
                applications = []
                for row in rows:
                    applications.append({
                        'id': str(row[0]),
                        'jobId': str(row[1]),
                        'userId': str(row[2]),
                        'userName': row[3],
                        'userEmail': row[4],
                        'userPhone': row[5],
                        'userAge': row[6],
                        'coverLetter': row[7],
                        'status': row[8],
                        'createdAt': row[9].isoformat() if row[9] else None,
                        'updatedAt': row[10].isoformat() if row[10] else None
                    })
                
                return {
                    'statusCode': 200,
                    'headers': {**cors_headers, 'Content-Type': 'application/json'},
                    'body': json.dumps({'applications': applications}),
                    'isBase64Encoded': False
                }
            
            if method == 'POST':
                body_data = json.loads(event.get('body', '{}'))
                
                job_id = str(body_data.get('job_id', '')).replace("'", "''")
                user_id = str(body_data.get('user_id', '')).replace("'", "''")
                user_name = str(body_data.get('user_name', '')).replace("'", "''")
                user_email = str(body_data.get('user_email', '')).replace("'", "''")
                user_phone = str(body_data.get('user_phone', '')).replace("'", "''")
                user_age = int(body_data.get('user_age', 0))
                cover_letter = str(body_data.get('cover_letter', '')).replace("'", "''")
                status = str(body_data.get('status', 'pending')).replace("'", "''")
                
                print(f"Creating application - user: {user_email}, job: {job_id}")
                
                cur.execute(f"""
                    SELECT id FROM t_p86122027_youth_job_portal.applications 
                    WHERE job_id = '{job_id}' AND user_id = '{user_id}'
                """)
                existing = cur.fetchone()
                
                if existing:
                    print(f"User {user_id} already applied to job {job_id}")
                    conn.rollback()
                    return {
                        'statusCode': 400,
                        'headers': {**cors_headers, 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'You have already applied to this job'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute(f"""
                    INSERT INTO t_p86122027_youth_job_portal.applications 
                    (job_id, user_id, user_name, user_email, user_phone, user_age, 
                     cover_letter, status, created_at, updated_at)
                    VALUES ('{job_id}', '{user_id}', '{user_name}', '{user_email}', 
                            '{user_phone}', {user_age}, '{cover_letter}', '{status}', 
                            NOW(), NOW())
                    RETURNING id, created_at
                """)
                
                result = cur.fetchone()
                application_id = result[0]
                created_at = result[1]
                conn.commit()
                
                print(f"Application created successfully with id: {application_id}")
                
                return {
                    'statusCode': 201,
                    'headers': {**cors_headers, 'Content-Type': 'application/json'},
                    'body': json.dumps({
                        'id': str(application_id),
                        'jobId': job_id,
                        'userId': user_id,
                        'userName': user_name,
                        'userEmail': user_email,
                        'userPhone': user_phone,
                        'userAge': user_age,
                        'coverLetter': cover_letter,
                        'status': status,
                        'createdAt': created_at.isoformat() if created_at else None
                    }),
                    'isBase64Encoded': False
                }
            
            if method == 'PUT':
                body_data = json.loads(event.get('body', '{}'))
                
                application_id = str(body_data.get('id', '')).replace("'", "''")
                status = str(body_data.get('status', '')).replace("'", "''")
                
                if not application_id or not status:
                    return {
                        'statusCode': 400,
                        'headers': {**cors_headers, 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'Missing required fields: id, status'}),
                        'isBase64Encoded': False
                    }
                
                print(f"Updating application {application_id} status to {status}")
                
                cur.execute(f"""
                    UPDATE t_p86122027_youth_job_portal.applications 
                    SET status = '{status}', updated_at = NOW()
                    WHERE id = '{application_id}'
                    RETURNING id, job_id, user_id, user_name, user_email, user_phone, 
                              user_age, cover_letter, status, created_at, updated_at
                """)
                
                row = cur.fetchone()
                
                if not row:
                    conn.rollback()
                    return {
                        'statusCode': 404,
                        'headers': {**cors_headers, 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'Application not found'}),
                        'isBase64Encoded': False
                    }
                
                conn.commit()
                
                application = {
                    'id': str(row[0]),
                    'jobId': str(row[1]),
                    'userId': str(row[2]),
                    'userName': row[3],
                    'userEmail': row[4],
                    'userPhone': row[5],
                    'userAge': row[6],
                    'coverLetter': row[7],
                    'status': row[8],
                    'createdAt': row[9].isoformat() if row[9] else None,
                    'updatedAt': row[10].isoformat() if row[10] else None
                }
                
                print(f"Application {application_id} updated successfully")
                
                return {
                    'statusCode': 200,
                    'headers': {**cors_headers, 'Content-Type': 'application/json'},
                    'body': json.dumps(application),
                    'isBase64Encoded': False
                }
            
            if method == 'DELETE':
                application_id = str(query_params.get('id', '')).replace("'", "''")
                
                if not application_id:
                    return {
                        'statusCode': 400,
                        'headers': {**cors_headers, 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'Missing required parameter: id'}),
                        'isBase64Encoded': False
                    }
                
                print(f"Deleting application {application_id}")
                
                cur.execute(f"""
                    DELETE FROM t_p86122027_youth_job_portal.applications 
                    WHERE id = '{application_id}'
                """)
                
                deleted_count = cur.rowcount
                conn.commit()
                
                if deleted_count == 0:
                    return {
                        'statusCode': 404,
                        'headers': {**cors_headers, 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'Application not found'}),
                        'isBase64Encoded': False
                    }
                
                print(f"Application {application_id} deleted successfully")
                
                return {
                    'statusCode': 200,
                    'headers': {**cors_headers, 'Content-Type': 'application/json'},
                    'body': json.dumps({'message': 'Application deleted successfully'}),
                    'isBase64Encoded': False
                }
        
        # === MESSAGES API ===
        elif resource == 'messages':
            if method == 'GET':
                sender_id = query_params.get('sender_id', '')
                receiver_id = query_params.get('receiver_id', '')
                user_id = query_params.get('user_id', '')
                job_id = query_params.get('job_id', '')
                
                if sender_id and receiver_id:
                    sender_id_safe = str(sender_id).replace("'", "''")
                    receiver_id_safe = str(receiver_id).replace("'", "''")
                    
                    if job_id:
                        job_id_safe = str(job_id).replace("'", "''")
                        print(f"Fetching conversation between {sender_id} and {receiver_id} for job {job_id}")
                        
                        cur.execute(f"""
                            SELECT id, sender_id, receiver_id, job_id, message_text, is_read, created_at
                            FROM t_p86122027_youth_job_portal.messages
                            WHERE ((sender_id = '{sender_id_safe}' AND receiver_id = '{receiver_id_safe}')
                               OR (sender_id = '{receiver_id_safe}' AND receiver_id = '{sender_id_safe}'))
                               AND job_id = '{job_id_safe}'
                            ORDER BY created_at ASC
                        """)
                    else:
                        print(f"Fetching conversation between {sender_id} and {receiver_id}")
                        
                        cur.execute(f"""
                            SELECT id, sender_id, receiver_id, job_id, message_text, is_read, created_at
                            FROM t_p86122027_youth_job_portal.messages
                            WHERE (sender_id = '{sender_id_safe}' AND receiver_id = '{receiver_id_safe}')
                               OR (sender_id = '{receiver_id_safe}' AND receiver_id = '{sender_id_safe}')
                            ORDER BY created_at ASC
                        """)
                    
                    rows = cur.fetchall()
                    messages = []
                    for row in rows:
                        messages.append({
                            'id': str(row[0]),
                            'senderId': str(row[1]),
                            'receiverId': str(row[2]),
                            'jobId': str(row[3]) if row[3] else None,
                            'messageText': row[4],
                            'isRead': row[5],
                            'createdAt': row[6].isoformat() if row[6] else None
                        })
                    
                    return {
                        'statusCode': 200,
                        'headers': {**cors_headers, 'Content-Type': 'application/json'},
                        'body': json.dumps({'messages': messages}),
                        'isBase64Encoded': False
                    }
                
                elif user_id:
                    user_id_safe = str(user_id).replace("'", "''")
                    
                    print(f"Fetching all conversations for user {user_id}")
                    
                    cur.execute(f"""
                        WITH user_messages AS (
                            SELECT 
                                CASE 
                                    WHEN sender_id = '{user_id_safe}' THEN receiver_id
                                    ELSE sender_id
                                END AS other_user_id,
                                id, sender_id, receiver_id, job_id, message_text, is_read, created_at,
                                ROW_NUMBER() OVER (
                                    PARTITION BY CASE 
                                        WHEN sender_id = '{user_id_safe}' THEN receiver_id
                                        ELSE sender_id
                                    END 
                                    ORDER BY created_at DESC
                                ) AS rn
                            FROM t_p86122027_youth_job_portal.messages
                            WHERE sender_id = '{user_id_safe}' OR receiver_id = '{user_id_safe}'
                        )
                        SELECT id, sender_id, receiver_id, job_id, message_text, is_read, created_at, other_user_id
                        FROM user_messages
                        WHERE rn = 1
                        ORDER BY created_at DESC
                    """)
                    
                    rows = cur.fetchall()
                    conversations = []
                    for row in rows:
                        conversations.append({
                            'id': str(row[0]),
                            'senderId': str(row[1]),
                            'receiverId': str(row[2]),
                            'jobId': str(row[3]) if row[3] else None,
                            'messageText': row[4],
                            'isRead': row[5],
                            'createdAt': row[6].isoformat() if row[6] else None,
                            'otherUserId': str(row[7])
                        })
                    
                    return {
                        'statusCode': 200,
                        'headers': {**cors_headers, 'Content-Type': 'application/json'},
                        'body': json.dumps({'conversations': conversations}),
                        'isBase64Encoded': False
                    }
                
                else:
                    return {
                        'statusCode': 400,
                        'headers': {**cors_headers, 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'Missing required parameters. Provide either sender_id & receiver_id or user_id'}),
                        'isBase64Encoded': False
                    }
            
            if method == 'POST':
                body_data = json.loads(event.get('body', '{}'))
                
                sender_id = str(body_data.get('sender_id', '')).replace("'", "''")
                receiver_id = str(body_data.get('receiver_id', '')).replace("'", "''")
                job_id = body_data.get('job_id', None)
                message_text = str(body_data.get('message_text', '')).replace("'", "''")
                
                if not sender_id or not receiver_id or not message_text:
                    return {
                        'statusCode': 400,
                        'headers': {**cors_headers, 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'Missing required fields: sender_id, receiver_id, message_text'}),
                        'isBase64Encoded': False
                    }
                
                print(f"Sending message from {sender_id} to {receiver_id}")
                
                if job_id:
                    job_id_safe = str(job_id).replace("'", "''")
                    cur.execute(f"""
                        INSERT INTO t_p86122027_youth_job_portal.messages 
                        (sender_id, receiver_id, job_id, message_text, is_read, created_at)
                        VALUES ('{sender_id}', '{receiver_id}', '{job_id_safe}', '{message_text}', FALSE, NOW())
                        RETURNING id, created_at
                    """)
                else:
                    cur.execute(f"""
                        INSERT INTO t_p86122027_youth_job_portal.messages 
                        (sender_id, receiver_id, job_id, message_text, is_read, created_at)
                        VALUES ('{sender_id}', '{receiver_id}', NULL, '{message_text}', FALSE, NOW())
                        RETURNING id, created_at
                    """)
                
                result = cur.fetchone()
                message_id = result[0]
                created_at = result[1]
                conn.commit()
                
                print(f"Message sent successfully with id: {message_id}")
                
                return {
                    'statusCode': 201,
                    'headers': {**cors_headers, 'Content-Type': 'application/json'},
                    'body': json.dumps({
                        'id': str(message_id),
                        'senderId': sender_id,
                        'receiverId': receiver_id,
                        'jobId': job_id,
                        'messageText': message_text,
                        'isRead': False,
                        'createdAt': created_at.isoformat() if created_at else None
                    }),
                    'isBase64Encoded': False
                }
            
            if method == 'PUT':
                body_data = json.loads(event.get('body', '{}'))
                
                message_id = str(body_data.get('id', '')).replace("'", "''")
                is_read = body_data.get('is_read', True)
                
                if not message_id:
                    return {
                        'statusCode': 400,
                        'headers': {**cors_headers, 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'Missing required field: id'}),
                        'isBase64Encoded': False
                    }
                
                print(f"Marking message {message_id} as read: {is_read}")
                
                is_read_str = 'TRUE' if is_read else 'FALSE'
                
                cur.execute(f"""
                    UPDATE t_p86122027_youth_job_portal.messages 
                    SET is_read = {is_read_str}
                    WHERE id = '{message_id}'
                    RETURNING id, sender_id, receiver_id, job_id, message_text, is_read, created_at
                """)
                
                row = cur.fetchone()
                
                if not row:
                    conn.rollback()
                    return {
                        'statusCode': 404,
                        'headers': {**cors_headers, 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'Message not found'}),
                        'isBase64Encoded': False
                    }
                
                conn.commit()
                
                message = {
                    'id': str(row[0]),
                    'senderId': str(row[1]),
                    'receiverId': str(row[2]),
                    'jobId': str(row[3]) if row[3] else None,
                    'messageText': row[4],
                    'isRead': row[5],
                    'createdAt': row[6].isoformat() if row[6] else None
                }
                
                print(f"Message {message_id} updated successfully")
                
                return {
                    'statusCode': 200,
                    'headers': {**cors_headers, 'Content-Type': 'application/json'},
                    'body': json.dumps(message),
                    'isBase64Encoded': False
                }
            
            if method == 'DELETE':
                body_data = json.loads(event.get('body', '{}'))
                message_id = str(body_data.get('id', '')).replace("'", "''")
                
                if not message_id:
                    return {
                        'statusCode': 400,
                        'headers': {**cors_headers, 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'Missing required field: id'}),
                        'isBase64Encoded': False
                    }
                
                print(f"Deleting message {message_id}")
                
                cur.execute(f"""
                    DELETE FROM t_p86122027_youth_job_portal.messages 
                    WHERE id = '{message_id}'
                """)
                
                deleted_count = cur.rowcount
                conn.commit()
                
                if deleted_count == 0:
                    return {
                        'statusCode': 404,
                        'headers': {**cors_headers, 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'Message not found'}),
                        'isBase64Encoded': False
                    }
                
                print(f"Message {message_id} deleted successfully")
                
                return {
                    'statusCode': 200,
                    'headers': {**cors_headers, 'Content-Type': 'application/json'},
                    'body': json.dumps({'message': 'Message deleted successfully'}),
                    'isBase64Encoded': False
                }
        
        # === INTERVIEWS API ===
        elif resource == 'interviews':
            if method == 'GET':
                user_id = query_params.get('user_id', '')
                job_id = query_params.get('job_id', '')
                
                print(f"Fetching interviews - user_id: {user_id}, job_id: {job_id}")
                
                filters = []
                if user_id:
                    user_id_safe = str(user_id).replace("'", "''")
                    filters.append(f"user_id = '{user_id_safe}'")
                if job_id:
                    job_id_safe = str(job_id).replace("'", "''")
                    filters.append(f"job_id = '{job_id_safe}'")
                
                where_clause = f"WHERE {' AND '.join(filters)}" if filters else ""
                
                cur.execute(f"""
                    SELECT id, user_id, job_id, user_name, user_email, user_age,
                           job_title, interview_date, location, notes, created_at
                    FROM t_p86122027_youth_job_portal.interviews
                    {where_clause}
                    ORDER BY interview_date DESC
                """)
                
                rows = cur.fetchall()
                interviews = []
                for row in rows:
                    interviews.append({
                        'id': row[0],
                        'userId': str(row[1]),
                        'jobId': str(row[2]),
                        'userName': row[3],
                        'userEmail': row[4],
                        'userAge': row[5],
                        'jobTitle': row[6],
                        'date': row[7].isoformat() if row[7] else None,
                        'location': row[8],
                        'notes': row[9],
                        'timestamp': int(row[10].timestamp() * 1000) if row[10] else None
                    })
                
                return {
                    'statusCode': 200,
                    'headers': {**cors_headers, 'Content-Type': 'application/json'},
                    'body': json.dumps({'interviews': interviews}),
                    'isBase64Encoded': False
                }
            
            if method == 'POST':
                body_data = json.loads(event.get('body', '{}'))
                
                user_id = str(body_data.get('userId', '')).replace("'", "''")
                job_id = str(body_data.get('jobId', '')).replace("'", "''")
                user_name = str(body_data.get('userName', '')).replace("'", "''")
                user_email = str(body_data.get('userEmail', '')).replace("'", "''")
                user_age = int(body_data.get('userAge', 0))
                job_title = str(body_data.get('jobTitle', '')).replace("'", "''")
                interview_date = str(body_data.get('date', '')).replace("'", "''")
                location = str(body_data.get('location', '')).replace("'", "''")
                notes = str(body_data.get('notes', '')).replace("'", "''")
                
                print(f"Creating interview for user {user_id} on job {job_id}")
                
                cur.execute(f"""
                    INSERT INTO t_p86122027_youth_job_portal.interviews 
                    (user_id, job_id, user_name, user_email, user_age, job_title, 
                     interview_date, location, notes, created_at)
                    VALUES ('{user_id}', '{job_id}', '{user_name}', '{user_email}', 
                            {user_age}, '{job_title}', '{interview_date}', '{location}', 
                            '{notes}', NOW())
                    RETURNING id, created_at
                """)
                
                result = cur.fetchone()
                interview_id = result[0]
                created_at = result[1]
                conn.commit()
                
                print(f"Interview created with id: {interview_id}")
                
                return {
                    'statusCode': 201,
                    'headers': {**cors_headers, 'Content-Type': 'application/json'},
                    'body': json.dumps({
                        'id': interview_id,
                        'userId': user_id,
                        'jobId': job_id,
                        'createdAt': created_at.isoformat() if created_at else None
                    }),
                    'isBase64Encoded': False
                }
            
            if method == 'DELETE':
                body_data = json.loads(event.get('body', '{}'))
                interview_id = str(body_data.get('id', '')).replace("'", "''")
                
                if not interview_id:
                    return {
                        'statusCode': 400,
                        'headers': {**cors_headers, 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'Missing required field: id'}),
                        'isBase64Encoded': False
                    }
                
                print(f"Deleting interview {interview_id}")
                
                cur.execute(f"""
                    DELETE FROM t_p86122027_youth_job_portal.interviews 
                    WHERE id = {interview_id}
                """)
                
                deleted_count = cur.rowcount
                conn.commit()
                
                if deleted_count == 0:
                    return {
                        'statusCode': 404,
                        'headers': {**cors_headers, 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'Interview not found'}),
                        'isBase64Encoded': False
                    }
                
                print(f"Interview {interview_id} deleted successfully")
                
                return {
                    'statusCode': 200,
                    'headers': {**cors_headers, 'Content-Type': 'application/json'},
                    'body': json.dumps({'message': 'Interview deleted successfully'}),
                    'isBase64Encoded': False
                }
        
        # === LOGIN API ===
        if resource == 'login':
            if method == 'POST':
                body_data = json.loads(event.get('body', '{}'))
                email = str(body_data.get('email', '')).replace("'", "''")
                password = str(body_data.get('password', '')).replace("'", "''")
                
                print(f"🔐 LOGIN ATTEMPT - Email: {email}, Password length: {len(password)}")
                
                if not email or not password:
                    print("❌ Missing email or password")
                    return {
                        'statusCode': 400,
                        'headers': {**cors_headers, 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'Email and password required'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute(f"""
                    SELECT id, email, full_name, password_hash,
                           EXTRACT(YEAR FROM AGE(date_of_birth))::int as age,
                           phone, test_result, role, company_name, created_at
                    FROM t_p86122027_youth_job_portal.users
                    WHERE email = '{email}'
                """)
                
                row = cur.fetchone()
                
                if not row:
                    print(f"❌ USER NOT FOUND: {email}")
                    return {
                        'statusCode': 401,
                        'headers': {**cors_headers, 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'Invalid credentials'}),
                        'isBase64Encoded': False
                    }
                
                db_password = row[3]
                print(f"🔍 COMPARING - Input: '{password}', DB: '{db_password}', Match: {db_password == password}")
                
                if db_password != password:
                    print(f"❌ INVALID PASSWORD for: {email}")
                    print(f"   Input length: {len(password)}, DB length: {len(db_password)}")
                    print(f"   Input repr: {repr(password)}, DB repr: {repr(db_password)}")
                    return {
                        'statusCode': 401,
                        'headers': {**cors_headers, 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'Invalid credentials'}),
                        'isBase64Encoded': False
                    }
                
                print(f"✅ LOGIN SUCCESS for: {email}, role: {row[7]}, company: {row[8]}")
                
                user_data = {
                    'id': str(row[0]),
                    'email': row[1],
                    'name': row[2],
                    'age': row[4],
                    'phone': row[5],
                    'testResult': row[6],
                    'role': row[7] if row[7] else 'user',
                    'company_name': row[8],
                    'completedTest': bool(row[6]),
                    'createdAt': row[9].isoformat() if row[9] else None
                }
                
                print(f"📤 Sending user data: {json.dumps(user_data, indent=2)}")
                
                return {
                    'statusCode': 200,
                    'headers': {**cors_headers, 'Content-Type': 'application/json'},
                    'body': json.dumps({'user': user_data}),
                    'isBase64Encoded': False
                }
        
        return {
            'statusCode': 404,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': f'Resource not found: {resource}'}),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"❌ EXCEPTION CAUGHT!")
        print(f"❌ Error type: {type(e).__name__}")
        print(f"❌ Error message: {str(e)}")
        print(f"❌ Full traceback:\n{error_trace}")
        if 'conn' in locals():
            conn.rollback()
        return {
            'statusCode': 500,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': str(e), 'type': type(e).__name__}),
            'isBase64Encoded': False
        }
    
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()