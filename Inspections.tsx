
import React, { useState } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { Inspection, Employee, ViolationType, VIOLATION_TYPES } from '../types';
import Modal from '../components/Modal';
import { EyeIcon } from '../constants';
import { useAuth } from '../Auth';

// Form Component
const InspectionForm: React.FC<{
    onSave: (inspection: Omit<Inspection, 'id'>) => void;
    onClose: () => void;
    employees: Employee[];
}> = ({ onSave, onClose, employees }) => {
    // Employee search state
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

    // Form fields state
    const [violation, setViolation] = useState(false);
    const [selectedViolations, setSelectedViolations] = useState<ViolationType[]>([]);
    const [observations, setObservations] = useState('');

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
    
    const handleViolationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const hasViolation = e.target.value === 'yes';
        setViolation(hasViolation);
        if (!hasViolation) {
            setSelectedViolations([]); // Clear violations if "No" is selected
        }
    };

    const handleViolationTypeChange = (violationType: ViolationType) => {
        setSelectedViolations(prev =>
            prev.includes(violationType)
                ? prev.filter(v => v !== violationType)
                : [...prev, violationType]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedEmployee) {
            alert('Por favor, seleccione un empleado.');
            return;
        }
        if (violation && selectedViolations.length === 0) {
            alert('Si hubo una violación, debe seleccionar al menos un tipo.');
            return;
        }

        onSave({
            employeeId: selectedEmployee.id,
            date: new Date().toISOString(),
            violation,
            violations: violation ? selectedViolations : [],
            observations,
        });
        onClose();
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Employee Search */}
            <div>
                 <label className="block text-sm font-bold text-gray-700 mb-2">1. Buscar Empleado</label>
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
                                        <li key={emp.id} onClick={() => handleSelectEmployee(emp)} className="p-3 hover:bg-gray-100 cursor-pointer text-dark-text">
                                            {emp.name} ({emp.employeeNumber})
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
                                <p className="text-sm text-medium-text">Nº: {selectedEmployee.employeeNumber}</p>
                            </div>
                            <button type="button" onClick={() => setSelectedEmployee(null)} className="text-sm text-blue-600 hover:text-blue-800 font-semibold">Cambiar</button>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Inspection details */}
            {selectedEmployee && (
                <div className="space-y-4 pt-4 border-t">
                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">2. ¿Se detectó una violación en el uso de EPP?</label>
                        <div className="flex items-center space-x-4">
                            <label className="flex items-center">
                                <input type="radio" name="violation" value="yes" checked={violation === true} onChange={handleViolationChange} className="focus:ring-primary h-4 w-4 text-primary border-gray-300"/>
                                <span className="ml-2 text-gray-700">Sí</span>
                            </label>
                            <label className="flex items-center">
                                <input type="radio" name="violation" value="no" checked={violation === false} onChange={handleViolationChange} className="focus:ring-primary h-4 w-4 text-primary border-gray-300"/>
                                <span className="ml-2 text-gray-700">No</span>
                            </label>
                        </div>
                    </div>
                    
                    {violation && (
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">3. Tipos de Violación (marque todas las que apliquen)</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 border p-3 rounded-md max-h-48 overflow-y-auto">
                                {VIOLATION_TYPES.map(type => (
                                    <label key={type} className="flex items-center space-x-2 p-1 rounded-md hover:bg-gray-100">
                                        <input
                                            type="checkbox"
                                            checked={selectedViolations.includes(type)}
                                            onChange={() => handleViolationTypeChange(type)}
                                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <span className="text-sm text-gray-700">{type}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">{violation ? '4.' : '3.'} Observaciones</label>
                        <textarea
                            value={observations}
                            onChange={e => setObservations(e.target.value)}
                            rows={4}
                            placeholder="Añadir comentarios, acciones correctivas tomadas, etc."
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                        />
                    </div>
                </div>
            )}
            
            <div className="flex justify-end space-x-2 pt-4 border-t mt-6">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark" disabled={!selectedEmployee}>Guardar Inspección</button>
            </div>
        </form>
    );
};


// Main Page Component
const Inspections: React.FC = () => {
    const [inspections, setInspections] = useLocalStorage<Inspection[]>('inspections', []);
    const [employees] = useLocalStorage<Employee[]>('employees', []);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const { hasPermission } = useAuth();

    const handleSaveInspection = (inspectionData: Omit<Inspection, 'id'>) => {
        const newInspection: Inspection = {
            id: new Date().toISOString(),
            ...inspectionData
        };
        setInspections(prev => [newInspection, ...prev]);
        setIsFormModalOpen(false);
    };

    const handleViewDetails = (inspection: Inspection) => {
        setSelectedInspection(inspection);
        setIsViewModalOpen(true);
    };
    
    const getEmployeeName = (id: string) => employees.find(e => e.id === id)?.name || 'N/A';
    
    const filteredInspections = inspections.filter(inspection => {
        if (!searchTerm) return true;
        const employee = employees.find(e => e.id === inspection.employeeId);
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
                <h2 className="text-xl font-bold text-dark-text">Inspecciones de EPP</h2>
                <div className="flex items-center space-x-4">
                    <input
                        type="text"
                        placeholder="Buscar por empleado..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    />
                    {hasPermission('manage_inspections') && (
                        <button onClick={() => setIsFormModalOpen(true)} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark flex-shrink-0">
                            + Nueva Inspección
                        </button>
                    )}
                </div>
            </div>
             <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Empleado</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Violación</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Observaciones</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredInspections.map(item => (
                            <tr key={item.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(item.date).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{getEmployeeName(item.employeeId)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {item.violation ? (
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Sí</span>
                                    ) : (
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">No</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 max-w-md truncate" title={item.observations}>{item.observations || 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button onClick={() => handleViewDetails(item)} className="text-gray-600 hover:text-primary" title="Ver Detalles">
                                        <EyeIcon className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredInspections.length === 0 && (
                             <tr>
                                <td colSpan={5} className="text-center py-4 text-gray-500">
                                    {inspections.length > 0 ? 'No se encontraron inspecciones con ese criterio.' : 'No hay inspecciones registradas.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {hasPermission('manage_inspections') && (
                <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title="Registrar Nueva Inspección de EPP">
                    <InspectionForm
                        onSave={handleSaveInspection}
                        onClose={() => setIsFormModalOpen(false)}
                        employees={employees}
                    />
                </Modal>
            )}
            
            <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Detalles de la Inspección">
                {selectedInspection && (() => {
                    const employee = employees.find(e => e.id === selectedInspection.employeeId);
                    return (
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-bold text-lg text-dark-text">{employee?.name || 'Empleado no encontrado'}</h3>
                                <p className="text-sm text-medium-text">Número de Empleado: {employee?.employeeNumber || 'N/A'}</p>
                                <p className="text-sm text-medium-text">Fecha: {new Date(selectedInspection.date).toLocaleString()}</p>
                            </div>
                            <div className="border-t pt-4">
                                <p className="font-semibold text-dark-text">Violación Detectada: 
                                    <span className={`ml-2 font-bold ${selectedInspection.violation ? 'text-red-600' : 'text-green-600'}`}>
                                        {selectedInspection.violation ? 'Sí' : 'No'}
                                    </span>
                                </p>
                            </div>
                            {selectedInspection.violation && selectedInspection.violations.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-dark-text">Incumplimientos Específicos:</h4>
                                    <ul className="list-disc list-inside mt-2 space-y-1">
                                        {selectedInspection.violations.map(v => (
                                            <li key={v} className="text-medium-text">{v}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                             <div>
                                <h4 className="font-semibold text-dark-text">Observaciones:</h4>
                                <p className="text-medium-text whitespace-pre-wrap">
                                    {selectedInspection.observations || 'Sin observaciones.'}
                                </p>
                            </div>
                        </div>
                    );
                })()}
            </Modal>
        </div>
    );
};

export default Inspections;
