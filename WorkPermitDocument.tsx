import React from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { WorkPermit, User, Jha, AppSettings } from '../types';

interface WorkPermitDocumentProps {
  permit: WorkPermit;
  users: User[];
  jhas: Jha[];
}

const WorkPermitDocument: React.FC<WorkPermitDocumentProps> = ({ permit, users, jhas }) => {
    const [settings] = useLocalStorage<AppSettings>('app_settings', {
        companyName: 'EHS Integral Management',
        companyAddress: '',
        companyPhone: '',
        companyLogo: '',
    });
    
    const handlePrint = () => {
        window.print();
    };
    
    const getStatusClass = (status: string) => {
        switch(status) {
            case 'Aprobado': return 'bg-green-100 text-green-800 border-green-300';
            case 'En Progreso': return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'Cerrado': return 'bg-gray-200 text-gray-800 border-gray-300';
            case 'Rechazado': return 'bg-red-100 text-red-800 border-red-300';
            case 'Solicitado': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    
    const requester = users.find(u => u.id === permit.requesterUserId);
    const approver = users.find(u => u.id === permit.approverUserId);
    const closer = users.find(u => u.id === permit.closerUserId);
    const linkedJha = jhas.find(j => j.id === permit.jhaId);

    return (
        <div className="text-dark-text">
            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    #print-section-permit, #print-section-permit * { visibility: visible; }
                    #print-section-permit { position: absolute; left: 0; top: 0; width: 100%; padding: 20px; font-size: 10px; }
                    .no-print { display: none; }
                    .print-bg-transparent { background-color: transparent !important; }
                }
            `}</style>
            <div id="print-section-permit" className="p-4">
                <header className="flex justify-between items-start border-b pb-4 mb-4">
                    <div>
                        {settings.companyLogo && <img src={settings.companyLogo} alt={`${settings.companyName} Logo`} className="h-12 w-auto mb-2" />}
                        <h1 className="text-2xl font-bold text-gray-900">Permiso de Trabajo de Alto Riesgo</h1>
                        <p className="text-gray-600">{settings.companyName || 'EHS Integral Management'}</p>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-lg text-gray-900">Folio: <span className="text-primary font-mono">{permit.folio}</span></p>
                        <p className={`mt-1 font-bold text-lg border p-1 rounded-md ${getStatusClass(permit.status)} print-bg-transparent`}>{permit.status.toUpperCase()}</p>
                    </div>
                </header>
                
                <section className="mb-4">
                    <h2 className="text-lg font-bold border-b mb-2 pb-1 text-gray-900">1. Información General</h2>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                        <div><strong>Título del Trabajo:</strong> {permit.title}</div>
                        <div><strong>Tipo de Permiso:</strong> {permit.type}</div>
                        <div><strong>Ubicación:</strong> {permit.location}</div>
                        <div><strong>JHA Vinculado:</strong> {linkedJha ? `${linkedJha.title} (${linkedJha.area})` : 'N/A'}</div>
                        <div><strong>Válido Desde:</strong> {permit.validFrom ? new Date(permit.validFrom).toLocaleString() : 'N/A'}</div>
                        <div><strong>Válido Hasta:</strong> {permit.validTo ? new Date(permit.validTo).toLocaleString() : 'N/A'}</div>
                    </div>
                </section>
                
                <section className="mb-4">
                    <h2 className="text-lg font-bold border-b mb-2 pb-1 text-gray-900">2. Descripción del Trabajo</h2>
                    <p className="text-sm whitespace-pre-wrap">{permit.description}</p>
                </section>

                <section className="mb-4">
                     <h2 className="text-lg font-bold border-b mb-2 pb-1 text-gray-900">3. Precauciones de Seguridad</h2>
                     <div className="grid grid-cols-2 gap-x-6 text-sm">
                         <div>
                            <h3 className="font-semibold mb-1">Equipo a Utilizar:</h3>
                            <ul className="list-disc list-inside">
                                {permit.equipment.length > 0 ? permit.equipment.map((item, i) => <li key={i}>{item}</li>) : <li>Ninguno especificado.</li>}
                            </ul>
                         </div>
                         <div>
                            <h3 className="font-semibold mb-1">EPP Requerido:</h3>
                            <ul className="list-disc list-inside">
                                {permit.ppe.length > 0 ? permit.ppe.map((item, i) => <li key={i}>{item}</li>) : <li>Ninguno especificado.</li>}
                            </ul>
                         </div>
                     </div>
                </section>
                
                <section className="mb-4">
                    <h2 className="text-lg font-bold border-b mb-2 pb-1 text-gray-900">4. Autorizaciones</h2>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                        <div><strong>Solicitado por:</strong> {requester?.fullName || 'N/A'}</div>
                        <div><strong>Fecha de Solicitud:</strong> {new Date(permit.requestDate).toLocaleDateString()}</div>
                        <div><strong>Aprobado por:</strong> {approver?.fullName || 'Pendiente'}</div>
                        <div><strong>Cerrado por:</strong> {closer?.fullName || 'Pendiente'}</div>
                    </div>
                </section>
                
                <footer className="pt-12 mt-8 grid grid-cols-3 gap-8 text-center text-sm">
                    <div>
                        <hr className="border-gray-400 mb-2"/>
                        <p className="font-semibold text-gray-800">Firma del Solicitante</p>
                        <p className="text-xs">{requester?.fullName}</p>
                    </div>
                    <div>
                        <hr className="border-gray-400 mb-2"/>
                        <p className="font-semibold text-gray-800">Firma de Aprobación (Seguridad)</p>
                         <p className="text-xs">{approver?.fullName || '________________'}</p>
                    </div>
                    <div>
                        <hr className="border-gray-400 mb-2"/>
                        <p className="font-semibold text-gray-800">Firma de Cierre</p>
                         <p className="text-xs">{closer?.fullName || '________________'}</p>
                    </div>
                </footer>
            </div>
            <div className="flex justify-end pt-4 border-t mt-4 no-print">
                <button type="button" onClick={handlePrint} className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">
                    Imprimir Permiso
                </button>
            </div>
        </div>
    );
};

export default WorkPermitDocument;