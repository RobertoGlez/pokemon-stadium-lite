import 'package:flutter/material.dart';
import '../../../core/models/pokemon.dart';
import '../../../core/theme/app_theme.dart';

class PokemonCard extends StatelessWidget {
  final PokemonBase pokemon;
  final bool isLarge;

  const PokemonCard({
    super.key,
    required this.pokemon,
    this.isLarge = false,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 8.0, vertical: 4.0),
        child: Row(
          children: [
            // Sprite
            SizedBox(
              height: isLarge ? 60 : 44,
              width: isLarge ? 60 : 44,
              child: pokemon.spriteUrl.isNotEmpty
                  ? Image.network(
                      pokemon.spriteUrl,
                      fit: BoxFit.contain,
                      errorBuilder: (_, __, ___) => const Icon(Icons.help_outline, size: 20),
                    )
                  : const Icon(Icons.pets, size: 20, color: AppColors.textSecondary),
            ),
            const SizedBox(width: 8),
            // Info
            Expanded(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    pokemon.name.toUpperCase(),
                    style: TextStyle(
                      fontSize: isLarge ? 13 : 11,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 0.2,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 1),
                  // Types
                  Wrap(
                    spacing: 3,
                    runSpacing: 1,
                    children: pokemon.types.map((type) => Container(
                      padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
                      decoration: BoxDecoration(
                        color: AppColors.arenaBlue.withOpacity(0.08),
                        borderRadius: BorderRadius.circular(3),
                        border: Border.all(color: AppColors.arenaBlue.withOpacity(0.15)),
                      ),
                      child: Text(
                        type.toUpperCase(),
                        style: const TextStyle(fontSize: 6, color: AppColors.arenaBlue, fontWeight: FontWeight.w900),
                      ),
                    )).toList(),
                  ),
                  const SizedBox(height: 2),
                  // Stats
                  Row(
                    mainAxisAlignment: MainAxisAlignment.start,
                    children: [
                      _statItem('HP', pokemon.stats.currentHp.toString()),
                      const SizedBox(width: 8),
                      _statItem('ATK', pokemon.stats.attack.toString()),
                      const SizedBox(width: 8),
                      _statItem('DEF', pokemon.stats.defense.toString()),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _statItem(String label, String value) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          label,
          style: const TextStyle(fontSize: 7, color: AppColors.textSecondary, fontWeight: FontWeight.bold),
        ),
        Text(
          value,
          style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w900),
        ),
      ],
    );
  }
}
