import 'dart:async';
import 'package:flutter/material.dart';
import '../../l10n/app_localizations.dart';
import '../models/player.dart';
import '../models/pokemon.dart';
import '../models/battle.dart';
import '../models/global_history.dart';
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

  Locale _locale = const Locale('es');

  void updateLocale(Locale locale) {
    if (_locale.languageCode == locale.languageCode) return;
    _locale = locale;
  }

  AppLocalizations get _l10n => lookupAppLocalizations(_locale);

  bool _isConnected = false;
  String _localNickname = '';
  LobbyStatus _lobbyStatus = LobbyStatus.idle;
  List<Player> _players = [];
  String? _currentTurnPlayerId;
  String? _winnerId;
  List<BattleLogEntry> _battleLog = [];
  List<GlobalHistoryEntry> _globalHistory = [];
  bool _isRequestingTeam = false;
  String? _joinError;
  String? _socketActionError;

  // Getters
  bool get isConnected => _isConnected;
  String get localNickname => _localNickname;
  LobbyStatus get lobbyStatus => _lobbyStatus;
  List<Player> get players => _players;
  String? get currentTurnPlayerId => _currentTurnPlayerId;
  List<BattleLogEntry> get battleLog => _battleLog;
  List<GlobalHistoryEntry> get globalHistory => _globalHistory;
  bool get isRequestingTeam => _isRequestingTeam;
  String? get joinError => _joinError;
  String? get socketActionError => _socketActionError;
  String? get winnerId => _winnerId;

  String _messageFromSocketPayload(dynamic data) {
    if (data is Map && data['message'] is String) {
      final m = data['message'] as String;
      if (m.isNotEmpty) return m;
    }
    return _l10n.socketActionFallback;
  }

  Player? get localPlayer {
    try {
      return _players.firstWhere((p) => p.nickname.toLowerCase() == _localNickname.toLowerCase());
    } catch (_) {
      return null;
    }
  }

  Player? get opponent {
    try {
      return _players.firstWhere((p) => p.nickname.toLowerCase() != _localNickname.toLowerCase());
    } catch (_) {
      return null;
    }
  }

  bool get isMyTurn => localPlayer?.id == _currentTurnPlayerId || (localPlayer?.socketId != null && localPlayer?.socketId == _currentTurnPlayerId);

  void connectAndJoin(String url, String nickname) {
    _localNickname = nickname;
    _joinError = null;
    _socketActionError = null;

    _socketClient.connect(
      url,
      onConnectionError: (detail) {
        final shortDetail = detail == 'connect_error' || detail == 'socket_error';
        _joinError = shortDetail ? _l10n.connectionFailed : '${_l10n.connectionFailed} ($detail)';
        _isConnected = false;
        _socketClient.disconnect();
        notifyListeners();
      },
    );

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
      
      // Prevent unnecessary rebuilds during rapid polling updates
      bool stateChanged = false;
      if (_lobbyStatus != payload.status) {
        _lobbyStatus = payload.status;
        stateChanged = true;
      }
      
      // Simple length check or more complex equality could be used.
      // For now, if the payload has players, we update them.
      _players = payload.players;
      stateChanged = true;
      
      // Clear requesting team state if team is assigned
      if (localPlayer?.team != null && localPlayer!.team!.isNotEmpty) {
        if (_isRequestingTeam) {
          _isRequestingTeam = false;
          stateChanged = true;
        }
      }
      
      if (stateChanged) {
        notifyListeners();
      }
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
      _appendLog('winner', _l10n.battleLogWinner(payload.winnerName));
      notifyListeners();
    });

    _socketClient.on('join_error', (data) {
      final msg = data is Map ? data['message'] : null;
      _joinError = msg is String ? msg : _l10n.joinErrorDefault;
      _socketClient.disconnect();
      _isConnected = false;
      notifyListeners();
    });

    _socketClient.on('assign_error', (data) {
      _isRequestingTeam = false;
      _socketActionError = _messageFromSocketPayload(data);
      notifyListeners();
    });

    _socketClient.on('ready_error', (data) {
      _socketActionError = _messageFromSocketPayload(data);
      notifyListeners();
    });

    _socketClient.on('attack_error', (data) {
      _socketActionError = _messageFromSocketPayload(data);
      notifyListeners();
    });

    _socketClient.on('global_history', (data) {
      if (data is List) {
        _globalHistory = data.map((e) => GlobalHistoryEntry.fromJson(e)).toList();
        notifyListeners();
      }
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
        _appendLog(
          'damage',
          _l10n.battleLogAttack(attackerActive.name, defenderActive.name, result.damage),
        );
      }

      if (result.pokemonFainted && defenderActive != null) {
        _appendLog('defeat', _l10n.battleLogDefeated(defenderActive.name));
        if (result.nextDefenderPokemon != null) {
          _appendLog(
            'switch',
            _l10n.battleLogSwitch(defender.nickname, result.nextDefenderPokemon!.name),
          );
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
        bool updatedActive = false;
        final team = p.team?.map((poke) {
          // Only update the FIRST non-defeated Pokémon (the active one)
          // This is the one who took damage.
          if (!poke.isDefeated && !updatedActive) {
            updatedActive = true;
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

  void requestGlobalHistory() {
    _socketClient.emit('request_global_history');
  }

  void emitAttack() {
    _socketClient.emit('attack');
  }

  void clearJoinError() {
    _joinError = null;
    notifyListeners();
  }

  void clearSocketActionError() {
    _socketActionError = null;
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
    _socketActionError = null;
  }
}
