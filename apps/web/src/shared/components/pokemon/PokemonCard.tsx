import type { PokemonBase } from '../../../core/types/models';
import { Heart, Sword, Shield, Zap } from 'lucide-react';
import { BorderBeam } from '../magicui/border-beam';

interface PokemonCardProps {
    pokemon: PokemonBase;
}

export function PokemonCard({ pokemon }: PokemonCardProps) {
    // Backend payload resiliency (handling both mapped and raw API payloads)
    const types = (pokemon as any).types || (pokemon as any).type || [];
    const spriteUrl = pokemon.spriteUrl || (pokemon as any).sprite || '';

    // Stats extraction
    const maxHp = pokemon.stats?.maxHp ?? pokemon.stats?.currentHp ?? (pokemon as any).hp ?? 0;
    const attack = pokemon.stats?.attack ?? (pokemon as any).attack ?? 0;
    const defense = pokemon.stats?.defense ?? (pokemon as any).defense ?? 0;
    const speed = pokemon.stats?.speed ?? (pokemon as any).speed ?? 0;

    return (
        <div className="flex flex-col items-center bg-card border border-border rounded-[14px] p-4 w-40 min-w-40 shadow-lg relative overflow-hidden group hover:border-primary/50 transition-colors">

            {/* Subtle Gradient Glow behind Sprite */}
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

            {/* Magic UI Hover Beam Animation */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-[14px]">
                <BorderBeam size={120} duration={8} delay={0} colorFrom="#2563EB" colorTo="#3b82f6" borderWidth={2} />
            </div>

            {/* Header: Name and Type */}
            <div className="w-full text-center mb-3 relative z-10">
                <h3 className="font-bold text-foreground text-sm truncate uppercase tracking-tight">
                    {pokemon.name}
                </h3>
                <div className="flex gap-1 justify-center mt-1">
                    {types.map((type: string) => (
                        <span
                            key={type}
                            className="bg-background border border-border text-muted-foreground text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-wider"
                        >
                            {type}
                        </span>
                    ))}
                </div>
            </div>

            {/* Sprite Canvas */}
            <div className="w-24 h-24 mb-3 relative flex items-center justify-center">
                <img
                    src={spriteUrl}
                    alt={pokemon.name}
                    className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(255,255,255,0.15)] relative z-10 scale-110"
                />
                {/* Floor Shadow */}
                <div className="absolute bottom-0 w-16 h-2 bg-black/40 blur-sm rounded-full" />
            </div>

            {/* Base Stats Row */}
            <div className="w-full flex items-center justify-between mt-auto border-t border-border/50 pt-2 relative z-10">
                <div className="flex items-center gap-1 text-[10px] font-medium text-green-500" title="Health Points">
                    <Heart className="w-3 h-3" />
                    {maxHp}
                </div>
                <div className="flex items-center gap-1 text-[10px] font-medium text-red-400" title="Attack">
                    <Sword className="w-3 h-3" />
                    {attack}
                </div>
                <div className="flex items-center gap-1 text-[10px] font-medium text-blue-400" title="Defense">
                    <Shield className="w-3 h-3" />
                    {defense}
                </div>
                <div className="flex items-center gap-1 text-[10px] font-medium text-yellow-500" title="Speed">
                    <Zap className="w-3 h-3" />
                    {speed}
                </div>
            </div>

        </div>
    );
}
