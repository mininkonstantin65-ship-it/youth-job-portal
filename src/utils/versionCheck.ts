const CURRENT_VERSION = '2.3.2';
const VERSION_KEY = 'app_version';

export const checkAndUpdateVersion = (): void => {
  const storedVersion = localStorage.getItem(VERSION_KEY);
  
  if (storedVersion !== CURRENT_VERSION) {
    console.log(`🔄 Обнаружено обновление: ${storedVersion} → ${CURRENT_VERSION}`);
    console.log('🧹 Очищаю кеш и перезагружаю страницу...');
    
    localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
    
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
      });
    }
    
    window.location.reload();
  }
};

export const getCurrentVersion = (): string => {
  return CURRENT_VERSION;
};