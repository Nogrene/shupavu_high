import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { FILE_BASE_URL } from '../utils/api';
import { User, Mail, Smartphone, MapPin, Calendar, CreditCard, ChevronLeft, Download, AlertCircle, Edit, Trash2 } from 'lucide-react';

const StudentProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [feeRecord, setFeeRecord] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editingPayment, setEditingPayment] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [settings, setSettings] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [studentRes, feeRes, settingsRes] = await Promise.all([
                api.get(`/students/${id}`),
                api.get(`/fees/student/${id}`),
                api.get('/settings')
            ]);
            setStudent(studentRes.data);
            setFeeRecord(feeRes.data);
            setSettings(settingsRes.data);
        } catch (error) {
            console.error('Error fetching student details', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const handleDeletePayment = async (paymentId) => {
        if (!window.confirm('Are you sure you want to delete this payment record?')) return;
        setDeleting(true);
        try {
            await api.delete(`/fees/payment/${id}/${paymentId}`);
            fetchData();
        } catch (error) {
            alert('Failed to delete payment');
        } finally {
            setDeleting(false);
        }
    };

    const handleUpdatePayment = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/fees/payment/${id}/${editingPayment._id}`, editingPayment);
            setEditingPayment(null);
            fetchData();
        } catch (error) {
            alert('Failed to update payment');
        }
    };

    if (loading) return <div className="p-6 text-center">Loading student profile...</div>;
    if (!student) return <div className="p-6 text-center text-red-500">Student not found</div>;

    return (
        <div className="space-y-6">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                <ChevronLeft size={20} /> Back to Directory
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
                        <div className="p-6 pt-0 -mt-16 text-center">
                            <div className="w-32 h-32 rounded-3xl bg-white p-1 mx-auto shadow-lg">
                                {student.photo ? (
                                    <img
                                        src={student.photo.startsWith('http') ? student.photo : `${FILE_BASE_URL}${student.photo}`}
                                        className="w-full h-full rounded-[20px] object-cover"
                                        alt=""
                                    />
                                ) : (
                                    <div className="w-full h-full rounded-[20px] bg-gray-100 flex items-center justify-center text-gray-400">
                                        <User size={48} />
                                    </div>
                                )}
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mt-4">{student.name}</h2>
                            <p className="text-blue-600 font-semibold mt-1">Adm: {student.admissionNumber}</p>
                            <div className="flex justify-center gap-3 mt-4">
                                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold uppercase">Form {student.form}</span>
                                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold uppercase">Stream {student.stream}</span>
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-50 flex justify-center">
                            <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase ${student.isCleared ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {student.isCleared ? `Cleared for Exams — Ksh ${feeRecord?.totalPaid?.toLocaleString()}` : 'Fees Outstanding'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Details & Fees */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <CreditCard size={20} className="text-blue-600" /> Fee Summary (Annual: Ksh {(settings?.totalFeePerTerm * 3 || 45000).toLocaleString()})
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <p className="text-sm text-gray-500 mb-1">Total Paid (Overall)</p>
                                <h4 className="text-xl font-bold text-green-600">Ksh {feeRecord?.totalPaid?.toLocaleString()}</h4>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <p className="text-sm text-gray-500 mb-1">Annual Balance</p>
                                <h4 className="text-xl font-bold text-red-600">Ksh {feeRecord?.balance?.toLocaleString()}</h4>
                            </div>
                            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                <p className="text-sm text-blue-600 mb-1 font-semibold uppercase tracking-wider">Fee Clearance</p>
                                <h4 className="text-xl font-bold text-blue-700">
                                    {feeRecord ? Math.min(100, Math.round((feeRecord.totalPaid / (settings?.totalFeePerTerm * 3 || 45000)) * 100)) : 0}%
                                </h4>
                            </div>
                        </div>

                        <div className="overflow-hidden border border-gray-100 rounded-xl">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-gray-600 font-bold uppercase tracking-tight">
                                    <tr>
                                        <th className="px-6 py-4">Term</th>
                                        <th className="px-6 py-4 text-right">Target</th>
                                        <th className="px-6 py-4 text-right">Paid</th>
                                        <th className="px-6 py-4 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {[1, 2, 3].map(termNum => {
                                        const termTarget = settings?.totalFeePerTerm || 15000;
                                        const cumulativeTarget = termNum * termTarget;
                                        const amountPaidInThisTermArea = Math.max(0, Math.min(termTarget, (feeRecord?.totalPaid || 0) - (termNum - 1) * termTarget));

                                        return (
                                            <tr key={termNum} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4 font-bold text-gray-700">Term {termNum}</td>
                                                <td className="px-6 py-4 text-right text-gray-500 font-mono">Ksh {termTarget.toLocaleString()}</td>
                                                <td className="px-6 py-4 text-right font-bold text-main font-mono">Ksh {amountPaidInThisTermArea.toLocaleString()}</td>
                                                <td className="px-6 py-4 text-center">
                                                    {amountPaidInThisTermArea >= termTarget ? (
                                                        <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Cleared</span>
                                                    ) : amountPaidInThisTermArea > 0 ? (
                                                        <span className="bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Partial</span>
                                                    ) : (
                                                        <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Pending</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <p className="mt-4 text-[11px] text-secondary italic flex items-center gap-1">
                            <AlertCircle size={14} className="text-accent" />
                            Overpayments are automatically carried forward to subsequent terms.
                        </p>

                        <h3 className="text-lg font-bold text-gray-800 mb-4">Payment History</h3>
                        <div className="overflow-hidden border border-gray-100 rounded-xl">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Date</th>
                                        <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Term</th>
                                        <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Year</th>
                                        <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase text-right">Amount</th>
                                        <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {feeRecord?.payments.map((p, i) => (
                                        <tr key={p._id || i} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm text-gray-600">{new Date(p.date).toLocaleDateString()}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">Term {p.term || p.semester}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{p.year}</td>
                                            <td className="px-4 py-3 text-sm font-semibold text-gray-800 text-right">Ksh {p.amount.toLocaleString()}</td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex justify-center gap-2">
                                                    <button onClick={() => setEditingPayment(p)} className="p-1 hover:text-blue-600 transition-colors"><Edit size={14} /></button>
                                                    <button onClick={() => handleDeletePayment(p._id)} className="p-1 hover:text-red-600 transition-colors"><Trash2 size={14} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {(!feeRecord?.payments || feeRecord.payments.length === 0) && (
                                        <tr>
                                            <td colSpan="4" className="px-4 py-8 text-center text-gray-500 text-sm">No payments recorded yet</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {editingPayment && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-surface rounded-lg w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-border flex justify-between items-center bg-accent text-white">
                            <h2 className="text-xl font-bold">Edit Payment</h2>
                            <button onClick={() => setEditingPayment(null)} className="text-white hover:text-blue-100 flex items-center justify-center w-8 h-8 rounded-full hover:bg-white/10 transition-colors">
                                <Plus size={24} className="rotate-45" />
                            </button>
                        </div>
                        <form onSubmit={handleUpdatePayment} className="p-6 space-y-4">
                            <div className="form-group">
                                <label className="label">Amount (Ksh)</label>
                                <input
                                    type="number"
                                    required
                                    className="input"
                                    value={editingPayment.amount}
                                    onChange={(e) => setEditingPayment({ ...editingPayment, amount: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="form-group">
                                    <label className="label">Term</label>
                                    <select
                                        className="select"
                                        value={editingPayment.term || editingPayment.semester}
                                        onChange={(e) => setEditingPayment({ ...editingPayment, term: Number(e.target.value) })}
                                    >
                                        <option value="1">Term 1</option>
                                        <option value="2">Term 2</option>
                                        <option value="3">Term 3</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="label">Year</label>
                                    <input
                                        type="number"
                                        className="input"
                                        value={editingPayment.year}
                                        onChange={(e) => setEditingPayment({ ...editingPayment, year: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary w-full mt-4">Save Changes</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentProfile;
