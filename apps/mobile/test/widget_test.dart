import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:mobile/core/locale/locale_controller.dart';
import 'package:mobile/core/providers/lobby_provider.dart';
import 'package:mobile/main.dart';

void main() {
  testWidgets('App builds with providers', (WidgetTester tester) async {
    await tester.pumpWidget(
      MultiProvider(
        providers: [
          ChangeNotifierProvider(create: (_) => LocaleController()),
          ChangeNotifierProvider(create: (_) => LobbyProvider()),
        ],
        child: const PokemonStadiumApp(),
      ),
    );
    await tester.pump();
    expect(find.byType(MaterialApp), findsOneWidget);
  });
}
