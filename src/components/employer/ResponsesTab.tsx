import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';

export interface ResponseData {
  userId: string;
  userName: string;
  userEmail: string;
  userAge: number;
  jobId: number | string;
  jobTitle: string;
  timestamp: number;
  testScore?: number;
  testDate?: number;
}

interface ResponsesTabProps {
  responses: ResponseData[];
  responsesByJob: Record<number | string, ResponseData[]>;
  formatTime: (timestamp: number) => string;
}

interface CandidateFullData {
  id: string;
  name: string;
  email: string;
  age: number;
  completedTest: boolean;
  testResult?: string;
  testScore?: number;
  testDate?: number;
  testAnswers?: any[];
}

const ResponsesTab = ({ responses, responsesByJob, formatTime }: ResponsesTabProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isPremium = user?.subscription === 'premium' || user?.subscription === 'premium_plus';

  const getCandidateData = (userId: string): CandidateFullData | null => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    return users.find((u: any) => u.id === userId) || null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Отклики на вакансии</CardTitle>
        <CardDescription>
          Все отклики от кандидатов сгруппированы по вакансиям
        </CardDescription>
      </CardHeader>
      <CardContent>
        {responses.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Icon name="Inbox" size={48} className="mx-auto mb-4 opacity-50" />
            <p>Пока нет откликов на ваши вакансии</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(responsesByJob).map(([jobId, jobResponses]) => (
              <div key={jobId} className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">{jobResponses[0].jobTitle}</h3>
                  <Badge>{jobResponses.length} {jobResponses.length === 1 ? 'отклик' : 'откликов'}</Badge>
                </div>
                <div className="space-y-3">
                  {jobResponses.map((response, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-secondary/50 transition">
                      <div className="bg-blue-500/10 p-3 rounded-full">
                        <Icon name="User" size={24} className="text-blue-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-lg">{response.userName}</span>
                          <Badge variant="outline">{response.userAge} лет</Badge>
                          {response.testScore && (
                            <Badge variant="default" className="bg-green-500">
                              <Icon name="CheckCircle2" size={12} className="mr-1" />
                              {response.testScore}%
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <Icon name="Mail" size={14} className="text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{response.userEmail}</span>
                        </div>
                        {response.testDate && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Icon name="Calendar" size={12} />
                            <span>Тест пройден: {new Date(response.testDate).toLocaleDateString('ru-RU')}</span>
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatTime(response.timestamp)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Icon name="User" size={16} className="mr-2" />
                              Профиль
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Профиль кандидата</DialogTitle>
                              <DialogDescription>
                                {response.userName}, {response.userAge} лет
                              </DialogDescription>
                            </DialogHeader>
                            {(() => {
                              const candidate = getCandidateData(response.userId);
                              if (!candidate) return <div>Данные не найдены</div>;
                              
                              return (
                                <div className="space-y-4 py-4">
                                  <div>
                                    <p className="text-sm text-muted-foreground mb-2">Контакты:</p>
                                    <p className="font-medium">{candidate.email}</p>
                                  </div>
                                  
                                  {candidate.completedTest && candidate.testResult ? (
                                    isPremium ? (
                                      <div className="border-t pt-4">
                                        <div className="flex items-center gap-2 mb-4">
                                          <Icon name="Target" size={20} className="text-primary" />
                                          <h3 className="font-semibold text-lg">Результаты профориентационного теста</h3>
                                        </div>
                                        
                                        <div className="space-y-4">
                                          <div>
                                            <p className="text-sm text-muted-foreground mb-2">Рекомендованная категория:</p>
                                            <Badge variant="default" className="text-base py-1 px-3">
                                              {candidate.testResult}
                                            </Badge>
                                          </div>
                                          
                                          <div>
                                            <p className="text-sm text-muted-foreground mb-2">Процент совпадения:</p>
                                            <div className="flex items-center gap-2">
                                              <div className="flex-1 bg-secondary rounded-full h-2">
                                                <div 
                                                  className="bg-primary h-2 rounded-full transition-all"
                                                  style={{ width: `${candidate.testScore || 0}%` }}
                                                />
                                              </div>
                                              <span className="font-semibold">{candidate.testScore || 0}%</span>
                                            </div>
                                          </div>
                                          
                                          {candidate.testDate && (
                                            <div>
                                              <p className="text-sm text-muted-foreground mb-2">Дата прохождения:</p>
                                              <p className="font-medium">{new Date(candidate.testDate).toLocaleDateString('ru-RU')}</p>
                                            </div>
                                          )}
                                          
                                          {candidate.testAnswers && (
                                            <div>
                                              <p className="text-sm text-muted-foreground mb-2">Ответы на вопросы теста:</p>
                                              <div className="bg-secondary/30 p-4 rounded-lg space-y-3 max-h-64 overflow-y-auto">
                                                {candidate.testAnswers.map((answer: any, idx: number) => (
                                                  <div key={idx} className="text-sm">
                                                    <p className="font-medium mb-1">{idx + 1}. {answer.question}</p>
                                                    <p className="text-muted-foreground pl-4">→ {answer.answer}</p>
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="border-t pt-4">
                                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 text-center">
                                          <Icon name="Crown" size={32} className="text-yellow-500 mx-auto mb-2" />
                                          <p className="font-semibold mb-2">Результаты профтеста доступны только с премиум подпиской</p>
                                          <p className="text-sm text-muted-foreground mb-3">
                                            Обновите подписку, чтобы видеть результаты профориентационных тестов кандидатов
                                          </p>
                                          <Badge variant="outline" className="text-xs">
                                            <Icon name="Check" size={12} className="mr-1" />
                                            Тест пройден
                                          </Badge>
                                        </div>
                                      </div>
                                    )
                                  ) : (
                                    <div className="border-t pt-4">
                                      <div className="bg-secondary/30 rounded-lg p-4 text-center">
                                        <Icon name="AlertCircle" size={32} className="text-muted-foreground mx-auto mb-2" />
                                        <p className="text-sm text-muted-foreground">
                                          Кандидат ещё не прошёл профориентационный тест
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })()}
                          </DialogContent>
                        </Dialog>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/chat/${response.jobId}?userId=${response.userId}`)}
                        >
                          <Icon name="MessageSquare" size={16} className="mr-2" />
                          Чат
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResponsesTab;