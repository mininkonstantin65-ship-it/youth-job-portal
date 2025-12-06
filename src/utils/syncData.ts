// Утилиты для синхронизации данных с БД

const API_BASE = 'https://functions.poehali.dev/81ba1a01-47ea-40ac-9ce8-1dc2aa32d523';
const JOBS_API = `${API_BASE}?resource=jobs`;
const APPLICATIONS_API = `${API_BASE}?resource=applications`;

export async function syncJobsToDatabase(jobs: any[]) {
  for (const job of jobs) {
    try {
      await fetch(JOBS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(job)
      });
    } catch (error) {
      console.error('Error syncing job:', job.id, error);
    }
  }
}

export async function loadJobsFromDatabase(): Promise<any[]> {
  try {
    const response = await fetch(JOBS_API);
    if (response.ok) {
      const data = await response.json();
      const jobs = data.jobs || [];
      if (jobs.length > 0) {
        localStorage.setItem('jobs_cache', JSON.stringify(jobs));
      }
      return jobs;
    }
  } catch (error) {
    console.warn('API недоступен, использую кеш:', error);
    const cached = localStorage.getItem('jobs_cache');
    if (cached) {
      return JSON.parse(cached);
    }
  }
  return [];
}

export async function saveJobToDatabase(job: any): Promise<boolean> {
  try {
    console.log('🚀 ОТПРАВКА ВАКАНСИИ - URL:', JOBS_API);
    console.log('📦 Данные вакансии:', JSON.stringify(job, null, 2));
    
    const response = await fetch(JOBS_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(job)
    });
    
    console.log('📡 HTTP статус ответа:', response.status);
    console.log('📋 Headers ответа:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ УСПЕХ! Вакансия сохранена, ответ сервера:', data);
      return true;
    } else {
      const errorText = await response.text();
      console.error('❌ ОШИБКА HTTP:', response.status);
      console.error('📄 Тело ошибки:', errorText);
      return false;
    }
  } catch (error) {
    console.error('❌ КРИТИЧЕСКАЯ ОШИБКА при fetch:', error);
    console.error('🔍 Детали ошибки:', error instanceof Error ? error.message : String(error));
    return false;
  }
}

export async function updateJobInDatabase(job: any): Promise<boolean> {
  try {
    const response = await fetch(JOBS_API, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(job)
    });
    console.log(response.ok ? '✅ Вакансия обновлена в БД' : '❌ Ошибка обновления');
    return response.ok;
  } catch (error) {
    console.error('Error updating job:', error);
    return false;
  }
}

export async function deleteJobFromDatabase(jobId: string): Promise<boolean> {
  try {
    const response = await fetch(JOBS_API, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: jobId })
    });
    console.log(response.ok ? '✅ Вакансия удалена из БД' : '❌ Ошибка удаления');
    return response.ok;
  } catch (error) {
    console.error('Error deleting job:', error);
    return false;
  }
}

export async function saveApplicationToDatabase(application: any): Promise<boolean> {
  try {
    const result = await fetch(APPLICATIONS_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(application)
    });
    if (result.ok) {
      const cached = localStorage.getItem('applications_cache');
      const apps = cached ? JSON.parse(cached) : [];
      apps.push(application);
      localStorage.setItem('applications_cache', JSON.stringify(apps));
      return true;
    }
  } catch (error) {
    console.warn('API недоступен, сохраняю в кеш:', error);
    const cached = localStorage.getItem('applications_cache');
    const apps = cached ? JSON.parse(cached) : [];
    apps.push(application);
    localStorage.setItem('applications_cache', JSON.stringify(apps));
    return true;
  }
  return false;
}

export async function loadApplicationsFromDatabase(userId?: string, jobId?: string): Promise<any[]> {
  try {
    let url = APPLICATIONS_API;
    const params = new URLSearchParams();
    if (userId) params.append('user_id', userId);
    if (jobId) params.append('job_id', jobId);
    if (params.toString()) url += '&' + params.toString();
    
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      const apps = data.applications || [];
      if (apps.length > 0) {
        localStorage.setItem('applications_cache', JSON.stringify(apps));
      }
      return apps;
    }
  } catch (error) {
    console.warn('API недоступен, использую кеш:', error);
    const cached = localStorage.getItem('applications_cache');
    if (cached) {
      const all = JSON.parse(cached);
      return all.filter((a: any) => {
        if (userId && a.user_id !== userId) return false;
        if (jobId && a.job_id !== jobId) return false;
        return true;
      });
    }
  }
  return [];
}

export async function loadJobByIdFromDatabase(jobId: number | string): Promise<any | null> {
  try {
    const response = await fetch(`${JOBS_API}&id=${jobId}`);
    if (response.ok) {
      const data = await response.json();
      const jobs = data.jobs || [];
      return jobs.find((j: any) => String(j.id) === String(jobId)) || null;
    }
  } catch (error) {
    console.warn('API недоступен, использую кеш:', error);
    const cached = localStorage.getItem('jobs_cache');
    if (cached) {
      const jobs = JSON.parse(cached);
      return jobs.find((j: any) => String(j.id) === String(jobId)) || null;
    }
  }
  return null;
}