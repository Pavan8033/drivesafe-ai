/**
 * DriveSafe AI — Circadian Fatigue & Biological Vulnerability Analyzer
 * Based on NHTSA, SAE, and National Sleep Foundation circadian rhythms models.
 */

export interface CircadianAssessment {
  currentHour: number;
  timeString: string;
  riskLevel: 'OPTIMAL' | 'MODERATE' | 'ELEVATED' | 'CRITICAL';
  riskScorePercent: number;
  multiplier: number;
  phaseLabel: string;
  recommendation: string;
}

export function evaluateCircadianVulnerability(date: Date = new Date()): CircadianAssessment {
  const hour = date.getHours();
  const minutes = date.getMinutes();
  const timeString = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

  // Circadian dip 1: Peak Biological Sleepiness (02:00 - 05:30)
  if (hour >= 2 && (hour < 5 || (hour === 5 && minutes <= 30))) {
    return {
      currentHour: hour,
      timeString,
      riskLevel: 'CRITICAL',
      riskScorePercent: 92,
      multiplier: 1.25,
      phaseLabel: 'Circadian Nadir (Peak Sleep Pressure)',
      recommendation: 'Driver is within peak biological microsleep window (02:00 - 05:30). High vigilance required; take hourly breaks.',
    };
  }

  // Circadian dip 2: Post-Prandial Afternoon Slump (13:00 - 15:30)
  if (hour >= 13 && (hour < 15 || (hour === 15 && minutes <= 30))) {
    return {
      currentHour: hour,
      timeString,
      riskLevel: 'MODERATE',
      riskScorePercent: 55,
      multiplier: 1.10,
      phaseLabel: 'Post-Prandial Slump (Afternoon Dip)',
      recommendation: 'Natural dip in body core temperature and alertness. Maintain cabin ventilation.',
    };
  }

  // Pre-sleep late evening window (22:00 - 01:59)
  if (hour >= 22 || hour < 2) {
    return {
      currentHour: hour,
      timeString,
      riskLevel: 'ELEVATED',
      riskScorePercent: 75,
      multiplier: 1.18,
      phaseLabel: 'Melatonin Surge (Late Night Fatigue)',
      recommendation: 'Elevated sleep propensity. Avoid prolonged continuous highway stints.',
    };
  }

  // Optimal daytime alert windows (06:00 - 12:59 & 15:31 - 21:59)
  return {
    currentHour: hour,
    timeString,
    riskLevel: 'OPTIMAL',
    riskScorePercent: 18,
    multiplier: 1.0,
    phaseLabel: 'Optimal Alertness Window',
    recommendation: 'Driver is within optimal circadian alertness window. Standard monitoring active.',
  };
}

