import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLobby } from '../../../core/context/LobbyContext';
import { Server, User, ArrowRight, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Globe } from '../../../shared/components/magicui/globe';
import { useServerValidation } from '../hooks/useServerValidation';
import { apiClient } from '../../../core/axios.client';
import logo from '../../../assets/identity/logo.png';

export function LoginScreen() {
    const [nickname, setNickname] = useState('');
    const [serverUrl, setServerUrl] = useState('');
    const [formError, setFormError] = useState('');
    const [nicknameError, setNicknameError] = useState('');
    const [isCheckingNickname, setIsCheckingNickname] = useState(false);

    const navigate = useNavigate();
    const { connectAndJoin, isConnected, joinError, clearJoinError } = useLobby();
    const { validateServer, isValid, isChecking, error: serverError, metadata } = useServerValidation();

    useEffect(() => {
        // Load saved config
        const savedUrl = localStorage.getItem('backendUrl') || import.meta.env.VITE_API_BACKEND || 'http://localhost:8080';
        setServerUrl(savedUrl);
        // Initial silent validation
        if (savedUrl) {
            validateServer(savedUrl);
        }
    }, [validateServer]);

    // Redirect to lobby if properly connected
    useEffect(() => {
        if (isConnected) {
            navigate('/lobby');
        }
    }, [isConnected, navigate]);

    const handleBlur = () => {
        if (serverUrl.trim()) {
            validateServer(serverUrl.trim());
        }
    };

    const handleNicknameBlur = async () => {
        if (!nickname.trim() || nickname.trim().length <= 3) return;
        setIsCheckingNickname(true);
        setNicknameError('');
        try {
            const res = await apiClient.get<{ available: boolean; message?: string }>(
                `/api/players/check?nickname=${encodeURIComponent(nickname.trim())}`
            );
            if (!res.data.available) {
                setNicknameError(res.data.message || 'Este apodo ya está en uso.');
            }
        } catch {
            // If the check fails (server down etc.) we allow the attempt
        } finally {
            setIsCheckingNickname(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!isValid) {
            setFormError('No puedes ingresar hasta configurar un servidor válido.');
            return;
        }

        if (!nickname.trim() || nickname.trim().length <= 3) {
            setFormError('El apodo debe tener más de 3 caracteres.');
            return;
        }

        setFormError('');
        connectAndJoin(nickname.trim());
    };

    const isFormValid = isValid && nickname.trim().length > 3 && !isChecking && !nicknameError && !isCheckingNickname;
    const currentError = formError || serverError || joinError || nicknameError;

    // Determine Status Dot Color
    let statusDotClass = "bg-muted-foreground/40"; // disconnected/unknown
    if (isChecking) statusDotClass = "bg-yellow-500 animate-pulse shadow-[0_0_8px_rgba(234,179,8,0.6)]";
    else if (isValid) statusDotClass = "bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]";
    else if (serverError) statusDotClass = "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]";

    return (
        <div className="relative flex flex-col items-center min-h-screen bg-background text-foreground overflow-hidden font-sans">

            {/* Magic UI Globe Background */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[25%] z-0 opacity-70 pointer-events-none w-[900px] sm:w-[1000px] md:w-[1200px] flex justify-center items-center">
                <Globe />
            </div>

            {/* Grid Pattern */}
            <div
                className="absolute inset-0 z-0 pointer-events-none"
                style={{
                    backgroundImage: 'linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                    maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)'
                }}
            />

            {/* Main Container */}
            <div className="z-10 w-full max-w-sm px-6 py-8 flex flex-col h-full min-h-screen">

                {/* Logo & Titles */}
                <div className="flex flex-col items-center mb-8 mt-6">
                    <div className="w-40 h-40 mb-6 relative flex items-center justify-center">
                        <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse"></div>
                        <img src={logo} alt="Pokemon Stadium Lite Logo" className="w-full h-full object-contain relative z-10 drop-shadow-2xl" />
                    </div>

                    <h2 className="text-3xl font-bold mb-3 tracking-tight text-white text-center">Pokémon Stadium Lite</h2>
                    <p className="text-sm text-muted-foreground text-center max-w-[280px]">
                        Configura tu conexión para entrar a la arena y retar a otros entrenadores.
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-card w-full rounded-2xl border border-border p-5 mb-8 shadow-2xl backdrop-blur-sm bg-opacity-95">
                    <form id="login-form" onSubmit={handleSubmit} className="flex flex-col gap-5">

                        {/* Server Connection Input */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wider text-[11px]">
                                <Server className="w-3.5 h-3.5 text-primary" />
                                Conexión al Servidor
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={serverUrl}
                                    onChange={(e) => {
                                        setServerUrl(e.target.value);
                                        if (isValid) setFormError('Has modificado la URL. Haz click fuera del texto para validarla nuevamente.');
                                    }}
                                    onBlur={handleBlur}
                                    className="w-full h-12 px-4 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium"
                                    placeholder={import.meta.env.VITE_API_BACKEND || "http://localhost:8080"}
                                />
                                <div className={`absolute right-4 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full transition-colors duration-300 ${statusDotClass}`} />
                            </div>

                            {/* Server Metadata Display */}
                            <div className="min-h-[20px] px-1">
                                {isChecking ? (
                                    <div className="flex items-center gap-2 text-xs text-yellow-500 font-medium animate-pulse">
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        <span>Conectando...</span>
                                    </div>
                                ) : isValid && metadata ? (
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-green-500 font-medium bg-green-500/10 p-2 rounded-lg border border-green-500/20">
                                        <span className="flex items-center gap-1 font-bold"><CheckCircle2 className="w-3.5 h-3.5" /> En línea</span>
                                        <span>{metadata.serverName}</span>
                                        <span>v{metadata.version}</span>
                                        <span className="capitalize">{metadata.region}</span>
                                    </div>
                                ) : serverError && !isChecking && serverUrl ? (
                                    <div className="flex items-center gap-2 text-[11px] text-red-500 font-medium bg-red-500/10 p-2 rounded-lg border border-red-500/20">
                                        <XCircle className="w-3.5 h-3.5" />
                                        <span>Desconectado</span>
                                    </div>
                                ) : null}
                            </div>
                        </div>

                        <div className="h-[1px] w-full bg-border" />

                        {/* Trainer Nickname Input */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wider text-[11px]">
                                <User className="w-3.5 h-3.5 text-primary" />
                                Nickname de entrenador
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={nickname}
                                    onChange={(e) => {
                                        const val = e.target.value.toLowerCase();
                                        if (/^[a-z0-9-]*$/.test(val)) {
                                            setNickname(val);
                                            if (joinError) clearJoinError();
                                            if (nicknameError) setNicknameError('');
                                        }
                                    }}
                                    onBlur={handleNicknameBlur}
                                    maxLength={15}
                                    className={`w-full h-12 px-4 pr-10 rounded-xl border bg-background text-foreground focus:outline-none focus:ring-1 transition-all font-medium ${nicknameError
                                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                        : 'border-border focus:border-primary focus:ring-primary'
                                        }`}
                                    placeholder="Ej: ash-1"
                                />
                                {isCheckingNickname && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                                    </div>
                                )}
                            </div>
                            {nicknameError && (
                                <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                                    <XCircle className="w-3.5 h-3.5 shrink-0" />
                                    {nicknameError}
                                </p>
                            )}
                        </div>

                    </form>
                </div>

                {/* Error Message */}
                {currentError && (
                    <p className="text-destructive text-sm font-medium text-center mb-4 bg-destructive/10 py-2 px-3 rounded-lg border border-destructive/20 animate-in fade-in zoom-in duration-200">{currentError}</p>
                )}

                <div className="flex-1" />

                {/* Connect Button */}
                <button
                    type="submit"
                    form="login-form"
                    disabled={!isFormValid}
                    className={`w-full h-14 mt-auto flex items-center justify-center gap-2 font-semibold rounded-xl text-[15px] tracking-wide transition-all ${isFormValid
                        ? 'bg-primary text-primary-foreground hover:brightness-110 active:scale-[0.98] shadow-[0_4px_20px_rgba(37,99,235,0.4)]'
                        : 'bg-muted text-muted-foreground cursor-not-allowed border border-border/50'
                        }`}
                >
                    {isChecking ? 'VALIDANDO...' : 'CONECTAR AL ESTADIO'}
                    {!isChecking && <ArrowRight className="w-5 h-5" />}
                </button>

                {/* Footer */}
                <div className="flex items-center justify-center gap-3 mt-6 text-xs text-muted-foreground font-medium">
                    <span>Estado del Servidor</span>
                    <span className={`w-2 h-2 rounded-full ${isValid ? 'bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.6)]' : 'bg-muted-foreground/40'}`} />
                    <a href="#" className="hover:text-foreground transition-colors ml-2">Ayuda</a>
                </div>

            </div>
        </div>
    );
}
