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
    });
  }

  @override
  Widget build(BuildContext context) {
    final lobby = context.watch<LobbyProvider>();
    final localPlayer = lobby.localPlayer;
    final opponent = lobby.opponent;

    // Listen for battle start and navigate
    if (lobby.lobbyStatus == LobbyStatus.battling) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        context.go('/battle');
      });
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('LOBBY GLOBAL', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, letterSpacing: 1.5)),
        centerTitle: true,
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
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
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Players Row
                  Row(
                    children: [
                      _playerInfoTile(localPlayer, isLocal: true),
                      const SizedBox(width: 12),
                      const Text('VS', style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.textSecondary)),
                      const SizedBox(width: 12),
                      _playerInfoTile(opponent, isLocal: false),
                    ],
                  ),
                  
                  const SizedBox(height: 32),
                  
                  // Team Section
                  const Text(
                    'TU EQUIPO ASIGNADO',
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.textSecondary, letterSpacing: 1.0),
                  ),
                  const SizedBox(height: 16),
                  
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
                        crossAxisSpacing: 12,
                        mainAxisSpacing: 12,
                        childAspectRatio: 0.85,
                      ),
                      itemCount: localPlayer.team!.length,
                      itemBuilder: (context, index) {
                        return PokemonCard(pokemon: localPlayer.team![index]);
                      },
                    )
                  else
                    const Center(child: Text('Esperando asignación de equipo...')),
                  
                  const SizedBox(height: 40),
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
                      style: ElevatedButton.styleFrom(height: 56),
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
}
