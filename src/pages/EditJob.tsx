import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { loadJobsFromDatabase, updateJobInDatabase } from '@/utils/syncData';

const EditJob = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('');
  const [salary, setSalary] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [responsibilities, setResponsibilities] = useState('');
  const [conditions, setConditions] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadJob = async () => {
      if (!id) return;
      
      const allJobs = await loadJobsFromDatabase();
      console.log('✅ Загружено вакансий для редактирования:', allJobs.length);
      
      const job = allJobs.find((j: any) => j.id.toString() === id);
      
      if (!job) {
        navigate('/employer-profile');
        return;
      }
      
      if (user?.email !== 'mininkonstantin@gmail.com' && job.employerId !== user?.id) {
        navigate('/employer-profile');
        return;
      }
      
      setTitle(job.title || '');
      setCompany(job.company || '');
      setLocation(job.location || '');
      setType(job.type || '');
      setSalary(job.salary || '');
      setDescription(job.description || '');
      setRequirements(Array.isArray(job.requirements) ? job.requirements.join('\n') : '');
      setResponsibilities(Array.isArray(job.responsibilities) ? job.responsibilities.join('\n') : '');
      setConditions(Array.isArray(job.conditions) ? job.conditions.join('\n') : '');
      setPhone(job.contact?.phone || '');
      setEmail(job.contact?.email || job.employerEmail || '');
      setIsPremium(job.isPremium || false);
      setLoading(false);
    };
    
    loadJob();
  }, [id, user, navigate]);

  if (!user || user.role !== 'employer') {
    navigate('/');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const updatedJob = {
      id,
      title,
      company,
      location,
      type,
      salary,
      category: 'Работа с людьми',
      ageRange: '14-17',
      coordinates: [56.0184, 92.8672] as [number, number],
      isPremium,
      employerId: user.id,
      employerEmail: user.email,
      description,
      requirements: requirements.split('\n').filter(r => r.trim()),
      responsibilities: responsibilities.split('\n').filter(r => r.trim()),
      conditions: conditions.split('\n').filter(c => c.trim()),
      contact: {
        phone,
        email
      }
    };

    const success = await updateJobInDatabase(updatedJob);
    
    if (success) {
      const stored = localStorage.getItem('jobs');
      if (stored) {
        const allJobs = JSON.parse(stored);
        const index = allJobs.findIndex((j: any) => j.id.toString() === id);
        if (index !== -1) {
          allJobs[index] = updatedJob;
          localStorage.setItem('jobs', JSON.stringify(allJobs));
        }
      }
      navigate('/employer-profile');
    } else {
      setError('Не удалось обновить вакансию');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Icon name="Loader2" size={48} className="animate-spin mx-auto mb-4" />
          <p>Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/10">
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Button onClick={() => navigate('/employer-profile')} variant="ghost">
            <Icon name="ArrowLeft" size={20} className="mr-2" />
            Назад в профиль
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Редактировать вакансию</CardTitle>
              <CardDescription>
                Обновите информацию о вакансии
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Название вакансии *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="Помощник в кофейне"
                  />
                </div>

                <div>
                  <Label htmlFor="company">Компания *</Label>
                  <Input
                    id="company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    required
                    placeholder="Coffee House"
                  />
                </div>

                <div>
                  <Label htmlFor="location">Адрес *</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                    placeholder="Красноярск, ул. Ленина, 45"
                  />
                </div>

                <div>
                  <Label htmlFor="type">Тип занятости *</Label>
                  <Input
                    id="type"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    required
                    placeholder="Частичная, Гибкий график"
                  />
                </div>

                <div>
                  <Label htmlFor="salary">Зарплата *</Label>
                  <Input
                    id="salary"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    required
                    placeholder="28000 ₽"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Описание вакансии *</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    placeholder="Краткое описание вакансии и компании"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="requirements">Требования (каждое с новой строки) *</Label>
                  <Textarea
                    id="requirements"
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    required
                    placeholder="Возраст 14-17 лет&#10;Ответственность и пунктуальность&#10;Готовность работать в команде"
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="responsibilities">Обязанности (каждая с новой строки)</Label>
                  <Textarea
                    id="responsibilities"
                    value={responsibilities}
                    onChange={(e) => setResponsibilities(e.target.value)}
                    placeholder="Выполнение основных рабочих задач&#10;Соблюдение правил компании&#10;Взаимодействие с клиентами"
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="conditions">Условия работы (каждое с новой строки)</Label>
                  <Textarea
                    id="conditions"
                    value={conditions}
                    onChange={(e) => setConditions(e.target.value)}
                    placeholder="Официальное оформление&#10;Обучение за счёт компании&#10;Дружный коллектив&#10;Возможность карьерного роста"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Телефон для связи *</Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      placeholder="+7 (391) 234-56-78"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email для связи *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="hr@company.ru"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2 p-4 border border-yellow-500 rounded-lg bg-yellow-50/5">
                  <Checkbox
                    id="premium"
                    checked={isPremium}
                    onCheckedChange={(checked) => setIsPremium(checked as boolean)}
                  />
                  <div className="flex-1">
                    <Label htmlFor="premium" className="flex items-center gap-2 cursor-pointer">
                      <Icon name="Crown" size={16} className="text-yellow-500" />
                      <span className="font-semibold">Сделать премиум-вакансией</span>
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Вакансия будет видна только работникам с премиум-подпиской и всегда наверху
                    </p>
                  </div>
                </div>

                {error && (
                  <div className="bg-destructive/10 text-destructive px-4 py-2 rounded text-sm">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full">
                  <Icon name="Save" size={16} className="mr-2" />
                  Сохранить изменения
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EditJob;