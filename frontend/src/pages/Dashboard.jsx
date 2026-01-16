import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Users, GraduationCap, DollarSign, AlertCircle, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LabelList } from 'recharts';

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map((card) => (
                    <div key={card.title} className="card flex items-center justify-between p-6 shadow-md hover:shadow-lg transition-shadow">
                        <div>
                            <p className="text-sm font-medium text-secondary flex items-center gap-1">
                                <card.icon size={16} className="text-muted" />
                                {card.title}
                            </p>
                            <h3 className="text-2xl font-bold mt-1 text-main">{card.value}</h3>
                        </div>
                        <div className={`p-4 rounded-xl text-white ${card.color} shadow-sm`}>
                            <card.icon size={28} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 mt-6 gap-6">
                <div className="card shadow-md">
                    <div className="flex items-center gap-2 mb-6">
                        <Users className="text-accent" size={20} />
                        <h3 className="text-lg font-bold">Students per Form</h3>
                    </div>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats?.studentsPerForm.map(s => ({ name: `Form ${s._id}`, count: s.count }))}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ fill: '#f8fafc' }}
                                />
                                <Bar dataKey="count" fill="var(--accent)" radius={[6, 6, 0, 0]} barSize={40}>
                                    <LabelList dataKey="count" position="top" style={{ fill: '#64748b', fontSize: '12px', fontWeight: 'bold' }} />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card shadow-md">
                    <div className="flex items-center gap-2 mb-6">
                        <DollarSign className="text-success" size={20} />
                        <h3 className="text-lg font-bold">Fee Clearance Status</h3>
                    </div>
                    <div className="h-80 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats?.clearance}
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={8}
                                    dataKey="value"
                                    label={({ name, value }) => `${name}: ${value}`}
                                >
                                    {stats?.clearance.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 0 ? 'var(--success)' : 'var(--error)'} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-8 mt-4">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-md" style={{ backgroundColor: 'var(--success)' }}></div>
                            <span className="text-sm font-semibold text-secondary">Cleared ({stats?.clearance[0].value})</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-md" style={{ backgroundColor: 'var(--error)' }}></div>
                            <span className="text-sm font-semibold text-secondary">Uncleared ({stats?.clearance[1].value})</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
