import 'pokemon.dart';

class TurnResultPayload {
  final int damage;
  final int remainingHp;
  final bool isDefeated;
  final bool pokemonFainted;
  final PokemonBase? nextDefenderPokemon;
  final String? nextTurnPlayerId;
  final bool matchFinished;
  final String? attackerId;
  final String? defenderId;

  TurnResultPayload({
    required this.damage,
    required this.remainingHp,
    required this.isDefeated,
    required this.pokemonFainted,
    this.nextDefenderPokemon,
    this.nextTurnPlayerId,
    required this.matchFinished,
    this.attackerId,
    this.defenderId,
  });

  factory TurnResultPayload.fromJson(Map<String, dynamic> json) {
    return TurnResultPayload(
      damage: json['damage'] ?? 0,
      remainingHp: json['remainingHp'] ?? 0,
      isDefeated: json['isDefeated'] ?? false,
      pokemonFainted: json['pokemonFainted'] ?? false,
      nextDefenderPokemon: json['nextDefenderPokemon'] != null
          ? PokemonBase.fromJson(json['nextDefenderPokemon'])
          : null,
      nextTurnPlayerId: json['nextTurnPlayerId'],
      matchFinished: json['matchFinished'] ?? false,
      attackerId: json['attackerId'],
      defenderId: json['defenderId'],
    );
  }
}

class BattleStartPayload {
  final String currentTurnPlayerId;

  BattleStartPayload({required this.currentTurnPlayerId});

  factory BattleStartPayload.fromJson(Map<String, dynamic> json) {
    return BattleStartPayload(
      currentTurnPlayerId: json['currentTurnPlayerId'] ?? '',
    );
  }
}

class BattleEndPayload {
  final String winnerId;
  final String winnerName;

  BattleEndPayload({required this.winnerId, required this.winnerName});

  factory BattleEndPayload.fromJson(Map<String, dynamic> json) {
    return BattleEndPayload(
      winnerId: json['winnerId'] ?? '',
      winnerName: json['winnerName'] ?? '',
    );
  }
}
