import React from 'react';
import DashboardCard from '../components/DashboardCard';
import { UserGroupIcon, ShieldCheckIcon, ExclamationTriangleIcon, AcademicCapIcon, ArrowPathIcon } from '../constants';
import useLocalStorage from '../hooks/useLocalStorage';
import { Employee, Incident, PpeItem, Training, Waste, WasteLog } from '../types';

const Dashboard: React.FC = () => {
    const [employees] = useLocalStorage<Employee[]>('employees', []);
    const [incidents] = useLocalStorage<Incident[]>('incidents', []);
    const [ppeItems] = useLocalStorage<PpeItem[]>('ppe_items', []);
    const [trainings] = useLocalStorage<Training[]>('trainings', []);
    const [wasteLogs] = useLocalStorage<WasteLog[]>('waste_logs', []);
    const [wastes] = useLocalStorage<Waste[]>('wastes', []);

    const totalPpeStock = ppeItems.reduce((sum, item) => {
        const stockValue = parseFloat(String(item.stock)) || 0;
        return sum + stockValue;
    }, 0);
    
    // Logic for upcoming trainings
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to the start of the day
    const fifteenDaysFromNow = new Date();
    fifteenDaysFromNow.setDate(today.getDate() + 15);

    const upcomingTrainings = trainings
        .filter(training => {
            const trainingDate = new Date(training.date + 'T00:00:00'); // Treat date string as local date
            return trainingDate >= today && trainingDate <= fifteenDaysFromNow;
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
    // Logic for waste generated in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    const hazardousWasteGenerated = wasteLogs.filter(log => {
        const logDate = new Date(log.date + 'T00:00:00');
        const wasteInfo = wastes.find(w => w.id === log.wasteId);
        return wasteInfo?.type === 'Peligroso' && logDate >= thirtyDaysAgo;
    }).reduce((sum, log) => sum + (log.unit === 'Kg' ? log.quantity : 0), 0); // Sum only kgs for simplicity


    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <DashboardCard 
                    title="Total de Empleados"
                    value={employees.length}
                    icon={<UserGroupIcon className="w-8 h-8 text-blue-500" />}
                    colorClass="bg-blue-100"
                />
                <DashboardCard 
                    title="Total de Incidentes"
                    value={incidents.length}
                    icon={<ExclamationTriangleIcon className="w-8 h-8 text-red-500" />}
                    colorClass="bg-red-100"
                />
                <DashboardCard 
                    title="Stock Total de EPP"
                    value={totalPpeStock}
                    icon={<ShieldCheckIcon className="w-8 h-8 text-green-500" />}
                    colorClass="bg-green-100"
                />
                 <DashboardCard 
                    title="Residuo Peligroso (30d)"
                    value={`${hazardousWasteGenerated.toFixed(2)} Kg`}
                    icon={<ArrowPathIcon className="w-8 h-8 text-purple-500" />}
                    colorClass="bg-purple-100"
                />
                <DashboardCard 
                    title="Capacitaciones"
                    value={trainings.length}
                    icon={<AcademicCapIcon className="w-8 h-8 text-yellow-500" />}
                    colorClass="bg-yellow-100"
                />
            </div>

            <div className="mt-8 bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-bold text-dark-text mb-4">Bienvenido al Sistema de Gestión EHS</h2>
                <p className="text-medium-text">
                    Utilice la navegación de la izquierda para gestionar empleados, equipos de protección personal, incidentes y capacitaciones. 
                    La sección de reportes le proporcionará una visión gráfica de todos los datos registrados.
                </p>
            </div>
            
             <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-lg font-bold text-dark-text mb-4">Últimos Incidentes</h3>
                    {incidents.slice(-5).reverse().map(incident => (
                        <div key={incident.id} className="border-b last:border-b-0 py-2">
                            <p className="font-semibold text-dark-text">{incident.machineOrOperation}</p>
                            <p className="text-sm text-medium-text">Fecha: {new Date(incident.date + 'T00:00:00').toLocaleDateString()}</p>
                        </div>
                    ))}
                    {incidents.length === 0 && <p className="text-medium-text">No hay incidentes registrados.</p>}
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-lg font-bold text-dark-text mb-4">Próximas Capacitaciones (Próximos 15 días)</h3>
                     {upcomingTrainings.length > 0 ? (
                        upcomingTrainings.map(training => (
                             <div key={training.id} className="border-b last:border-b-0 py-2">
                                <p className="font-semibold text-dark-text">{training.topic}</p>
                                <p className="text-sm text-medium-text">Fecha: {new Date(training.date + 'T00:00:00').toLocaleDateString()}</p>
                            </div>
                        ))
                     ) : (
                        <p className="text-medium-text">No hay capacitaciones programadas para los próximos 15 días.</p>
                     )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;