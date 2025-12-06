import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

const UserSubscription = () => {
  const { user, updateSubscription } = useAuth();
  const navigate = useNavigate();

  if (!user || user.role !== 'user') {
    navigate('/');
    return null;
  }

  const handleSelectLifetime = () => {
    // Устанавливаем дату окончания на 2099 год (практически навсегда)
    const lifetimeExpiry = new Date('2099-12-31T23:59:59');
    updateSubscription('premium_plus', lifetimeExpiry.toISOString());
    navigate('/vacancies');
  };

  const handleSkip = () => {
    navigate('/vacancies');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mx-auto mb-6">
            <Icon name="Sparkles" size={40} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Полный доступ навсегда</h1>
          <p className="text-muted-foreground text-lg">
            Единоразовый платёж — все возможности платформы без ограничений
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-6">
          <div className="bg-gradient-to-br from-yellow-500/20 via-orange-500/20 to-red-500/20 p-10 rounded-2xl border-4 border-yellow-500 relative overflow-hidden shadow-2xl">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-yellow-400 rounded-full opacity-20 blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-orange-400 rounded-full opacity-20 blur-3xl"></div>
            
            <div className="relative z-10">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-2 rounded-full text-sm font-bold mb-6">
                  <Icon name="Zap" size={16} />
                  Единоразовый платёж
                </div>
                
                <h2 className="text-3xl font-bold mb-4">Полный доступ навсегда</h2>
                <div className="flex items-center justify-center gap-3 mb-2">
                  <span className="text-2xl text-muted-foreground line-through">399₽</span>
                  <span className="text-6xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">500₽</span>
                </div>
                <p className="text-muted-foreground font-semibold">Платите один раз — пользуйтесь всегда</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3 bg-white/50 p-4 rounded-lg">
                  <Icon name="Check" size={24} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-bold block text-lg">Доступ к премиум-вакансиям</span>
                    <span className="text-sm text-muted-foreground">
                      Откликайтесь на эксклюзивные предложения от лучших работодателей
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-3 bg-white/50 p-4 rounded-lg">
                  <Icon name="Check" size={24} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-bold block text-lg">Приоритет в откликах</span>
                    <span className="text-sm text-muted-foreground">
                      Ваше резюме работодатели увидят первым
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-3 bg-white/50 p-4 rounded-lg">
                  <Icon name="Check" size={24} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-bold block text-lg">Расширенная статистика</span>
                    <span className="text-sm text-muted-foreground">
                      Узнайте, кто просмотрел ваше резюме и отследите активность
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-3 bg-white/50 p-4 rounded-lg">
                  <Icon name="Video" size={24} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-bold block text-lg">Обучающие видеокурсы</span>
                    <span className="text-sm text-muted-foreground">
                      Полная библиотека видео по освоению разных специальностей
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-3 bg-white/50 p-4 rounded-lg">
                  <Icon name="GraduationCap" size={24} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-bold block text-lg">Практические задания</span>
                    <span className="text-sm text-muted-foreground">
                      Развивайте реальные навыки для выбранной профессии
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-3 bg-white/50 p-4 rounded-lg">
                  <Icon name="BookOpen" size={24} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-bold block text-lg">База знаний</span>
                    <span className="text-sm text-muted-foreground">
                      Полезные материалы, статьи и гайды по каждой специальности
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-3 bg-white/50 p-4 rounded-lg">
                  <Icon name="Infinity" size={24} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-bold block text-lg">Навсегда без подписок</span>
                    <span className="text-sm text-muted-foreground">
                      Никаких ежемесячных платежей — платите один раз и всё
                    </span>
                  </div>
                </li>
              </ul>

              <Button
                onClick={handleSelectLifetime}
                className="w-full bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 hover:from-yellow-600 hover:via-orange-600 hover:to-red-600 text-white shadow-lg shadow-orange-500/50"
                size="lg"
              >
                <Icon name="Sparkles" size={24} className="mr-2" />
                Получить полный доступ за 500₽
              </Button>
              
              <p className="text-center text-sm text-muted-foreground mt-4">
                ✨ Специальная цена — обычно 399₽/мес × 12 мес = 4788₽
              </p>
            </div>
          </div>
        </div>

        <div className="text-center space-y-4">
          <Button
            onClick={handleSkip}
            variant="ghost"
            className="w-full max-w-md"
          >
            Продолжить без подписки
          </Button>
          
          <p className="text-sm text-muted-foreground">
            💡 Вы всегда сможете оформить подписку позже в профиле
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserSubscription;