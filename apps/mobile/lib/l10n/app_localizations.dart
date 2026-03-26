import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_en.dart';
import 'app_localizations_es.dart';

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of AppLocalizations
/// returned by `AppLocalizations.of(context)`.
///
/// Applications need to include `AppLocalizations.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'l10n/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: AppLocalizations.localizationsDelegates,
///   supportedLocales: AppLocalizations.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the AppLocalizations.supportedLocales
/// property.
abstract class AppLocalizations {
  AppLocalizations(String locale)
    : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppLocalizations? of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations);
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates =
      <LocalizationsDelegate<dynamic>>[
        delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
      ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[
    Locale('en'),
    Locale('es'),
  ];

  /// No description provided for @appTitle.
  ///
  /// In en, this message translates to:
  /// **'Pokémon Stadium Lite'**
  String get appTitle;

  /// No description provided for @loginIntro.
  ///
  /// In en, this message translates to:
  /// **'Enter the arena and challenge other trainers.'**
  String get loginIntro;

  /// No description provided for @loginServerLabel.
  ///
  /// In en, this message translates to:
  /// **'SERVER CONNECTION'**
  String get loginServerLabel;

  /// No description provided for @loginServerHint.
  ///
  /// In en, this message translates to:
  /// **'https://your-server.example.com'**
  String get loginServerHint;

  /// No description provided for @loginUrlRequired.
  ///
  /// In en, this message translates to:
  /// **'Enter a valid URL'**
  String get loginUrlRequired;

  /// No description provided for @loginNicknameLabel.
  ///
  /// In en, this message translates to:
  /// **'TRAINER NICKNAME'**
  String get loginNicknameLabel;

  /// No description provided for @loginNicknameHint.
  ///
  /// In en, this message translates to:
  /// **'e.g. ash-1'**
  String get loginNicknameHint;

  /// No description provided for @loginNicknameRequired.
  ///
  /// In en, this message translates to:
  /// **'Enter a nickname'**
  String get loginNicknameRequired;

  /// No description provided for @loginNicknameMinLength.
  ///
  /// In en, this message translates to:
  /// **'At least 4 characters'**
  String get loginNicknameMinLength;

  /// No description provided for @loginConnectButton.
  ///
  /// In en, this message translates to:
  /// **'CONNECT TO STADIUM'**
  String get loginConnectButton;

  /// No description provided for @loginServerStatus.
  ///
  /// In en, this message translates to:
  /// **'Server status'**
  String get loginServerStatus;

  /// No description provided for @lobbyAppBarTitle.
  ///
  /// In en, this message translates to:
  /// **'GLOBAL LOBBY'**
  String get lobbyAppBarTitle;

  /// No description provided for @lobbyHistoryTooltip.
  ///
  /// In en, this message translates to:
  /// **'Global history'**
  String get lobbyHistoryTooltip;

  /// No description provided for @lobbyWaitingPlayers.
  ///
  /// In en, this message translates to:
  /// **'WAITING FOR PLAYERS...'**
  String get lobbyWaitingPlayers;

  /// No description provided for @lobbyRivalFound.
  ///
  /// In en, this message translates to:
  /// **'OPPONENT FOUND ({readyCount}/2 READY)'**
  String lobbyRivalFound(int readyCount);

  /// No description provided for @lobbyYourTeam.
  ///
  /// In en, this message translates to:
  /// **'YOUR ASSIGNED TEAM'**
  String get lobbyYourTeam;

  /// No description provided for @lobbyWaitingTeam.
  ///
  /// In en, this message translates to:
  /// **'Waiting for team assignment...'**
  String get lobbyWaitingTeam;

  /// No description provided for @lobbyReadyToFight.
  ///
  /// In en, this message translates to:
  /// **'READY TO FIGHT!'**
  String get lobbyReadyToFight;

  /// No description provided for @lobbyIAmReady.
  ///
  /// In en, this message translates to:
  /// **'I\'M READY'**
  String get lobbyIAmReady;

  /// No description provided for @lobbyYou.
  ///
  /// In en, this message translates to:
  /// **'You'**
  String get lobbyYou;

  /// No description provided for @lobbyWaitingOpponent.
  ///
  /// In en, this message translates to:
  /// **'Waiting...'**
  String get lobbyWaitingOpponent;

  /// No description provided for @lobbyRegionalHistory.
  ///
  /// In en, this message translates to:
  /// **'REGIONAL HISTORY'**
  String get lobbyRegionalHistory;

  /// No description provided for @lobbyNoRecentBattles.
  ///
  /// In en, this message translates to:
  /// **'No recent battles.'**
  String get lobbyNoRecentBattles;

  /// No description provided for @lobbyStatusInProgress.
  ///
  /// In en, this message translates to:
  /// **'IN PROGRESS'**
  String get lobbyStatusInProgress;

  /// No description provided for @lobbyStatusFinished.
  ///
  /// In en, this message translates to:
  /// **'FINISHED'**
  String get lobbyStatusFinished;

  /// No description provided for @lobbyTimeAgoMoments.
  ///
  /// In en, this message translates to:
  /// **'A few seconds ago'**
  String get lobbyTimeAgoMoments;

  /// No description provided for @lobbyTimeAgoMinutes.
  ///
  /// In en, this message translates to:
  /// **'{minutes}m ago'**
  String lobbyTimeAgoMinutes(int minutes);

  /// No description provided for @lobbyTimeAgoHours.
  ///
  /// In en, this message translates to:
  /// **'{hours}h ago'**
  String lobbyTimeAgoHours(int hours);

  /// No description provided for @lobbyTimeAgoDays.
  ///
  /// In en, this message translates to:
  /// **'{days}d ago'**
  String lobbyTimeAgoDays(int days);

  /// No description provided for @lobbyWinner.
  ///
  /// In en, this message translates to:
  /// **'Winner: {name}'**
  String lobbyWinner(String name);

  /// No description provided for @vs.
  ///
  /// In en, this message translates to:
  /// **'VS'**
  String get vs;

  /// No description provided for @battleAttack.
  ///
  /// In en, this message translates to:
  /// **'ATTACK!'**
  String get battleAttack;

  /// No description provided for @battleWaitingRival.
  ///
  /// In en, this message translates to:
  /// **'WAITING FOR OPPONENT...'**
  String get battleWaitingRival;

  /// No description provided for @resultsVictory.
  ///
  /// In en, this message translates to:
  /// **'VICTORY!'**
  String get resultsVictory;

  /// No description provided for @resultsGameOver.
  ///
  /// In en, this message translates to:
  /// **'GAME OVER'**
  String get resultsGameOver;

  /// No description provided for @resultsSubtitleWin.
  ///
  /// In en, this message translates to:
  /// **'You\'ve proven yourself a great trainer.'**
  String get resultsSubtitleWin;

  /// No description provided for @resultsSubtitleLose.
  ///
  /// In en, this message translates to:
  /// **'Your Pokémon have fainted—but you can try again.'**
  String get resultsSubtitleLose;

  /// No description provided for @resultsWinnerBadge.
  ///
  /// In en, this message translates to:
  /// **'WINNER: {name}'**
  String resultsWinnerBadge(String name);

  /// No description provided for @resultsBackToLobby.
  ///
  /// In en, this message translates to:
  /// **'BACK TO LOBBY'**
  String get resultsBackToLobby;

  /// No description provided for @resultsExitGame.
  ///
  /// In en, this message translates to:
  /// **'EXIT GAME'**
  String get resultsExitGame;

  /// No description provided for @statHp.
  ///
  /// In en, this message translates to:
  /// **'HP'**
  String get statHp;

  /// No description provided for @statAtk.
  ///
  /// In en, this message translates to:
  /// **'ATK'**
  String get statAtk;

  /// No description provided for @statDef.
  ///
  /// In en, this message translates to:
  /// **'DEF'**
  String get statDef;

  /// No description provided for @battleLogStarted.
  ///
  /// In en, this message translates to:
  /// **'The battle has begun!'**
  String get battleLogStarted;

  /// No description provided for @battleLogAttack.
  ///
  /// In en, this message translates to:
  /// **'{attacker} attacked {defender} for {damage} damage.'**
  String battleLogAttack(String attacker, String defender, int damage);

  /// No description provided for @battleLogDefeated.
  ///
  /// In en, this message translates to:
  /// **'{pokemon} was defeated!'**
  String battleLogDefeated(String pokemon);

  /// No description provided for @battleLogSwitch.
  ///
  /// In en, this message translates to:
  /// **'{nickname} sends out {pokemon}.'**
  String battleLogSwitch(String nickname, String pokemon);

  /// No description provided for @battleLogWinner.
  ///
  /// In en, this message translates to:
  /// **'{winner} has won the battle!'**
  String battleLogWinner(String winner);

  /// No description provided for @joinErrorDefault.
  ///
  /// In en, this message translates to:
  /// **'Could not join'**
  String get joinErrorDefault;

  /// No description provided for @connectionFailed.
  ///
  /// In en, this message translates to:
  /// **'Could not connect to the server. Check the URL and your network.'**
  String get connectionFailed;

  /// No description provided for @socketActionFallback.
  ///
  /// In en, this message translates to:
  /// **'Could not complete the action.'**
  String get socketActionFallback;

  /// No description provided for @languageEs.
  ///
  /// In en, this message translates to:
  /// **'ES'**
  String get languageEs;

  /// No description provided for @languageEn.
  ///
  /// In en, this message translates to:
  /// **'EN'**
  String get languageEn;
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) =>
      <String>['en', 'es'].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {
  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'en':
      return AppLocalizationsEn();
    case 'es':
      return AppLocalizationsEs();
  }

  throw FlutterError(
    'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
    'an issue with the localizations generation tool. Please file an issue '
    'on GitHub with a reproducible sample app and the gen-l10n configuration '
    'that was used.',
  );
}
