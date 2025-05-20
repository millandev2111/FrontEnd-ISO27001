import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronRight, ChevronLeft, ChevronDown, Check, FileText, Shield, Building, UserCheck, Monitor, Loader } from 'lucide-react';
import axios from 'axios';
import { getCookie } from 'cookies-next';

interface Controller {
  id: number;
  attributes?: {
    id: number;
    code: string;
    title: string;
    ask: string;
    description: string;
    type: string;
  };
  data?: {
    id: number;
    code: string;
    title: string;
    ask: string;
    description: string;
    type: string;
  };
}

interface User {
  id: number;
  attributes?: {
    id: number;
    username: string;
    email: string;
  };
  data?: {
    id: number;
    username: string;
    email: string;
  };
}

interface AuditFormData {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  state: string;
  users: number[];
  controladors: number[];
}

interface AuditCreationFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

const ISO_CATEGORIES = {
  A: { label: 'Controles Organizacionales', icon: Building, color: 'blue' },
  B: { label: 'Controles de Personas', icon: UserCheck, color: 'green' },
  C: { label: 'Controles Físicos', icon: Shield, color: 'purple' },
  D: { label: 'Controles Tecnológicos', icon: Monitor, color: 'orange' }
};

const AuditCreationForm: React.FC<AuditCreationFormProps> = ({ onClose, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<AuditFormData>({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    state: 'pending',
    users: [],
    controladors: []
  });

  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [availableControllers, setAvailableControllers] = useState<Controller[]>([]);

  const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>({
    A: false,
    B: false,
    C: false,
    D: false
  });

  const getAuthToken = () => {
    if (typeof window === 'undefined') return null;
    const token = getCookie('auth_token')
    return typeof token === 'string' ? token : null
  }


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = getAuthToken();
        if (!token) throw new Error('No se encontró el token de autenticación');

        const controllersResponse = await axios.get('https://backend-iso27001.onrender.com/api/controladors', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const usersResponse = await axios.get('https://backend-iso27001.onrender.com/api/users', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const users = Array.isArray(usersResponse.data) ? usersResponse.data : usersResponse.data.data || [];
        const controllers = Array.isArray(controllersResponse.data)
          ? controllersResponse.data
          : controllersResponse.data.data || [];

        setAvailableUsers(users);
        setAvailableControllers(controllers);
      } catch (err: any) {
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 403) {
            setError('No tienes permisos para acceder a los recursos. Verifica los permisos en Strapi.');
          } else if (err.response?.status === 401) {
            setError('Token inválido o expirado. Por favor, inicia sesión nuevamente.');
          } else {
            setError(err.response?.data?.error?.message || 'Error al cargar datos');
          }
        } else {
          setError(err.message || 'Error al cargar datos');
        }
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (field: keyof AuditFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUserToggle = useCallback((userId: number) => {
    setFormData(prev => ({
      ...prev,
      users: prev.users.includes(userId) ? prev.users.filter(id => id !== userId) : [...prev.users, userId]
    }));
  }, []);

  const handleControllerToggle = useCallback((controllerId: number) => {
    setFormData(prev => ({
      ...prev,
      controladors: prev.controladors.includes(controllerId)
        ? prev.controladors.filter(id => id !== controllerId)
        : [...prev.controladors, controllerId]
    }));
  }, []);

  const toggleCategory = useCallback((category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  }, []);

  // Validación completa del formulario
  const validateFormData = (data: AuditFormData) => {
    const errors: string[] = [];

    if (!data.title || data.title.trim() === '') errors.push('El título es obligatorio');
    if (!data.description || data.description.trim() === '') errors.push('La descripción es obligatoria');

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(data.startDate)) errors.push('Fecha de inicio inválida');
    if (!dateRegex.test(data.endDate)) errors.push('Fecha de fin inválida');

    if (new Date(data.startDate) > new Date(data.endDate))
      errors.push('La fecha de inicio no puede ser posterior a la fecha de fin');

    const validStates = ['pending', 'in_progress', 'completed'];
    if (!validStates.includes(data.state)) errors.push('Estado inválido');

    if (!Array.isArray(data.users) || data.users.some(id => typeof id !== 'number'))
      errors.push('Lista de usuarios inválida');

    if (!Array.isArray(data.controladors) || data.controladors.some(id => typeof id !== 'number'))
      errors.push('Lista de controladores inválida');

    return errors;
  };

  const handleNext = async () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const token = getAuthToken();
      if (!token) throw new Error('No se encontró el token de autenticación');

      // Filtrar controladores válidos
      const validControladors = formData.controladors.filter(id =>
        availableControllers.some(ctrl => ctrl.id === id)
      );

      // Validar estado
      const validStates = ['En Progreso', 'Completada']; // agrega "Pendiente" si aplica
      if (!validStates.includes(formData.state)) {
        setError(`Estado inválido. Debe ser uno de: ${validStates.join(', ')}`);
        setSaving(false);
        return;
      }

      // Validar que usuarios sean números válidos si quieres (similar)

      const payload = {
        data: {
          title: formData.title,
          description: formData.description,
          startDate: formData.startDate,
          endDate: formData.endDate,
          state: formData.state,
          users: { connect: formData.users },
          controladors: { connect: validControladors }
        }
      };

      console.log('Payload a enviar:', JSON.stringify(payload, null, 2));

      const response = await axios.post('https://backend-iso27001.onrender.com/api/auditorias', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Auditoría creada:', response.data);

      if (onSuccess) onSuccess();
      onClose();

    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || err.message || 'Error al crear auditoría';
      setError(errorMessage);
      console.error('Error en handleNext:', err);
      console.error('Error response:', err.response?.data);
    } finally {
      setSaving(false);
    }
  };


  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.title && formData.description && formData.startDate && formData.endDate;
      case 2:
        return formData.controladors.length > 0;
      case 3:
        return true;
      default:
        return false;
    }
  };

  // Helper para extraer datos del formato de Strapi
  const getUserData = (user: User): { id: number; username: string; email: string } => {
    const data = user.attributes || user.data || user;
    return {
      id: user.id,
      username: (data as any).username || (data as any).email || 'Usuario',
      email: (data as any).email || ''
    };
  };

  const getControllerData = (controller: Controller): { id: number; code: string; title: string; ask: string; description: string; type: string } => {
    const data = controller.attributes || controller.data || controller;
    return {
      id: controller.id,
      code: (data as any).code || '',
      title: (data as any).title || '',
      ask: (data as any).ask || '',
      description: (data as any).description || '',
      type: (data as any).type || 'A'
    };
  };

  // Agrupar controladores por tipo/categoría
  const groupControllersByType = () => {
    const grouped: { [key: string]: Controller[] } = {};

    availableControllers.forEach(controller => {
      const controllerData = getControllerData(controller);
      const type = controllerData.type || 'A'; // Default a tipo A si no tiene tipo

      if (!grouped[type]) {
        grouped[type] = [];
      }
      grouped[type].push(controller);
    });

    return grouped;
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Título de la Auditoría
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Ingrese el título de la auditoría"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Descripción
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={4}
          placeholder="Describa el objetivo y alcance de la auditoría"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fecha de Inicio
          </label>
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) => handleInputChange('startDate', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fecha de Fin
          </label>
          <input
            type="date"
            value={formData.endDate}
            onChange={(e) => handleInputChange('endDate', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Estado
        </label>
        <select
          value={formData.state}
          onChange={(e) => handleInputChange('state', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="Competada">Completada</option>
          <option value="En Progreso">En Progreso</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Asignar Usuarios
        </label>
        <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
          {availableUsers.map(user => {
            const userData = getUserData(user);
            return (
              <label key={user.id} className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-50 rounded">
                <input
                  type="checkbox"
                  checked={formData.users.includes(user.id)}
                  onChange={() => handleUserToggle(user.id)}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{userData.username}</p>
                  <p className="text-xs text-gray-500">{userData.email}</p>
                </div>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => {
    const groupedControllers = groupControllersByType();

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Seleccionar Controladores</h3>
          <p className="text-sm text-gray-600 mb-4">
            Seleccione los controladores que serán evaluados en esta auditoría siguiendo los lineamientos ISO 27001.
          </p>
          <p className="text-xs text-gray-500 mb-6">
            Total de controladores disponibles: {availableControllers.length} de 93
          </p>
        </div>

        <div className="space-y-4">
          {Object.entries(ISO_CATEGORIES).map(([type, category]) => {
            const controllers = groupedControllers[type] || [];
            const CategoryIcon = category.icon;
            const isExpanded = expandedCategories[type];
            const selectedCount = controllers.filter(c => formData.controladors.includes(c.id)).length;

            return (
              <div key={type} className="border border-gray-200 rounded-lg overflow-hidden">
                <div
                  className={`bg-${category.color}-50 p-4 flex items-center cursor-pointer hover:bg-${category.color}-100 transition-colors`}
                  onClick={() => toggleCategory(type)}
                >
                  <button className="mr-2">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-gray-600" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-600" />
                    )}
                  </button>
                  <CategoryIcon className={`w-5 h-5 text-${category.color}-600 mr-3`} />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">
                      Tipo {type}: {category.label}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {controllers.length} controladores disponibles
                      {selectedCount > 0 && (
                        <span className="text-blue-600 font-medium">
                          {' '}({selectedCount} seleccionados)
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
                    {controllers.length > 0 ? (
                      controllers.map(controller => {
                        const controllerData = getControllerData(controller);
                        return (
                          <label
                            key={controller.id}
                            className="flex items-start space-x-3 cursor-pointer p-3 hover:bg-gray-50 rounded"
                          >
                            <input
                              type="checkbox"
                              checked={formData.controladors.includes(controller.id)}
                              onChange={() => handleControllerToggle(controller.id)}
                              className="w-4 h-4 text-blue-600 rounded border-gray-300 mt-1"
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {controllerData.code} - {controllerData.title}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {controllerData.description}
                              </p>
                            </div>
                          </label>
                        );
                      })
                    ) : (
                      <p className="text-sm text-gray-500 italic">
                        No hay controladores disponibles en esta categoría
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderStep3 = () => {
    const selectedControllersByType: { [key: string]: Controller[] } = {};

    formData.controladors.forEach(controllerId => {
      const controller = availableControllers.find(c => c.id === controllerId);
      if (controller) {
        const controllerData = getControllerData(controller);
        const type = controllerData.type || 'A';
        if (!selectedControllersByType[type]) {
          selectedControllersByType[type] = [];
        }
        selectedControllersByType[type].push(controller);
      }
    });

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Confirmar Auditoría</h3>
          <p className="text-sm text-gray-600 mb-6">
            Revise la información antes de crear la auditoría:
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700">Información Básica</h4>
            <dl className="mt-2 text-sm text-gray-900">
              <div className="py-2">
                <dt className="font-medium inline">Título:</dt>
                <dd className="inline ml-2">{formData.title}</dd>
              </div>
              <div className="py-2">
                <dt className="font-medium inline">Descripción:</dt>
                <dd className="inline ml-2">{formData.description}</dd>
              </div>
              <div className="py-2">
                <dt className="font-medium inline">Período:</dt>
                <dd className="inline ml-2">
                  {formData.startDate} - {formData.endDate}
                </dd>
              </div>
              <div className="py-2">
                <dt className="font-medium inline">Estado:</dt>
                <dd className="inline ml-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${formData.state === 'pending' ? 'bg-gray-100 text-gray-800' :
                    formData.state === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                    {formData.state === 'pending' ? 'Pendiente' :
                      formData.state === 'in_progress' ? 'En Progreso' :
                        'Completada'}
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700">Usuarios Asignados</h4>
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.users.map(userId => {
                const user = availableUsers.find(u => u.id === userId);
                if (!user) return null;
                const userData = getUserData(user);
                return (
                  <span
                    key={userId}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full"
                  >
                    {userData.username}
                  </span>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700">Controladores Seleccionados</h4>
            <div className="mt-3 space-y-3">
              {Object.entries(ISO_CATEGORIES).map(([type, category]) => {
                const controllers = selectedControllersByType[type] || [];
                if (controllers.length === 0) return null;

                return (
                  <div key={type} className="border-l-4 border-${category.color}-400 pl-3">
                    <h5 className="text-xs font-medium text-gray-600 mb-1">
                      Tipo {type}: {category.label} ({controllers.length})
                    </h5>
                    <div className="grid grid-cols-1 gap-1">
                      {controllers.map(controller => {
                        const controllerData = getControllerData(controller);
                        return (
                          <div
                            key={controller.id}
                            className="text-xs bg-white p-2 rounded"
                          >
                            {controllerData.code} - {controllerData.title}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Si está cargando, mostrar spinner
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-2xl p-8">
          <div className="flex flex-col items-center">
            <Loader className="w-8 h-8 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-600">Cargando datos...</p>
          </div>
        </div>
      </div>
    );
  }

  // Si hay error, mostrar mensaje
  if (error && currentStep === 1) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <X className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar datos</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="space-y-2 text-sm text-left">
              <p className="text-gray-500">Posibles soluciones:</p>
              <ul className="list-disc list-inside text-gray-500">
                <li>Verifica que el token JWT esté configurado correctamente</li>
                <li>Asegúrate de que los endpoints de la API estén accesibles</li>
                <li>Revisa los permisos en Strapi para usuarios y controladores</li>
              </ul>
            </div>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  const steps = [
    { number: 1, title: 'Información Básica', icon: FileText },
    { number: 2, title: 'Controladores ISO', icon: Shield },
    { number: 3, title: 'Confirmación', icon: Check }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Nueva Auditoría</h2>
            <button
              onClick={onClose}
              disabled={saving}
              className="text-white hover:text-gray-200 transition-colors disabled:opacity-50"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Stepper */}
        <div className="bg-gray-50 px-6 py-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep >= step.number
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-300 text-gray-600'
                      }`}
                  >
                    {currentStep > step.number ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      Paso {step.number}
                    </p>
                    <p className="text-xs text-gray-500">{step.title}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-24 h-1 mx-4 ${currentStep > step.number
                      ? 'bg-blue-600'
                      : 'bg-gray-300'
                      }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 280px)' }}>
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </div>

        {/* Error display */}
        {error && (
          <div className="px-6 pb-4">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1 || saving}
            className={`flex items-center px-4 py-2 rounded-lg font-medium ${currentStep === 1 || saving
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Anterior
          </button>

          <div className="flex items-center space-x-2">
            {steps.map((step) => (
              <div
                key={step.number}
                className={`w-2 h-2 rounded-full ${currentStep === step.number
                  ? 'bg-blue-600'
                  : 'bg-gray-300'
                  }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={!isStepValid() || saving}
            className={`flex items-center px-4 py-2 rounded-lg font-medium ${isStepValid() && !saving
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
          >
            {saving ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                {currentStep === 3 ? 'Crear Auditoría' : 'Siguiente'}
                {currentStep < 3 && <ChevronRight className="w-4 h-4 ml-2" />}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuditCreationForm;