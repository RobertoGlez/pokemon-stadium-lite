import 'dart:async';
import 'package:flutter/material.dart';
import '../models/player.dart';
import '../models/pokemon.dart';
import '../models/battle.dart';
import '../network/socket_client.dart';

class BattleLogEntry {
  final String id;
  final String type; // info, damage, defeat, switch, winner
  final String message;
  final DateTime timestamp;

  BattleLogEntry({
    required this.id,
    required this.type,
    required this.message,
    required this.timestamp,
  });
}

class LobbyProvider extends ChangeNotifier {
  final SocketClient _socketClient = SocketClient();
  
  bool _isConnected = false;
  String _localNickname = '';
  LobbyStatus _lobbyStatus = LobbyStatus.idle;
  List<Player> _players = [];
  String? _currentTurnPlayerId;
  String? _winnerId;
  List<BattleLogEntry> _battleLog = [];
  bool _isRequestingTeam = false;
  String? _joinError;

  // Getters
  bool get isConnected => _isConnected;
  String get localNickname => _localNickname;
  LobbyStatus get lobbyStatus => _lobbyStatus;
  List<Player> get players => _players;
  String? get currentTurnPlayerId => _currentTurnPlayerId;
  List<BattleLogEntry> get battleLog => _battleLog;
  bool get isRequestingTeam => _isRequestingTeam;
  String? get joinError => _joinError;
  String? get winnerId => _winnerId;

  Player? get localPlayer {
    try {
      return _players.firstWhere((p) => p.nickname == _localNickname);
    } catch (_) {
      return null;
    }
  }

  Player? get opponent {
    try {
      return _players.firstWhere((p) => p.nickname != _localNickname);
    } catch (_) {
      return null;
    }
  }

  bool get isMyTurn => localPlayer?.id == _currentTurnPlayerId;

  void connectAndJoin(String url, String nickname) {
    _localNickname = nickname;
    _socketClient.connect(url);
    
    _socketClient.on('connect', (_) {
      _isConnected = true;
      _socketClient.emit('join_lobby', nickname);
      notifyListeners();
    });

    _socketClient.on('disconnect', (_) {
      _isConnected = false;
      _lobbyStatus = LobbyStatus.idle;
      notifyListeners();
    });

    _socketClient.on('lobby_status', (data) {
      final payload = LobbyStatusPayload.fromJson(data);
      _lobbyStatus = payload.status;
      _players = payload.players;
      
      // Clear requesting team state if team is assigned
      if (localPlayer?.team != null && localPlayer!.team!.isNotEmpty) {
        _isRequestingTeam = false;
      }
      notifyListeners();
    });

    _socketClient.on('battle_start', (data) {
      final payload = BattleStartPayload.fromJson(data);
      _lobbyStatus = LobbyStatus.battling;
      _currentTurnPlayerId = payload.currentTurnPlayerId;
      _appendLog('info', '¡La batalla ha comenzado!');
      notifyListeners();
    });

    _socketClient.on('turn_result', (data) {
      final payload = TurnResultPayload.fromJson(data);
      _handleTurnResult(payload);
    });

    _socketClient.on('battle_end', (data) {
      final payload = BattleEndPayload.fromJson(data);
      _lobbyStatus = LobbyStatus.finished;
      _winnerId = payload.winnerId;
      _appendLog('winner', '¡${payload.winnerName} ha ganado la batalla!');
      notifyListeners();
    });

    _socketClient.on('join_error', (data) {
      _joinError = data['message'] ?? 'Error al unirse';
      _socketClient.disconnect();
      _isConnected = false;
      notifyListeners();
    });
  }

  void _handleTurnResult(TurnResultPayload result) {
    if (result.damage > 0) {
      // Use orElse to safely find active Pokémon
      final attacker = _players.firstWhere((p) => p.id == result.attackerId, orElse: () => _players.first);
      final defender = _players.firstWhere((p) => p.id == result.defenderId, orElse: () => _players.last);

      final attackerActive = attacker.team?.where((p) => !p.isDefeated).firstOrNull;
      final defenderActive = defender.team?.where((p) => !p.isDefeated).firstOrNull;

      if (attackerActive != null && defenderActive != null) {
        _appendLog('damage', '${attackerActive.name} atacó a ${defenderActive.name} por ${result.damage} de daño.');
      }

      if (result.pokemonFainted && defenderActive != null) {
        _appendLog('defeat', '¡${defenderActive.name} fue derrotado!');
        if (result.nextDefenderPokemon != null) {
          _appendLog('switch', '${defender.nickname} envía a ${result.nextDefenderPokemon!.name}.');
        }
      }
    }

    // Update player HP — MUST happen before notifyListeners
    _updatePlayersHP(result);

    if (!result.matchFinished) {
      if (result.isDefeated) {
        // Mirror the web app: delay turn update by 1200ms when a faint occurs
        // to let local state become consistent before the next turn starts.
        Future.delayed(const Duration(milliseconds: 1200), () {
          _currentTurnPlayerId = result.nextTurnPlayerId;
          notifyListeners();
        });
      } else {
        _currentTurnPlayerId = result.nextTurnPlayerId;
      }
    }
    notifyListeners();
  }

  void _updatePlayersHP(TurnResultPayload result) {
    _players = _players.map((p) {
      if (p.id == result.defenderId) {
        final team = p.team?.map((poke) {
          // Only update the FIRST non-defeated Pokémon (the active one)
          // This is the one who took damage.
          if (!poke.isDefeated) {
            final newStats = PokemonStats(
              maxHp: poke.stats.maxHp,
              // BUG FIX: If it fainted, clamp HP to 0 — don't use remainingHp
              // which might not be 0 yet in the payload timing.
              currentHp: result.isDefeated ? 0 : result.remainingHp,
              attack: poke.stats.attack,
              defense: poke.stats.defense,
              speed: poke.stats.speed,
            );
            return PokemonBase(
              id: poke.id,
              name: poke.name,
              types: poke.types,
              stats: newStats,
              spriteUrl: poke.spriteUrl,
              // BUG FIX: Only mark THIS specific Pokémon as defeated.
              // The old code set isDefeated on every active Pokémon which
              // caused firstWhere(!p.isDefeated) to find nothing next turn.
              isDefeated: result.isDefeated,
            );
          }
          // All other Pokémon in the team remain unchanged
          return poke;
        }).toList();
        return Player(
          id: p.id,
          nickname: p.nickname,
          joinedLobbyAt: p.joinedLobbyAt,
          isReady: p.isReady,
          team: team,
        );
      }
      return p;
    }).toList();
  }

  void _appendLog(String type, String message) {
    _battleLog.add(BattleLogEntry(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      type: type,
      message: message,
      timestamp: DateTime.now(),
    ));
  }

  void requestTeam() {
    _isRequestingTeam = true;
    _socketClient.emit('assign_pokemon');
    notifyListeners();
  }

  void emitReady() {
    _socketClient.emit('ready');
  }

  void emitAttack() {
    _socketClient.emit('attack');
  }

  void clearJoinError() {
    _joinError = null;
    notifyListeners();
  }

  void disconnect() {
    _socketClient.disconnect();
    _resetState();
    notifyListeners();
  }

  void _resetState() {
    _isConnected = false;
    _lobbyStatus = LobbyStatus.idle;
    _players = [];
    _currentTurnPlayerId = null;
    _battleLog = [];
    _winnerId = null;
  }
}
