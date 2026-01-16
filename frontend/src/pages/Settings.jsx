import React, { useState, useEffect } from 'react';
import api, { FILE_BASE_URL } from '../utils/api';
import { Save, Plus, X, Settings as SettingsIcon, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
    const { user } = useAuth();
    const [settings, setSettings] = useState({ streams: [], totalFeePerTerm: 0 });
    const [newStream, setNewStream] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await api.get('/settings');
                setSettings(data);
            } catch (error) {
                console.error('Error fetching settings', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put('/settings', settings);
            alert('Settings saved successfully!');
        } catch (error) {
            alert('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const addStream = () => {
        if (newStream && !settings.streams.includes(newStream)) {
            setSettings({ ...settings, streams: [...settings.streams, newStream] });
            setNewStream('');
        }
    };

    const removeStream = (stream) => {
        setSettings({ ...settings, streams: settings.streams.filter(s => s !== stream) });
    };

    if (loading) return <div className="p-6 text-center">Loading settings...</div>;

    return (
        <div className="container space-y-6">
            <div className="flex items-center gap-3 mb-2">
                <SettingsIcon className="text-secondary" size={28} />
                <h1 className="text-2xl font-bold">School Settings</h1>
            </div>

            <div className="card space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-group">
                        <label className="label text-main font-bold">Fee per Term (Ksh)</label>
                        <input
                            type="number"
                            className="input focus:ring-2 focus:ring-accent/20"
                            value={settings.totalFeePerTerm}
                            onChange={(e) => {
                                const termFee = Number(e.target.value);
                                setSettings({ ...settings, totalFeePerTerm: termFee });
                            }}
                            disabled={user?.role !== 'Admin'}
                        />
                    </div>
                    <div className="form-group">
                        <label className="label text-main font-bold">Annual Fee (Ksh)</label>
                        <input
                            type="number"
                            className="input focus:ring-2 focus:ring-accent/20"
                            value={settings.totalFeePerTerm * 3}
                            onChange={(e) => {
                                const annualFee = Number(e.target.value);
                                setSettings({ ...settings, totalFeePerTerm: Math.round(annualFee / 3) });
                            }}
                            disabled={user?.role !== 'Admin'}
                        />
                    </div>
                    <div className="form-group">
                        <label className="label text-main font-bold">Current Term</label>
                        <select
                            className="select w-full"
                            value={settings.currentTerm || 1}
                            onChange={(e) => setSettings({ ...settings, currentTerm: Number(e.target.value) })}
                            disabled={user?.role !== 'Admin'}
                        >
                            <option value="1">Term 1</option>
                            <option value="2">Term 2</option>
                            <option value="3">Term 3</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="label text-main font-bold">Current Year</label>
                        <input
                            type="number"
                            className="input focus:ring-2 focus:ring-accent/20"
                            value={settings.currentYear || new Date().getFullYear()}
                            onChange={(e) => setSettings({ ...settings, currentYear: Number(e.target.value) })}
                            disabled={user?.role !== 'Admin'}
                        />
                    </div>
                </div>
                <p className="text-xs text-secondary mt-1 flex items-center gap-1">
                    <AlertCircle size={14} className="text-accent" />
                    Changing one value automatically updates the other based on a 3-term year.
                </p>

                <div>
                    <label className="label">Managed Streams</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                        {settings.streams.map((stream) => (
                            <div key={stream} className="badge badge-neutral bg-blue-50 text-blue-700 border border-blue-100 flex items-center gap-2 px-3 py-1">
                                {stream}
                                {user?.role === 'Admin' && (
                                    <button onClick={() => removeStream(stream)} className="hover:text-error">
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                    {user?.role === 'Admin' && (
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="New stream name (e.g. North)"
                                className="input flex-1"
                                value={newStream}
                                onChange={(e) => setNewStream(e.target.value)}
                            />
                            <button onClick={addStream} className="btn btn-secondary">
                                <Plus size={18} /> Add
                            </button>
                        </div>
                    )}
                </div>

                {user?.role === 'Admin' && (
                    <div className="pt-4 border-t border-border">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="btn btn-primary w-full"
                        >
                            {saving ? 'Saving...' : <><Save size={20} /> Save Changes</>}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const ProfileSection = ({ user }) => {
    const { login } = useAuth();
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [photo, setPhoto] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        const data = new FormData();
        data.append('name', name);
        data.append('email', email);
        if (photo) data.append('photo', photo);

        try {
            const res = await api.put('/auth/profile', data);
            localStorage.setItem('userInfo', JSON.stringify(res.data));
            window.location.reload(); // Refresh to update user context
        } catch (error) {
            alert('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card space-y-6">
            <h3 className="text-lg font-bold border-b pb-4">Admin Profile</h3>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="flex items-center gap-6 mb-4">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-accent/20 bg-gray-100 flex items-center justify-center">
                        {user?.photo ? (
                            <img src={user.photo.startsWith('http') ? user.photo : `${FILE_BASE_URL}${user.photo}`} className="w-full h-full object-cover" alt="" />
                        ) : <span className="text-4xl font-bold text-gray-300">{user?.name?.charAt(0)}</span>}
                    </div>
                    <div className="flex-1">
                        <label className="label">Update Profile Picture</label>
                        <input type="file" onChange={(e) => setPhoto(e.target.files[0])} className="input text-xs" accept="image/*" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group">
                        <label className="label">Display Name</label>
                        <input type="text" className="input" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label className="label">Email Address</label>
                        <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                </div>
                <button type="submit" disabled={loading} className="btn btn-secondary w-full">
                    {loading ? 'Updating...' : 'Update Admin Profile'}
                </button>
            </form>
        </div>
    );
};

const SettingsWithProfile = () => {
    const { user } = useAuth();
    return (
        <div className="space-y-6">
            <Settings />
            {user?.role === 'Admin' && <ProfileSection user={user} />}
        </div>
    );
};

export default SettingsWithProfile;
