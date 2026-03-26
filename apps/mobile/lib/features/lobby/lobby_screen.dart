import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../core/providers/lobby_provider.dart';
import '../../core/theme/app_theme.dart';
import '../../core/models/player.dart';
import '../../l10n/app_localizations.dart';
import 'components/pokemon_card.dart';

class LobbyScreen extends StatefulWidget {
  const LobbyScreen({super.key});

  @override
  State<LobbyScreen> createState() => _LobbyScreenState();
}

class _LobbyScreenState extends State<LobbyScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final lobby = context.read<LobbyProvider>();
      if (lobby.localPlayer?.team == null || lobby.localPlayer!.team!.isEmpty) {
        lobby.requestTeam();
      }
      lobby.addListener(_onLobbyStateChanged);
    });
  }

  @override
  void dispose() {
    final lobby = context.read<LobbyProvider>();
    lobby.removeListener(_onLobbyStateChanged);
    super.dispose();
  }

  void _onLobbyStateChanged() {
    if (!mounted) return;
    final lobby = context.read<LobbyProvider>();
    if (lobby.lobbyStatus == LobbyStatus.battling) {
      if (GoRouterState.of(context).uri.toString() != '/battle') {
        context.go('/battle');
      }
    }
  }

  String _formatTimeAgo(AppLocalizations l10n, DateTime date) {
    final diff = DateTime.now().difference(date);
    if (diff.inSeconds < 60) {
      return l10n.lobbyTimeAgoMoments;
    } else if (diff.inMinutes < 60) {
      return l10n.lobbyTimeAgoMinutes(diff.inMinutes);
    } else if (diff.inHours < 24) {
      return l10n.lobbyTimeAgoHours(diff.inHours);
    } else {
      return l10n.lobbyTimeAgoDays(diff.inDays);
    }
  }

  @override
  Widget build(BuildContext context) {
    final lobby = context.watch<LobbyProvider>();
    final localPlayer = lobby.localPlayer;
    final opponent = lobby.opponent;
    final l10n = AppLocalizations.of(context)!;

    return Scaffold(
      appBar: AppBar(
        title: Text(
          l10n.lobbyAppBarTitle,
          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, letterSpacing: 1.5),
        ),
        centerTitle: true,
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.history, size: 22, color: AppColors.textSecondary),
            tooltip: l10n.lobbyHistoryTooltip,
            onPressed: () => _showGlobalHistoryModal(context),
          ),
          IconButton(
            icon: const Icon(Icons.logout, size: 20, color: AppColors.textSecondary),
            onPressed: () {
              lobby.disconnect();
              context.go('/');
            },
          ),
        ],
      ),
      body: Column(
        children: [
          if (lobby.socketActionError != null)
            Material(
              color: Colors.red.withOpacity(0.12),
              child: InkWell(
                onTap: () => lobby.clearSocketActionError(),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  child: Row(
                    children: [
                      Expanded(
                        child: Text(
                          lobby.socketActionError!,
                          style: const TextStyle(color: Colors.redAccent, fontSize: 12),
                        ),
                      ),
                      TextButton(
                        onPressed: () => lobby.clearSocketActionError(),
                        child: const Text('OK'),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          _buildStatusBanner(lobby),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Row(
                    children: [
                      _playerInfoTile(l10n, localPlayer, isLocal: true),
                      const SizedBox(width: 8),
                      Text(l10n.vs, style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.textSecondary, fontSize: 10)),
                      const SizedBox(width: 8),
                      _playerInfoTile(l10n, opponent, isLocal: false),
                    ],
                  ),
                  const SizedBox(height: 24),
                  Text(
                    l10n.lobbyYourTeam,
                    style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.textSecondary, letterSpacing: 1.0),
                  ),
                  const SizedBox(height: 12),
                  if (lobby.isRequestingTeam)
                    const Center(
                      child: Padding(
                        padding: EdgeInsets.all(40.0),
                        child: CircularProgressIndicator(),
                      ),
                    )
                  else if (localPlayer?.team != null && localPlayer!.team!.isNotEmpty)
                    GridView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        crossAxisSpacing: 8,
                        mainAxisSpacing: 8,
                        mainAxisExtent: 76,
                      ),
                      itemCount: localPlayer.team!.length,
                      itemBuilder: (context, index) {
                        return PokemonCard(pokemon: localPlayer.team![index]);
                      },
                    )
                  else
                    Center(child: Text(l10n.lobbyWaitingTeam)),
                  const SizedBox(height: 24),
                ],
              ),
            ),
          ),
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(20.0),
              child: localPlayer?.isReady ?? false
                  ? Container(
                      height: 56,
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        color: AppColors.success.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppColors.success.withOpacity(0.3)),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.check_circle, color: AppColors.success),
                          const SizedBox(width: 8),
                          Text(
                            l10n.lobbyReadyToFight,
                            style: const TextStyle(color: AppColors.success, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    )
                  : ElevatedButton(
                      onPressed: (localPlayer?.team != null && localPlayer!.team!.isNotEmpty)
                          ? () => lobby.emitReady()
                          : null,
                      style: ElevatedButton.styleFrom(minimumSize: const Size(double.infinity, 56)),
                      child: Text(l10n.lobbyIAmReady),
                    ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusBanner(LobbyProvider lobby) {
    final l10n = AppLocalizations.of(context)!;
    String text = l10n.lobbyWaitingPlayers;
    Color color = AppColors.textSecondary.withOpacity(0.1);
    Color textColor = AppColors.textSecondary;

    if (lobby.players.length == 2) {
      final readyCount = lobby.players.where((p) => p.isReady).length;
      text = l10n.lobbyRivalFound(readyCount);
      color = AppColors.arenaBlue.withOpacity(0.1);
      textColor = AppColors.arenaBlue;
    }

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 8),
      color: color,
      child: Text(
        text,
        style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: textColor, letterSpacing: 0.5),
        textAlign: TextAlign.center,
      ),
    );
  }

  Widget _playerInfoTile(AppLocalizations l10n, Player? player, {required bool isLocal}) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: AppColors.panel,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.border),
        ),
        child: Column(
          children: [
            Row(
              children: [
                CircleAvatar(
                  radius: 12,
                  backgroundColor: isLocal ? AppColors.arenaBlue : AppColors.textSecondary.withOpacity(0.2),
                  child: Icon(Icons.person, size: 14, color: isLocal ? Colors.white : AppColors.textSecondary),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    player?.nickname ?? (isLocal ? l10n.lobbyYou : l10n.lobbyWaitingOpponent),
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                if (player?.isReady ?? false) const Icon(Icons.check_circle, size: 16, color: AppColors.success),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _showGlobalHistoryModal(BuildContext context) {
    final lobby = context.read<LobbyProvider>();
    lobby.requestGlobalHistory();

    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.background,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) {
        return DraggableScrollableSheet(
          expand: false,
          initialChildSize: 0.6,
          maxChildSize: 0.9,
          minChildSize: 0.4,
          builder: (context, scrollController) {
            final modalLobby = context.watch<LobbyProvider>();
            final history = modalLobby.globalHistory;
            final sheetL10n = AppLocalizations.of(context)!;

            return Column(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  decoration: const BoxDecoration(
                    border: Border(bottom: BorderSide(color: AppColors.border)),
                  ),
                  child: Center(
                    child: Text(
                      sheetL10n.lobbyRegionalHistory,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 2.0,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 8),
                Expanded(
                  child: history.isEmpty
                      ? Center(
                          child: Text(
                            sheetL10n.lobbyNoRecentBattles,
                            style: const TextStyle(color: AppColors.textSecondary),
                          ),
                        )
                      : ListView.builder(
                          controller: scrollController,
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                          itemCount: history.length,
                          itemBuilder: (context, index) {
                            final entry = history[index];
                            final isInProgress = entry.status == 'in_progress';

                            return Container(
                              margin: const EdgeInsets.only(bottom: 12),
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: AppColors.panel,
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(
                                  color: isInProgress ? AppColors.arenaBlue.withOpacity(0.5) : AppColors.border,
                                  width: isInProgress ? 2 : 1,
                                ),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.stretch,
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                        decoration: BoxDecoration(
                                          color: isInProgress
                                              ? AppColors.arenaBlue.withOpacity(0.2)
                                              : AppColors.textSecondary.withOpacity(0.2),
                                          borderRadius: BorderRadius.circular(6),
                                        ),
                                        child: Text(
                                          isInProgress ? sheetL10n.lobbyStatusInProgress : sheetL10n.lobbyStatusFinished,
                                          style: TextStyle(
                                            fontSize: 10,
                                            fontWeight: FontWeight.bold,
                                            color: isInProgress ? AppColors.arenaBlue : AppColors.textSecondary,
                                          ),
                                        ),
                                      ),
                                      Text(
                                        _formatTimeAgo(sheetL10n, entry.createdAt),
                                        style: const TextStyle(
                                          fontSize: 11,
                                          color: AppColors.textSecondary,
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 12),
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                                    children: [
                                      Expanded(
                                        child: Text(
                                          entry.player1,
                                          textAlign: TextAlign.right,
                                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ),
                                      Padding(
                                        padding: const EdgeInsets.symmetric(horizontal: 12),
                                        child: Text(
                                          sheetL10n.vs,
                                          style: const TextStyle(color: AppColors.textSecondary, fontSize: 12, fontWeight: FontWeight.bold),
                                        ),
                                      ),
                                      Expanded(
                                        child: Text(
                                          entry.player2,
                                          textAlign: TextAlign.left,
                                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ),
                                    ],
                                  ),
                                  if (!isInProgress && entry.winnerName != null) ...[
                                    const SizedBox(height: 12),
                                    Container(
                                      padding: const EdgeInsets.all(8),
                                      decoration: BoxDecoration(
                                        color: AppColors.success.withOpacity(0.1),
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: Row(
                                        mainAxisAlignment: MainAxisAlignment.center,
                                        children: [
                                          const Icon(Icons.emoji_events, color: AppColors.success, size: 16),
                                          const SizedBox(width: 8),
                                          Text(
                                            sheetL10n.lobbyWinner(entry.winnerName!),
                                            style: const TextStyle(
                                              color: AppColors.success,
                                              fontWeight: FontWeight.bold,
                                              fontSize: 13,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ]
                                ],
                              ),
                            );
                          },
                        ),
                ),
              ],
            );
          },
        );
      },
    );
  }
}
