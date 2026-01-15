import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Users, GraduationCap, DollarSign, AlertCircle, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/reports/dashboard');
                setStats(data);
            } catch (error) {
                console.error('Error fetching dashboard stats', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="p-6 text-center">Loading dashboard...</div>;

    const COLORS = ['#22c55e', '#ef4444'];

    const cards = [
        { title: 'Total Students', value: stats?.totalStudents, icon: Users, color: 'bg-blue-500' },
        { title: 'Fees Collected', value: `Ksh ${stats?.totalCollected.toLocaleString()}`, icon: TrendingUp, color: 'bg-green-500' },
        { title: 'Outstanding Balance', value: `Ksh ${stats?.totalBalance.toLocaleString()}`, icon: DollarSign, color: 'bg-red-500' },
        { title: 'Cleared Students', value: stats?.clearance[0].value, icon: GraduationCap, color: 'bg-emerald-500' },
    ];

    return (
        <div className="flex-col gap-6">
            <div className="grid grid-cols-1 lg:grid-cols-4">
                {cards.map((card) => (
                    <div key={card.title} className="card flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-secondary">{card.title}</p>
                            <h3 className="text-2xl font-bold mt-1">{card.value}</h3>
                        </div>
                        <div className="p-3 rounded-lg text-white" style={{ backgroundColor: card.color }}>
                            <card.icon size={24} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 mt-6">
                <div className="card">
                    <h3 className="text-lg font-semibold mb-4">Students per Form</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats?.studentsPerForm.map(s => ({ name: `Form ${s._id}`, count: s.count }))}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="count" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card">
                    <h3 className="text-lg font-semibold mb-4">Fee Clearance Status</h3>
                    <div className="h-80 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats?.clearance}
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {stats?.clearance.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 0 ? 'var(--success)' : 'var(--error)'} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-6 mt-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--success)' }}></div>
                            <span className="text-sm text-secondary">Cleared</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--error)' }}></div>
                            <span className="text-sm text-secondary">Uncleared</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
