import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../core/providers/lobby_provider.dart';
import '../../core/theme/app_theme.dart';

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
    _urlController.text = 'http://127.0.0.1:8080'; // Default
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
        _nicknameController.text.trim().toLowerCase(),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final lobbyProvider = context.watch<LobbyProvider>();

    // Listen to connection and navigate
    if (lobbyProvider.isConnected) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        context.go('/lobby');
      });
    }

    return Scaffold(
      body: Stack(
        children: [
          // Background Grid Pattern (Simulated with CustomPaint or simplified)
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
                padding: const EdgeInsets.all(24.0),
                child: Form(
                  key: _formKey,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      // Logo Placeholder / Placeholder for Logo img
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
                      
                      const Text(
                        'Pokémon Stadium Lite',
                        style: TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.bold,
                          letterSpacing: -0.5,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'Ingresa a la arena y reta a otros entrenadores.',
                        style: TextStyle(
                          color: AppColors.textSecondary,
                          fontSize: 14,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 40),
                      
                      // Server URL Input
                      TextFormField(
                        controller: _urlController,
                        decoration: const InputDecoration(
                          hintText: 'http://localhost:8080',
                          labelText: 'CONEXIÓN AL SERVIDOR',
                          floatingLabelBehavior: FloatingLabelBehavior.always,
                          labelStyle: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 1.0,
                          ),
                        ),
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Ingresa una URL válida';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 20),
                      
                      // Nickname Input
                      TextFormField(
                        controller: _nicknameController,
                        decoration: const InputDecoration(
                          hintText: 'Ej: ash-1',
                          labelText: 'NICKNAME DE ENTRENADOR',
                          floatingLabelBehavior: FloatingLabelBehavior.always,
                          labelStyle: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 1.0,
                          ),
                        ),
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Ingresa un nickname';
                          }
                          if (value.length <= 3) {
                            return 'Mínimo 4 caracteres';
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
                      
                      // Submit Button
                      ElevatedButton(
                        onPressed: _handleLogin,
                        child: const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text('CONECTAR AL ESTADIO'),
                            SizedBox(width: 8),
                            Icon(Icons.arrow_forward, size: 20),
                          ],
                        ),
                      ),
                      
                      const SizedBox(height: 24),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Text(
                            'Estado del Servidor',
                            style: TextStyle(color: AppColors.textSecondary, fontSize: 12),
                          ),
                          const SizedBox(width: 8),
                          Container(
                            width: 8,
                            height: 8,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: lobbyProvider.isConnected ? AppColors.success : Colors.grey.withOpacity(0.4),
                              boxShadow: lobbyProvider.isConnected ? [
                                BoxShadow(
                                  color: AppColors.success.withOpacity(0.6),
                                  blurRadius: 4,
                                  spreadRadius: 1,
                                )
                              ] : null,
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
