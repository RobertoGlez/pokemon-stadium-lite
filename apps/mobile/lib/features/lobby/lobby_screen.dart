import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../core/providers/lobby_provider.dart';
import '../../core/theme/app_theme.dart';
import '../../core/models/player.dart';
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
    // Auto-request team if not present
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

  @override
  Widget build(BuildContext context) {
    final lobby = context.watch<LobbyProvider>();
    final localPlayer = lobby.localPlayer;
    final opponent = lobby.opponent;

    return Scaffold(
      appBar: AppBar(
        title: const Text('LOBBY GLOBAL', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, letterSpacing: 1.5)),
        centerTitle: true,
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.history, size: 22, color: AppColors.textSecondary),
            tooltip: 'Historial Global',
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
          // Status Banner
          _buildStatusBanner(lobby),
          
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(12), // Reduced padding
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Players Row
                  Row(
                    children: [
                      _playerInfoTile(localPlayer, isLocal: true),
                      const SizedBox(width: 8),
                      const Text('VS', style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.textSecondary, fontSize: 10)),
                      const SizedBox(width: 8),
                      _playerInfoTile(opponent, isLocal: false),
                    ],
                  ),
                  
                  const SizedBox(height: 24),
                  
                  // Team Section
                  const Text(
                    'TU EQUIPO ASIGNADO',
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.textSecondary, letterSpacing: 1.0),
                  ),
                  const SizedBox(height: 12),
                  
                  if (lobby.isRequestingTeam)
                    const Center(child: Padding(
                      padding: EdgeInsets.all(40.0),
                      child: CircularProgressIndicator(),
                    ))
                  else if (localPlayer?.team != null && localPlayer!.team!.isNotEmpty)
                    GridView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        crossAxisSpacing: 8,
                        mainAxisSpacing: 8,
                        mainAxisExtent: 76, // Fixed pixel height — eliminates empty space
                      ),
                      itemCount: localPlayer.team!.length,
                      itemBuilder: (context, index) {
                        return PokemonCard(pokemon: localPlayer.team![index]);
                      },
                    )
                  else
                    const Center(child: Text('Esperando asignación de equipo...')),
                  
                  const SizedBox(height: 24),
                ],
              ),
            ),
          ),
          
          // Action Footer
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
                      child: const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.check_circle, color: AppColors.success),
                          SizedBox(width: 8),
                          Text('¡LISTO PARA LUCHAR!', style: TextStyle(color: AppColors.success, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    )
                  : ElevatedButton(
                      onPressed: (localPlayer?.team != null && localPlayer!.team!.isNotEmpty)
                          ? () => lobby.emitReady()
                          : null,
                      style: ElevatedButton.styleFrom(minimumSize: const Size(double.infinity, 56)),
                      child: const Text('ESTOY LISTO'),
                    ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusBanner(LobbyProvider lobby) {
    String text = 'ESPERANDO JUGADORES...';
    Color color = AppColors.textSecondary.withOpacity(0.1);
    Color textColor = AppColors.textSecondary;

    if (lobby.players.length == 2) {
      final readyCount = lobby.players.where((p) => p.isReady).length;
      text = 'RIVAL ENCONTRADO ($readyCount/2 LISTOS)';
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

  Widget _playerInfoTile(Player? player, {required bool isLocal}) {
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
                    player?.nickname ?? (isLocal ? 'Tú' : 'Esperando...'),
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                if (player?.isReady ?? false)
                  const Icon(Icons.check_circle, size: 16, color: AppColors.success),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _showGlobalHistoryModal(BuildContext context) {
    // We get a direct read of the provider to emit the request without triggering a build
    final lobby = context.read<LobbyProvider>();
    lobby.requestGlobalHistory();

    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.background,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (BottomSheetContext) {
        return DraggableScrollableSheet(
          expand: false,
          initialChildSize: 0.6,
          maxChildSize: 0.9,
          minChildSize: 0.4,
          builder: (context, scrollController) {
            // Watch the provider inside the builder to ensure the modal updates
            // when the globalHistory list changes via WebSockets.
            final modalLobby = context.watch<LobbyProvider>();
            final history = modalLobby.globalHistory;

            return Column(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  decoration: const BoxDecoration(
                    border: Border(bottom: BorderSide(color: AppColors.border)),
                  ),
                  child: const Center(
                    child: Text(
                      'HISTORIAL REGIONAL',
                      style: TextStyle(
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
                      ? const Center(
                          child: Text(
                            'No hay batallas recientes.',
                            style: TextStyle(color: AppColors.textSecondary),
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
                                  color: isInProgress
                                      ? AppColors.arenaBlue.withOpacity(0.5)
                                      : AppColors.border,
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
                                          isInProgress ? 'EN CURSO' : 'TERMINADA',
                                          style: TextStyle(
                                            fontSize: 10,
                                            fontWeight: FontWeight.bold,
                                            color: isInProgress ? AppColors.arenaBlue : AppColors.textSecondary,
                                          ),
                                        ),
                                      ),
                                      Text(
                                        'Hace ${_formatTimeAgo(entry.createdAt)}',
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
                                      const Padding(
                                        padding: EdgeInsets.symmetric(horizontal: 12),
                                        child: Text('VS', style: TextStyle(color: AppColors.textSecondary, fontSize: 12, fontWeight: FontWeight.bold)),
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
                                            'Ganador: ${entry.winnerName}',
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

  String _formatTimeAgo(DateTime date) {
    final diff = DateTime.now().difference(date);
    if (diff.inSeconds < 60) {
      return 'unos segundos';
    } else if (diff.inMinutes < 60) {
      return '${diff.inMinutes}m';
    } else if (diff.inHours < 24) {
      return '${diff.inHours}h';
    } else {
      return '${diff.inDays}d';
    }
  }
}
