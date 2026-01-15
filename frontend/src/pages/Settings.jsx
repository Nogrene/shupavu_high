import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Save, Plus, X, Settings as SettingsIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
    const { user } = useAuth();
    const [settings, setSettings] = useState({ streams: [], totalFeePerSemester: 0 });
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
                <div className="form-group">
                    <label className="label">Total School Fee per Semester (Ksh)</label>
                    <input
                        type="number"
                        className="input"
                        value={settings.totalFeePerSemester}
                        onChange={(e) => setSettings({ ...settings, totalFeePerSemester: Number(e.target.value) })}
                        disabled={user?.role !== 'Admin'}
                    />
                    <p className="text-xs text-secondary mt-1">Total annual fee will be auto-calculated (3 x Semester Fee)</p>
                </div>

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

export default Settings;
