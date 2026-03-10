class GlobalHistoryEntry {
  final String id;
  final String player1;
  final String player2;
  final String status;
  final String? winnerName;
  final DateTime createdAt;

  GlobalHistoryEntry({
    required this.id,
    required this.player1,
    required this.player2,
    required this.status,
    this.winnerName,
    required this.createdAt,
  });

  factory GlobalHistoryEntry.fromJson(Map<String, dynamic> json) {
    return GlobalHistoryEntry(
      id: json['id'] ?? '',
      player1: json['player1'] ?? 'Desconocido',
      player2: json['player2'] ?? 'Desconocido',
      status: json['status'] ?? 'finished',
      winnerName: json['winnerName'],
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
    );
  }
}
