import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../locale/locale_controller.dart';
import '../theme/app_theme.dart';
import '../../l10n/app_localizations.dart';

class LanguageBar extends StatelessWidget {
  const LanguageBar({super.key});

  @override
  Widget build(BuildContext context) {
    final localeCtrl = context.watch<LocaleController>();
    final l10n = AppLocalizations.of(context);
    if (l10n == null) return const SizedBox.shrink();

    final isEs = localeCtrl.locale.languageCode == 'es';

    return Material(
      color: Colors.transparent,
      child: Container(
        padding: const EdgeInsets.all(4),
        decoration: BoxDecoration(
          color: AppColors.panel.withOpacity(0.92),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.border),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            _Segment(
              label: l10n.languageEs,
              selected: isEs,
              onTap: () => localeCtrl.setLocale(const Locale('es')),
            ),
            const SizedBox(width: 4),
            _Segment(
              label: l10n.languageEn,
              selected: !isEs,
              onTap: () => localeCtrl.setLocale(const Locale('en')),
            ),
          ],
        ),
      ),
    );
  }
}

class _Segment extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;

  const _Segment({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: selected ? AppColors.arenaBlue.withOpacity(0.25) : null,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: selected ? AppColors.arenaBlue : Colors.transparent,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w800,
            letterSpacing: 0.5,
            color: selected ? AppColors.arenaBlue : AppColors.textSecondary,
          ),
        ),
      ),
    );
  }
}
