import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

export interface ServerMetadata {
    serverName?: string;
    packageName?: string;
    version?: string;
    region?: string;
    status?: string;
}

export function useServerValidation() {
    const { t } = useTranslation('login');
    const [isValid, setIsValid] = useState<boolean>(false);
    const [isChecking, setIsChecking] = useState<boolean>(false);
    const [metadata, setMetadata] = useState<ServerMetadata | null>(null);
    const [error, setError] = useState<string | null>(null);

    const validateServer = useCallback(async (url: string) => {
        if (!url) {
            setIsValid(false);
            setMetadata(null);
            setError(null);
            return false;
        }

        setIsChecking(true);
        setError(null);

        try {
            const baseUrl = url.replace(/\/+$/, '');
            // Realizar petición a la raíz exigida por el user
            const response = await axios.get<ServerMetadata>(`${baseUrl}/`, { timeout: 5000 });

            // Validamos que el response.data tenga los campos esperados
            if (response.data && response.data.packageName === 'pokemon-stadium-lite-server') {
                setIsValid(true);
                setMetadata(response.data);
                setIsChecking(false);
                // Persist successful URL
                localStorage.setItem('backendUrl', baseUrl);
                return true;
            } else {
                throw new Error("Invalid Server Metadata");
            }
        } catch (err: any) {
            setIsValid(false);
            setMetadata(null);
            setError(t('serverInvalid'));
            setIsChecking(false);
            return false;
        }
    }, [t]);

    return { validateServer, isValid, isChecking, metadata, error, setIsValid };
}
