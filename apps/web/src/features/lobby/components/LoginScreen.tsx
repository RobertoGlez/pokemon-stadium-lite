import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLobby } from '../../../core/context/LobbyContext';
import { Server, User, ArrowRight, Loader2, CheckCircle2, XCircle, History } from 'lucide-react';
import { Globe } from '../../../shared/components/magicui/globe';
import { useServerValidation } from '../hooks/useServerValidation';
import { apiClient } from '../../../core/axios.client';
import logo from '../../../assets/identity/logo.png';
import { BattleHistoryModal } from './BattleHistoryModal';

export function LoginScreen() {
    const [nickname, setNickname] = useState('');
    const [serverUrl, setServerUrl] = useState('');
    const [formError, setFormError] = useState('');
    const [nicknameError, setNicknameError] = useState('');
    const [isCheckingNickname, setIsCheckingNickname] = useState(false);
    const [isNicknameVerified, setIsNicknameVerified] = useState(false);
    const [showHistory, setShowHistory] = useState(false);

    const { t } = useTranslation('login');
    const navigate = useNavigate();
    const { connectAndJoin, isConnected, joinError, clearJoinError, connectionError, clearConnectionError } = useLobby();
    const { validateServer, isValid, isChecking, error: serverError, metadata, setIsValid } = useServerValidation();

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

    const DEFAULT_URL = import.meta.env.VITE_API_BACKEND || 'http://localhost:8080';

    const handleBlur = () => {
        const trimmed = serverUrl.trim();
        if (!trimmed) {
            // Clear saved reference and fall back to default
            localStorage.removeItem('backendUrl');
            setServerUrl(DEFAULT_URL);
            setIsValid(false);
            validateServer(DEFAULT_URL);
        } else {
            validateServer(trimmed);
        }
    };

    const handleNicknameBlur = async () => {
        if (!nickname.trim() || nickname.trim().length <= 3) {
            setIsNicknameVerified(false);
            return;
        }
        setIsCheckingNickname(true);
        setNicknameError('');
        try {
            const res = await apiClient.get<{ available: boolean; message?: string }>(
                `/api/players/check?nickname=${encodeURIComponent(nickname.trim())}`
            );
            if (!res.data.available) {
                setNicknameError(res.data.message || t('nicknameInUse'));
                setIsNicknameVerified(false);
            } else {
                setIsNicknameVerified(true);
            }
        } catch {
            setIsNicknameVerified(false);
            setNicknameError(t('serverCheckFailed'));
        } finally {
            setIsCheckingNickname(false);
        }
    };

    const isFormValid = isValid && nickname.trim().length > 3 && !nicknameError && isNicknameVerified;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('[LoginScreen] Submit pulsado. Validando antes de conectar...');

        if (!isValid) {
            setFormError(t('invalidServerError'));
            return;
        }

        if (!nickname.trim() || nickname.trim().length <= 3) {
            setFormError(t('nicknameTooShort'));
            return;
        }

        if (nicknameError) {
            setFormError(nicknameError);
            return;
        }

        // Si la validación del blur no ha terminado, o si el blur disparó justo antes del click
        // Hacemos una última verificación del nickname de manera síncrona aquí
        setIsCheckingNickname(true);
        try {
            const res = await apiClient.get<{ available: boolean; message?: string }>(
                `/api/players/check?nickname=${encodeURIComponent(nickname.trim())}`
            );
            if (!res.data.available) {
                setNicknameError(res.data.message || t('nicknameInUse'));
                setIsCheckingNickname(false);
                return;
            }
        } catch {
            setNicknameError(t('serverCheckFailed'));
            setIsCheckingNickname(false);
            return;
        }
        setIsCheckingNickname(false);

        setFormError('');
        console.log('[LoginScreen] Todo correcto, conectando...', { nickname: nickname.trim(), serverUrl: serverUrl.trim() });
        connectAndJoin(nickname.trim(), serverUrl.trim());
    };
    const currentError = formError || serverError || joinError || nicknameError || connectionError;

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
                        <img src={logo} alt={t('logoAlt')} className="w-full h-full object-contain relative z-10 drop-shadow-2xl" />
                    </div>

                    <h2 className="text-3xl font-bold mb-3 tracking-tight text-white text-center">{t('title')}</h2>
                    <p className="text-sm text-muted-foreground text-center max-w-[280px]">
                        {t('intro')}
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-card w-full rounded-2xl border border-border p-5 mb-8 shadow-2xl backdrop-blur-sm bg-opacity-95">
                    <form id="login-form" onSubmit={handleSubmit} className="flex flex-col gap-5">

                        {/* Server Connection Input */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wider text-[11px]">
                                <Server className="w-3.5 h-3.5 text-primary" />
                                {t('serverLabel')}
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={serverUrl}
                                    onChange={(e) => {
                                        setServerUrl(e.target.value);
                                        if (isValid) setIsValid(false);
                                        if (formError === t('invalidServerError')) setFormError('');
                                        if (connectionError) clearConnectionError();
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
                                        <span>{t('connecting')}</span>
                                    </div>
                                ) : isValid && metadata ? (
                                    <div className="flex w-full bg-green-500/10 px-4 py-3 rounded-xl border border-green-500/20">
                                        <div className="flex items-center gap-3 text-[11px] font-medium text-green-500 w-full">
                                            <span className="flex items-center gap-1 font-bold whitespace-nowrap"><CheckCircle2 className="w-3.5 h-3.5" /> {t('online')}</span>
                                            <span className="text-green-500/50 shrink-0">|</span>
                                            <div className="flex flex-col gap-0.5 w-full">
                                                <span className="truncate max-w-[180px] xs:max-w-[220px] sm:max-w-[280px]">{metadata.serverName}</span>
                                                <div className="flex items-center gap-1.5 text-[10px] text-green-500/70 font-medium">
                                                    <span>{metadata.region}</span>
                                                    <span>-</span>
                                                    <span>v{metadata.version}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : serverError && !isChecking && serverUrl ? (
                                    <div className="flex items-center gap-2 text-[11px] text-red-500 font-medium bg-red-500/10 p-2 rounded-lg border border-red-500/20">
                                        <XCircle className="w-3.5 h-3.5" />
                                        <span>{t('disconnected')}</span>
                                    </div>
                                ) : null}
                            </div>
                        </div>

                        <div className="h-[1px] w-full bg-border" />

                        {/* Trainer Nickname Input */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wider text-[11px]">
                                <User className="w-3.5 h-3.5 text-primary" />
                                {t('nicknameLabel')}
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={nickname}
                                    onChange={(e) => {
                                        const val = e.target.value.toLowerCase();
                                        if (/^[a-z0-9-]*$/.test(val)) {
                                            setNickname(val);
                                            setIsNicknameVerified(false);
                                            if (joinError) clearJoinError();
                                            if (connectionError) clearConnectionError();
                                            if (nicknameError) setNicknameError('');
                                        }
                                    }}
                                    onBlur={handleNicknameBlur}
                                    maxLength={15}
                                    className={`w-full h-12 px-4 pr-10 rounded-xl border bg-background text-foreground focus:outline-none focus:ring-1 transition-all font-medium ${nicknameError
                                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                        : 'border-border focus:border-primary focus:ring-primary'
                                        }`}
                                    placeholder={t('nicknamePlaceholder')}
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
                    type="button"
                    onClick={(e) => {
                        console.log('[LoginScreen] Clic detectado en el botón (onClick)');
                        handleSubmit(e);
                    }}
                    className={`w-full h-14 mt-auto flex items-center justify-center gap-2 font-semibold rounded-xl text-[15px] tracking-wide transition-all ${isFormValid && !isChecking && !isCheckingNickname
                        ? 'bg-primary text-primary-foreground hover:brightness-110 active:scale-[0.98] shadow-[0_4px_20px_rgba(37,99,235,0.4)] cursor-pointer'
                        : 'bg-muted text-muted-foreground cursor-not-allowed border border-border/50'
                        }`}
                >
                    {(isChecking || isCheckingNickname) ? t('validating') : t('connectButton')}
                    {!(isChecking || isCheckingNickname) && <ArrowRight className="w-5 h-5" />}
                </button>

                {/* Footer */}
                <div className="flex flex-col items-center mt-6">
                    <button 
                        type="button"
                        onClick={() => setShowHistory(true)}
                        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-white transition-colors mb-4 bg-[#1F2937]/30 hover:bg-[#1F2937] px-4 py-2 rounded-full border border-[#1F2937]"
                    >
                        <History className="w-4 h-4" />
                        {t('viewHistory')}
                    </button>
                    <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground font-medium mb-2">
                        <span>{t('serverStatus')}</span>
                        <span className={`w-2 h-2 rounded-full ${isValid ? 'bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.6)]' : 'bg-muted-foreground/40'}`} />
                        <a href="#" className="hover:text-foreground transition-colors ml-2">{t('help')}</a>
                    </div>
                    <span className="text-[10px] text-muted-foreground/30 font-medium">{t('version', { version: import.meta.env.VITE_APP_VERSION })}</span>
                </div>

            </div>

            <BattleHistoryModal 
                isOpen={showHistory} 
                onClose={() => setShowHistory(false)} 
                serverUrl={serverUrl} 
            />
        </div>
    );
}
