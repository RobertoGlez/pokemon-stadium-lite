import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'core/locale/locale_controller.dart';
import 'core/providers/lobby_provider.dart';
import 'core/router/app_router.dart';
import 'core/theme/app_theme.dart';
import 'core/widgets/language_bar.dart';
import 'l10n/app_localizations.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => LocaleController()),
        ChangeNotifierProvider(create: (_) => LobbyProvider()),
      ],
      child: const PokemonStadiumApp(),
    ),
  );
}

class PokemonStadiumApp extends StatefulWidget {
  const PokemonStadiumApp({super.key});

  @override
  State<PokemonStadiumApp> createState() => _PokemonStadiumAppState();
}

class _PokemonStadiumAppState extends State<PokemonStadiumApp> {
  LocaleController? _localeCtrl;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      _localeCtrl = context.read<LocaleController>()..addListener(_onLocaleChanged);
      context.read<LobbyProvider>().updateLocale(_localeCtrl!.locale);
    });
  }

  void _onLocaleChanged() {
    if (!mounted || _localeCtrl == null) return;
    context.read<LobbyProvider>().updateLocale(_localeCtrl!.locale);
  }

  @override
  void dispose() {
    _localeCtrl?.removeListener(_onLocaleChanged);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final localeCtrl = context.watch<LocaleController>();

    return MaterialApp.router(
      locale: localeCtrl.locale,
      supportedLocales: AppLocalizations.supportedLocales,
      localizationsDelegates: AppLocalizations.localizationsDelegates,
      onGenerateTitle: (ctx) => AppLocalizations.of(ctx)!.appTitle,
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      routerConfig: appRouter,
      builder: (context, child) {
        return Stack(
          clipBehavior: Clip.none,
          children: [
            child ?? const SizedBox.shrink(),
            const Positioned(
              top: 0,
              right: 0,
              child: SafeArea(
                child: Padding(
                  padding: EdgeInsets.only(top: 8, right: 8),
                  child: LanguageBar(),
                ),
              ),
            ),
          ],
        );
      },
    );
  }
}
