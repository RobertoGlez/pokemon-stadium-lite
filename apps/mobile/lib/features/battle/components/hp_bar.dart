import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';

class HpBar extends StatelessWidget {
  final double percentage; // 0.0 to 1.0
  final String label;
  final bool isLarge;

  const HpBar({
    super.key,
    required this.percentage,
    required this.label,
    this.isLarge = false,
  });

  @override
  Widget build(BuildContext context) {
    Color barColor = AppColors.success;
    if (percentage < 0.2) {
      barColor = AppColors.danger;
    } else if (percentage < 0.5) {
      barColor = AppColors.warning;
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'HP',
              style: TextStyle(
                fontSize: isLarge ? 12 : 10,
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary,
              ),
            ),
            Text(
              label,
              style: TextStyle(
                fontSize: isLarge ? 12 : 10,
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary,
              ),
            ),
          ],
        ),
        const SizedBox(height: 4),
        Container(
          height: isLarge ? 12 : 8,
          width: double.infinity,
          decoration: BoxDecoration(
            color: AppColors.border,
            borderRadius: BorderRadius.circular(10),
          ),
          child: LayoutBuilder(
            builder: (context, constraints) {
              return Stack(
                children: [
                  AnimatedContainer(
                    duration: const Duration(seconds: 1),
                    curve: Curves.easeOutCubic,
                    width: constraints.maxWidth * percentage.clamp(0.0, 1.0),
                    decoration: BoxDecoration(
                      color: barColor,
                      borderRadius: BorderRadius.circular(10),
                      boxShadow: [
                        BoxShadow(
                          color: barColor.withOpacity(0.4),
                          blurRadius: 4,
                          spreadRadius: 1,
                        )
                      ],
                    ),
                  ),
                ],
              );
            },
          ),
        ),
      ],
    );
  }
}
