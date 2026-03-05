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
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Sprite Image
            SizedBox(
              height: isLarge ? 120 : 80,
              width: isLarge ? 120 : 80,
              child: pokemon.spriteUrl.isNotEmpty
                  ? Image.network(
                      pokemon.spriteUrl,
                      fit: BoxFit.contain,
                      errorBuilder: (context, error, stackTrace) =>
                          const Icon(Icons.help_outline, size: 40),
                    )
                  : const Icon(Icons.pets, size: 40, color: AppColors.textSecondary),
            ),
            const SizedBox(height: 12),
            
            // Name
            Text(
              pokemon.name.toUpperCase(),
              style: TextStyle(
                fontSize: isLarge ? 18 : 14,
                fontWeight: FontWeight.bold,
                letterSpacing: 0.5,
              ),
            ),
            const SizedBox(height: 4),
            
            // Types
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: pokemon.types.map((type) => Container(
                margin: const EdgeInsets.symmetric(horizontal: 4),
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: AppColors.arenaBlue.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(4),
                  border: Border.all(color: AppColors.arenaBlue.withOpacity(0.3)),
                ),
                child: Text(
                  type,
                  style: const TextStyle(fontSize: 10, color: AppColors.arenaBlue, fontWeight: FontWeight.bold),
                ),
              )).toList(),
            ),
            
            const SizedBox(height: 12),
            
            // Stats (Simplified for card view)
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _statItem('HP', pokemon.stats.currentHp.toString()),
                _statItem('ATK', pokemon.stats.attack.toString()),
                _statItem('DEF', pokemon.stats.defense.toString()),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _statItem(String label, String value) {
    return Column(
      children: [
        Text(
          label,
          style: const TextStyle(fontSize: 9, color: AppColors.textSecondary, fontWeight: FontWeight.bold),
        ),
        Text(
          value,
          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
        ),
      ],
    );
  }
}
