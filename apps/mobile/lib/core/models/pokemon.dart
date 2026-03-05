class PokemonStats {
  final int maxHp;
  final int currentHp;
  final int attack;
  final int defense;
  final int speed;

  PokemonStats({
    required this.maxHp,
    required this.currentHp,
    required this.attack,
    required this.defense,
    required this.speed,
  });

  factory PokemonStats.fromJson(Map<String, dynamic> json) {
    return PokemonStats(
      maxHp: json['maxHp'] ?? 0,
      currentHp: json['currentHp'] ?? 0,
      attack: json['attack'] ?? 0,
      defense: json['defense'] ?? 0,
      speed: json['speed'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() => {
        'maxHp': maxHp,
        'currentHp': currentHp,
        'attack': attack,
        'defense': defense,
        'speed': speed,
      };

  double get hpPercentage => maxHp > 0 ? currentHp / maxHp : 0;
}

class PokemonBase {
  final int id;
  final String name;
  final List<String> types;
  final PokemonStats stats;
  final String spriteUrl;
  final bool isDefeated;

  PokemonBase({
    required this.id,
    required this.name,
    required this.types,
    required this.stats,
    required this.spriteUrl,
    this.isDefeated = false,
  });

  factory PokemonBase.fromJson(Map<String, dynamic> json) {
    return PokemonBase(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      types: List<String>.from(json['types'] ?? []),
      stats: PokemonStats.fromJson(json['stats'] ?? {}),
      spriteUrl: json['spriteUrl'] ?? '',
      isDefeated: json['isDefeated'] ?? false,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'types': types,
        'stats': stats.toJson(),
        'spriteUrl': spriteUrl,
        'isDefeated': isDefeated,
      };
}
