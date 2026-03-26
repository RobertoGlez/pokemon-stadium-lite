import type { PokemonBase } from '../../../core/types/models';
import { useTranslation } from 'react-i18next';
import { Heart, Sword, Shield, Zap } from 'lucide-react';
import { BorderBeam } from '../magicui/border-beam';

interface PokemonCardProps {
    pokemon: PokemonBase;
    compact?: boolean;
    isDefeated?: boolean;
}

const getTypeColorClasses = (type: string) => {
    const t = type.toLowerCase();
    switch (t) {
        case 'fire': return 'text-orange-500 border-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)] hover:shadow-[0_0_15px_rgba(249,115,22,1)]';
        case 'water': return 'text-blue-500 border-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)] hover:shadow-[0_0_15px_rgba(59,130,246,1)]';
        case 'grass': return 'text-green-500 border-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] hover:shadow-[0_0_15px_rgba(34,197,94,1)]';
        case 'electric': return 'text-yellow-400 border-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)] hover:shadow-[0_0_15px_rgba(250,204,21,1)]';
        case 'poison': return 'text-purple-500 border-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)] hover:shadow-[0_0_15px_rgba(168,85,247,1)]';
        case 'flying': return 'text-indigo-400 border-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.6)] hover:shadow-[0_0_15px_rgba(129,140,248,1)]';
        case 'dragon': return 'text-indigo-600 border-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.6)] hover:shadow-[0_0_15px_rgba(79,70,229,1)]';
        case 'bug': return 'text-lime-500 border-lime-500 shadow-[0_0_8px_rgba(132,204,22,0.6)] hover:shadow-[0_0_15px_rgba(132,204,22,1)]';
        case 'normal': return 'text-gray-400 border-gray-400 shadow-[0_0_8px_rgba(156,163,175,0.6)] hover:shadow-[0_0_15px_rgba(156,163,175,1)]';
        case 'fairy': return 'text-pink-400 border-pink-400 shadow-[0_0_8px_rgba(244,114,182,0.6)] hover:shadow-[0_0_15px_rgba(244,114,182,1)]';
        case 'fighting': return 'text-red-500 border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)] hover:shadow-[0_0_15px_rgba(239,68,68,1)]';
        case 'psychic': return 'text-pink-500 border-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.6)] hover:shadow-[0_0_15px_rgba(236,72,153,1)]';
        case 'rock': return 'text-amber-600 border-amber-600 shadow-[0_0_8px_rgba(217,119,6,0.6)] hover:shadow-[0_0_15px_rgba(217,119,6,1)]';
        case 'ground': return 'text-yellow-600 border-yellow-600 shadow-[0_0_8px_rgba(202,138,4,0.6)] hover:shadow-[0_0_15px_rgba(202,138,4,1)]';
        case 'ice': return 'text-cyan-400 border-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)] hover:shadow-[0_0_15px_rgba(34,211,238,1)]';
        case 'ghost': return 'text-purple-700 border-purple-700 shadow-[0_0_8px_rgba(126,34,206,0.6)] hover:shadow-[0_0_15px_rgba(126,34,206,1)]';
        case 'steel': return 'text-slate-400 border-slate-400 shadow-[0_0_8px_rgba(148,163,184,0.6)] hover:shadow-[0_0_15px_rgba(148,163,184,1)]';
        case 'dark': return 'text-zinc-500 border-zinc-500 shadow-[0_0_8px_rgba(113,113,122,0.6)] hover:shadow-[0_0_15px_rgba(113,113,122,1)]';
        default: return 'text-gray-300 border-gray-300 shadow-[0_0_8px_rgba(209,213,219,0.6)] hover:shadow-[0_0_15px_rgba(209,213,219,1)]';
    }
};

export function PokemonCard({ pokemon, compact, isDefeated }: PokemonCardProps) {
    const { t } = useTranslation('common');
    // Backend payload resiliency (handling both mapped and raw API payloads)
    const types = (pokemon as any).types || (pokemon as any).type || [];
    const spriteUrl = pokemon.spriteUrl || (pokemon as any).sprite || '';

    // Stats extraction
    const maxHp = pokemon.stats?.maxHp ?? pokemon.stats?.currentHp ?? (pokemon as any).hp ?? 0;
    const attack = pokemon.stats?.attack ?? (pokemon as any).attack ?? 0;
    const defense = pokemon.stats?.defense ?? (pokemon as any).defense ?? 0;
    const speed = pokemon.stats?.speed ?? (pokemon as any).speed ?? 0;

    // Pokedex formatting hook (defaults to ??? if not strictly typed)
    const dexNumber = (pokemon as any).id
        ? `#${String((pokemon as any).id).padStart(3, '0')}`
        : '';

    return (
        <div className={`flex flex-col items-center bg-[#0B0F19] border border-[#1E293B] rounded-[20px] ${compact ? 'p-2 w-full min-w-0' : 'p-4 w-48 min-w-48'} shadow-lg relative overflow-hidden group transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:border-primary/40 ${isDefeated ? 'grayscale opacity-60 border-destructive/10 bg-destructive/5' : ''}`}>

            {/* Pokedex Number */}
            <div className="absolute top-3 left-4 text-[10px] font-black text-slate-700/40 tracking-wider">
                {dexNumber}
            </div>

            {/* Magic UI Hover Beam Animation */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-[20px]">
                <BorderBeam size={120} duration={8} delay={0} colorFrom="#2563EB" colorTo="#3b82f6" borderWidth={1.5} />
            </div>

            {/* Sprite Canvas */}
            <div className={`${compact ? 'w-20 h-20 my-0.5' : 'w-28 h-28 my-3'} relative flex items-center justify-center`}>
                <img
                    src={spriteUrl}
                    alt={pokemon.name}
                    className="w-full h-full object-contain filter drop-shadow-[0_0_10px_rgba(255,255,255,0.1)] relative z-10 scale-105 group-hover:scale-115 transition-transform duration-500"
                />
            </div>

            {/* Details Section */}
            <div className={`w-full text-center ${compact ? 'mb-1.5' : 'mb-4'} relative z-10`}>
                <h3 className={`font-black text-white ${compact ? 'text-base' : 'text-xl'} truncate capitalize tracking-tight ${compact ? 'mb-1' : 'mb-2'}`}>
                    {pokemon.name}
                </h3>

                {/* Type Badges */}
                <div className="flex gap-1.5 justify-center flex-wrap">
                    {types.map((type: string) => (
                        <span
                            key={type}
                            className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border transition-all duration-300 bg-[#0F172A] cursor-default ${getTypeColorClasses(type)}`}
                        >
                            {type}
                        </span>
                    ))}
                </div>
            </div>

            {/* Stats Grid */}
            <div className={`grid grid-cols-2 gap-1.5 w-full mt-auto relative z-10 ${compact ? 'text-[9px]' : 'text-[10px]'}`}>
                {/* HP Badge */}
                <div className={`flex items-center justify-between bg-[#131B2C] rounded-lg ${compact ? 'px-1.5 py-1' : 'px-2 py-1.5'} cursor-default group-hover:bg-[#1A233A] border border-transparent group-hover:border-green-500/10 transition-all`}>
                    <div className="flex items-center gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                        <Heart className="w-3 h-3 text-green-500" />
                        <span className="font-bold text-slate-400">{t('stats.hp')}</span>
                    </div>
                    <span className="font-black text-green-400">{maxHp}</span>
                </div>

                {/* Attack Badge */}
                <div className={`flex items-center justify-between bg-[#131B2C] rounded-lg ${compact ? 'px-1.5 py-1' : 'px-2 py-1.5'} cursor-default group-hover:bg-[#1A233A] border border-transparent group-hover:border-red-500/10 transition-all`}>
                    <div className="flex items-center gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                        <Sword className="w-3 h-3 text-red-500" />
                        <span className="font-bold text-slate-400">{t('stats.attack')}</span>
                    </div>
                    <span className="font-black text-red-400">{attack}</span>
                </div>

                {/* Defense Badge */}
                <div className={`flex items-center justify-between bg-[#131B2C] rounded-lg ${compact ? 'px-1.5 py-1' : 'px-2 py-1.5'} cursor-default group-hover:bg-[#1A233A] border border-transparent group-hover:border-blue-500/10 transition-all`}>
                    <div className="flex items-center gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                        <Shield className="w-3 h-3 text-blue-500" />
                        <span className="font-bold text-slate-400">{t('stats.defense')}</span>
                    </div>
                    <span className="font-black text-blue-400">{defense}</span>
                </div>

                {/* Speed Badge */}
                <div className={`flex items-center justify-between bg-[#131B2C] rounded-lg ${compact ? 'px-1.5 py-1' : 'px-2 py-1.5'} cursor-default group-hover:bg-[#1A233A] border border-transparent group-hover:border-yellow-400/10 transition-all`}>
                    <div className="flex items-center gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                        <Zap className="w-3 h-3 text-yellow-400" />
                        <span className="font-bold text-slate-400">{t('stats.speed')}</span>
                    </div>
                    <span className="font-black text-yellow-400">{speed}</span>
                </div>
            </div>

        </div>
    );
}
