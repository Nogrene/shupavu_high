import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Loader2 } from 'lucide-react';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--primary)' }}>
            <div className="bg-white rounded-lg shadow-2xl overflow-hidden w-full max-w-md">
                <div className="p-8 text-center bg-blue-600">
                    <div className="inline-block p-1 bg-white mb-6 shadow-lg">
                        <img src="/logo.png" alt="Shupavu High Logo" className="w-32 h-32 object-contain" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">Shupavu High</h1>
                    <p className="mt-2 text-blue-100 italic">"Usiwe Mjinga"</p>
                </div>
                <div className="p-8">
                    <h2 className="text-2xl font-semibold text-center mb-6 text-main">Login to your account</h2>
                    {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="form-group">
                            <label className="label">Email Address</label>
                            <input
                                type="email"
                                required
                                className="input"
                                placeholder="admin@shupavu.ac.ke"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label className="label">Password</label>
                            <input
                                type="password"
                                required
                                className="input"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary w-auto px-12 mt-6 mx-auto block"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <LogIn size={20} />}
                            {loading ? 'Logging in...' : 'Sign In'}
                        </button>
                    </form>
                    <div className="mt-8 text-center text-sm text-secondary">
                        Contact Admin for account registration
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
