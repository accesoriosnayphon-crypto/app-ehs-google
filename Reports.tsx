import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import useLocalStorage from '../hooks/useLocalStorage';
import { Incident, Employee } from '../types';

const Reports: React.FC = () => {
    const [incidents] = useLocalStorage<Incident[]>('incidents', []);
    const [employees] = useLocalStorage<Employee[]>('employees', []);

    const incidentsByMonth = incidents.reduce((acc, incident) => {
        const month = new Date(incident.date).toLocaleString('es-ES', { month: 'short', year: 'numeric' });
        const found = acc.find(item => item.name === month);
        if (found) {
            found.incidentes++;
        } else {
            acc.push({ name: month, incidentes: 1 });
        }
        return acc;
    }, [] as { name: string, incidentes: number }[]).sort((a,b) => new Date(a.name).getTime() - new Date(b.name).getTime());
    
    const incidentsByEventType = incidents.reduce((acc, incident) => {
        const eventType = incident.eventType;
        const found = acc.find(item => item.name === eventType);
        if (found) {
            found.value++;
        } else {
            acc.push({ name: eventType, value: 1 });
        }
        return acc;
    }, [] as { name: string, value: number }[]);

    const incidentsByDepartment = incidents.reduce((acc, incident) => {
        const employee = employees.find(e => e.id === incident.employeeId);
        if (employee) {
            const department = employee.department;
            const found = acc.find(item => item.name === department);
            if (found) {
                found.incidentes++;
            } else {
                acc.push({ name: department, incidentes: 1 });
            }
        }
        return acc;
    }, [] as { name: string, incidentes: number }[]);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-lg h-96">
                <h3 className="text-lg font-bold text-dark-text mb-4">Incidentes por Mes</h3>
                {incidents.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={incidentsByMonth} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis allowDecimals={false}/>
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="incidentes" fill="#8884d8" name="Nº de Incidentes" />
                        </BarChart>
                    </ResponsiveContainer>
                ) : <p className="text-center text-medium-text mt-16">No hay datos de incidentes para mostrar.</p>}
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg h-96">
                <h3 className="text-lg font-bold text-dark-text mb-4">Incidentes por Tipo de Evento</h3>
                {incidents.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={incidentsByEventType}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={120}
                                fill="#8884d8"
                                dataKey="value"
                                nameKey="name"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {incidentsByEventType.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                ) : <p className="text-center text-medium-text mt-16">No hay datos de incidentes para mostrar.</p>}
            </div>
            
             <div className="bg-white p-6 rounded-xl shadow-lg h-96">
                <h3 className="text-lg font-bold text-dark-text mb-4">Incidentes por Departamento</h3>
                {incidents.length > 0 && employees.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={incidentsByDepartment} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" allowDecimals={false} />
                            <YAxis type="category" dataKey="name" width={100} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="incidentes" fill="#82ca9d" name="Nº de Incidentes" />
                        </BarChart>
                    </ResponsiveContainer>
                ) : <p className="text-center text-medium-text mt-16">No hay datos de incidentes por departamento.</p>}
            </div>
        </div>
    );
};

export default Reports;