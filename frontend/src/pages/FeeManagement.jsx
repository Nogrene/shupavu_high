import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { CreditCard, Plus, Search, Download, Filter, Loader2, DollarSign } from 'lucide-react';

const FeeManagement = () => {
    const [fees, setFees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [paymentData, setPaymentData] = useState({ amount: '', semester: 1, year: new Date().getFullYear() });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchFees();
    }, []);

    const fetchFees = async () => {
        try {
            const { data } = await api.get('/fees');
            setFees(data);
        } catch (error) {
            console.error('Error fetching fees', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.post('/fees/payment', {
                studentId: selectedStudent._id,
                ...paymentData,
                amount: Number(paymentData.amount)
            });
            fetchFees();
            setIsPaymentModalOpen(false);
            setPaymentData({ amount: '', semester: 1, year: new Date().getFullYear() });
        } catch (error) {
            alert('Payment failed');
        } finally {
            setSaving(false);
        }
    };

    const exportFeeReport = async () => {
        try {
            const response = await api.get('/reports/fees/excel', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'fee_report.xlsx');
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            alert('Export failed');
        }
    };

    const filteredFees = fees.filter(f =>
        f.student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.student?.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-6 text-center">Loading fee records...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Fee Management</h1>
                    <p className="text-secondary">Track and manage student payments</p>
                </div>
                <button onClick={exportFeeReport} className="btn btn-secondary">
                    <Download size={18} /> Export Report
                </button>
            </div>

            <div className="card">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                    <input
                        type="text"
                        placeholder="Search student..."
                        className="input pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Student</th>
                            <th>Total Paid</th>
                            <th>Balance</th>
                            <th>Status</th>
                            <th className="text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredFees.map((fee) => (
                            <tr key={fee._id}>
                                <td>
                                    <div className="flex items-center gap-3">
                                        <div className="avatar">
                                            {fee.student?.photo ? (
                                                <img src={`http://localhost:5000${fee.student.photo}`} alt={fee.student.name} />
                                            ) : (
                                                <span className="text-xs font-bold">{fee.student?.name?.charAt(0)}</span>
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{fee.student?.name}</span>
                                            <span className="text-xs text-secondary">{fee.student?.admissionNumber}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="font-medium text-success">Ksh {fee.totalPaid.toLocaleString()}</td>
                                <td className="font-medium text-error">Ksh {fee.balance.toLocaleString()}</td>
                                <td>
                                    <span className={`badge ${fee.balance <= 0 ? 'badge-success' : 'badge-danger'}`}>
                                        {fee.balance <= 0 ? 'Cleared' : 'Pending'}
                                    </span>
                                </td>
                                <td className="text-right">
                                    <button
                                        onClick={() => { setSelectedStudent(fee.student); setIsPaymentModalOpen(true); }}
                                        className="btn btn-primary text-xs py-1 px-3 ml-auto"
                                    >
                                        <Plus size={16} /> Record Payment
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isPaymentModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-surface rounded-lg w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-border flex justify-between items-center bg-accent text-white">
                            <div>
                                <h2 className="text-xl font-bold">Record Payment</h2>
                                <p className="text-blue-100 text-sm">{selectedStudent?.name}</p>
                            </div>
                            <button onClick={() => setIsPaymentModalOpen(false)} className="text-white hover:text-blue-100"><Plus size={24} className="rotate-45" /></button>
                        </div>
                        <form onSubmit={handlePayment} className="p-6 space-y-4">
                            <div className="form-group">
                                <label className="label">Amount (Ksh)</label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">Ksh</div>
                                    <input
                                        type="number"
                                        required
                                        className="input pl-12"
                                        value={paymentData.amount}
                                        onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="form-group">
                                    <label className="label">Semester</label>
                                    <select
                                        className="select"
                                        value={paymentData.semester}
                                        onChange={(e) => setPaymentData({ ...paymentData, semester: Number(e.target.value) })}
                                    >
                                        <option value="1">Semester 1</option>
                                        <option value="2">Semester 2</option>
                                        <option value="3">Semester 3</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="label">Year</label>
                                    <input
                                        type="number"
                                        className="input"
                                        value={paymentData.year}
                                        onChange={(e) => setPaymentData({ ...paymentData, year: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={saving}
                                className="btn btn-primary w-full mt-4"
                            >
                                {saving ? <Loader2 className="animate-spin" size={20} /> : <DollarSign size={20} />}
                                {saving ? 'Recording...' : 'Confirm Payment'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FeeManagement;
