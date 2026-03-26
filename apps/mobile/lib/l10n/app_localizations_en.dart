// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get appTitle => 'Pokémon Stadium Lite';

  @override
  String get loginIntro => 'Enter the arena and challenge other trainers.';

  @override
  String get loginServerLabel => 'SERVER CONNECTION';

  @override
  String get loginServerHint => 'https://your-server.example.com';

  @override
  String get loginUrlRequired => 'Enter a valid URL';

  @override
  String get loginNicknameLabel => 'TRAINER NICKNAME';

  @override
  String get loginNicknameHint => 'e.g. ash-1';

  @override
  String get loginNicknameRequired => 'Enter a nickname';

  @override
  String get loginNicknameMinLength => 'At least 4 characters';

  @override
  String get loginConnectButton => 'CONNECT TO STADIUM';

  @override
  String get loginServerStatus => 'Server status';

  @override
  String get lobbyAppBarTitle => 'GLOBAL LOBBY';

  @override
  String get lobbyHistoryTooltip => 'Global history';

  @override
  String get lobbyWaitingPlayers => 'WAITING FOR PLAYERS...';

  @override
  String lobbyRivalFound(int readyCount) {
    return 'OPPONENT FOUND ($readyCount/2 READY)';
  }

  @override
  String get lobbyYourTeam => 'YOUR ASSIGNED TEAM';

  @override
  String get lobbyWaitingTeam => 'Waiting for team assignment...';

  @override
  String get lobbyReadyToFight => 'READY TO FIGHT!';

  @override
  String get lobbyIAmReady => 'I\'M READY';

  @override
  String get lobbyYou => 'You';

  @override
  String get lobbyWaitingOpponent => 'Waiting...';

  @override
  String get lobbyRegionalHistory => 'REGIONAL HISTORY';

  @override
  String get lobbyNoRecentBattles => 'No recent battles.';

  @override
  String get lobbyStatusInProgress => 'IN PROGRESS';

  @override
  String get lobbyStatusFinished => 'FINISHED';

  @override
  String get lobbyTimeAgoMoments => 'A few seconds ago';

  @override
  String lobbyTimeAgoMinutes(int minutes) {
    return '${minutes}m ago';
  }

  @override
  String lobbyTimeAgoHours(int hours) {
    return '${hours}h ago';
  }

  @override
  String lobbyTimeAgoDays(int days) {
    return '${days}d ago';
  }

  @override
  String lobbyWinner(String name) {
    return 'Winner: $name';
  }

  @override
  String get vs => 'VS';

  @override
  String get battleAttack => 'ATTACK!';

  @override
  String get battleWaitingRival => 'WAITING FOR OPPONENT...';

  @override
  String get resultsVictory => 'VICTORY!';

  @override
  String get resultsGameOver => 'GAME OVER';

  @override
  String get resultsSubtitleWin => 'You\'ve proven yourself a great trainer.';

  @override
  String get resultsSubtitleLose =>
      'Your Pokémon have fainted—but you can try again.';

  @override
  String resultsWinnerBadge(String name) {
    return 'WINNER: $name';
  }

  @override
  String get resultsBackToLobby => 'BACK TO LOBBY';

  @override
  String get resultsExitGame => 'EXIT GAME';

  @override
  String get statHp => 'HP';

  @override
  String get statAtk => 'ATK';

  @override
  String get statDef => 'DEF';

  @override
  String get battleLogStarted => 'The battle has begun!';

  @override
  String battleLogAttack(String attacker, String defender, int damage) {
    return '$attacker attacked $defender for $damage damage.';
  }

  @override
  String battleLogDefeated(String pokemon) {
    return '$pokemon was defeated!';
  }

  @override
  String battleLogSwitch(String nickname, String pokemon) {
    return '$nickname sends out $pokemon.';
  }

  @override
  String battleLogWinner(String winner) {
    return '$winner has won the battle!';
  }

  @override
  String get joinErrorDefault => 'Could not join';

  @override
  String get connectionFailed =>
      'Could not connect to the server. Check the URL and your network.';

  @override
  String get socketActionFallback => 'Could not complete the action.';

  @override
  String get languageEs => 'ES';

  @override
  String get languageEn => 'EN';
}
