// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Spanish Castilian (`es`).
class AppLocalizationsEs extends AppLocalizations {
  AppLocalizationsEs([String locale = 'es']) : super(locale);

  @override
  String get appTitle => 'Pokémon Stadium Lite';

  @override
  String get loginIntro => 'Ingresa a la arena y reta a otros entrenadores.';

  @override
  String get loginServerLabel => 'CONEXIÓN AL SERVIDOR';

  @override
  String get loginServerHint => 'https://tu-servidor.example.com';

  @override
  String get loginUrlRequired => 'Ingresa una URL válida';

  @override
  String get loginNicknameLabel => 'NICKNAME DE ENTRENADOR';

  @override
  String get loginNicknameHint => 'Ej: ash-1';

  @override
  String get loginNicknameRequired => 'Ingresa un nickname';

  @override
  String get loginNicknameMinLength => 'Mínimo 4 caracteres';

  @override
  String get loginConnectButton => 'CONECTAR AL ESTADIO';

  @override
  String get loginServerStatus => 'Estado del Servidor';

  @override
  String get lobbyAppBarTitle => 'LOBBY GLOBAL';

  @override
  String get lobbyHistoryTooltip => 'Historial Global';

  @override
  String get lobbyWaitingPlayers => 'ESPERANDO JUGADORES...';

  @override
  String lobbyRivalFound(int readyCount) {
    return 'RIVAL ENCONTRADO ($readyCount/2 LISTOS)';
  }

  @override
  String get lobbyYourTeam => 'TU EQUIPO ASIGNADO';

  @override
  String get lobbyWaitingTeam => 'Esperando asignación de equipo...';

  @override
  String get lobbyReadyToFight => '¡LISTO PARA LUCHAR!';

  @override
  String get lobbyIAmReady => 'ESTOY LISTO';

  @override
  String get lobbyYou => 'Tú';

  @override
  String get lobbyWaitingOpponent => 'Esperando...';

  @override
  String get lobbyRegionalHistory => 'HISTORIAL REGIONAL';

  @override
  String get lobbyNoRecentBattles => 'No hay batallas recientes.';

  @override
  String get lobbyStatusInProgress => 'EN CURSO';

  @override
  String get lobbyStatusFinished => 'TERMINADA';

  @override
  String get lobbyTimeAgoMoments => 'Hace unos segundos';

  @override
  String lobbyTimeAgoMinutes(int minutes) {
    return 'Hace ${minutes}m';
  }

  @override
  String lobbyTimeAgoHours(int hours) {
    return 'Hace ${hours}h';
  }

  @override
  String lobbyTimeAgoDays(int days) {
    return 'Hace ${days}d';
  }

  @override
  String lobbyWinner(String name) {
    return 'Ganador: $name';
  }

  @override
  String get vs => 'VS';

  @override
  String get battleAttack => '¡ATACAR!';

  @override
  String get battleWaitingRival => 'ESPERANDO RIVAL...';

  @override
  String get resultsVictory => '¡VICTORIA!';

  @override
  String get resultsGameOver => 'FIN DEL JUEGO';

  @override
  String get resultsSubtitleWin => 'Has demostrado ser un gran entrenador.';

  @override
  String get resultsSubtitleLose =>
      'Tus Pokémon han caído, pero puedes volverlo a intentar.';

  @override
  String resultsWinnerBadge(String name) {
    return 'GANADOR: $name';
  }

  @override
  String get resultsBackToLobby => 'VOLVER AL LOBBY';

  @override
  String get resultsExitGame => 'SALIR DEL JUEGO';

  @override
  String get statHp => 'HP';

  @override
  String get statAtk => 'ATQ';

  @override
  String get statDef => 'DEF';

  @override
  String get battleLogStarted => '¡La batalla ha comenzado!';

  @override
  String battleLogAttack(String attacker, String defender, int damage) {
    return '$attacker atacó a $defender por $damage de daño.';
  }

  @override
  String battleLogDefeated(String pokemon) {
    return '¡$pokemon fue derrotado!';
  }

  @override
  String battleLogSwitch(String nickname, String pokemon) {
    return '$nickname envía a $pokemon.';
  }

  @override
  String battleLogWinner(String winner) {
    return '¡$winner ha ganado la batalla!';
  }

  @override
  String get joinErrorDefault => 'Error al unirse';

  @override
  String get connectionFailed =>
      'No se pudo conectar al servidor. Revisa la URL y la red.';

  @override
  String get socketActionFallback => 'No se pudo completar la acción.';

  @override
  String get languageEs => 'ES';

  @override
  String get languageEn => 'EN';
}
