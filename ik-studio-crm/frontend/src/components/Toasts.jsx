import { createContext, useCallback, useContext, useState } from 'react';
import Icon from '../shared/Icon';

const Ctx = createContext(() => {});
export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const push = useCallback((message, tone = 'ok') => {
    const id = Math.random();
    setItems((x) => [...x, { id, message, tone }]);
    setTimeout(() => setItems((x) => x.filter((t) => t.id !== id)), 3800);
  }, []);
  return (
    <Ctx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[200] flex w-[min(360px,calc(100%-32px))] flex-col gap-2" role="status" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className={`pointer-events-auto flex items-start gap-2.5 rounded-xl px-4 py-3 text-[13.5px] shadow-lg ${t.tone === 'error' ? 'bg-[#9E2A22] text-white' : 'bg-ink text-paper'}`}>
            <Icon name={t.tone === 'error' ? 'close' : 'check'} size={16} className="mt-0.5 shrink-0" />
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
