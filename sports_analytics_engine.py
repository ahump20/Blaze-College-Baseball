"""
Blaze Sports Intel - Comprehensive Sports Analytics Engine
Deep South Sports Authority - Championship Intelligence Platform

Advanced feature engineering functions for baseball, football, basketball, and track & field
Supporting Cardinals, Titans, Longhorns, Grizzlies, and Deep South athletics
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Union, Optional
import json
import warnings
warnings.filterwarnings('ignore')

class DeepSouthSportsAnalytics:
    """
    Core analytics engine for Deep South Sports Authority
    From Friday Night Lights to Sunday in the Show
    """

    def __init__(self):
        self.sports_config = {
            'baseball': {
                'leagues': ['MLB', 'MiLB', 'NCAA', 'Perfect Game'],
                'key_metrics': ['exit_velocity', 'launch_angle', 'spin_rate', 'woba'],
                'teams_focus': ['Cardinals', 'Rangers', 'Astros']
            },
            'football': {
                'leagues': ['NFL', 'NCAA', 'Texas HS', 'SEC'],
                'key_metrics': ['qbr', 'epa', 'dvoa', 'pressure_rate'],
                'teams_focus': ['Titans', 'Cowboys', 'Longhorns']
            },
            'basketball': {
                'leagues': ['NBA', 'NCAA', 'G-League'],
                'key_metrics': ['per', 'usage_rate', 'true_shooting', 'bpm'],
                'teams_focus': ['Grizzlies', 'Mavericks', 'Longhorns']
            },
            'track_field': {
                'leagues': ['UIL', 'NCAA', 'USATF'],
                'key_metrics': ['personal_best', 'season_best', 'progression_rate'],
                'teams_focus': ['Longhorns', 'A&M', 'SEC Schools']
            }
        }

        # Performance thresholds for character assessment
        self.character_thresholds = {
            'clutch_performance': 0.75,
            'consistency_score': 0.80,
            'pressure_response': 0.70,
            'teamwork_rating': 0.85
        }

    # ========================= BASEBALL ANALYTICS =========================

    def baseball_bullpen_fatigue_index_3d(self, df: pd.DataFrame) -> pd.Series:
        """
        Advanced bullpen fatigue analysis for championship-level management

        Input columns: team_id, pitcher_id, timestamp, role, pitches, back_to_back
        Logic: Normalized rolling 3-day workload with back-to-back penalty
        """
        d = df.copy()
        d["is_reliever"] = (d.get("role", "RP") == "RP")
        d = d.sort_values(["team_id", "pitcher_id", "timestamp"])

        # Convert timestamp to datetime if string
        if d["timestamp"].dtype == 'object':
            d["timestamp"] = pd.to_datetime(d["timestamp"])

        # Calculate rolling 3-day pitch count
        d = d.set_index("timestamp")
        rolling_workload = (d.groupby(["team_id", "pitcher_id"])
                           .apply(lambda g: g["pitches"].rolling("3D", min_periods=1).sum())
                           .reset_index(level=[0,1], drop=True))

        # Normalize by championship-level capacity (150 pitches over 3 days)
        capacity = 150.0
        fatigue_base = (rolling_workload.fillna(0) / capacity).clip(0, 1.0)

        # Back-to-back penalty (15% increase in fatigue)
        b2b_penalty = d.get("back_to_back", pd.Series(False, index=d.index)).astype(bool).map({True: 0.15, False: 0.0})

        # Final fatigue index
        fatigue_index = (fatigue_base + b2b_penalty).clip(0, 1.0)

        # Only apply to relievers
        fatigue_index = fatigue_index.where(d["is_reliever"], 0.0)

        return fatigue_index.reindex(df.index)

    def baseball_times_through_order_penalty(self, df: pd.DataFrame) -> pd.Series:
        """
        Times-through-order analysis for championship pitching strategy

        Calculates performance degradation from 2nd to 3rd time through batting order
        Critical for SEC/Texas championship-level game management
        """
        d = df.copy()

        # Extract season if not present
        if "season" not in d.columns:
            d["season"] = pd.to_datetime(d["timestamp"]).dt.year

        # Group by pitcher and season
        pitcher_season_groups = d.groupby(["pitcher_id", "season"])

        # Calculate mean wOBA for 2nd and 3rd times through order
        woba_tto2 = pitcher_season_groups.apply(
            lambda g: g.loc[g["times_through_order"] == 2, "woba_value"].mean()
        )
        woba_tto3 = pitcher_season_groups.apply(
            lambda g: g.loc[g["times_through_order"] == 3, "woba_value"].mean()
        )

        # Calculate penalty (positive values indicate degradation)
        tto_penalty = (woba_tto3 - woba_tto2).rename("tto_penalty")

        # Broadcast to all rows for the pitcher-season
        result = d.set_index(["pitcher_id", "season"]).join(tto_penalty).reset_index(drop=True)["tto_penalty"]

        return result.reindex(df.index)

    def baseball_clutch_performance_index(self, df: pd.DataFrame) -> pd.Series:
        """
        Clutch performance analysis for championship moments

        Measures performance in high-leverage situations
        Essential for Deep South championship baseball
        """
        d = df.copy()

        # Define clutch situations (high leverage index > 1.5)
        clutch_situations = d["leverage_index"] > 1.5

        # Calculate clutch vs. normal performance by player
        player_groups = d.groupby("player_id")

        # Normal performance (non-clutch situations)
        normal_performance = player_groups.apply(
            lambda g: g.loc[~clutch_situations & (g.index.isin(g.index)), "woba_value"].mean()
        )

        # Clutch performance
        clutch_performance = player_groups.apply(
            lambda g: g.loc[clutch_situations & (g.index.isin(g.index)), "woba_value"].mean()
        )

        # Clutch index (positive values indicate improved clutch performance)
        clutch_index = (clutch_performance - normal_performance).fillna(0)

        # Broadcast to all rows
        result = d.set_index("player_id").join(clutch_index.rename("clutch_index")).reset_index(drop=True)["clutch_index"]

        return result.reindex(df.index)

    # ========================= FOOTBALL ANALYTICS =========================

    def football_qb_pressure_sack_rate_adjusted(self, df: pd.DataFrame) -> pd.Series:
        """
        QB pressure-to-sack rate adjusted for opponent pass blocking

        Critical for SEC/Texas championship-level quarterback evaluation
        """
        d = df.copy().sort_values(["qb_id", "game_number"])

        # Calculate per-game metrics
        per_game = (d.groupby(["qb_id", "game_number"])
                   .agg(
                       pressures=("pressure", "sum"),
                       sacks=("sack", "sum"),
                       opponent_pass_block_rating=("opponent_pass_block_win_rate", "mean")
                   )
                   .reset_index())

        # Raw sack rate
        per_game["raw_sack_rate"] = (per_game["sacks"] /
                                    per_game["pressures"].replace(0, np.nan)).clip(0, 1)

        # Sort for rolling calculations
        per_game = per_game.sort_values(["qb_id", "game_number"])

        # Rolling 4-game averages
        per_game["raw_rate_4g"] = (per_game.groupby("qb_id")["raw_sack_rate"]
                                  .rolling(4, min_periods=2).mean()
                                  .reset_index(level=0, drop=True))

        per_game["opponent_rating_4g"] = (per_game.groupby("qb_id")["opponent_pass_block_rating"]
                                         .rolling(4, min_periods=2).mean()
                                         .reset_index(level=0, drop=True))

        # Adjusted rate (lower opponent rating = tougher pass blocking)
        per_game["adjusted_sack_rate"] = (per_game["raw_rate_4g"] /
                                         per_game["opponent_rating_4g"]).clip(0, 1)

        # Merge back to play-level data
        result = d.merge(
            per_game[["qb_id", "game_number", "adjusted_sack_rate"]],
            on=["qb_id", "game_number"],
            how="left"
        )["adjusted_sack_rate"]

        return result.reindex(df.index)

    def football_hidden_yardage_per_drive(self, df: pd.DataFrame) -> pd.Series:
        """
        Hidden yardage analysis for championship-level field position advantage

        Accounts for field position, returns, and penalties
        Critical for SEC/Texas strategic analysis
        """
        d = df.copy().sort_values(["offense_team", "game_number", "drive_id"])

        # Calculate hidden yardage per drive
        d["hidden_yardage"] = ((d["start_yardline"] - d.get("expected_start_yardline", 25)) +
                              d.get("return_yards", 0).fillna(0) -
                              d.get("penalty_yards", 0).fillna(0))

        # Aggregate to game level
        per_game = (d.groupby(["offense_team", "game_number"])["hidden_yardage"]
                   .mean().reset_index(name="hidden_yardage_per_game"))

        # Sort for rolling calculations
        per_game = per_game.sort_values(["offense_team", "game_number"])

        # Rolling 5-game average
        per_game["hidden_yardage_5g"] = (per_game.groupby("offense_team")["hidden_yardage_per_game"]
                                        .rolling(5, min_periods=2).mean()
                                        .reset_index(level=0, drop=True))

        # Clip to reasonable bounds
        per_game["hidden_yardage_5g"] = per_game["hidden_yardage_5g"].clip(-30, 30)

        # Merge back to drive-level data
        result = d.merge(
            per_game[["offense_team", "game_number", "hidden_yardage_5g"]],
            on=["offense_team", "game_number"],
            how="left"
        )["hidden_yardage_5g"]

        return result.reindex(df.index)

    def football_championship_momentum_index(self, df: pd.DataFrame) -> pd.Series:
        """
        Championship momentum analysis for critical game situations

        Measures team momentum shifts in championship-level games
        Essential for Deep South football authority analysis
        """
        d = df.copy()

        # Define momentum events
        momentum_events = {
            'touchdown': 7,
            'field_goal': 3,
            'turnover': -4,
            'safety': -2,
            'fourth_down_conversion': 3,
            'fourth_down_stop': -3
        }

        # Calculate momentum points for each play
        d["momentum_points"] = 0
        for event, points in momentum_events.items():
            if event in d.columns:
                d["momentum_points"] += d[event].fillna(0) * points

        # Rolling momentum index (last 10 plays)
        d = d.sort_values(["team_id", "game_id", "play_number"])
        d["momentum_index"] = (d.groupby(["team_id", "game_id"])["momentum_points"]
                              .rolling(10, min_periods=1).sum()
                              .reset_index(level=[0,1], drop=True))

        # Normalize to -1 to 1 scale
        d["momentum_index"] = d["momentum_index"].clip(-20, 20) / 20

        return d["momentum_index"].reindex(df.index)

    # ========================= BASKETBALL ANALYTICS =========================

    def basketball_clutch_factor_analysis(self, df: pd.DataFrame) -> pd.Series:
        """
        Basketball clutch performance for championship moments

        Analyzes performance in final 5 minutes of close games
        Critical for SEC/Texas championship basketball
        """
        d = df.copy()

        # Define clutch situations (final 5 minutes, margin <= 5 points)
        clutch_time = d["time_remaining"] <= 300  # 5 minutes in seconds
        close_game = d["score_margin"].abs() <= 5
        clutch_situation = clutch_time & close_game

        # Calculate clutch vs. non-clutch performance by player
        player_groups = d.groupby("player_id")

        # Non-clutch performance
        non_clutch_performance = player_groups.apply(
            lambda g: g.loc[~clutch_situation & (g.index.isin(g.index)), "true_shooting_pct"].mean()
        )

        # Clutch performance
        clutch_performance = player_groups.apply(
            lambda g: g.loc[clutch_situation & (g.index.isin(g.index)), "true_shooting_pct"].mean()
        )

        # Clutch factor (positive values indicate improved clutch performance)
        clutch_factor = (clutch_performance - non_clutch_performance).fillna(0)

        # Broadcast to all rows
        result = d.set_index("player_id").join(clutch_factor.rename("clutch_factor")).reset_index(drop=True)["clutch_factor"]

        return result.reindex(df.index)

    def basketball_defensive_impact_rating(self, df: pd.DataFrame) -> pd.Series:
        """
        Advanced defensive impact analysis for championship-level evaluation

        Combines traditional and advanced defensive metrics
        Essential for Grizzlies and SEC basketball analysis
        """
        d = df.copy()

        # Defensive metrics weights
        defensive_weights = {
            'steals': 2.0,
            'blocks': 2.5,
            'defensive_rebounds': 1.0,
            'deflections': 1.5,
            'charges_taken': 3.0,
            'opponent_fg_pct_defending': -10.0  # Lower is better
        }

        # Calculate weighted defensive impact
        d["defensive_impact"] = 0
        for metric, weight in defensive_weights.items():
            if metric in d.columns:
                d["defensive_impact"] += d[metric].fillna(0) * weight

        # Normalize by minutes played
        d["defensive_impact_per_minute"] = d["defensive_impact"] / d["minutes_played"].replace(0, np.nan)

        # Rolling 10-game average
        d = d.sort_values(["player_id", "game_date"])
        d["defensive_impact_rating"] = (d.groupby("player_id")["defensive_impact_per_minute"]
                                       .rolling(10, min_periods=3).mean()
                                       .reset_index(level=0, drop=True))

        return d["defensive_impact_rating"].reindex(df.index)

    # ========================= TRACK & FIELD ANALYTICS =========================

    def track_field_progression_analysis(self, df: pd.DataFrame) -> pd.Series:
        """
        Track and field progression analysis for championship potential

        Analyzes improvement trends for SEC/UIL championship prediction
        """
        d = df.copy()

        # Convert times to seconds for standardization
        def convert_time_to_seconds(time_str):
            """Convert time string to seconds"""
            if pd.isna(time_str):
                return np.nan
            if isinstance(time_str, (int, float)):
                return time_str

            # Handle various time formats
            parts = str(time_str).split(':')
            if len(parts) == 2:  # MM:SS.ss format
                return float(parts[0]) * 60 + float(parts[1])
            elif len(parts) == 1:  # SS.ss format
                return float(parts[0])
            return np.nan

        # Convert performance times
        d["performance_seconds"] = d["performance_time"].apply(convert_time_to_seconds)

        # Sort by athlete and date
        d = d.sort_values(["athlete_id", "competition_date"])

        # Calculate progression rate (improvement over time)
        athlete_groups = d.groupby("athlete_id")

        # For running events, lower times are better (negative progression is improvement)
        # For field events, higher marks are better (positive progression is improvement)
        running_events = ['100m', '200m', '400m', '800m', '1500m', '5000m', '10000m', 'marathon']

        d["is_running_event"] = d["event"].isin(running_events)

        # Calculate rolling progression rate (last 5 competitions) - OPTIMIZED
        def calculate_progression(group):
            if len(group) < 2:
                return pd.Series(np.nan, index=group.index)

            # Vectorized approach for better performance
            group_len = len(group)
            progression_rates = np.zeros(group_len)
            
            # Pre-calculate running event flag
            is_running = group["is_running_event"].iloc[0]
            
            # Use rolling window approach for better performance
            for i in range(group_len):
                start_idx = max(0, i - 4)  # Last 5 competitions
                subset_len = i + 1 - start_idx
                
                if subset_len >= 2:
                    # Use vectorized operations
                    x = np.arange(subset_len)
                    y = group["performance_seconds"].iloc[start_idx:i+1].values
                    
                    # Skip if all NaN values
                    if not np.all(np.isnan(y)):
                        slope = np.polyfit(x, y, 1)[0]
                        # Apply direction based on event type
                        progression_rates[i] = -slope if is_running else slope
                    else:
                        progression_rates[i] = 0
                else:
                    progression_rates[i] = 0

            return pd.Series(progression_rates, index=group.index)

        d["progression_rate"] = athlete_groups.apply(calculate_progression).reset_index(level=0, drop=True)

        return d["progression_rate"].reindex(df.index)

    def track_field_championship_potential(self, df: pd.DataFrame) -> pd.Series:
        """
        Championship potential analysis for track and field athletes

        Predicts championship potential based on progression and performance
        Essential for UIL and SEC championship forecasting
        """
        d = df.copy()

        # Get current season best and personal best
        d = d.sort_values(["athlete_id", "competition_date"])

        # Calculate season best (minimum for running, maximum for field)
        current_season = d["competition_date"].dt.year.max()
        season_data = d[d["competition_date"].dt.year == current_season]

        running_events = ['100m', '200m', '400m', '800m', '1500m', '5000m', '10000m', 'marathon']
        d["is_running_event"] = d["event"].isin(running_events)

        # Calculate season best and personal best
        athlete_season_groups = season_data.groupby(["athlete_id", "event"])
        athlete_all_groups = d.groupby(["athlete_id", "event"])

        # For running events, best is minimum; for field events, best is maximum
        def get_best_performance(group):
            if group["is_running_event"].iloc[0]:
                return group["performance_seconds"].min()
            else:
                return group["performance_seconds"].max()

        season_best = athlete_season_groups.apply(get_best_performance).rename("season_best")
        personal_best = athlete_all_groups.apply(get_best_performance).rename("personal_best")

        # Championship standards (approximate)
        championship_standards = {
            '100m': 10.50,  # seconds
            '200m': 21.00,
            '400m': 47.00,
            '800m': 105.00,
            '1500m': 225.00,
            '5000m': 900.00,
            'long_jump': 7.50,  # meters
            'high_jump': 2.10,
            'shot_put': 18.00,
            'discus': 55.00
        }

        # Calculate championship potential
        def calculate_championship_potential(row):
            event = row["event"]
            season_best_val = season_best.get((row["athlete_id"], event), np.nan)

            if pd.isna(season_best_val) or event not in championship_standards:
                return 0.0

            standard = championship_standards[event]

            if row["is_running_event"]:
                # For running, lower is better
                potential = max(0, (standard - season_best_val) / standard)
            else:
                # For field events, higher is better
                potential = max(0, (season_best_val - standard) / standard)

            return min(1.0, potential)  # Cap at 1.0

        d["championship_potential"] = d.apply(calculate_championship_potential, axis=1)

        return d["championship_potential"].reindex(df.index)

    # ========================= CHARACTER ASSESSMENT =========================

    def character_assessment_composite(self, df: pd.DataFrame) -> pd.Series:
        """
        Comprehensive character assessment for Deep South athletics

        Combines performance metrics with behavioral indicators
        Essential for championship-level talent evaluation
        """
        d = df.copy()

        # Character metrics weights
        character_weights = {
            'clutch_performance': 0.30,
            'consistency_score': 0.25,
            'pressure_response': 0.25,
            'teamwork_rating': 0.20
        }

        # Calculate composite character score
        d["character_score"] = 0
        total_weight = 0

        for metric, weight in character_weights.items():
            if metric in d.columns:
                # Normalize metric to 0-1 scale
                metric_normalized = (d[metric] - d[metric].min()) / (d[metric].max() - d[metric].min())
                d["character_score"] += metric_normalized.fillna(0) * weight
                total_weight += weight

        # Normalize by actual weights used
        if total_weight > 0:
            d["character_score"] = d["character_score"] / total_weight

        # Apply character thresholds for classification
        d["character_grade"] = pd.cut(
            d["character_score"],
            bins=[0, 0.5, 0.7, 0.85, 1.0],
            labels=['Developing', 'Good', 'Excellent', 'Elite'],
            include_lowest=True
        )

        return d["character_score"].reindex(df.index)

    # ========================= CHAMPIONSHIP PREDICTION ENGINE =========================

    def championship_probability_calculator(self, team_stats: Dict, opponent_strength: float = 0.5) -> Dict:
        """
        Calculate championship probability using advanced metrics

        Integrates all sport-specific analytics for championship forecasting
        """

        # Base probability calculation
        base_metrics = {
            'win_percentage': team_stats.get('wins', 0) / max(team_stats.get('games_played', 1), 1),
            'strength_of_schedule': team_stats.get('sos', 0.5),
            'recent_form': team_stats.get('last_10_win_pct', 0.5),
            'key_player_health': team_stats.get('injury_index', 1.0)
        }

        # Sport-specific adjustments
        sport_adjustments = {
            'baseball': {
                'bullpen_depth': team_stats.get('bullpen_era', 4.00),
                'starting_rotation': team_stats.get('starter_era', 4.00),
                'clutch_hitting': team_stats.get('risp_avg', 0.250)
            },
            'football': {
                'turnover_margin': team_stats.get('turnover_margin', 0),
                'red_zone_efficiency': team_stats.get('rz_pct', 0.5),
                'defensive_efficiency': team_stats.get('def_dvoa', 0)
            },
            'basketball': {
                'offensive_efficiency': team_stats.get('off_rating', 100),
                'defensive_efficiency': team_stats.get('def_rating', 100),
                'rebounding_margin': team_stats.get('reb_margin', 0)
            }
        }

        # Calculate weighted probability
        sport = team_stats.get('sport', 'baseball')
        adjustments = sport_adjustments.get(sport, {})

        # Base probability from win percentage and SOS
        base_prob = (base_metrics['win_percentage'] * 0.4 +
                    base_metrics['strength_of_schedule'] * 0.2 +
                    base_metrics['recent_form'] * 0.3 +
                    base_metrics['key_player_health'] * 0.1)

        # Sport-specific adjustments
        sport_modifier = 1.0
        if sport == 'baseball':
            pitching_factor = 1 - (adjustments.get('bullpen_depth', 4.0) - 3.0) / 5.0
            hitting_factor = adjustments.get('clutch_hitting', 0.25) / 0.30
            sport_modifier = (pitching_factor + hitting_factor) / 2

        elif sport == 'football':
            turnover_factor = 1 + (adjustments.get('turnover_margin', 0) * 0.1)
            efficiency_factor = adjustments.get('red_zone_efficiency', 0.5)
            sport_modifier = (turnover_factor + efficiency_factor) / 2

        # Final championship probability
        championship_prob = min(0.95, max(0.05, base_prob * sport_modifier))

        return {
            'championship_probability': round(championship_prob, 3),
            'confidence_interval': [
                round(max(0.01, championship_prob - 0.1), 3),
                round(min(0.99, championship_prob + 0.1), 3)
            ],
            'key_factors': base_metrics,
            'sport_adjustments': adjustments,
            'analysis_timestamp': datetime.now().isoformat()
        }

    # ========================= DATA VALIDATION & QUALITY =========================

    def validate_sports_data(self, df: pd.DataFrame, sport: str) -> Dict:
        """
        Comprehensive data validation for championship-level analytics

        Ensures data quality for accurate Deep South sports analysis
        """
        validation_results = {
            'sport': sport,
            'total_records': len(df),
            'validation_timestamp': datetime.now().isoformat(),
            'quality_score': 0.0,
            'issues': [],
            'recommendations': []
        }

        # Required columns by sport
        required_columns = {
            'baseball': ['player_id', 'timestamp', 'team_id'],
            'football': ['player_id', 'game_id', 'team_id'],
            'basketball': ['player_id', 'game_date', 'team_id'],
            'track_field': ['athlete_id', 'competition_date', 'event']
        }

        sport_requirements = required_columns.get(sport, [])
        missing_columns = [col for col in sport_requirements if col not in df.columns]

        if missing_columns:
            validation_results['issues'].append(f"Missing required columns: {missing_columns}")

        # Data quality checks
        quality_factors = []

        # Completeness check
        completeness = 1 - (df.isnull().sum().sum() / (len(df) * len(df.columns)))
        quality_factors.append(completeness)

        # Temporal consistency
        if any(col in df.columns for col in ['timestamp', 'game_date', 'competition_date']):
            date_col = next(col for col in ['timestamp', 'game_date', 'competition_date'] if col in df.columns)
            try:
                date_range = pd.to_datetime(df[date_col]).max() - pd.to_datetime(df[date_col]).min()
                temporal_quality = min(1.0, date_range.days / 365)  # Prefer data spanning full season
                quality_factors.append(temporal_quality)
            except:
                validation_results['issues'].append(f"Invalid date format in {date_col}")

        # Duplicate detection
        duplicate_rate = df.duplicated().mean()
        if duplicate_rate > 0.01:  # More than 1% duplicates
            validation_results['issues'].append(f"High duplicate rate: {duplicate_rate:.2%}")
        quality_factors.append(1 - duplicate_rate)

        # Calculate overall quality score
        validation_results['quality_score'] = round(np.mean(quality_factors), 3)

        # Recommendations based on quality score
        if validation_results['quality_score'] < 0.7:
            validation_results['recommendations'].append("Data quality below championship standards - review data sources")
        if missing_columns:
            validation_results['recommendations'].append("Implement data collection for missing required columns")
        if duplicate_rate > 0.01:
            validation_results['recommendations'].append("Implement duplicate detection and removal process")

        return validation_results

# ========================= EXPORT CONFIGURATION =========================

def get_analytics_engine():
    """Factory function to create analytics engine instance"""
    return DeepSouthSportsAnalytics()

def get_feature_functions():
    """Export dictionary of available feature engineering functions"""
    engine = DeepSouthSportsAnalytics()

    return {
        # Baseball features
        'baseball_bullpen_fatigue_index_3d': engine.baseball_bullpen_fatigue_index_3d,
        'baseball_times_through_order_penalty': engine.baseball_times_through_order_penalty,
        'baseball_clutch_performance_index': engine.baseball_clutch_performance_index,

        # Football features
        'football_qb_pressure_sack_rate_adjusted': engine.football_qb_pressure_sack_rate_adjusted,
        'football_hidden_yardage_per_drive': engine.football_hidden_yardage_per_drive,
        'football_championship_momentum_index': engine.football_championship_momentum_index,

        # Basketball features
        'basketball_clutch_factor_analysis': engine.basketball_clutch_factor_analysis,
        'basketball_defensive_impact_rating': engine.basketball_defensive_impact_rating,

        # Track & Field features
        'track_field_progression_analysis': engine.track_field_progression_analysis,
        'track_field_championship_potential': engine.track_field_championship_potential,

        # Character assessment
        'character_assessment_composite': engine.character_assessment_composite,

        # Utilities
        'championship_probability_calculator': engine.championship_probability_calculator,
        'validate_sports_data': engine.validate_sports_data
    }

if __name__ == "__main__":
    # Example usage and testing
    print("🔥 Blaze Sports Intel - Deep South Sports Authority")
    print("Championship Analytics Engine Initialized")

    engine = get_analytics_engine()
    functions = get_feature_functions()

    print(f"\nAvailable Features: {len(functions)}")
    for feature_name in functions.keys():
        print(f"  - {feature_name}")

    print("\n" + "="*60)
    print("Ready for championship-level sports analytics!")
    print("From Friday Night Lights to Sunday in the Show")
    print("="*60)