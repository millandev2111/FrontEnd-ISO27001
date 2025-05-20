import React, { useState } from 'react';
import { TrendingUp, TrendingDown, AlertCircle, Bell, Check, Settings, ExternalLink } from 'lucide-react';

// Definimos el tipo para una notificación
interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  action?: string;
}

// Props para NotificationCard
interface NotificationCardProps {
  notification: Notification;
  onClose: (id: number) => void;
}

// Componente de notificación con animación
const NotificationCard: React.FC<NotificationCardProps> = ({ notification, onClose }) => {
  return (
    <div className="relative bg-white p-4 rounded-lg shadow flex items-start">
      <button
        onClick={() => onClose(notification.id)}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
        aria-label="Cerrar notificación"
      >
        ×
      </button>

      <div
        className={`p-2 rounded-lg mr-3 flex-shrink-0 ${
          notification.type === 'success' ? 'bg-green-100' :
          notification.type === 'warning' ? 'bg-amber-100' :
          notification.type === 'error' ? 'bg-red-100' :
          'bg-blue-100'
        }`}
      >
        {notification.type === 'success' ? <Check className="h-5 w-5 text-green-600" /> :
          notification.type === 'warning' ? <AlertCircle className="h-5 w-5 text-amber-600" /> :
          notification.type === 'error' ? <AlertCircle className="h-5 w-5 text-red-600" /> :
          <Bell className="h-5 w-5 text-blue-600" />}
      </div>

      <div className="flex-1">
        <h4 className="font-medium text-gray-900">{notification.title}</h4>
        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>

        {notification.action && (
          <button className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center">
            {notification.action}
            <ExternalLink className="h-3 w-3 ml-1" />
          </button>
        )}
      </div>
    </div>
  );
};

// Componente de la sección de notificaciones
export const NotificationsPanel: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: 'Auditoría Completada',
      message: 'La auditoría PRUEBA100 ha sido completada con éxito.',
      type: 'success',
      action: 'Ver detalles'
    },
    {
      id: 2,
      title: 'Nueva Asignación',
      message: 'Se te ha asignado una nueva auditoría para evaluar.',
      type: 'info',
      action: 'Revisar ahora'
    },
    {
      id: 3,
      title: 'Recordatorio',
      message: 'La auditoría "Control Calidad" vence en 3 días.',
      type: 'warning',
      action: 'Continuar'
    }
  ]);

  const handleCloseNotification = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Notificaciones</h3>
        <div className="flex items-center space-x-2">
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <Settings className="h-5 w-5 text-gray-500" />
          </button>
          <button className="text-sm text-blue-600 hover:text-blue-800">Ver todas</button>
        </div>
      </div>

      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map(notification => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onClose={handleCloseNotification}
            />
          ))
        ) : (
          <p>No hay notificaciones nuevas</p>
        )}
      </div>
    </div>
  );
};

// Componente de resumen diario
export const DailySummary: React.FC = () => {
  const summaryData = {
    date: new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }),
    percentage: 85,
    stats: [
      { label: 'Auditorías en Progreso', value: 2, change: 0, changePct: 0 },
      { label: 'Controles Evaluados', value: 15, change: 3, changePct: 25 },
      { label: 'Auditorías Completadas', value: 3, change: 1, changePct: 50 }
    ]
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">Resumen del Día</h3>
          <p className="text-sm text-gray-500 capitalize">{summaryData.date}</p>
        </div>
        <div className="relative">
          <svg className="w-16 h-16" viewBox="0 0 36 36">
            <path
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="3"
              strokeDasharray="100, 100"
            />
            <path
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#4F46E5"
              strokeWidth="3"
              strokeDasharray={`${summaryData.percentage}, 100`}
            />
            <text x="18" y="21" textAnchor="middle" fill="#4F46E5" fontSize="10" fontWeight="bold">
              {summaryData.percentage}%
            </text>
          </svg>
        </div>
      </div>

      <div className="space-y-4">
        {summaryData.stats.map((stat, index) => (
          <div key={index} className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{stat.label}</p>
              <p className="text-xl font-bold text-gray-800">{stat.value}</p>
            </div>
            {stat.change !== 0 && (
              <div className={`flex items-center ${stat.change > 0 ? 'text-green-600' : stat.change < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                {stat.change > 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : stat.change < 0 ? <TrendingDown className="h-4 w-4 mr-1" /> : null}
                <span className="text-sm font-medium">{stat.change > 0 ? '+' : ''}{stat.change} ({stat.change > 0 ? '+' : ''}{stat.changePct}%)</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-blue-100">
        <button className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">
          Ver informe completo
        </button>
      </div>
    </div>
  );
};
