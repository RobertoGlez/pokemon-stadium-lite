import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../core/providers/lobby_provider.dart';
import '../../core/theme/app_theme.dart';
import '../../l10n/app_localizations.dart';

class ResultsScreen extends StatelessWidget {
  const ResultsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final lobby = context.watch<LobbyProvider>();
    final l10n = AppLocalizations.of(context)!;
    final isWinner = lobby.localPlayer?.id == lobby.winnerId;
    final winnerName = lobby.players.firstWhere((p) => p.id == lobby.winnerId, orElse: () => lobby.players.first).nickname;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: Stack(
        children: [
          Positioned.fill(
            child: Opacity(
              opacity: 0.05,
              child: GridPaper(
                color: Colors.white.withOpacity(0.1),
                divisions: 1,
                interval: 40,
                subdivisions: 1,
              ),
            ),
          ),
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(40, 48, 40, 60),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Spacer(),
                  TweenAnimationBuilder(
                    tween: Tween<double>(begin: 0, end: 1),
                    duration: const Duration(seconds: 1),
                    curve: Curves.elasticOut,
                    builder: (context, double value, child) {
                      return Transform.scale(
                        scale: value,
                        child: child,
                      );
                    },
                    child: Container(
                      width: 160,
                      height: 160,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: (isWinner ? AppColors.success : AppColors.danger).withOpacity(0.1),
                        border: Border.all(
                          color: (isWinner ? AppColors.success : AppColors.danger).withOpacity(0.3),
                          width: 2,
                        ),
                      ),
                      child: Icon(
                        isWinner ? Icons.emoji_events : Icons.heart_broken,
                        size: 80,
                        color: isWinner ? AppColors.success : AppColors.danger,
                      ),
                    ),
                  ),
                  const SizedBox(height: 48),
                  Text(
                    isWinner ? l10n.resultsVictory : l10n.resultsGameOver,
                    style: TextStyle(
                      fontSize: 40,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 2.0,
                      color: isWinner ? AppColors.success : AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    isWinner ? l10n.resultsSubtitleWin : l10n.resultsSubtitleLose,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontSize: 16,
                      color: AppColors.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 32),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                    decoration: BoxDecoration(
                      color: AppColors.panel,
                      borderRadius: BorderRadius.circular(100),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.stars, size: 16, color: AppColors.warning),
                        const SizedBox(width: 8),
                        Text(
                          l10n.resultsWinnerBadge(winnerName.toUpperCase()),
                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 1),
                        ),
                      ],
                    ),
                  ),
                  const Spacer(),
                  ElevatedButton(
                    onPressed: () {
                      lobby.disconnect();
                      context.go('/');
                    },
                    style: ElevatedButton.styleFrom(
                      minimumSize: const Size(double.infinity, 56),
                    ),
                    child: Text(l10n.resultsBackToLobby),
                  ),
                  const SizedBox(height: 12),
                  OutlinedButton(
                    onPressed: () {},
                    style: OutlinedButton.styleFrom(
                      minimumSize: const Size(double.infinity, 56),
                      side: const BorderSide(color: AppColors.border),
                      foregroundColor: AppColors.textSecondary,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: Text(l10n.resultsExitGame),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
