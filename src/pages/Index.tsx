import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold">Успех 14</Link>
          <div className="flex gap-3">
            {user ? (
              <Link to={user.role === 'employer' ? '/employer-profile' : '/profile'}>
                <Button>
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
                  <Button>Я ищу работу</Button>
                </Link>
                <Link to="/register-employer">
                  <Button variant="secondary">Я работодатель</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Твой первый шаг <br />
            к успешной карьере
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Платформа для молодых соискателей 14-24 лет в Красноярске. 
            Найди работу своей мечты и построй будущее уже сегодня.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to={user ? '/vacancies' : '/register'}>
              <Button size="lg" className="text-lg px-8">
                Найти работу
                <Icon name="ArrowRight" size={20} className="ml-2" />
              </Button>
            </Link>
            <Link to={user ? '/test' : '/register'}>
              <Button size="lg" variant="outline" className="text-lg px-8">
                Пройти тест
                <Icon name="ClipboardList" size={20} className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-card p-8 rounded-lg border border-border text-center">
            <div className="bg-primary/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Icon name="Search" size={32} className="text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Поиск вакансий</h3>
            <p className="text-muted-foreground">
              Более 20 актуальных вакансий для молодёжи 14-24 лет в Красноярске с зарплатой от 25000₽
            </p>
          </div>

          <div className="bg-card p-8 rounded-lg border border-border text-center">
            <div className="bg-primary/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Icon name="ClipboardList" size={32} className="text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Профориентация</h3>
            <p className="text-muted-foreground">
              Пройди тест и узнай, какая работа подходит тебе больше всего
            </p>
          </div>

          <div className="bg-card p-8 rounded-lg border border-border text-center">
            <div className="bg-primary/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Icon name="ShieldCheck" size={32} className="text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Безопасность</h3>
            <p className="text-muted-foreground">
              Все вакансии проверены и соответствуют законам о трудоустройстве молодёжи
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16 bg-gradient-to-b from-yellow-50/5 to-transparent">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-full mb-4">
            <Icon name="Crown" size={20} />
            <span className="font-semibold">Премиум возможности</span>
          </div>
          <h2 className="text-3xl font-bold mb-4">Получи доступ к лучшим вакансиям</h2>
          <p className="text-muted-foreground text-lg">
            Премиум-подписка всего за 150₽ открывает эксклюзивные предложения
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
          <div className="bg-card p-6 rounded-lg border border-border">
            <Icon name="Briefcase" size={32} className="text-primary mb-3" />
            <h4 className="font-semibold mb-2">Эксклюзивные вакансии</h4>
            <p className="text-sm text-muted-foreground">
              Доступ к премиум-вакансиям от лучших работодателей
            </p>
          </div>
          <div className="bg-card p-6 rounded-lg border border-border">
            <Icon name="TrendingUp" size={32} className="text-primary mb-3" />
            <h4 className="font-semibold mb-2">Приоритет в откликах</h4>
            <p className="text-sm text-muted-foreground">
              Твое резюме увидят первым среди всех кандидатов
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto bg-card p-12 rounded-lg border border-border text-center">
          <h2 className="text-3xl font-bold mb-4">Как это работает?</h2>
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div>
              <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h4 className="font-semibold mb-2">Регистрация</h4>
              <p className="text-sm text-muted-foreground">
                Создай аккаунт за 1 минуту
              </p>
            </div>
            <div>
              <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h4 className="font-semibold mb-2">Профориентация</h4>
              <p className="text-sm text-muted-foreground">
                Пройди тест и получи рекомендации
              </p>
            </div>
            <div>
              <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h4 className="font-semibold mb-2">Найди работу</h4>
              <p className="text-sm text-muted-foreground">
                Выбери вакансию и начни работать
              </p>
            </div>
          </div>
          <Link to="/register">
            <Button size="lg" className="mt-8">
              Начать сейчас
            </Button>
          </Link>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16 mb-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Почему выбирают нас?</h2>
          <div className="grid md:grid-cols-2 gap-6 text-left">
            <div className="flex gap-4">
              <div className="bg-primary/10 p-2 rounded-lg h-fit">
                <Icon name="CheckCircle2" size={24} className="text-primary" />
              </div>
              <div>
                <h4 className="font-semibold mb-2">Легальное трудоустройство</h4>
                <p className="text-sm text-muted-foreground">
                  Все вакансии соответствуют трудовому кодексу РФ для молодых соискателей
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="bg-primary/10 p-2 rounded-lg h-fit">
                <Icon name="CheckCircle2" size={24} className="text-primary" />
              </div>
              <div>
                <h4 className="font-semibold mb-2">Достойная оплата</h4>
                <p className="text-sm text-muted-foreground">
                  Зарплата от 25000 до 70000 рублей в зависимости от вакансии
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="bg-primary/10 p-2 rounded-lg h-fit">
                <Icon name="CheckCircle2" size={24} className="text-primary" />
              </div>
              <div>
                <h4 className="font-semibold mb-2">Гибкий график</h4>
                <p className="text-sm text-muted-foreground">
                  Работа совместима с учебой в школе
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="bg-primary/10 p-2 rounded-lg h-fit">
                <Icon name="CheckCircle2" size={24} className="text-primary" />
              </div>
              <div>
                <h4 className="font-semibold mb-2">Профориентация</h4>
                <p className="text-sm text-muted-foreground">
                  Помогаем определиться с будущей профессией
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-card/30 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p className="mb-2">© 2026 Успех 14. Все права защищены.</p>
          <p className="text-sm">Платформа трудоустройства для молодых соискателей 14-24 лет в Красноярске</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;