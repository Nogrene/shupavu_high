import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { User, Mail, Smartphone, MapPin, Calendar, CreditCard, ChevronLeft, Download } from 'lucide-react';

const StudentProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [feeRecord, setFeeRecord] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [studentRes, feeRes] = await Promise.all([
                    api.get(`/students/${id}`),
                    api.get(`/fees/student/${id}`)
                ]);
                setStudent(studentRes.data);
                setFeeRecord(feeRes.data);
            } catch (error) {
                console.error('Error fetching student details', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

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
                                    <img src={`http://localhost:5000${student.photo}`} className="w-full h-full rounded-[20px] object-cover" alt="" />
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
                                {student.isCleared ? 'Cleared for Exams' : 'Fees Outstanding'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Details & Fees */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <CreditCard size={20} className="text-blue-600" /> Fee Summary
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <p className="text-sm text-gray-500 mb-1">Total Paid</p>
                                <h4 className="text-xl font-bold text-green-600">Ksh {feeRecord?.totalPaid?.toLocaleString()}</h4>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <p className="text-sm text-gray-500 mb-1">Balance Due</p>
                                <h4 className="text-xl font-bold text-red-600">Ksh {feeRecord?.balance?.toLocaleString()}</h4>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <p className="text-sm text-gray-500 mb-1">Percentage Paid</p>
                                <h4 className="text-xl font-bold text-blue-600">
                                    {feeRecord ? Math.round((feeRecord.totalPaid / (feeRecord.totalPaid + feeRecord.balance)) * 100) : 0}%
                                </h4>
                            </div>
                        </div>

                        <h3 className="text-lg font-bold text-gray-800 mb-4">Payment History</h3>
                        <div className="overflow-hidden border border-gray-100 rounded-xl">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Date</th>
                                        <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Semester</th>
                                        <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Year</th>
                                        <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {feeRecord?.payments.map((p, i) => (
                                        <tr key={i} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm text-gray-600">{new Date(p.date).toLocaleDateString()}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">Sem {p.semester}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{p.year}</td>
                                            <td className="px-4 py-3 text-sm font-semibold text-gray-800 text-right">Ksh {p.amount.toLocaleString()}</td>
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
        </div>
    );
};

export default StudentProfile;
