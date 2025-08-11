
import React, { useState } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { Incident, Employee, EventType } from '../types';
import Modal from '../components/Modal';
import IncidentReport from '../components/IncidentReport';
import { ClipboardDocumentListIcon } from '../constants';
import { useAuth } from '../Auth';

// The form for creating/editing an incident
const IncidentForm: React.FC<{
    onSave: (incident: Omit<Incident, 'id' | 'folio'>) => void,
    onClose: () => void,
    employees: Employee[]
}> = ({ onSave, onClose, employees }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));
    const [eventType, setEventType] = useState<EventType>('Incidente');
    const [machineOrOperation, setMachineOrOperation] = useState('');
    const [area, setArea] = useState('');
    const [description, setDescription] = useState('');
    const [treatment, setTreatment] = useState('');
    const [evidenceImageUrl, setEvidenceImageUrl] = useState<string | undefined>(undefined);

    const filteredEmployees = searchTerm
        ? employees.filter(e =>
            e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.employeeNumber.toLowerCase().includes(searchTerm.toLowerCase())
          ).slice(0, 5)
        : [];

    const handleSelectEmployee = (employee: Employee) => {
        setSelectedEmployee(employee);
        setSearchTerm('');
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setEvidenceImageUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            employeeId: selectedEmployee?.id || null,
            date, time, eventType, machineOrOperation, area, description, treatment, evidenceImageUrl
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Employee Search */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">1. Empleado Involucrado (Opcional)</label>
                {!selectedEmployee ? (
                    <div>
                        <input
                            type="text"
                            placeholder="Buscar por nombre o número..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        />
                         {searchTerm && (
                            <ul className="mt-2 border border-gray-200 rounded-md max-h-48 overflow-y-auto bg-white">
                                {filteredEmployees.length > 0 ? (
                                    filteredEmployees.map(emp => (
                                        <li key={emp.id} onClick={() => handleSelectEmployee(emp)} className="p-3 hover:bg-gray-100 cursor-pointer">
                                            <div className="flex justify-between items-center w-full">
                                                <span className="font-semibold text-dark-text">{emp.name}</span>
                                                <span className="text-sm text-medium-text">Nº: {emp.employeeNumber}</span>
                                            </div>
                                        </li>
                                    ))
                                ) : (<li className="p-3 text-gray-500">No se encontraron empleados.</li>)}
                            </ul>
                        )}
                    </div>
                ) : (
                    <div className="mt-1 p-4 border border-green-300 bg-green-50 rounded-md">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-bold text-dark-text">{selectedEmployee.name}</p>
                                <p className="text-sm text-medium-text">Nº: {selectedEmployee.employeeNumber} | Puesto: {selectedEmployee.position}</p>
                            </div>
                            <button type="button" onClick={() => setSelectedEmployee(null)} className="text-sm text-blue-600 hover:text-blue-800 font-semibold">Cambiar</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Incident Details */}
            <div className="space-y-4 pt-4 border-t mt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Fecha del Evento</label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Hora del Evento</label>
                        <input type="time" value={time} onChange={e => setTime(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tipo de Evento</label>
                        <select value={eventType} onChange={e => setEventType(e.target.value as EventType)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-dark-text" required>
                            <option className="text-dark-text">Accidente</option>
                            <option className="text-dark-text">Incidente</option>
                            <option className="text-dark-text">Condición Insegura</option>
                            <option className="text-dark-text">Acto Inseguro</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Máquina / Operación Involucrada</label>
                        <input type="text" value={machineOrOperation} onChange={e => setMachineOrOperation(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Área donde Ocurrió</label>
                        <input type="text" value={area} onChange={e => setArea(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
                    </div>
                </div>

                 <div>
                    <label className="block text-sm font-medium text-gray-700">Descripción Detallada del Evento</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Tratamiento / Procedimiento Aplicado</label>
                    <textarea value={treatment} onChange={e => setTreatment(e.target.value)} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Evidencia (Fotografía)</label>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-primary hover:file:bg-blue-100"/>
                    {evidenceImageUrl && <img src={evidenceImageUrl} alt="previsualización" className="mt-2 h-32 w-auto rounded shadow"/>}
                </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t mt-6">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md">Guardar y Generar Reporte</button>
            </div>
        </form>
    );
};


// Main page component
const Incidents: React.FC = () => {
    const [incidents, setIncidents] = useLocalStorage<Incident[]>('incidents', []);
    const [employees] = useLocalStorage<Employee[]>('employees', []);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [currentIncidentForReport, setCurrentIncidentForReport] = useState<Incident | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const { hasPermission } = useAuth();

    const handleSaveIncident = (incidentData: Omit<Incident, 'id' | 'folio'>) => {
        const lastFolioNumber = incidents.reduce((max, i) => {
            const num = parseInt(i.folio.split('-')[1], 10);
            return num > max ? num : max;
        }, 0);
        const newFolio = `I-${String(lastFolioNumber + 1).padStart(4, '0')}`;
        
        const newIncident: Incident = { 
            id: new Date().toISOString(), 
            folio: newFolio,
            ...incidentData
        };

        setIncidents(prev => [newIncident, ...prev]);
        setCurrentIncidentForReport(newIncident);
        setIsFormModalOpen(false);
        setIsReportModalOpen(true);
    };

    const handleViewReport = (incident: Incident) => {
        setCurrentIncidentForReport(incident);
        setIsReportModalOpen(true);
    };
    
    const getEmployeeName = (id: string | null) => {
      if (!id) return <span className="text-gray-400 italic">No aplica</span>;
      return employees.find(e => e.id === id)?.name || 'Desconocido';
    };

    const filteredIncidents = incidents.filter(incident => {
        if (!searchTerm) return true;
        const employee = employees.find(e => e.id === incident.employeeId);
        if (!employee) return false;
        const searchTermLower = searchTerm.toLowerCase();
        return (
            employee.name.toLowerCase().includes(searchTermLower) ||
            employee.employeeNumber.toLowerCase().includes(searchTermLower)
        );
    });

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-4 gap-4 flex-wrap">
                <h2 className="text-xl font-bold text-dark-text">Investigación de Incidentes</h2>
                <div className="flex items-center space-x-4">
                    <input
                        type="text"
                        placeholder="Buscar por empleado..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md"
                    />
                    {hasPermission('manage_incidents') && (
                        <button onClick={() => setIsFormModalOpen(true)} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark flex-shrink-0">
                            + Nuevo Reporte
                        </button>
                    )}
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Folio</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Empleado</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción Breve</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredIncidents.map(incident => (
                            <tr key={incident.id}>
                                <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-500">{incident.folio}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text">{new Date(incident.date + 'T00:00:00').toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text">{incident.eventType}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text">{getEmployeeName(incident.employeeId)}</td>
                                <td className="px-6 py-4 text-sm text-gray-500 max-w-sm truncate" title={incident.description}>{incident.description}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button onClick={() => handleViewReport(incident)} className="text-gray-600 hover:text-primary" title="Ver Reporte de Investigación">
                                        <ClipboardDocumentListIcon className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                         {filteredIncidents.length === 0 && (
                            <tr><td colSpan={6} className="text-center py-4 text-gray-500">
                                {incidents.length > 0 ? 'No se encontraron registros con ese criterio.' : 'No hay incidentes registrados.'}
                            </td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            {hasPermission('manage_incidents') && (
                <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title="Registrar Nuevo Reporte de Incidente">
                    <IncidentForm onSave={handleSaveIncident} onClose={() => setIsFormModalOpen(false)} employees={employees} />
                </Modal>
            )}
            <Modal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} title={`Reporte de Investigación - Folio ${currentIncidentForReport?.folio || ''}`}>
                {currentIncidentForReport && (
                    <IncidentReport 
                        incident={currentIncidentForReport} 
                        employee={employees.find(e => e.id === currentIncidentForReport.employeeId)}
                    />
                )}
            </Modal>
        </div>
    );
};

export default Incidents;
