import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { loadJobByIdFromDatabase } from '@/utils/syncData';

interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  senderRole: 'user' | 'employer';
  timestamp: number;
}

const API_BASE = 'https://functions.poehali.dev/81ba1a01-47ea-40ac-9ce8-1dc2aa32d523';
const MESSAGES_API = `${API_BASE}?resource=messages`;
const EMPLOYER_ID = '6';

const Chat = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [jobInfo, setJobInfo] = useState<any>(null);
  const [chatPartnerName, setChatPartnerName] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const urlParams = new URLSearchParams(window.location.search);
  const otherUserId = urlParams.get('userId');
  
  const chatPartnerId = user?.role === 'employer' ? otherUserId : EMPLOYER_ID;

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    const loadJob = async () => {
      if (!id) return;
      const dbJob = await loadJobByIdFromDatabase(id);
      if (dbJob) {
        setJobInfo({
          id: dbJob.id,
          title: dbJob.title,
          company: dbJob.company
        });
      }
    };
    loadJob();
  }, [id]);

  useEffect(() => {
    const loadChatPartnerName = async () => {
      if (!chatPartnerId) return;
      
      try {
        const response = await fetch(`${API_BASE}?resource=users`);
        if (response.ok) {
          const data = await response.json();
          const partner = data.users.find((u: any) => u.id === chatPartnerId);
          if (partner) {
            setChatPartnerName(partner.name || partner.email);
          }
        }
      } catch (error) {
        console.error('Error loading chat partner:', error);
      }
    };
    loadChatPartnerName();
  }, [chatPartnerId]);

  useEffect(() => {
    const loadMessages = async () => {
      if (!user || !chatPartnerId || !id) return;
      
      try {
        const params = new URLSearchParams();
        
        params.append('sender_id', user.id);
        params.append('receiver_id', chatPartnerId!);
        params.append('job_id', id);
        
        console.log('📨 Загрузка сообщений:', {
          sender_id: user.id,
          receiver_id: chatPartnerId,
          job_id: id,
          userRole: user.role
        });
        
        const response = await fetch(`${MESSAGES_API}&${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          const dbMessages = data.messages || [];
          
          const formattedMessages = dbMessages.map((msg: any) => ({
            id: msg.id,
            text: msg.messageText || msg.message_text,
            senderId: msg.senderId || msg.sender_id,
            senderName: (msg.senderId || msg.sender_id) === user.id ? user.name : (chatPartnerName || 'Собеседник'),
            senderRole: (msg.senderId || msg.sender_id) === user.id ? (user.role === 'employer' ? 'employer' : 'user') : (user.role === 'employer' ? 'user' : 'employer'),
            timestamp: new Date(msg.createdAt || msg.created_at).getTime()
          }));
          
          setMessages(formattedMessages);
        }
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };

    loadMessages();
    const interval = setInterval(loadMessages, 2000);
    return () => clearInterval(interval);
  }, [user, chatPartnerId, id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!inputValue.trim() || !user) return;

    try {
      const receiverId = user.role === 'employer' ? chatPartnerId : EMPLOYER_ID;
      
      const response = await fetch(MESSAGES_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_id: user.id,
          receiver_id: receiverId,
          job_id: id || null,
          message_text: inputValue
        })
      });

      if (response.ok) {
        setInputValue('');
        
        const params = new URLSearchParams();
        
        params.append('sender_id', user.id);
        params.append('receiver_id', chatPartnerId!);
        if (id) params.append('job_id', id);
        
        const refreshResponse = await fetch(`${MESSAGES_API}&${params.toString()}`);
        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          const dbMessages = data.messages || [];
          
          const formattedMessages = dbMessages.map((msg: any) => ({
            id: msg.id,
            text: msg.messageText || msg.message_text,
            senderId: msg.senderId || msg.sender_id,
            senderName: (msg.senderId || msg.sender_id) === user.id ? user.name : (chatPartnerName || 'Собеседник'),
            senderRole: (msg.senderId || msg.sender_id) === user.id ? (user.role === 'employer' ? 'employer' : 'user') : (user.role === 'employer' ? 'user' : 'employer'),
            timestamp: new Date(msg.createdAt || msg.created_at).getTime()
          }));
          
          setMessages(formattedMessages);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const scheduleInterview = async () => {
    if (!interviewDate || !interviewTime || !user || !chatPartnerId) {
      console.log('❌ Недостаточно данных для назначения собеседования');
      return;
    }

    try {
      console.log('📅 Запрос пользователей для назначения собеседования...');
      const usersResponse = await fetch(`${API_BASE}?resource=users`);
      if (!usersResponse.ok) {
        console.error('❌ Не удалось загрузить пользователей:', usersResponse.status);
        return;
      }
      
      const usersData = await usersResponse.json();
      const responseUser = usersData.users.find((u: any) => u.id === chatPartnerId);

      if (!responseUser) {
        console.error('❌ Пользователь не найден:', chatPartnerId);
        return;
      }

      const interviewDateTime = `${interviewDate}T${interviewTime}:00`;
      
      const jobIdToSend = id && id !== 'undefined' ? String(id) : jobInfo?.id || '';
      
      console.log('📤 Создание собеседования:', {
        userId: responseUser.id,
        userName: responseUser.name,
        jobId: jobIdToSend,
        jobTitle: jobInfo?.title,
        date: interviewDateTime
      });
      
      const response = await fetch(`${API_BASE}?resource=interviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: responseUser.id,
          userName: responseUser.name,
          userEmail: responseUser.email,
          userAge: responseUser.age || 16,
          jobId: jobIdToSend,
          jobTitle: jobInfo?.title || '',
          date: interviewDateTime,
          time: interviewTime,
          location: 'Офис компании',
          notes: 'Собеседование назначено работодателем'
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Собеседование создано:', data);
        sendMessageToChat(`📅 Собеседование назначено на ${new Date(interviewDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })} в ${interviewTime}`);
        alert('✅ Собеседование успешно назначено!');
        setIsDialogOpen(false);
        setInterviewDate('');
        setInterviewTime('');
      } else {
        const errorData = await response.json();
        console.error('❌ Ошибка создания собеседования:', response.status, errorData);
        alert(`❌ Не удалось назначить собеседование: ${errorData.error || 'Ошибка сервера'}`);
      }
    } catch (error) {
      console.error('❌ Критическая ошибка при назначении собеседования:', error);
      alert('❌ Не удалось назначить собеседование. Проверьте подключение к интернету.');
    }
  };

  const requestInterview = () => {
    if (!interviewDate || !interviewTime || !user) return;

    sendMessageToChat(`🙋 Прошу назначить собеседование на ${new Date(interviewDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })} в ${interviewTime}`);

    setIsDialogOpen(false);
    setInterviewDate('');
    setInterviewTime('');
  };

  const sendMessageToChat = async (text: string) => {
    if (!user) return;

    try {
      const receiverId = user.role === 'employer' ? chatPartnerId : EMPLOYER_ID;
      
      await fetch(MESSAGES_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_id: user.id,
          receiver_id: receiverId,
          job_id: id || null,
          message_text: text
        })
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!confirm('Удалить это сообщение?')) return;

    try {
      console.log('🗑️ Удаление сообщения:', messageId);
      const response = await fetch(MESSAGES_API, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: messageId })
      });

      if (response.ok) {
        console.log('✅ Сообщение удалено');
        setMessages(messages.filter(m => m.id !== messageId));
      } else {
        const errorData = await response.json();
        console.error('❌ Ошибка удаления:', errorData);
        alert('Не удалось удалить сообщение');
      }
    } catch (error) {
      console.error('❌ Критическая ошибка при удалении:', error);
      alert('Ошибка при удалении сообщения');
    }
  };

  if (!user) return null;

  if (!jobInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Чат не найден</h2>
          <Link to="/vacancies">
            <Button>Вернуться к вакансиям</Button>
          </Link>
        </div>
      </div>
    );
  }

  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const chatPartner = users.find((u: any) => u.id === chatPartnerId);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate(user.role === 'employer' ? '/employer-profile' : '/vacancies')}
              className="flex items-center gap-2"
            >
              <Icon name="ArrowLeft" size={20} />
              <span className="hidden sm:inline">Назад</span>
            </Button>
            <div className="flex-1">
              <h1 className="font-bold text-lg">
                {user.role === 'employer' && chatPartner ? chatPartner.name : jobInfo.company}
              </h1>
              <p className="text-sm text-muted-foreground">{jobInfo.title}</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="default" size="sm">
                  <Icon name="Calendar" size={16} className="mr-2" />
                  {user.role === 'employer' ? 'Назначить собеседование' : 'Запросить собеседование'}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {user.role === 'employer' ? 'Назначить собеседование' : 'Запросить собеседование'}
                  </DialogTitle>
                  <DialogDescription>
                    {user.role === 'employer' 
                      ? 'Укажите дату и время для встречи с кандидатом'
                      : 'Предложите удобную дату и время для собеседования'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Дата</Label>
                    <Input
                      id="date"
                      type="date"
                      value={interviewDate}
                      onChange={(e) => setInterviewDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Время</Label>
                    <Input
                      id="time"
                      type="time"
                      value={interviewTime}
                      onChange={(e) => setInterviewTime(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Отмена
                  </Button>
                  <Button 
                    onClick={user.role === 'employer' ? scheduleInterview : requestInterview} 
                    disabled={!interviewDate || !interviewTime}
                  >
                    {user.role === 'employer' ? 'Назначить' : 'Отправить запрос'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 flex flex-col max-w-4xl">
        <div className="flex-1 space-y-4 overflow-y-auto mb-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              <Icon name="MessageCircle" size={48} className="mx-auto mb-4 opacity-50" />
              <p>Нет сообщений. Начните общение!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex group ${message.senderId === user.id ? 'justify-end' : 'justify-start'}`}
              >
                <div className="flex items-start gap-2">
                  {message.senderId === user.id && (
                    <button
                      onClick={() => deleteMessage(message.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/10 rounded"
                      title="Удалить сообщение"
                    >
                      <Icon name="Trash2" size={16} className="text-destructive" />
                    </button>
                  )}
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${
                      message.senderId === user.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-xs font-medium mb-1 opacity-70">
                      {message.senderName}
                    </p>
                    <p className="break-words">{message.text}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(message.timestamp).toLocaleTimeString('ru-RU', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  {message.senderId !== user.id && (
                    <button
                      onClick={() => deleteMessage(message.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/10 rounded"
                      title="Удалить сообщение"
                    >
                      <Icon name="Trash2" size={16} className="text-destructive" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-border pt-4">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Введите сообщение..."
              className="flex-1"
            />
            <Button onClick={sendMessage} disabled={!inputValue.trim()}>
              <Icon name="Send" size={20} />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Chat;