"""
Pose and Biomechanical Data Models
Core data structures for 3D pose tracking and analysis
"""

from pydantic import BaseModel, Field, validator
from typing import List, Dict, Optional, Any, Tuple
from datetime import datetime
from enum import Enum
import numpy as np

class Sport(str, Enum):
    BASEBALL = "baseball"
    FOOTBALL = "football"
    BASKETBALL = "basketball"
    TRACK = "track"

class JointType(str, Enum):
    """Standard joint definitions across capture systems"""
    # Core joints
    PELVIS = "pelvis"
    SPINE = "spine"
    NECK = "neck"
    HEAD = "head"
    
    # Upper body
    LEFT_SHOULDER = "left_shoulder"
    RIGHT_SHOULDER = "right_shoulder"
    LEFT_ELBOW = "left_elbow"
    RIGHT_ELBOW = "right_elbow"
    LEFT_WRIST = "left_wrist"
    RIGHT_WRIST = "right_wrist"
    
    # Lower body
    LEFT_HIP = "left_hip"
    RIGHT_HIP = "right_hip"
    LEFT_KNEE = "left_knee"
    RIGHT_KNEE = "right_knee"
    LEFT_ANKLE = "left_ankle"
    RIGHT_ANKLE = "right_ankle"
    
    # Extremities
    LEFT_HEEL = "left_heel"
    RIGHT_HEEL = "right_heel"
    LEFT_TOE = "left_toe"
    RIGHT_TOE = "right_toe"

class Joint3D(BaseModel):
    """3D joint position with confidence"""
    x: float = Field(..., description="X coordinate in meters")
    y: float = Field(..., description="Y coordinate in meters")
    z: float = Field(..., description="Z coordinate in meters")
    confidence: float = Field(0.0, ge=0.0, le=1.0, description="Detection confidence")
    visibility: float = Field(1.0, ge=0.0, le=1.0, description="Joint visibility")
    
    def to_numpy(self) -> np.ndarray:
        """Convert to numpy array"""
        return np.array([self.x, self.y, self.z])
    
    def distance_to(self, other: 'Joint3D') -> float:
        """Calculate Euclidean distance to another joint"""
        return float(np.linalg.norm(self.to_numpy() - other.to_numpy()))

class PoseFrame(BaseModel):
    """Single frame of 3D pose data"""
    frame_id: str = Field(..., description="Unique frame identifier")
    timestamp: datetime = Field(..., description="Frame capture timestamp")
    athlete_id: str = Field(..., description="Athlete identifier")
    
    # Joint positions
    joints: Dict[JointType, Joint3D] = Field(..., description="Joint positions")
    
    # Capture metadata
    capture_source: str = Field("unknown", description="Capture system (kintrax, hawkeye, etc)")
    camera_count: int = Field(1, ge=1, description="Number of cameras used")
    fps: float = Field(30.0, gt=0, description="Capture framerate")
    
    # Event metadata
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    @validator('joints')
    def validate_minimum_joints(cls, v):
        """Ensure minimum required joints are present"""
        required = {JointType.PELVIS, JointType.LEFT_HIP, JointType.RIGHT_HIP}
        if not required.issubset(v.keys()):
            raise ValueError(f"Missing required joints: {required - set(v.keys())}")
        return v
    
    def get_joint(self, joint_type: JointType) -> Optional[Joint3D]:
        """Safe joint getter"""
        return self.joints.get(joint_type)
    
    def compute_center_of_mass(self) -> Joint3D:
        """Compute approximate center of mass"""
        # Simplified COM calculation using pelvis and spine
        pelvis = self.joints[JointType.PELVIS]
        spine = self.joints.get(JointType.SPINE, pelvis)
        
        # Weighted average (pelvis has more mass)
        com_pos = pelvis.to_numpy() * 0.6 + spine.to_numpy() * 0.4
        
        return Joint3D(
            x=float(com_pos[0]),
            y=float(com_pos[1]),
            z=float(com_pos[2]),
            confidence=min(pelvis.confidence, spine.confidence)
        )

class Athlete(BaseModel):
    """Athlete profile with biomechanical baselines"""
    id: str = Field(..., description="Unique athlete identifier")
    name: str = Field(..., description="Athlete name")
    primary_sport: Sport = Field(..., description="Primary sport")
    position: Optional[str] = Field(None, description="Playing position")
    
    # Physical attributes
    height_cm: float = Field(..., gt=0, description="Height in centimeters")
    weight_kg: float = Field(..., gt=0, description="Weight in kilograms")
    wingspan_cm: Optional[float] = Field(None, gt=0, description="Wingspan in centimeters")
    
    # Biomechanical baselines
    baselines: Dict[str, float] = Field(default_factory=dict)
    
    # Injury history
    injury_history: List[Dict[str, Any]] = Field(default_factory=list)
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class BiomechFeatures(BaseModel):
    """Extracted biomechanical features from pose data"""
    # Core mechanics
    hip_shoulder_separation: Optional[float] = Field(None, description="Degrees")
    pelvis_rotation_velocity: Optional[float] = Field(None, description="Degrees/second")
    trunk_angular_velocity: Optional[float] = Field(None, description="Degrees/second")
    
    # Ground reaction
    ground_contact_time: Optional[float] = Field(None, description="Seconds")
    vertical_ground_reaction_force: Optional[float] = Field(None, description="Normalized to body weight")
    
    # First step (football/basketball)
    first_step_contact_time: Optional[float] = Field(None, description="Seconds")
    horizontal_impulse: Optional[float] = Field(None, description="Newton-seconds")
    shin_angle_at_launch: Optional[float] = Field(None, description="Degrees")
    
    # Jump/Land (basketball)
    jump_height: Optional[float] = Field(None, description="Meters")
    landing_impact_asymmetry: Optional[float] = Field(None, description="Percentage")
    knee_valgus_angle: Optional[float] = Field(None, description="Degrees")
    
    # Running (track)
    stride_length: Optional[float] = Field(None, description="Meters")
    cadence: Optional[float] = Field(None, description="Steps/minute")
    vertical_oscillation: Optional[float] = Field(None, description="Centimeters")
    
    # Baseball specific
    hip_torque: Optional[float] = Field(None, description="Newton-meters")
    elbow_valgus_torque: Optional[float] = Field(None, description="Newton-meters")
    release_height: Optional[float] = Field(None, description="Meters")
    
    def is_significant_event(self) -> bool:
        """Check if features represent a significant athletic event"""
        # Check if key metrics exceed thresholds
        significant_metrics = [
            self.pelvis_rotation_velocity and abs(self.pelvis_rotation_velocity) > 200,
            self.horizontal_impulse and self.horizontal_impulse > 100,
            self.jump_height and self.jump_height > 0.3,
            self.hip_torque and abs(self.hip_torque) > 50
        ]
        return any(significant_metrics)
    
    def to_percentiles(self, sport: Sport, norms: Dict[str, Tuple[float, float]]) -> Dict[str, float]:
        """Convert raw values to percentiles based on sport norms"""
        percentiles = {}
        for field, value in self.dict(exclude_none=True).items():
            if field in norms and value is not None:
                min_val, max_val = norms[field]
                percentile = (value - min_val) / (max_val - min_val) * 100
                percentiles[field] = max(0, min(100, percentile))
        return percentiles

class RiskFactor(BaseModel):
    """Injury risk factor identification"""
    category: str = Field(..., description="Risk category (e.g., 'elbow_stress', 'acl_risk')")
    severity: str = Field(..., description="low, moderate, high, critical")
    value: float = Field(..., description="Measured value")
    threshold: float = Field(..., description="Risk threshold")
    description: str = Field(..., description="Human-readable risk description")
    recommendation: str = Field(..., description="Mitigation recommendation")

class BiomechAnalysis(BaseModel):
    """Complete biomechanical analysis result"""
    athlete_id: str
    sport: Sport
    timestamp: datetime
    
    # Normalized metrics (0-100 percentiles)
    metrics: Dict[str, float]
    
    # Risk assessment
    risk_factors: List[RiskFactor] = Field(default_factory=list)
    overall_risk_score: float = Field(0.0, ge=0.0, le=100.0)
    
    # Training recommendations
    recommendations: List[str] = Field(default_factory=list)
    
    # Comparison to baseline
    baseline_comparison: Optional[Dict[str, float]] = None
    
    # Confidence and data quality
    confidence_score: float = Field(0.85, ge=0.0, le=1.0)
    frame_count: int = Field(0, ge=0)
    
    def get_top_risks(self, n: int = 3) -> List[RiskFactor]:
        """Get top N risk factors by severity"""
        severity_order = {"critical": 4, "high": 3, "moderate": 2, "low": 1}
        return sorted(
            self.risk_factors,
            key=lambda x: severity_order.get(x.severity, 0),
            reverse=True
        )[:n]
    
    def get_improvement_areas(self, threshold: float = 50.0) -> List[Tuple[str, float]]:
        """Identify metrics below threshold for improvement"""
        return [
            (metric, value) 
            for metric, value in self.metrics.items() 
            if value < threshold
        ]

class VideoClip(BaseModel):
    """Video clip metadata for metric visualization"""
    clip_id: str
    athlete_id: str
    metric: str
    metric_value: float
    
    # Video details
    url: str
    duration_seconds: float
    fps: float
    
    # Frame references
    start_frame_id: str
    end_frame_id: str
    peak_frame_id: str
    
    # Annotations
    annotations: List[Dict[str, Any]] = Field(default_factory=list)
    
    created_at: datetime = Field(default_factory=datetime.utcnow)

class CalibrationData(BaseModel):
    """Camera calibration parameters"""
    camera_id: str
    
    # Intrinsic parameters
    focal_length: Tuple[float, float]
    principal_point: Tuple[float, float]
    distortion_coefficients: List[float]
    
    # Extrinsic parameters
    rotation_matrix: List[List[float]]
    translation_vector: List[float]
    
    # Calibration quality
    reprojection_error: float
    calibration_date: datetime

class PoseSequence(BaseModel):
    """Sequence of pose frames for temporal analysis"""
    athlete_id: str
    sequence_id: str
    sport: Sport
    event_type: str  # "pitch", "swing", "jump", "sprint", etc
    
    frames: List[PoseFrame]
    
    # Timing markers
    event_start: datetime
    event_end: datetime
    peak_moment: Optional[datetime] = None
    
    # Pre-computed features
    features: Optional[BiomechFeatures] = None
    
    def get_duration_seconds(self) -> float:
        """Get sequence duration"""
        return (self.event_end - self.event_start).total_seconds()
    
    def get_frame_at_time(self, time_offset: float) -> Optional[PoseFrame]:
        """Get frame at specific time offset from start"""
        target_time = self.event_start.timestamp() + time_offset
        for frame in self.frames:
            if abs(frame.timestamp.timestamp() - target_time) < 0.05:  # 50ms tolerance
                return frame
        return None
    
    def interpolate_frame(self, timestamp: datetime) -> Optional[PoseFrame]:
        """Interpolate pose at specific timestamp"""
        # Find surrounding frames
        before, after = None, None
        for i, frame in enumerate(self.frames):
            if frame.timestamp <= timestamp:
                before = frame
            if frame.timestamp >= timestamp and after is None:
                after = frame
                break
        
        if not before or not after or before == after:
            return before or after
        
        # Linear interpolation
        t = (timestamp - before.timestamp).total_seconds()
        dt = (after.timestamp - before.timestamp).total_seconds()
        
        if dt == 0:
            return before
        
        alpha = t / dt
        
        # Interpolate joints
        interpolated_joints = {}
        for joint_type in before.joints:
            if joint_type in after.joints:
                before_joint = before.joints[joint_type]
                after_joint = after.joints[joint_type]
                
                interpolated_joints[joint_type] = Joint3D(
                    x=before_joint.x * (1 - alpha) + after_joint.x * alpha,
                    y=before_joint.y * (1 - alpha) + after_joint.y * alpha,
                    z=before_joint.z * (1 - alpha) + after_joint.z * alpha,
                    confidence=min(before_joint.confidence, after_joint.confidence),
                    visibility=min(before_joint.visibility, after_joint.visibility)
                )
        
        return PoseFrame(
            frame_id=f"interp_{timestamp.timestamp()}",
            timestamp=timestamp,
            athlete_id=self.athlete_id,
            joints=interpolated_joints,
            capture_source="interpolated",
            camera_count=before.camera_count,
            fps=before.fps,
            metadata={"interpolated": True}
        )

# Normative data for percentile calculations
SPORT_NORMS = {
    Sport.BASEBALL: {
        "hip_shoulder_separation": (20, 60),  # degrees
        "pelvis_rotation_velocity": (400, 800),  # deg/s
        "hip_torque": (30, 90),  # Nm
        "release_height": (1.7, 2.2),  # meters
    },
    Sport.FOOTBALL: {
        "first_step_contact_time": (0.15, 0.25),  # seconds
        "horizontal_impulse": (150, 300),  # Ns
        "shin_angle_at_launch": (35, 55),  # degrees
    },
    Sport.BASKETBALL: {
        "jump_height": (0.4, 0.8),  # meters
        "landing_impact_asymmetry": (0, 15),  # percentage
        "knee_valgus_angle": (0, 10),  # degrees
    },
    Sport.TRACK: {
        "ground_contact_time": (0.08, 0.15),  # seconds
        "vertical_oscillation": (4, 10),  # cm
        "cadence": (160, 200),  # steps/min
    }
}
