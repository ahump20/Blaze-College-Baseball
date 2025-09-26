# Blaze Biomechanics Vision System

**Real-time 3D pose tracking + biomechanical analysis for elite athletic performance prediction**

## Mission
Bridge computer vision and biomechanics to quantify the "unseen" micro-moves that predict elite upside. Integrates seamlessly with the Champion Enigma Engine to deliver actionable insights from multi-camera 3D pose data.

## Quick Start

```bash
# Clone and setup
git clone https://github.com/blazesportsintel/biomech-vision.git
cd blaze-biomech-vision

# One-command launch
make up

# Or using docker-compose directly
docker-compose up -d

# Access the system
# Dashboard: http://localhost:3000
# API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

## Architecture

### Core Pipeline
```
Multi-Camera Feed → 3D Pose Extraction → Feature Computation → Enigma Mapping → Coach UX
     ↓                    ↓                     ↓                    ↓              ↓
  Raw Video         Joint Angles          Biomech Metrics     Trait Scores    Clip Reels
```

### Key Components

1. **Pose Ingestion Service**: Handles multi-format 3D skeleton data (OpenPose, MediaPipe, KinaTrax, Hawk-Eye)
2. **Feature Extraction Engine**: Computes 30+ biomechanical features in real-time
3. **Risk Assessment Module**: Identifies injury risk patterns and mechanical inefficiencies
4. **Clip Generation System**: Auto-generates video segments tied to specific metrics
5. **Champion Enigma Integration**: Maps biomechanics to trait dimensions

## Measured Micro-Signals

### Baseball
- **Hip-Shoulder Separation**: Peak separation angle at foot contact
- **Pelvis Rotation Velocity**: Angular velocity through rotation sequence
- **Trunk Angular Momentum**: Energy transfer efficiency
- **Ground Contact Time**: Load phase duration
- **Elbow Valgus Angle**: Injury risk indicator

### Football
- **First-Step Explosiveness**: 0-400ms burst metrics
- **Center of Mass Projection**: Balance and acceleration efficiency
- **Shin Angle at Launch**: Power generation indicator
- **Hip Extension Power**: Drive phase mechanics

### Basketball
- **Lateral Step Quickness**: Change of direction efficiency
- **Jump Loading Rate**: Force development speed
- **Landing Stability Index**: ACL risk assessment
- **Deceleration Control**: Eccentric strength indicator

### Track & Field
- **Ground Contact Asymmetry**: Left/right imbalance detection
- **Flight Time Ratio**: Elastic energy utilization
- **Vertical Oscillation**: Running economy metric
- **Cadence Variability**: Fatigue indicator

## API Endpoints

### Core Analysis
- `POST /api/v1/pose/ingest` - Stream 3D pose data
- `GET /api/v1/analysis/{athlete_id}/biomech` - Get biomechanical analysis
- `GET /api/v1/enigma/{athlete_id}/scores` - Champion Enigma trait scores
- `POST /api/v1/clips/generate` - Generate metric-specific video clips

### Risk Assessment
- `GET /api/v1/risk/{athlete_id}/profile` - Injury risk assessment
- `GET /api/v1/risk/alerts` - Real-time mechanical red flags

## Environment Variables

```bash
# Copy example config
cp .env.example .env

# Core settings
POSTGRES_DB=blaze_biomech
REDIS_URL=redis://redis:6379
S3_BUCKET=blaze-pose-data

# External integrations
KINTRAX_API_KEY=your_key_here
HAWKEYE_ENDPOINT=https://api.hawkeye.com
ENIGMA_ENGINE_URL=https://enigma.blazesportsintel.com
```

## Development

```bash
# Run with hot reload
make dev

# Run tests
make test

# Format code
make format

# Build production images
make build-prod
```

## Performance Benchmarks

- **Pose Processing**: 30 FPS real-time for 4 camera streams
- **Feature Extraction**: <50ms per frame
- **Clip Generation**: 2-3 seconds per 10-second segment
- **API Response**: p95 < 200ms

## Sample Data

The system includes sample 3D pose streams and athlete profiles:

```bash
# Load sample data
python scripts/seed_data.py

# Sample athletes included:
# - Baseball: 5 pitchers, 5 hitters with full motion capture
# - Football: 3 QBs, 4 WRs with first-step analysis
# - Basketball: 6 players with jump/land sequences
```

## Deployment

### Production (AWS/Cloudflare)
```bash
# Deploy to Cloudflare R2 + Workers
make deploy-cloudflare

# Or traditional AWS
make deploy-aws
```

## Security Notes

- All pose data encrypted at rest (AES-256)
- API authentication via JWT with refresh tokens
- Rate limiting: 1000 requests/minute per client
- No PII stored with biomechanical data
- HIPAA-compliant data handling available

## Troubleshooting

### Common Issues

1. **Camera calibration errors**: Ensure calibration files in `sample_data/calibration/`
2. **Memory issues with video processing**: Adjust `VIDEO_BUFFER_SIZE` in `.env`
3. **Slow feature extraction**: Enable GPU support with `USE_GPU=true`

## License

MIT License - See LICENSE file for details

## Support

- Documentation: https://docs.blazesportsintel.com/biomech
- API Status: https://status.blazesportsintel.com
- Contact: biomech@blazesportsintel.com
