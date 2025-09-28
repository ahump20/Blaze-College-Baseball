"""
Blaze Sports Intel - Main Application
Real-time Sports Analytics and Championship Intelligence Platform
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import uvicorn
import httpx
import hashlib
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager

# Import our actual modules
from pose import PoseFrame, Athlete, BiomechAnalysis, Sport
from sports_analytics_engine import DeepSouthSportsAnalytics, get_feature_functions

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize analytics engine (singleton pattern for better performance)
analytics_engine = DeepSouthSportsAnalytics()

# Cache for frequently accessed data
_analysis_cache = {}
CACHE_TTL = 300  # 5 minutes

def get_cache_key(data: Dict, sport: str) -> str:
    """Generate cache key for data"""
    data_str = str(sorted(data.items()))
    return hashlib.md5(f"{sport}_{data_str}".encode()).hexdigest()

def is_cache_valid(timestamp: datetime) -> bool:
    """Check if cache entry is still valid"""
    return datetime.now() - timestamp < timedelta(seconds=CACHE_TTL)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifecycle"""
    # Startup
    logger.info("Starting Blaze Sports Intel - Championship Intelligence Platform")
    yield
    # Shutdown
    logger.info("Shutting down Blaze Sports Intel")

app = FastAPI(
    title="Blaze Sports Intel API",
    description="Championship Intelligence Platform for Deep South Sports Authority",
    version="2.1.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://blazesportsintel.com", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Health check and system info"""
    return {
        "service": "Blaze Sports Intel",
        "version": "2.1.0",
        "status": "operational",
        "timestamp": datetime.now().isoformat(),
        "description": "Championship Intelligence Platform for Deep South Sports Authority",
        "endpoints": {
            "docs": "/docs",
            "health": "/health",
            "analytics": "/api/v1/analytics",
            "sports": "/api/v1/sports"
        }
    }

@app.get("/health")
async def health_check():
    """Comprehensive health check"""
    return {
        "api": "healthy",
        "analytics_engine": "operational",
        "timestamp": datetime.now().isoformat(),
        "version": "2.1.0"
    }

@app.get("/api/v1/sports")
async def get_sports_info():
    """Get supported sports and their configurations"""
    return {
        "sports": list(analytics_engine.sports_config.keys()),
        "configurations": analytics_engine.sports_config,
        "features_available": len(get_feature_functions())
    }

@app.post("/api/v1/analytics/baseball")
async def analyze_baseball_data(data: Dict):
    """Analyze baseball data using our analytics engine with caching"""
    try:
        import pandas as pd
        
        # Check cache first
        cache_key = get_cache_key(data, "baseball")
        if cache_key in _analysis_cache:
            cached_result, timestamp = _analysis_cache[cache_key]
            if is_cache_valid(timestamp):
                logger.info("Returning cached baseball analysis")
                return cached_result
        
        # Convert data to DataFrame
        df = pd.DataFrame(data.get('records', []))
        
        if df.empty:
            raise HTTPException(status_code=400, detail="No data provided")
        
        # Run baseball analytics
        results = {}
        
        # Bullpen fatigue analysis
        if 'team_id' in df.columns and 'pitcher_id' in df.columns:
            results['bullpen_fatigue'] = analytics_engine.baseball_bullpen_fatigue_index_3d(df).to_dict()
        
        # Times through order penalty
        if 'times_through_order' in df.columns:
            results['tto_penalty'] = analytics_engine.baseball_times_through_order_penalty(df).to_dict()
        
        # Clutch performance
        if 'leverage_index' in df.columns:
            results['clutch_performance'] = analytics_engine.baseball_clutch_performance_index(df).to_dict()
        
        result = {
            "sport": "baseball",
            "analysis_timestamp": datetime.now().isoformat(),
            "records_processed": len(df),
            "results": results,
            "cached": False
        }
        
        # Cache the result
        _analysis_cache[cache_key] = (result, datetime.now())
        
        return result
    except Exception as e:
        logger.error(f"Baseball analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/analytics/football")
async def analyze_football_data(data: Dict):
    """Analyze football data using our analytics engine"""
    try:
        import pandas as pd
        
        df = pd.DataFrame(data.get('records', []))
        
        if df.empty:
            raise HTTPException(status_code=400, detail="No data provided")
        
        results = {}
        
        # QB pressure analysis
        if 'qb_id' in df.columns and 'pressure' in df.columns:
            results['qb_pressure_sack_rate'] = analytics_engine.football_qb_pressure_sack_rate_adjusted(df).to_dict()
        
        # Hidden yardage analysis
        if 'offense_team' in df.columns and 'drive_id' in df.columns:
            results['hidden_yardage'] = analytics_engine.football_hidden_yardage_per_drive(df).to_dict()
        
        # Momentum analysis
        if 'team_id' in df.columns and 'game_id' in df.columns:
            results['momentum_index'] = analytics_engine.football_championship_momentum_index(df).to_dict()
        
        return {
            "sport": "football",
            "analysis_timestamp": datetime.now().isoformat(),
            "records_processed": len(df),
            "results": results
        }
    except Exception as e:
        logger.error(f"Football analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/analytics/basketball")
async def analyze_basketball_data(data: Dict):
    """Analyze basketball data using our analytics engine"""
    try:
        import pandas as pd
        
        df = pd.DataFrame(data.get('records', []))
        
        if df.empty:
            raise HTTPException(status_code=400, detail="No data provided")
        
        results = {}
        
        # Clutch factor analysis
        if 'player_id' in df.columns and 'time_remaining' in df.columns:
            results['clutch_factor'] = analytics_engine.basketball_clutch_factor_analysis(df).to_dict()
        
        # Defensive impact rating
        if 'player_id' in df.columns and 'minutes_played' in df.columns:
            results['defensive_impact'] = analytics_engine.basketball_defensive_impact_rating(df).to_dict()
        
        return {
            "sport": "basketball",
            "analysis_timestamp": datetime.now().isoformat(),
            "records_processed": len(df),
            "results": results
        }
    except Exception as e:
        logger.error(f"Basketball analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/analytics/track-field")
async def analyze_track_field_data(data: Dict):
    """Analyze track and field data using our analytics engine"""
    try:
        import pandas as pd
        
        df = pd.DataFrame(data.get('records', []))
        
        if df.empty:
            raise HTTPException(status_code=400, detail="No data provided")
        
        results = {}
        
        # Progression analysis
        if 'athlete_id' in df.columns and 'competition_date' in df.columns:
            results['progression_analysis'] = analytics_engine.track_field_progression_analysis(df).to_dict()
        
        # Championship potential
        if 'athlete_id' in df.columns and 'event' in df.columns:
            results['championship_potential'] = analytics_engine.track_field_championship_potential(df).to_dict()
        
        return {
            "sport": "track_field",
            "analysis_timestamp": datetime.now().isoformat(),
            "records_processed": len(df),
            "results": results
        }
    except Exception as e:
        logger.error(f"Track & Field analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/analytics/character")
async def analyze_character_data(data: Dict):
    """Analyze character assessment data"""
    try:
        import pandas as pd
        
        df = pd.DataFrame(data.get('records', []))
        
        if df.empty:
            raise HTTPException(status_code=400, detail="No data provided")
        
        # Character assessment
        results = analytics_engine.character_assessment_composite(df).to_dict()
        
        return {
            "analysis_type": "character_assessment",
            "analysis_timestamp": datetime.now().isoformat(),
            "records_processed": len(df),
            "character_scores": results
        }
    except Exception as e:
        logger.error(f"Character analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/championship/probability")
async def calculate_championship_probability(team_stats: Dict):
    """Calculate championship probability for a team"""
    try:
        result = analytics_engine.championship_probability_calculator(team_stats)
        return result
    except Exception as e:
        logger.error(f"Championship probability calculation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/data/validate")
async def validate_data(data: Dict):
    """Validate sports data quality"""
    try:
        import pandas as pd
        
        df = pd.DataFrame(data.get('records', []))
        sport = data.get('sport', 'baseball')
        
        if df.empty:
            raise HTTPException(status_code=400, detail="No data provided")
        
        validation_result = analytics_engine.validate_sports_data(df, sport)
        return validation_result
    except Exception as e:
        logger.error(f"Data validation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/features")
async def get_available_features():
    """Get list of available feature engineering functions"""
    features = get_feature_functions()
    return {
        "total_features": len(features),
        "features": list(features.keys()),
        "categories": {
            "baseball": [f for f in features.keys() if f.startswith('baseball_')],
            "football": [f for f in features.keys() if f.startswith('football_')],
            "basketball": [f for f in features.keys() if f.startswith('basketball_')],
            "track_field": [f for f in features.keys() if f.startswith('track_field_')],
            "character": [f for f in features.keys() if 'character' in f],
            "utilities": [f for f in features.keys() if f in ['championship_probability_calculator', 'validate_sports_data']]
        }
    }

@app.get("/api/v1/teams")
async def get_supported_teams():
    """Get list of supported teams by sport"""
    teams = {}
    for sport, config in analytics_engine.sports_config.items():
        teams[sport] = config.get('teams_focus', [])
    
    return {
        "teams_by_sport": teams,
        "total_teams": sum(len(teams[sport]) for sport in teams)
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )