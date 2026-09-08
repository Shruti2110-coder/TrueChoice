import { useCallback, useMemo, useRef, useState } from 'react';
import { ToastContext } from './toast-context';

const ICONS = {
  success: (
    <path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  ),
  error: (
    <g stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v5M12 16.2v.2" />
    </g>
  ),
  info: (
    <g stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 7.8v.2" />
    </g>
  )
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback(
    (message, type = 'info') => {
      const id = nextId.current++;
      setToasts((current) => [...current, { id, message, type }]);
      setTimeout(() => dismiss(id), 4200);
    },
    [dismiss]
  );

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {toasts.map(({ id, message, type }) => (
          <div key={id} className={`toast toast-${type}`} onClick={() => dismiss(id)}>
            <svg className="toast-icon" width="19" height="19" viewBox="0 0 24 24" aria-hidden="true">
              {ICONS[type] || ICONS.info}
            </svg>
            <span>{message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
