import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../core/providers/lobby_provider.dart';
import '../../core/theme/app_theme.dart';
import '../../core/models/pokemon.dart';
import '../../core/models/player.dart'; // Added for LobbyStatus
import 'components/hp_bar.dart';

class BattleScreen extends StatefulWidget {
  const BattleScreen({super.key});

  @override
  State<BattleScreen> createState() => _BattleScreenState();
}

class _BattleScreenState extends State<BattleScreen> {
  final ScrollController _logScrollController = ScrollController();

  @override
  void dispose() {
    _logScrollController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    if (_logScrollController.hasClients) {
      _logScrollController.animateTo(
        _logScrollController.position.maxScrollExtent,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final lobby = context.watch<LobbyProvider>();
    final localPlayer = lobby.localPlayer;
    final opponent = lobby.opponent;

    // Auto-scroll logs
    WidgetsBinding.instance.addPostFrameCallback((_) => _scrollToBottom());

    // Navigation for finished match
    if (lobby.lobbyStatus == LobbyStatus.finished) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        context.go('/results');
      });
    }

    if (localPlayer == null || opponent == null) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    final myActive = localPlayer.team?.firstWhere((p) => !p.isDefeated, orElse: () => localPlayer.team!.first);
    final opponentActive = opponent.team?.firstWhere((p) => !p.isDefeated, orElse: () => opponent.team!.first);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // Opponent Section (Top)
            Expanded(
              flex: 4,
              child: _buildPokemonArenaSide(opponentActive!, opponent.nickname, isOpponent: true),
            ),
            
            // Divider / Battle Logs
            Expanded(
              flex: 2,
              child: Container(
                margin: const EdgeInsets.symmetric(horizontal: 16),
                decoration: BoxDecoration(
                  color: AppColors.panel,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.border),
                ),
                child: ListView.builder(
                  controller: _logScrollController,
                  padding: const EdgeInsets.all(12),
                  itemCount: lobby.battleLog.length,
                  itemBuilder: (context, index) {
                    final entry = lobby.battleLog[index];
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 4.0),
                      child: Text(
                        entry.message,
                        style: TextStyle(
                          fontSize: 12,
                          color: _getLogColor(entry.type),
                          fontWeight: entry.type == 'info' ? FontWeight.bold : FontWeight.normal,
                        ),
                      ),
                    );
                  },
                ),
              ),
            ),

            // Local Player Section (Bottom)
            Expanded(
              flex: 4,
              child: _buildPokemonArenaSide(myActive!, localPlayer.nickname, isOpponent: false),
            ),

            // Controls
            _buildActionPanel(lobby),
          ],
        ),
      ),
    );
  }

  Widget _buildPokemonArenaSide(PokemonBase pokemon, String trainerName, {required bool isOpponent}) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 12.0),
      child: Column(
        mainAxisAlignment: isOpponent ? MainAxisAlignment.start : MainAxisAlignment.end,
        children: [
          if (isOpponent) ...[
             _trainerInfo(trainerName, isOpponent),
             const SizedBox(height: 8),
             HpBar(
               percentage: pokemon.stats.hpPercentage,
               label: '${pokemon.stats.currentHp}/${pokemon.stats.maxHp}',
               isLarge: true,
             ),
             const Spacer(),
          ],
          
          // Sprite with simple animation placeholder
          TweenAnimationBuilder(
            tween: Tween<double>(begin: 0, end: 1),
            duration: const Duration(seconds: 1),
            builder: (context, double value, child) {
              return Transform.scale(
                scale: 0.8 + (value * 0.2), // Slightly smaller scale
                child: Opacity(
                  opacity: value,
                  child: child,
                ),
              );
            },
            child: SizedBox(
              height: 120, // Reduced from 150
              width: 120,
              child: Image.network(
                pokemon.spriteUrl,
                fit: BoxFit.contain,
                errorBuilder: (context, error, stackTrace) => const Icon(Icons.help, size: 60),
              ),
            ),
          ),
          
          if (!isOpponent) ...[
             const Spacer(),
             HpBar(
               percentage: pokemon.stats.hpPercentage,
               label: '${pokemon.stats.currentHp}/${pokemon.stats.maxHp}',
               isLarge: true,
             ),
             const SizedBox(height: 12),
             _trainerInfo(trainerName, isOpponent),
          ],
        ],
      ),
    );
  }

  Widget _trainerInfo(String name, bool isOpponent) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          name.toUpperCase(),
          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 1, color: AppColors.textSecondary),
        ),
        if (isOpponent) 
          const Icon(Icons.shield, size: 14, color: AppColors.textSecondary)
        else
          const Icon(Icons.bolt, size: 14, color: AppColors.arenaBlue),
      ],
    );
  }

  Widget _buildActionPanel(LobbyProvider lobby) {
    final bool isMyTurn = lobby.isMyTurn;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: const BoxDecoration(
        color: AppColors.panel,
        border: Border(top: BorderSide(color: AppColors.border)),
      ),
      child: SafeArea(
        top: false,
        child: Column(
          children: [
            ElevatedButton(
              onPressed: isMyTurn ? () => lobby.emitAttack() : null,
              style: ElevatedButton.styleFrom(
                minimumSize: const Size(double.infinity, 60),
                backgroundColor: isMyTurn ? AppColors.arenaBlue : Colors.grey.withOpacity(0.1),
                foregroundColor: isMyTurn ? Colors.white : AppColors.textSecondary,
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    isMyTurn ? '¡ATACAR!' : 'ESPERANDO RIVAL...',
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, letterSpacing: 2),
                  ),
                  if (!isMyTurn)
                    Text(
                      'L: ${lobby.localPlayer?.id.substring(0, 6)}... T: ${lobby.currentTurnPlayerId?.substring(0, 6)}...',
                      style: const TextStyle(fontSize: 10, color: Colors.grey),
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Color _getLogColor(String type) {
    switch (type) {
      case 'damage': return AppColors.warning;
      case 'defeat': return AppColors.danger;
      case 'winner': return AppColors.success;
      case 'switch': return AppColors.arenaBlue;
      default: return AppColors.textSecondary;
    }
  }
}
