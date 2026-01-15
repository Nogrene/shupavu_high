import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Link } from 'react-router-dom';
import { Users, Plus, Download, Search, Filter, Edit, Trash2, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import StudentModal from '../components/StudentModal';

const StudentList = () => {
    const { user } = useAuth();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [formFilter, setFormFilter] = useState('');
    const [streamFilter, setStreamFilter] = useState('');
    const [settings, setSettings] = useState({ streams: [] });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [studentsRes, settingsRes] = await Promise.all([
                api.get('/students'),
                api.get('/settings')
            ]);
            setStudents(studentsRes.data);
            setSettings(settingsRes.data);
        } catch (error) {
            console.error('Error fetching students', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this student?')) {
            try {
                await api.delete(`/students/${id}`);
                setStudents(students.filter(s => s._id !== id));
            } catch (error) {
                alert('Failed to delete student');
            }
        }
    };

    const exportToExcel = async () => {
        try {
            const response = await api.get('/reports/students/excel', {
                params: { form: formFilter, stream: streamFilter },
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'students.xlsx');
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            alert('Export failed');
        }
    };

    const openAddModal = () => {
        setSelectedStudent(null);
        setIsModalOpen(true);
    };

    const openEditModal = (student) => {
        setSelectedStudent(student);
        setIsModalOpen(true);
    };

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase())
    ).filter(s => formFilter === '' || s.form === Number(formFilter))
        .filter(s => streamFilter === '' || s.stream === streamFilter);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Student Directory</h1>
                    <p className="text-secondary">Manage all students in Shupavu High</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={exportToExcel} className="btn btn-secondary">
                        <Download size={18} /> Export
                    </button>
                    <button onClick={openAddModal} className="btn btn-primary">
                        <Plus size={18} /> Add Student
                    </button>
                </div>
            </div>

            <div className="card flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[300px] relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name or admission number..."
                        className="input pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-4">
                    <select
                        className="select"
                        value={formFilter}
                        onChange={(e) => setFormFilter(e.target.value)}
                    >
                        <option value="">All Forms</option>
                        <option value="1">Form 1</option>
                        <option value="2">Form 2</option>
                        <option value="3">Form 3</option>
                        <option value="4">Form 4</option>
                    </select>
                    <select
                        className="select"
                        value={streamFilter}
                        onChange={(e) => setStreamFilter(e.target.value)}
                    >
                        <option value="">All Streams</option>
                        {settings.streams.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>

            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Student</th>
                            <th>Admission No</th>
                            <th>Form</th>
                            <th>Stream</th>
                            <th>Status</th>
                            <th className="text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.map((student) => (
                            <tr key={student._id}>
                                <td>
                                    <div className="flex items-center gap-3">
                                        <div className="avatar">
                                            {student.photo ? <img src={`http://localhost:5000${student.photo}`} alt={student.name} /> : <Users size={20} />}
                                        </div>
                                        <div className="font-semibold text-gray-800">{student.name}</div>
                                    </div>
                                </td>
                                <td className="text-secondary">{student.admissionNumber}</td>
                                <td className="text-secondary">{student.form}</td>
                                <td className="text-secondary">{student.stream}</td>
                                <td>
                                    <span className={`badge ${student.isCleared ? 'badge-success' : 'badge-danger'}`}>
                                        {student.isCleared ? 'Cleared' : 'Uncleared'}
                                    </span>
                                </td>
                                <td className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Link to={`/students/${student._id}`} className="text-accent hover:text-accent-hover p-1"><Eye size={18} /></Link>
                                        <button onClick={() => openEditModal(student)} className="text-secondary hover:text-main p-1"><Edit size={18} /></button>
                                        {user?.role === 'Admin' && <button onClick={() => handleDelete(student._id)} className="text-error hover:text-red-700 p-1"><Trash2 size={18} /></button>}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredStudents.length === 0 && <div className="p-12 text-center text-secondary">No students found</div>}
            </div>

            <StudentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                student={selectedStudent}
                onSave={fetchData}
                settings={settings}
            />
        </div>
    );
};

export default StudentList;
