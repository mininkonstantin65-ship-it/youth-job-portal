import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useActivity } from '@/contexts/ActivityContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useEffect, useState } from 'react';

const Profile = () => {
  const { user, logout } = useAuth();
  const { activities, getStats } = useActivity();
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState<any[]>([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.role === 'employer') {
      navigate('/employer-profile');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!user) return;

    const loadInterviews = () => {
      const allInterviews = JSON.parse(localStorage.getItem('all_interviews') || '[]');
      const userInterviews = allInterviews.filter((i: any) => i.userId === user.id);
      userInterviews.sort((a: any, b: any) => b.timestamp - a.timestamp);
      setInterviews(userInterviews);
    };

    loadInterviews();
    const interval = setInterval(loadInterviews, 3000);
    return () => clearInterval(interval);
  }, [user]);

  if (!user || user.role === 'employer') {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleClearCache = () => {
    if (confirm('Очистить весь кэш браузера? Вам нужно будет войти заново.')) {
      localStorage.clear();
      alert('✅ Кэш очищен! Сейчас перенаправлю на страницу входа.');
      window.location.href = '/login';
    }
  };

  const statsData = getStats();
  const stats = [
    { label: 'Откликов', value: statsData.responses.toString(), icon: 'Send', color: 'text-blue-500' },
    { label: 'Сохранено', value: statsData.saved.toString(), icon: 'Heart', color: 'text-red-500' },
    { label: 'Просмотрено', value: statsData.views.toString(), icon: 'Eye', color: 'text-green-500' },
  ];

  const getActionText = (action: string) => {
    switch (action) {
      case 'response': return 'Отклик на вакансию';
      case 'save': return 'Сохранена вакансия';
      case 'view': return 'Просмотрена вакансия';
      default: return 'Действие';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'response': return 'Send';
      case 'save': return 'Heart';
      case 'view': return 'Eye';
      default: return 'Activity';
    }
  };

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes} ${minutes === 1 ? 'минуту' : 'минут'} назад`;
    if (hours < 24) return `${hours} ${hours === 1 ? 'час' : hours < 5 ? 'часа' : 'часов'} назад`;
    return `${days} ${days === 1 ? 'день' : days < 5 ? 'дня' : 'дней'} назад`;
  };

  const recentActivity = activities.slice(0, 5).map(a => ({
    action: getActionText(a.action),
    job: a.jobTitle,
    company: a.company,
    time: formatTime(a.timestamp),
    icon: getActionIcon(a.action)
  }));

  const skills = user.testResult 
    ? ['Коммуникабельность', 'Ответственность', 'Обучаемость', 'Пунктуальность']
    : [];

  return (
    <div className="min-h-screen bg-secondary/10">
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold">Успех 14</Link>
          <div className="flex gap-2">
            <Button onClick={handleClearCache} variant="ghost" size="sm" title="Очистить кэш">
              <Icon name="RotateCcw" size={16} className="mr-2" />
              Очистить кэш
            </Button>
            <Button onClick={() => navigate('/login')} variant="outline" size="sm">
              <Icon name="UserPlus" size={16} className="mr-2" />
              Сменить аккаунт
            </Button>
            <Button onClick={handleLogout} variant="outline" size="sm">
              <Icon name="LogOut" size={16} className="mr-2" />
              Выйти
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-6">
                    <div className="bg-primary/10 p-6 rounded-full">
                      <Icon name="User" size={64} className="text-primary" />
                    </div>
                    <div className="flex-1">
                      <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
                      <div className="space-y-2 text-muted-foreground mb-4">
                        <div className="flex items-center gap-2">
                          <Icon name="Mail" size={16} />
                          <span>{user.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Icon name="Calendar" size={16} />
                          <span>{user.age} лет</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Icon name="MapPin" size={16} />
                          <span>Красноярск</span>
                        </div>
                        {(user.subscription === 'premium' || user.subscription === 'premium_plus') && (
                          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-base px-3 py-1">
                            <Icon name="Sparkles" size={16} className="mr-1" />
                            Полный доступ навсегда
                          </Badge>
                        )}
                      </div>
                      {!user.subscription && (
                        <Button onClick={() => navigate('/user-subscription')} variant="default" className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600" size="sm">
                          <Icon name="Sparkles" size={16} className="mr-2" />
                          Получить полный доступ за 500₽
                        </Button>
                      )}
                      {user.completedTest && user.testResult && (
                        <Badge className="bg-primary/20 text-primary border-primary/30">
                          <Icon name="Star" size={14} className="mr-1" />
                          {user.testResult}
                        </Badge>
                      )}
                    </div>
                    <Button variant="outline" size="sm">
                      <Icon name="Settings" size={16} className="mr-2" />
                      Редактировать
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="grid sm:grid-cols-3 gap-4 mt-6">
                {stats.map((stat, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                          <p className="text-3xl font-bold">{stat.value}</p>
                        </div>
                        <Icon name={stat.icon as any} size={32} className={stat.color} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {interviews.length > 0 && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Назначенные собеседования</CardTitle>
                    <CardDescription>Ваши предстоящие встречи с работодателями</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {interviews.map((interview, index) => (
                        <div key={index} className="flex items-start gap-3 p-4 rounded-lg border border-border bg-purple-500/5">
                          <div className="bg-purple-500/10 p-3 rounded-full">
                            <Icon name="Calendar" size={24} className="text-purple-500" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-lg mb-1">{interview.jobTitle}</p>
                            <div className="flex items-center gap-3 text-sm mt-2">
                              <div className="flex items-center gap-1">
                                <Icon name="Calendar" size={14} className="text-muted-foreground" />
                                <span>{new Date(interview.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Icon name="Clock" size={14} className="text-muted-foreground" />
                                <span className="font-medium text-purple-600">{interview.time}</span>
                              </div>
                            </div>
                          </div>
                          <Badge variant="default" className="bg-purple-500">
                            Назначено
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Последняя активность</CardTitle>
                  <CardDescription>Ваши недавние действия на платформе</CardDescription>
                </CardHeader>
                <CardContent>
                  {recentActivity.length > 0 ? (
                    <div className="space-y-4">
                      {recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-start gap-4 p-3 rounded-lg hover:bg-secondary/50 transition">
                          <div className="bg-primary/10 p-2 rounded-lg">
                            <Icon name={activity.icon as any} size={20} className="text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold">{activity.action}</p>
                            <p className="text-sm text-muted-foreground">{activity.job} • {activity.company}</p>
                          </div>
                          <span className="text-xs text-muted-foreground">{activity.time}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="bg-secondary/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Icon name="Activity" size={32} className="text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground mb-4">Пока нет активности</p>
                      <Link to="/vacancies">
                        <Button size="sm">
                          <Icon name="Briefcase" size={16} className="mr-2" />
                          Просмотреть вакансии
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {user.completedTest && user.testResult ? (
                <Card className="border-primary/30 bg-primary/5">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon name="CheckCircle" size={20} className="text-green-500" />
                      <CardTitle className="text-lg">Тест пройден</CardTitle>
                    </div>
                    <CardDescription>
                      Ваша рекомендуемая сфера
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="font-semibold text-lg mb-4">{user.testResult}</p>
                    <Link to="/test">
                      <Button variant="outline" size="sm" className="w-full">
                        <Icon name="RefreshCw" size={16} className="mr-2" />
                        Пройти заново
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-primary bg-primary/5">
                  <CardHeader>
                    <CardTitle>Пройдите тест</CardTitle>
                    <CardDescription>
                      Узнайте, какая работа вам подходит
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link to="/test">
                      <Button className="w-full">
                        <Icon name="ClipboardList" size={16} className="mr-2" />
                        Начать тест
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}

              {skills.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Навыки</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Быстрые действия</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link to="/vacancies">
                    <Button variant="outline" className="w-full justify-start">
                      <Icon name="Briefcase" size={16} className="mr-2" />
                      Все вакансии
                    </Button>
                  </Link>
                  {user.testResult && (
                    <Link to="/vacancies">
                      <Button variant="outline" className="w-full justify-start">
                        <Icon name="Star" size={16} className="mr-2" />
                        Рекомендации для меня
                      </Button>
                    </Link>
                  )}
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate('/my-chats')}
                  >
                    <Icon name="MessageSquare" size={16} className="mr-2" />
                    Мои переписки
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate('/saved-jobs')}
                  >
                    <Icon name="Heart" size={16} className="mr-2" />
                    Сохранённые вакансии
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <Icon name="Info" size={20} className="text-primary" />
                    <div>
                      <h3 className="font-semibold mb-1">Совет дня</h3>
                      <p className="text-sm text-muted-foreground">
                        Обновляйте свой профиль и регулярно проверяйте новые вакансии для лучших результатов!
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;