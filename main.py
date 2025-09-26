"""
Blaze Biomechanics Vision API
Real-time 3D pose analysis and Champion Enigma Engine integration
"""

from fastapi import FastAPI, WebSocket, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import asyncio
import logging
from typing import List, Optional, Dict, Any
import uvicorn
from datetime import datetime, timezone

from config import settings
from models.pose import PoseFrame, Athlete, BiomechAnalysis
from models.enigma import EnigmaTraits, EnigmaScore
from services.pose_ingestion import PoseIngestionService
from services.feature_extraction import FeatureExtractor
from services.risk_assessment import RiskAssessor
from services.clip_generation import ClipGenerator
from routers import athletes, analysis, clips
from database import init_db, get_db

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Services initialization
pose_service = PoseIngestionService()
feature_extractor = FeatureExtractor()
risk_assessor = RiskAssessor()
clip_generator = ClipGenerator()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifecycle"""
    # Startup
    logger.info("Starting Blaze Biomechanics Vision System")
    await init_db()
    await pose_service.initialize()
    await clip_generator.initialize_storage()
    
    # Load calibration data
    logger.info("Loading camera calibration data")
    await pose_service.load_calibration("/sample_data/calibration")
    
    yield
    
    # Shutdown
    logger.info("Shutting down services")
    await pose_service.cleanup()
    await clip_generator.cleanup()

app = FastAPI(
    title="Blaze Biomechanics Vision API",
    description="Transform 3D pose data into elite performance insights",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://blazesportsintel.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(athletes.router, prefix="/api/v1/athletes", tags=["Athletes"])
app.include_router(analysis.router, prefix="/api/v1/analysis", tags=["Analysis"])
app.include_router(clips.router, prefix="/api/v1/clips", tags=["Clips"])

@app.get("/")
async def root():
    """Health check and system info"""
    return {
        "service": "Blaze Biomechanics Vision",
        "version": "1.0.0",
        "status": "operational",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "endpoints": {
            "docs": "/docs",
            "health": "/health",
            "metrics": "/metrics"
        }
    }

@app.get("/health")
async def health_check():
    """Comprehensive health check"""
    health_status = {
        "api": "healthy",
        "database": "unknown",
        "redis": "unknown",
        "storage": "unknown",
        "processor": "unknown"
    }
    
    try:
        # Check database
        db = next(get_db())
        db.execute("SELECT 1")
        health_status["database"] = "healthy"
    except Exception as e:
        health_status["database"] = f"unhealthy: {str(e)}"
    
    try:
        # Check Redis
        await pose_service.check_redis_health()
        health_status["redis"] = "healthy"
    except Exception as e:
        health_status["redis"] = f"unhealthy: {str(e)}"
    
    try:
        # Check storage
        await clip_generator.check_storage_health()
        health_status["storage"] = "healthy"
    except Exception as e:
        health_status["storage"] = f"unhealthy: {str(e)}"
    
    overall_health = all(v == "healthy" for v in health_status.values())
    
    return JSONResponse(
        status_code=200 if overall_health else 503,
        content=health_status
    )

@app.post("/api/v1/pose/ingest")
async def ingest_pose_data(
    pose_frame: PoseFrame,
    background_tasks: BackgroundTasks
):
    """
    Ingest 3D pose data from multi-camera systems
    Supports: OpenPose, MediaPipe, KinaTrax, Hawk-Eye formats
    """
    try:
        # Validate and normalize pose data
        normalized_frame = await pose_service.normalize_frame(pose_frame)
        
        # Queue for real-time processing
        await pose_service.queue_frame(normalized_frame)
        
        # Background feature extraction
        background_tasks.add_task(
            process_pose_frame,
            normalized_frame
        )
        
        return {
            "status": "ingested",
            "frame_id": normalized_frame.frame_id,
            "timestamp": normalized_frame.timestamp,
            "athlete_id": normalized_frame.athlete_id
        }
    except Exception as e:
        logger.error(f"Pose ingestion error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

async def process_pose_frame(frame: PoseFrame):
    """Background task to process pose frame"""
    try:
        # Extract biomechanical features
        features = await feature_extractor.extract_features(frame)
        
        # Assess injury risk
        risk_profile = await risk_assessor.assess_frame(frame, features)
        
        # Update Enigma scores if significant
        if features.is_significant_event():
            await update_enigma_scores(frame.athlete_id, features)
        
        # Store results
        await pose_service.store_analysis_results(
            frame.athlete_id,
            frame.frame_id,
            features,
            risk_profile
        )
    except Exception as e:
        logger.error(f"Frame processing error: {e}")

@app.get("/api/v1/analysis/{athlete_id}/biomech")
async def get_biomech_analysis(
    athlete_id: str,
    sport: Optional[str] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None
) -> BiomechAnalysis:
    """
    Get comprehensive biomechanical analysis for an athlete
    """
    try:
        # Fetch athlete data
        athlete = await pose_service.get_athlete(athlete_id)
        if not athlete:
            raise HTTPException(status_code=404, detail="Athlete not found")
        
        # Get analysis based on sport
        sport = sport or athlete.primary_sport
        
        if sport == "baseball":
            analysis = await analyze_baseball_biomech(athlete_id, date_from, date_to)
        elif sport == "football":
            analysis = await analyze_football_biomech(athlete_id, date_from, date_to)
        elif sport == "basketball":
            analysis = await analyze_basketball_biomech(athlete_id, date_from, date_to)
        elif sport == "track":
            analysis = await analyze_track_biomech(athlete_id, date_from, date_to)
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported sport: {sport}")
        
        return analysis
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Analysis error for {athlete_id}: {e}")
        raise HTTPException(status_code=500, detail="Analysis failed")

async def analyze_baseball_biomech(
    athlete_id: str,
    date_from: Optional[datetime],
    date_to: Optional[datetime]
) -> BiomechAnalysis:
    """Baseball-specific biomechanical analysis"""
    
    # Fetch pose data
    frames = await pose_service.get_frames(athlete_id, date_from, date_to)
    
    # Compute baseball-specific metrics
    metrics = {
        "hip_torque_index": 0.0,
        "separation_stability": 0.0,
        "pelvis_rotation_velocity": 0.0,
        "trunk_angular_momentum": 0.0,
        "ground_contact_time": 0.0,
        "elbow_valgus_angle": 0.0
    }
    
    for frame in frames:
        features = await feature_extractor.extract_baseball_features(frame)
        
        # Hip-Shoulder Separation
        hip_shoulder_sep = feature_extractor.compute_hip_shoulder_separation(frame)
        metrics["separation_stability"] = max(metrics["separation_stability"], hip_shoulder_sep)
        
        # Pelvis rotation velocity
        pelvis_omega = feature_extractor.compute_pelvis_rotation_velocity(frame)
        metrics["pelvis_rotation_velocity"] = max(metrics["pelvis_rotation_velocity"], pelvis_omega)
        
        # Hip torque
        hip_torque = feature_extractor.compute_hip_torque(frame)
        metrics["hip_torque_index"] = max(metrics["hip_torque_index"], hip_torque)
        
        # Injury risk - elbow valgus
        elbow_angle = feature_extractor.compute_elbow_valgus(frame)
        metrics["elbow_valgus_angle"] = max(metrics["elbow_valgus_angle"], elbow_angle)
    
    # Normalize to percentiles
    normalized_metrics = await feature_extractor.normalize_to_percentiles(
        metrics, 
        sport="baseball",
        position=frames[0].metadata.get("position", "pitcher")
    )
    
    return BiomechAnalysis(
        athlete_id=athlete_id,
        sport="baseball",
        timestamp=datetime.now(timezone.utc),
        metrics=normalized_metrics,
        risk_factors=await risk_assessor.assess_baseball_risks(metrics),
        recommendations=generate_baseball_recommendations(normalized_metrics)
    )

async def analyze_football_biomech(
    athlete_id: str,
    date_from: Optional[datetime],
    date_to: Optional[datetime]
) -> BiomechAnalysis:
    """Football-specific biomechanical analysis"""
    
    frames = await pose_service.get_frames(athlete_id, date_from, date_to)
    
    metrics = {
        "first_step_explosiveness": 0.0,
        "com_projection": 0.0,
        "shin_angle_launch": 0.0,
        "hip_extension_power": 0.0,
        "ground_contact_asymmetry": 0.0
    }
    
    # Analyze first-step mechanics (0-400ms)
    first_step_frames = [f for f in frames if f.metadata.get("event_type") == "first_step"]
    
    for frame in first_step_frames:
        # First step burst analysis
        contact_time = feature_extractor.compute_ground_contact_time(frame)
        horizontal_impulse = feature_extractor.compute_horizontal_impulse(frame)
        metrics["first_step_explosiveness"] = horizontal_impulse / contact_time if contact_time > 0 else 0
        
        # Center of mass projection
        com_angle = feature_extractor.compute_com_projection_angle(frame)
        metrics["com_projection"] = max(metrics["com_projection"], com_angle)
        
        # Shin angle at launch
        shin_angle = feature_extractor.compute_shin_angle(frame)
        metrics["shin_angle_launch"] = max(metrics["shin_angle_launch"], shin_angle)
    
    normalized_metrics = await feature_extractor.normalize_to_percentiles(
        metrics,
        sport="football",
        position=frames[0].metadata.get("position", "wr")
    )
    
    return BiomechAnalysis(
        athlete_id=athlete_id,
        sport="football",
        timestamp=datetime.now(timezone.utc),
        metrics=normalized_metrics,
        risk_factors=await risk_assessor.assess_football_risks(metrics),
        recommendations=generate_football_recommendations(normalized_metrics)
    )

async def analyze_basketball_biomech(
    athlete_id: str,
    date_from: Optional[datetime],
    date_to: Optional[datetime]
) -> BiomechAnalysis:
    """Basketball-specific biomechanical analysis"""
    
    frames = await pose_service.get_frames(athlete_id, date_from, date_to)
    
    metrics = {
        "lateral_step_quickness": 0.0,
        "jump_loading_rate": 0.0,
        "landing_stability_index": 0.0,
        "deceleration_control": 0.0,
        "ankle_stiffness": 0.0
    }
    
    # Analyze change of direction
    cod_frames = [f for f in frames if f.metadata.get("event_type") == "change_direction"]
    for frame in cod_frames:
        lateral_time = feature_extractor.compute_lateral_step_time(frame)
        metrics["lateral_step_quickness"] = 1.0 / lateral_time if lateral_time > 0 else 0
    
    # Jump/land analysis
    jump_frames = [f for f in frames if f.metadata.get("event_type") in ["jump", "land"]]
    for frame in jump_frames:
        if frame.metadata.get("event_type") == "jump":
            loading_rate = feature_extractor.compute_jump_loading_rate(frame)
            metrics["jump_loading_rate"] = max(metrics["jump_loading_rate"], loading_rate)
        else:  # landing
            stability = feature_extractor.compute_landing_stability(frame)
            metrics["landing_stability_index"] = max(metrics["landing_stability_index"], stability)
    
    normalized_metrics = await feature_extractor.normalize_to_percentiles(
        metrics,
        sport="basketball",
        position=frames[0].metadata.get("position", "guard")
    )
    
    return BiomechAnalysis(
        athlete_id=athlete_id,
        sport="basketball",
        timestamp=datetime.now(timezone.utc),
        metrics=normalized_metrics,
        risk_factors=await risk_assessor.assess_basketball_risks(metrics),
        recommendations=generate_basketball_recommendations(normalized_metrics)
    )

async def analyze_track_biomech(
    athlete_id: str,
    date_from: Optional[datetime],
    date_to: Optional[datetime]
) -> BiomechAnalysis:
    """Track & Field biomechanical analysis"""
    
    frames = await pose_service.get_frames(athlete_id, date_from, date_to)
    
    metrics = {
        "ground_contact_asymmetry": 0.0,
        "flight_time_ratio": 0.0,
        "vertical_oscillation": 0.0,
        "cadence_variability": 0.0,
        "stride_length_consistency": 0.0
    }
    
    # Compute running mechanics
    stride_data = []
    for i in range(1, len(frames)):
        if frames[i].metadata.get("foot_contact"):
            contact_time = frames[i].timestamp - frames[i-1].timestamp
            flight_time = feature_extractor.compute_flight_time(frames[i-1], frames[i])
            stride_data.append({
                "contact": contact_time,
                "flight": flight_time,
                "oscillation": feature_extractor.compute_vertical_oscillation(frames[i])
            })
    
    if stride_data:
        # Asymmetry analysis
        left_contacts = [s["contact"] for i, s in enumerate(stride_data) if i % 2 == 0]
        right_contacts = [s["contact"] for i, s in enumerate(stride_data) if i % 2 == 1]
        if left_contacts and right_contacts:
            avg_left = sum(left_contacts) / len(left_contacts)
            avg_right = sum(right_contacts) / len(right_contacts)
            metrics["ground_contact_asymmetry"] = abs(avg_left - avg_right) / max(avg_left, avg_right)
        
        # Flight time ratio
        avg_contact = sum(s["contact"] for s in stride_data) / len(stride_data)
        avg_flight = sum(s["flight"] for s in stride_data) / len(stride_data)
        metrics["flight_time_ratio"] = avg_flight / avg_contact if avg_contact > 0 else 0
        
        # Vertical oscillation
        metrics["vertical_oscillation"] = sum(s["oscillation"] for s in stride_data) / len(stride_data)
    
    normalized_metrics = await feature_extractor.normalize_to_percentiles(
        metrics,
        sport="track",
        event=frames[0].metadata.get("event", "sprint")
    )
    
    return BiomechAnalysis(
        athlete_id=athlete_id,
        sport="track",
        timestamp=datetime.now(timezone.utc),
        metrics=normalized_metrics,
        risk_factors=await risk_assessor.assess_track_risks(metrics),
        recommendations=generate_track_recommendations(normalized_metrics)
    )

@app.get("/api/v1/enigma/{athlete_id}/scores")
async def get_enigma_scores(athlete_id: str) -> EnigmaScore:
    """
    Get Champion Enigma Engine scores with biomechanics integration
    """
    try:
        # Get latest biomech analysis
        analysis = await get_biomech_analysis(athlete_id)
        
        # Map to Enigma traits
        traits = EnigmaTraits()
        
        # Map biomech metrics to trait dimensions
        if analysis.sport == "baseball":
            traits.power_index = analysis.metrics.get("hip_torque_index", 50)
            traits.consistency = analysis.metrics.get("separation_stability", 50)
            traits.explosiveness = analysis.metrics.get("pelvis_rotation_velocity", 50)
        elif analysis.sport == "football":
            traits.burst = analysis.metrics.get("first_step_explosiveness", 50)
            traits.balance = analysis.metrics.get("com_projection", 50)
            traits.power_index = analysis.metrics.get("hip_extension_power", 50)
        elif analysis.sport == "basketball":
            traits.agility = analysis.metrics.get("lateral_step_quickness", 50)
            traits.explosiveness = analysis.metrics.get("jump_loading_rate", 50)
            traits.durability = analysis.metrics.get("landing_stability_index", 50)
        elif analysis.sport == "track":
            traits.efficiency = 100 - analysis.metrics.get("ground_contact_asymmetry", 0) * 100
            traits.endurance = 100 - analysis.metrics.get("cadence_variability", 0) * 100
            traits.speed = analysis.metrics.get("flight_time_ratio", 50)
        
        # Calculate composite Enigma score
        enigma_score = EnigmaScore(
            athlete_id=athlete_id,
            traits=traits,
            overall_score=traits.calculate_overall(),
            timestamp=datetime.now(timezone.utc),
            confidence=0.85,  # Based on data quality
            next_assessment=datetime.now(timezone.utc).replace(hour=0, minute=0, second=0)
        )
        
        return enigma_score
    except Exception as e:
        logger.error(f"Enigma scoring error: {e}")
        raise HTTPException(status_code=500, detail="Enigma scoring failed")

@app.post("/api/v1/clips/generate")
async def generate_metric_clips(
    athlete_id: str,
    metric: str,
    count: int = 5,
    background_tasks: BackgroundTasks = None
):
    """
    Generate video clips for specific biomechanical metrics
    """
    try:
        # Find frames with top metric values
        top_frames = await pose_service.get_top_metric_frames(
            athlete_id, 
            metric, 
            count
        )
        
        if not top_frames:
            raise HTTPException(status_code=404, detail="No frames found for metric")
        
        # Generate clips
        clip_urls = []
        for frame in top_frames:
            clip_url = await clip_generator.generate_clip(
                frame,
                metric,
                duration_seconds=3
            )
            clip_urls.append({
                "url": clip_url,
                "frame_id": frame.frame_id,
                "timestamp": frame.timestamp,
                "metric_value": frame.metadata.get(metric)
            })
        
        # Background task to create highlight reel
        if background_tasks:
            background_tasks.add_task(
                create_highlight_reel,
                athlete_id,
                metric,
                clip_urls
            )
        
        return {
            "athlete_id": athlete_id,
            "metric": metric,
            "clips": clip_urls,
            "generation_time": datetime.now(timezone.utc)
        }
    except Exception as e:
        logger.error(f"Clip generation error: {e}")
        raise HTTPException(status_code=500, detail="Clip generation failed")

async def create_highlight_reel(athlete_id: str, metric: str, clips: List[Dict]):
    """Background task to create combined highlight reel"""
    try:
        await clip_generator.create_highlight_reel(athlete_id, metric, clips)
    except Exception as e:
        logger.error(f"Highlight reel creation error: {e}")

@app.websocket("/ws/pose-stream/{athlete_id}")
async def websocket_pose_stream(websocket: WebSocket, athlete_id: str):
    """
    WebSocket endpoint for real-time pose streaming
    """
    await websocket.accept()
    logger.info(f"WebSocket connected for athlete {athlete_id}")
    
    try:
        while True:
            # Receive pose data
            data = await websocket.receive_json()
            
            # Process frame
            pose_frame = PoseFrame(**data)
            pose_frame.athlete_id = athlete_id
            
            # Real-time feature extraction
            features = await feature_extractor.extract_features_realtime(pose_frame)
            
            # Send back analysis
            await websocket.send_json({
                "frame_id": pose_frame.frame_id,
                "features": features,
                "timestamp": datetime.now(timezone.utc).isoformat()
            })
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
    finally:
        logger.info(f"WebSocket disconnected for athlete {athlete_id}")

@app.get("/api/v1/risk/{athlete_id}/profile")
async def get_risk_profile(athlete_id: str):
    """
    Get comprehensive injury risk assessment
    """
    try:
        # Get recent biomech data
        analysis = await get_biomech_analysis(athlete_id)
        
        # Comprehensive risk assessment
        risk_profile = await risk_assessor.generate_risk_profile(
            athlete_id,
            analysis
        )
        
        return risk_profile
    except Exception as e:
        logger.error(f"Risk assessment error: {e}")
        raise HTTPException(status_code=500, detail="Risk assessment failed")

@app.get("/metrics")
async def get_metrics():
    """Prometheus-compatible metrics endpoint"""
    metrics = await pose_service.get_metrics()
    return JSONResponse(content=metrics, media_type="text/plain")

def generate_baseball_recommendations(metrics: Dict[str, float]) -> List[str]:
    """Generate training recommendations for baseball"""
    recommendations = []
    
    if metrics.get("hip_torque_index", 0) < 50:
        recommendations.append("Focus on hip mobility drills and rotational power exercises")
    
    if metrics.get("separation_stability", 0) < 50:
        recommendations.append("Work on trunk stability and sequencing drills")
    
    if metrics.get("elbow_valgus_angle", 0) > 70:
        recommendations.append("⚠️ High elbow stress detected - review throwing mechanics with coach")
    
    return recommendations

def generate_football_recommendations(metrics: Dict[str, float]) -> List[str]:
    """Generate training recommendations for football"""
    recommendations = []
    
    if metrics.get("first_step_explosiveness", 0) < 50:
        recommendations.append("Incorporate plyometric drills and resisted starts")
    
    if metrics.get("com_projection", 0) < 45:
        recommendations.append("Work on forward lean and acceleration mechanics")
    
    return recommendations

def generate_basketball_recommendations(metrics: Dict[str, float]) -> List[str]:
    """Generate training recommendations for basketball"""
    recommendations = []
    
    if metrics.get("lateral_step_quickness", 0) < 50:
        recommendations.append("Add lateral plyometrics and defensive slide drills")
    
    if metrics.get("landing_stability_index", 0) < 60:
        recommendations.append("Focus on single-leg stability and landing mechanics")
    
    return recommendations

def generate_track_recommendations(metrics: Dict[str, float]) -> List[str]:
    """Generate training recommendations for track"""
    recommendations = []
    
    if metrics.get("ground_contact_asymmetry", 0) > 0.1:
        recommendations.append("Address left/right imbalance with unilateral strength work")
    
    if metrics.get("vertical_oscillation", 0) > 8:
        recommendations.append("Focus on running efficiency and reduced vertical displacement")
    
    return recommendations

async def update_enigma_scores(athlete_id: str, features: Dict):
    """Update Champion Enigma Engine with new biomech data"""
    try:
        # Send to Enigma Engine
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{settings.ENIGMA_ENGINE_URL}/update",
                json={
                    "athlete_id": athlete_id,
                    "biomech_features": features,
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }
            )
            response.raise_for_status()
    except Exception as e:
        logger.error(f"Enigma update error: {e}")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
