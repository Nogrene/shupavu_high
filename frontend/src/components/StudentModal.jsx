import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { X, Upload, Save, Loader2 } from 'lucide-react';

const StudentModal = ({ isOpen, onClose, student, onSave, settings }) => {
    const [formData, setFormData] = useState({
        name: '',
        admissionNumber: '',
        form: 1,
        stream: '',
    });
    const [photo, setPhoto] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (student) {
            setFormData({
                name: student.name,
                admissionNumber: student.admissionNumber,
                form: student.form,
                stream: student.stream,
            });
        } else {
            setFormData({
                name: '',
                admissionNumber: '',
                form: 1,
                stream: settings?.streams[0] || '',
            });
        }
    }, [student, settings, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const data = new FormData();
        data.append('name', formData.name);
        data.append('admissionNumber', formData.admissionNumber);
        data.append('form', formData.form);
        data.append('stream', formData.stream);
        if (photo) data.append('photo', photo);

        try {
            if (student) {
                await api.put(`/students/${student._id}`, data);
            } else {
                await api.post('/students', data);
            }
            onSave();
            onClose();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to save student');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-surface rounded-lg w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-border flex justify-between items-center bg-accent text-white">
                    <h2 className="text-xl font-bold">{student ? 'Edit Student' : 'Add New Student'}</h2>
                    <button onClick={onClose} className="text-white hover:text-blue-100"><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="form-group">
                        <label className="label">Full Name</label>
                        <input
                            type="text"
                            required
                            className="input"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label className="label">Admission Number</label>
                        <input
                            type="text"
                            required
                            className="input"
                            value={formData.admissionNumber}
                            onChange={(e) => setFormData({ ...formData, admissionNumber: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-group">
                            <label className="label">Form</label>
                            <select
                                className="select"
                                value={formData.form}
                                onChange={(e) => setFormData({ ...formData, form: Number(e.target.value) })}
                            >
                                {[1, 2, 3, 4].map(f => <option key={f} value={f}>Form {f}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="label">Stream</label>
                            <select
                                className="select"
                                value={formData.stream}
                                onChange={(e) => setFormData({ ...formData, stream: e.target.value })}
                            >
                                {settings.streams.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="label">Student Photo</label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-border rounded-lg hover:border-accent transition-colors cursor-pointer relative">
                            <input
                                type="file"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={(e) => setPhoto(e.target.files[0])}
                                accept="image/*"
                            />
                            <div className="space-y-1 text-center">
                                <Upload className="mx-auto h-10 w-10 text-secondary" />
                                <div className="text-sm text-secondary">
                                    <span className="text-accent font-medium">Click to upload</span> or drag and drop
                                </div>
                                <p className="text-xs text-secondary">PNG, JPG up to 10MB</p>
                                {photo && <p className="text-sm text-success font-medium mt-2">{photo.name}</p>}
                            </div>
                        </div>
                    </div>
                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary w-full"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                            {student ? 'Update Student' : 'Register Student'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StudentModal;
