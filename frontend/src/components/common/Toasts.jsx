import { CheckCircle, Info, XCircle, X } from 'lucide-react';
import { useData } from '../../context/DataContext';

const styles = {
  success: { box: 'border-green-200 bg-green-50 text-green-800', Icon: CheckCircle },
  info:    { box: 'border-blue-200 bg-blue-50 text-blue-800',    Icon: Info },
  error:   { box: 'border-red-200 bg-red-50 text-red-800',       Icon: XCircle },
};

export default function Toasts() {
  const { toasts, dismissToast } = useData();
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 w-80">
      {toasts.map(t => {
        const { box, Icon } = styles[t.type] || styles.success;
        return (
          <div key={t.id} className={`flex items-start gap-2 border rounded-lg px-3 py-2.5 text-sm shadow-lg ${box}`}>
            <Icon size={16} className="mt-0.5 flex-shrink-0" />
            <span className="flex-1">{t.message}</span>
            <button onClick={() => dismissToast(t.id)} className="opacity-60 hover:opacity-100"><X size={14} /></button>
          </div>
        );
      })}
    </div>
  );
}
