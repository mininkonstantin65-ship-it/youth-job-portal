import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/contexts/AuthContext';
import VacancyMap from '@/components/VacancyMap';
import { Job } from '@/data/jobs';
import { loadJobsFromDatabase } from '@/utils/syncData';

const Vacancies = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [allJobs, setAllJobs] = useState<Job[]>([]);

  useEffect(() => {
    const loadJobs = async () => {
      const jobsFromDB = await loadJobsFromDatabase();
      if (jobsFromDB.length > 0) {
        setAllJobs(jobsFromDB);
      } else {
        const { defaultJobs } = require('@/data/jobs');
        setAllJobs(defaultJobs);
      }
    };

    loadJobs();
    const interval = setInterval(loadJobs, 2000);
    return () => clearInterval(interval);
  }, []);

  const filteredJobs = allJobs
    .filter((job) => {
      const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           job.company.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = !selectedType || job.type === selectedType;
      
      if (job.isPremium && (!user || (user.subscription !== 'premium' && user.subscription !== 'premium_plus'))) {
        return false;
      }
      
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      if (a.isPremium && !b.isPremium) return -1;
      if (!a.isPremium && b.isPremium) return 1;
      return 0;
    });

  const recommendedJobs = user?.testResult 
    ? allJobs.filter(job => job.category === user.testResult)
    : [];

  const types = Array.from(new Set(allJobs.map(job => job.type)));

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold">Успех 14</Link>
          <div className="flex gap-3">
            {user ? (
              <Link to="/profile">
                <Button variant="outline">
                  <Icon name="User" size={16} className="mr-2" />
                  Личный кабинет
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline">Войти</Button>
                </Link>
                <Link to="/register">
                  <Button>Регистрация</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Вакансии в Красноярске</h1>
          <p className="text-muted-foreground text-lg">
            {allJobs.length} доступных вакансий для молодёжи 14-24 лет
          </p>
        </div>

        {user?.testResult && recommendedJobs.length > 0 && (
          <div className="bg-primary/10 border border-primary/20 p-6 rounded-lg mb-8">
            <div className="flex items-start gap-4">
              <div className="bg-primary/20 p-2 rounded-lg">
                <Icon name="Sparkles" size={24} className="text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Рекомендовано для вас</h3>
                <p className="text-muted-foreground mb-3">
                  На основе вашего теста: {user.testResult}
                </p>
                <p className="text-sm text-muted-foreground">
                  Найдено {recommendedJobs.length} подходящих вакансий
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-4 mb-8 flex-wrap">
          <div className="flex-1 min-w-[250px]">
            <div className="relative">
              <Icon name="Search" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Поиск вакансий..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedType === null ? "default" : "outline"}
              onClick={() => setSelectedType(null)}
              size="sm"
            >
              Все
            </Button>
            {types.map((type) => (
              <Button
                key={type}
                variant={selectedType === type ? "default" : "outline"}
                onClick={() => setSelectedType(type)}
                size="sm"
              >
                {type}
              </Button>
            ))}
          </div>
        </div>

        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
            <TabsTrigger value="list" className="flex items-center gap-2">
              <Icon name="List" size={16} />
              Список
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center gap-2">
              <Icon name="Map" size={16} />
              На карте
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-0">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map((job) => {
                const isRecommended = user?.testResult && job.category === user.testResult;
                
                return (
                  <div
                    key={job.id}
                    className={`bg-card p-6 rounded-lg border ${
                      job.isPremium
                        ? 'border-yellow-500 shadow-lg shadow-yellow-500/20 bg-gradient-to-b from-yellow-50/5 to-transparent'
                        : isRecommended 
                        ? 'border-primary shadow-lg shadow-primary/10' 
                        : 'border-border'
                    } hover:border-primary/50 transition relative`}
                  >
                    <div className="flex gap-2 mb-3">
                      {job.isPremium && (
                        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                          <Icon name="Crown" size={12} className="mr-1" />
                          Премиум
                        </Badge>
                      )}
                      {isRecommended && (
                        <Badge className="bg-primary/20 text-primary border-primary/30">
                          <Icon name="Star" size={12} className="mr-1" />
                          Рекомендовано
                        </Badge>
                      )}
                    </div>
                    
                    <h3 className="text-xl font-semibold mb-2">{job.title}</h3>
                    <p className="text-muted-foreground mb-4">{job.company}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Icon name="MapPin" size={16} className="text-muted-foreground" />
                        <span className="truncate">{job.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Icon name="Clock" size={16} className="text-muted-foreground" />
                        <span>{job.type}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Icon name="Users" size={16} className="text-muted-foreground" />
                        <span>{job.ageRange} лет</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <span className="text-lg font-bold text-primary">{job.salary}</span>
                      <Link to={`/job/${job.id}`}>
                        <Button size="sm">
                          Подробнее
                          <Icon name="ArrowRight" size={14} className="ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredJobs.length === 0 && (
              <div className="text-center py-12">
                <div className="bg-muted/50 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <Icon name="Search" size={40} className="text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Вакансии не найдены</h3>
                <p className="text-muted-foreground">
                  Попробуйте изменить параметры поиска
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="map" className="mt-0">
            <VacancyMap jobs={filteredJobs} recommendedCategory={user?.testResult} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Vacancies;