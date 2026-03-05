import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'core/providers/lobby_provider.dart';
import 'core/router/app_router.dart';
import 'core/theme/app_theme.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => LobbyProvider()),
      ],
      child: const PokemonStadiumApp(),
    ),
  );
}

class PokemonStadiumApp extends StatelessWidget {
  const PokemonStadiumApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'Pokémon Stadium Lite',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      routerConfig: appRouter,
    );
  }
}
