import 'pokemon.dart';

class Player {
  final String id;
  final String nickname;
  final DateTime joinedLobbyAt;
  final List<PokemonBase>? team;
  final bool isReady;

  Player({
    required this.id,
    required this.nickname,
    required this.joinedLobbyAt,
    this.team,
    this.isReady = false,
  });

  factory Player.fromJson(Map<String, dynamic> json) {
    return Player(
      id: json['id'] ?? '',
      nickname: json['nickname'] ?? '',
      joinedLobbyAt: json['joinedLobbyAt'] != null 
          ? DateTime.parse(json['joinedLobbyAt'])
          : DateTime.now(),
      team: (json['team'] as List?)
          ?.map((e) => PokemonBase.fromJson(e))
          .toList(),
      isReady: json['isReady'] ?? false,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'nickname': nickname,
        'joinedLobbyAt': joinedLobbyAt.toIso8601String(),
        'team': team?.map((e) => e.toJson()).toList(),
        'isReady': isReady,
      };
}

enum LobbyStatus { waiting, ready, battling, finished, idle }

class LobbyStatusPayload {
  final String id;
  final LobbyStatus status;
  final List<Player> players;

  LobbyStatusPayload({
    required this.id,
    required this.status,
    required this.players,
  });

  factory LobbyStatusPayload.fromJson(Map<String, dynamic> json) {
    return LobbyStatusPayload(
      id: json['id'] ?? '',
      status: _parseStatus(json['status']),
      players: (json['players'] as List?)
          ?.map((e) => Player.fromJson(e))
          .toList() ?? [],
    );
  }

  static LobbyStatus _parseStatus(String? status) {
    switch (status) {
      case 'waiting': return LobbyStatus.waiting;
      case 'ready': return LobbyStatus.ready;
      case 'battling': return LobbyStatus.battling;
      case 'finished': return LobbyStatus.finished;
      default: return LobbyStatus.idle;
    }
  }
}
