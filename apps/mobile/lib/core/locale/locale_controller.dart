import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

const _kLocaleKey = 'app_locale';

class LocaleController extends ChangeNotifier {
  LocaleController() {
    _load();
  }

  Locale _locale = const Locale('es');
  Locale get locale => _locale;

  bool _ready = false;
  bool get isReady => _ready;

  Future<void> _load() async {
    final prefs = await SharedPreferences.getInstance();
    final code = prefs.getString(_kLocaleKey);
    if (code != null && (code == 'en' || code == 'es')) {
      _locale = Locale(code);
    } else {
      final platform = WidgetsBinding.instance.platformDispatcher.locale;
      final lang = platform.languageCode;
      _locale = (lang == 'en' || lang == 'es') ? Locale(lang) : const Locale('es');
    }
    _ready = true;
    notifyListeners();
  }

  Future<void> setLocale(Locale locale) async {
    final code = locale.languageCode;
    if (code != 'en' && code != 'es') return;
    if (_locale.languageCode == code && _ready) return;

    _locale = Locale(code);
    notifyListeners();

    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_kLocaleKey, code);
  }
}
