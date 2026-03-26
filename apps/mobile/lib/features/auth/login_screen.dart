import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../core/providers/lobby_provider.dart';
import '../../core/theme/app_theme.dart';
import '../../l10n/app_localizations.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final TextEditingController _nicknameController = TextEditingController();
  final TextEditingController _urlController = TextEditingController();
  final _formKey = GlobalKey<FormState>();

  @override
  void initState() {
    super.initState();
    _urlController.text = 'https://pokemon-server-api-433891638584.us-central1.run.app';
  }

  @override
  void dispose() {
    _nicknameController.dispose();
    _urlController.dispose();
    super.dispose();
  }

  void _handleLogin() {
    if (_formKey.currentState!.validate()) {
      final lobbyProvider = context.read<LobbyProvider>();
      lobbyProvider.clearJoinError();
      lobbyProvider.connectAndJoin(
        _urlController.text.trim(),
        _nicknameController.text.trim(),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final lobbyProvider = context.watch<LobbyProvider>();
    final l10n = AppLocalizations.of(context)!;

    if (lobbyProvider.isConnected) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        context.go('/lobby');
      });
    }

    return Scaffold(
      body: Stack(
        children: [
          Positioned.fill(
            child: Opacity(
              opacity: 0.1,
              child: GridPaper(
                color: Colors.white.withOpacity(0.1),
                divisions: 1,
                interval: 40,
                subdivisions: 1,
              ),
            ),
          ),
          SafeArea(
            child: Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(24.0, 56.0, 24.0, 24.0),
                child: Form(
                  key: _formKey,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        width: 120,
                        height: 120,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: AppColors.arenaBlue.withOpacity(0.2),
                        ),
                        child: const Icon(
                          Icons.catching_pokemon,
                          size: 80,
                          color: AppColors.arenaBlue,
                        ),
                      ),
                      const SizedBox(height: 32),
                      Text(
                        l10n.appTitle,
                        style: const TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.bold,
                          letterSpacing: -0.5,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        l10n.loginIntro,
                        style: const TextStyle(
                          color: AppColors.textSecondary,
                          fontSize: 14,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 40),
                      TextFormField(
                        controller: _urlController,
                        decoration: InputDecoration(
                          hintText: l10n.loginServerHint,
                          labelText: l10n.loginServerLabel,
                          floatingLabelBehavior: FloatingLabelBehavior.always,
                          labelStyle: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 1.0,
                          ),
                        ),
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return l10n.loginUrlRequired;
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 20),
                      TextFormField(
                        controller: _nicknameController,
                        decoration: InputDecoration(
                          hintText: l10n.loginNicknameHint,
                          labelText: l10n.loginNicknameLabel,
                          floatingLabelBehavior: FloatingLabelBehavior.always,
                          labelStyle: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 1.0,
                          ),
                        ),
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return l10n.loginNicknameRequired;
                          }
                          if (value.length <= 3) {
                            return l10n.loginNicknameMinLength;
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 32),
                      if (lobbyProvider.joinError != null)
                        Padding(
                          padding: const EdgeInsets.only(bottom: 20),
                          child: Text(
                            lobbyProvider.joinError!,
                            style: const TextStyle(color: AppColors.danger, fontSize: 13),
                          ),
                        ),
                      ElevatedButton(
                        onPressed: _handleLogin,
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(l10n.loginConnectButton),
                            const SizedBox(width: 8),
                            const Icon(Icons.arrow_forward, size: 20),
                          ],
                        ),
                      ),
                      const SizedBox(height: 24),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            l10n.loginServerStatus,
                            style: const TextStyle(color: AppColors.textSecondary, fontSize: 12),
                          ),
                          const SizedBox(width: 8),
                          Container(
                            width: 8,
                            height: 8,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: lobbyProvider.isConnected ? AppColors.success : Colors.grey.withOpacity(0.4),
                              boxShadow: lobbyProvider.isConnected
                                  ? [
                                      BoxShadow(
                                        color: AppColors.success.withOpacity(0.6),
                                        blurRadius: 4,
                                        spreadRadius: 1,
                                      )
                                    ]
                                  : null,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
