# Unity WebGL Integration for Blaze Sports Intel
## Professional 3D Sports Visualization Architecture

**Version:** 1.0.0
**Last Updated:** September 30, 2025
**Technology Stack:** Unity 6, WebGL 2.0, Babylon.js 8.0, Three.js r128

---

## 📚 Reference Repositories Analyzed

1. **CoplayDev/unity-mcp** - Unity MCP Bridge for Claude Code integration
2. **BabylonJS/Babylon.js** - Official Babylon.js 8.0 with WebGPU support
3. **mrdoob/three.js** - Three.js core library
4. **pmndrs/react-three-fiber** - React bindings for Three.js
5. **ahump20/3d-game-shaders-for-beginners** - Advanced shader techniques
6. **ahump20/Babylon.js** - Custom Babylon.js fork

---

## 🎯 Integration Overview

### Why Unity + WebGL for Sports Analytics?

1. **Performance:** Native C# execution compiled to WebAssembly
2. **Physics:** Built-in physics engine for ball trajectory simulation
3. **Animation:** Professional animation tools for player movements
4. **Shaders:** Advanced shader support for visual effects
5. **Asset Pipeline:** Efficient asset loading and management
6. **Cross-Platform:** Desktop, mobile, and VR/AR support

---

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Blaze Sports Intel Web                    │
│                   (blazesportsintel.com)                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐      ┌──────────────────┐            │
│  │   React Frontend │◄────►│  Cloudflare API  │            │
│  │   (Next.js)      │      │    (Workers)     │            │
│  └────────┬─────────┘      └──────────────────┘            │
│           │                                                  │
│           │ WebGL Canvas                                    │
│           ▼                                                  │
│  ┌──────────────────────────────────────────────────┐      │
│  │         Unity WebGL Build (Brotli)               │      │
│  │  • Stadium visualization (60 FPS)                │      │
│  │  • Player animations                              │      │
│  │  • Ball physics simulation                        │      │
│  │  • Real-time data integration                     │      │
│  └─────────────┬────────────────────────────────────┘      │
│                │                                             │
│                │ JavaScript Bridge                           │
│                ▼                                             │
│  ┌──────────────────────────────────────────────────┐      │
│  │         JavaScript ↔ Unity Bridge                │      │
│  │  • SendMessage() to Unity                         │      │
│  │  • Unity → JS callback functions                  │      │
│  │  • Data serialization (JSON)                      │      │
│  └──────────────────────────────────────────────────┘      │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Implementation Steps

### Phase 1: Unity Project Setup

#### 1.1 Create Unity Project

```bash
# Unity 6.0 (2024 LTS) or later
# Create new 3D project
# Template: Universal Render Pipeline (URP)
```

#### 1.2 Project Settings for WebGL

```csharp
// Player Settings → WebGL Platform
// Publishing Settings:
- Compression Format: Brotli
- Code Optimization: Master (Fastest)
- Enable Exceptions: Explicitly Thrown
- Data Caching: Enabled
- Progressive Web App: Enabled

// Quality Settings:
- Anti-Aliasing: 4x MSAA
- V Sync Count: Don't Sync
- Pixel Light Count: 4
- Shadow Quality: High
- Shadow Resolution: Very High

// Graphics Settings:
- Color Space: Linear
- Auto Graphics API: Off
- Graphics API: WebGL 2.0
```

#### 1.3 Install Required Packages

```json
{
  "dependencies": {
    "com.unity.render-pipelines.universal": "16.0.0",
    "com.unity.textmeshpro": "3.0.0",
    "com.unity.cinemachine": "3.0.0",
    "com.unity.postprocessing": "3.4.0"
  }
}
```

---

### Phase 2: Create Sports Visualization Scenes

#### 2.1 Baseball Stadium Scene

```csharp
// Assets/Scripts/BlazeBaseballStadium.cs
using UnityEngine;
using UnityEngine.Rendering.Universal;

public class BlazeBaseballStadium : MonoBehaviour
{
    [Header("Field Components")]
    public GameObject infield;
    public GameObject outfield;
    public GameObject basePath;
    public GameObject homeplate;

    [Header("Lighting")]
    public Light mainLight;
    public Light fillLight;
    public Volume postProcessVolume;

    [Header("Camera")]
    public Camera mainCamera;
    public float orbitSpeed = 2f;
    public float zoomSpeed = 5f;

    private float currentOrbitAngle = 0f;

    void Start()
    {
        InitializeStadium();
        SetupLighting();
        SetupPostProcessing();
    }

    void Update()
    {
        HandleCameraOrbit();
    }

    void InitializeStadium()
    {
        // Create field geometry
        CreateInfield();
        CreateOutfield();
        CreateBases();
        CreateFences();
    }

    void CreateInfield()
    {
        // Diamond shape
        Vector3[] infieldPoints = {
            new Vector3(0, 0, 0),      // Home plate
            new Vector3(30, 0, 30),     // First base
            new Vector3(60, 0, 60),     // Second base
            new Vector3(30, 0, 90),     // Third base
        };

        // Create mesh from points
        MeshFilter mf = infield.GetComponent<MeshFilter>();
        mf.mesh = CreateDiamondMesh(infieldPoints);

        // Apply grass material
        MeshRenderer mr = infield.GetComponent<MeshRenderer>();
        mr.material = Resources.Load<Material>("Materials/InfieldGrass");
    }

    void CreateOutfield()
    {
        // Circular outfield boundary
        float radius = 120f;
        int segments = 64;

        Vector3[] vertices = new Vector3[segments + 2];
        vertices[0] = new Vector3(60, 0, 60); // Center (second base)

        for (int i = 0; i <= segments; i++)
        {
            float angle = i * Mathf.PI * 0.5f / segments - Mathf.PI * 0.25f;
            float x = 60 + radius * Mathf.Cos(angle);
            float z = 60 + radius * Mathf.Sin(angle);
            vertices[i + 1] = new Vector3(x, 0, z);
        }

        MeshFilter mf = outfield.GetComponent<MeshFilter>();
        mf.mesh = CreateFanMesh(vertices);

        MeshRenderer mr = outfield.GetComponent<MeshRenderer>();
        mr.material = Resources.Load<Material>("Materials/OutfieldGrass");
    }

    void SetupLighting()
    {
        // Main sunlight
        mainLight.type = LightType.Directional;
        mainLight.intensity = 1.2f;
        mainLight.color = new Color(1f, 0.95f, 0.9f);
        mainLight.shadows = LightShadows.Soft;

        // Fill light for better shadows
        fillLight.type = LightType.Directional;
        fillLight.intensity = 0.4f;
        fillLight.color = new Color(0.7f, 0.8f, 1f);
    }

    void SetupPostProcessing()
    {
        // Bloom for stadium lights
        // Ambient Occlusion for depth
        // Color Grading for visual appeal
    }

    void HandleCameraOrbit()
    {
        if (Input.GetMouseButton(0))
        {
            float mouseX = Input.GetAxis("Mouse X");
            currentOrbitAngle += mouseX * orbitSpeed;

            float radius = 150f;
            float height = 50f;

            Vector3 newPos = new Vector3(
                60 + radius * Mathf.Cos(currentOrbitAngle * Mathf.Deg2Rad),
                height,
                60 + radius * Mathf.Sin(currentOrbitAngle * Mathf.Deg2Rad)
            );

            mainCamera.transform.position = newPos;
            mainCamera.transform.LookAt(new Vector3(60, 0, 60));
        }
    }

    Mesh CreateDiamondMesh(Vector3[] points)
    {
        // Implement diamond mesh generation
        Mesh mesh = new Mesh();
        // ... mesh creation logic
        return mesh;
    }

    Mesh CreateFanMesh(Vector3[] vertices)
    {
        // Implement fan-shaped mesh
        Mesh mesh = new Mesh();
        // ... mesh creation logic
        return mesh;
    }
}
```

#### 2.2 Ball Physics Simulation

```csharp
// Assets/Scripts/BaseballPhysics.cs
using UnityEngine;

public class BaseballPhysics : MonoBehaviour
{
    [Header("Ball Properties")]
    public float mass = 0.145f; // kg
    public float diameter = 0.074f; // meters
    public float dragCoefficient = 0.3f;

    [Header("Physics")]
    private Rigidbody rb;
    private Vector3 velocity;
    private Vector3 spin;

    void Start()
    {
        rb = GetComponent<Rigidbody>();
        rb.mass = mass;
        rb.drag = dragCoefficient;
        rb.useGravity = true;
    }

    public void SimulatePitch(float velocity, float angle, Vector3 spinAxis, float spinRate)
    {
        // Convert mph to m/s
        float velocityMS = velocity * 0.44704f;

        // Calculate initial velocity vector
        Vector3 direction = Quaternion.Euler(0, 0, angle) * Vector3.forward;
        this.velocity = direction * velocityMS;

        // Apply spin
        this.spin = spinAxis.normalized * spinRate;

        // Launch ball
        rb.velocity = this.velocity;
        rb.angularVelocity = this.spin;
    }

    void FixedUpdate()
    {
        // Magnus effect (spin-induced movement)
        Vector3 magnusForce = Vector3.Cross(spin, velocity) * 0.00001f;
        rb.AddForce(magnusForce, ForceMode.Force);

        // Air resistance
        float speed = velocity.magnitude;
        Vector3 dragForce = -velocity.normalized * dragCoefficient * speed * speed * 0.0001f;
        rb.AddForce(dragForce, ForceMode.Force);
    }
}
```

---

### Phase 3: JavaScript ↔ Unity Bridge

#### 3.1 Unity to JavaScript Communication

```csharp
// Assets/Scripts/BlazeAPIConnector.cs
using UnityEngine;
using System.Runtime.InteropServices;
using Newtonsoft.Json;

public class BlazeAPIConnector : MonoBehaviour
{
    [DllImport("__Internal")]
    private static extern void SendToJavaScript(string data);

    [DllImport("__Internal")]
    private static extern void RequestGameData(string gameId);

    // Send data to JavaScript
    public void SendPlayerStats(PlayerStats stats)
    {
        string json = JsonConvert.SerializeObject(stats);
        #if UNITY_WEBGL && !UNITY_EDITOR
        SendToJavaScript(json);
        #endif
    }

    // Request data from JavaScript API
    public void FetchGameData(string gameId)
    {
        #if UNITY_WEBGL && !UNITY_EDITOR
        RequestGameData(gameId);
        #endif
    }

    // Called from JavaScript
    public void ReceiveGameData(string jsonData)
    {
        GameData data = JsonConvert.DeserializeObject<GameData>(jsonData);
        UpdateVisualization(data);
    }

    void UpdateVisualization(GameData data)
    {
        // Update Unity scene with real data
    }
}

[System.Serializable]
public class PlayerStats
{
    public string playerId;
    public string name;
    public float battingAverage;
    public int homeRuns;
    public int rbi;
}

[System.Serializable]
public class GameData
{
    public string gameId;
    public string homeTeam;
    public string awayTeam;
    public int homeScore;
    public int awayScore;
    public int inning;
}
```

#### 3.2 JavaScript Bridge Implementation

```javascript
// public/js/unity-bridge.js

class UnityBridge {
  constructor() {
    this.unityInstance = null;
    this.initialized = false;
  }

  async initialize(unityLoaderUrl, dataUrl) {
    try {
      const unityLoader = await import(unityLoaderUrl);

      this.unityInstance = await unityLoader.createUnityInstance(
        document.querySelector("#unity-canvas"),
        {
          dataUrl: dataUrl,
          frameworkUrl: dataUrl.replace('.data', '.framework.js'),
          codeUrl: dataUrl.replace('.data', '.wasm'),
          streamingAssetsUrl: "StreamingAssets",
          companyName: "BlazeSportsIntel",
          productName: "BlazeSportsVisualization",
          productVersion: "1.0.0",
        },
        (progress) => {
          console.log(`Unity loading: ${Math.round(progress * 100)}%`);
        }
      );

      this.initialized = true;
      console.log("Unity WebGL initialized successfully");

      // Setup global bridge
      window.unityBridge = this;

    } catch (error) {
      console.error("Failed to initialize Unity:", error);
    }
  }

  // Send data from JavaScript to Unity
  sendToUnity(gameObjectName, methodName, data) {
    if (!this.initialized) {
      console.warn("Unity not initialized");
      return;
    }

    const jsonData = typeof data === 'string' ? data : JSON.stringify(data);
    this.unityInstance.SendMessage(gameObjectName, methodName, jsonData);
  }

  // Receive data from Unity (called by Unity)
  receiveFromUnity(data) {
    const parsedData = JSON.parse(data);
    console.log("Received from Unity:", parsedData);

    // Trigger custom event
    window.dispatchEvent(new CustomEvent('unityData', { detail: parsedData }));
  }

  // Send game data to Unity
  async sendGameData(gameId) {
    try {
      const response = await fetch(`/api/sports/baseball/games/${gameId}`);
      const gameData = await response.json();

      this.sendToUnity(
        "BlazeAPIConnector",
        "ReceiveGameData",
        JSON.stringify(gameData)
      );
    } catch (error) {
      console.error("Failed to fetch game data:", error);
    }
  }

  // Update stadium visualization
  updateStadium(teamData) {
    this.sendToUnity("BlazeBaseballStadium", "UpdateTeamColors", {
      primaryColor: teamData.primaryColor,
      secondaryColor: teamData.secondaryColor,
      logoUrl: teamData.logoUrl
    });
  }

  // Simulate pitch in Unity
  simulatePitch(pitchData) {
    this.sendToUnity("BaseballPhysics", "SimulatePitch", {
      velocity: pitchData.velocity,
      angle: pitchData.angle,
      spinRate: pitchData.spinRate,
      spinAxis: pitchData.spinAxis
    });
  }
}

// Global initialization
window.initializeUnityBridge = async () => {
  const bridge = new UnityBridge();
  await bridge.initialize(
    "/unity-builds/blaze-sports.loader.js",
    "/unity-builds/blaze-sports.data"
  );
  return bridge;
};
```

---

### Phase 4: Advanced Shader Effects

#### 4.1 Custom Grass Shader (HLSL)

```hlsl
// Assets/Shaders/BlazeGrass.shader
Shader "Blaze/Grass"
{
    Properties
    {
        _MainTex ("Grass Texture", 2D) = "white" {}
        _BaseColor ("Base Color", Color) = (0.2, 0.6, 0.2, 1)
        _TipColor ("Tip Color", Color) = (0.3, 0.8, 0.3, 1)
        _WindStrength ("Wind Strength", Range(0, 1)) = 0.3
        _WindSpeed ("Wind Speed", Range(0, 10)) = 2
    }

    SubShader
    {
        Tags { "RenderType"="Opaque" "RenderPipeline"="UniversalPipeline" }

        Pass
        {
            HLSLPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"

            struct Attributes
            {
                float4 positionOS : POSITION;
                float3 normalOS : NORMAL;
                float2 uv : TEXCOORD0;
            };

            struct Varyings
            {
                float4 positionCS : SV_POSITION;
                float3 normalWS : TEXCOORD0;
                float2 uv : TEXCOORD1;
                float3 worldPos : TEXCOORD2;
            };

            sampler2D _MainTex;
            float4 _BaseColor;
            float4 _TipColor;
            float _WindStrength;
            float _WindSpeed;

            Varyings vert(Attributes input)
            {
                Varyings output;

                // Wind animation
                float windPhase = _Time.y * _WindSpeed + input.positionOS.x * 0.1;
                float wind = sin(windPhase) * _WindStrength;
                float4 pos = input.positionOS;
                pos.x += wind * input.uv.y;

                output.positionCS = TransformObjectToHClip(pos);
                output.normalWS = TransformObjectToWorldNormal(input.normalOS);
                output.uv = input.uv;
                output.worldPos = TransformObjectToWorld(pos);

                return output;
            }

            half4 frag(Varyings input) : SV_Target
            {
                half4 texColor = tex2D(_MainTex, input.uv);
                half4 grassColor = lerp(_BaseColor, _TipColor, input.uv.y);

                // Lighting
                float3 lightDir = normalize(_MainLightPosition.xyz);
                float ndotl = saturate(dot(input.normalWS, lightDir));

                half4 finalColor = texColor * grassColor * ndotl;
                return finalColor;
            }
            ENDHLSL
        }
    }
}
```

#### 4.2 Ball Trail Shader

```hlsl
// Assets/Shaders/BallTrail.shader
Shader "Blaze/BallTrail"
{
    Properties
    {
        _Color ("Trail Color", Color) = (1, 1, 1, 0.5)
        _FadeDistance ("Fade Distance", Range(0, 10)) = 5
    }

    SubShader
    {
        Tags { "Queue"="Transparent" "RenderType"="Transparent" }
        Blend SrcAlpha OneMinusSrcAlpha
        ZWrite Off
        Cull Off

        Pass
        {
            HLSLPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"

            struct Attributes
            {
                float4 positionOS : POSITION;
                float2 uv : TEXCOORD0;
            };

            struct Varyings
            {
                float4 positionCS : SV_POSITION;
                float2 uv : TEXCOORD0;
            };

            float4 _Color;
            float _FadeDistance;

            Varyings vert(Attributes input)
            {
                Varyings output;
                output.positionCS = TransformObjectToHClip(input.positionOS);
                output.uv = input.uv;
                return output;
            }

            half4 frag(Varyings input) : SV_Target
            {
                float alpha = 1.0 - (input.uv.x / _FadeDistance);
                alpha = saturate(alpha);

                half4 color = _Color;
                color.a *= alpha;

                return color;
            }
            ENDHLSL
        }
    }
}
```

---

### Phase 5: Build & Deploy

#### 5.1 Unity Build Settings

```bash
# Build for WebGL
File → Build Settings
Platform: WebGL
Compression: Brotli
Code Optimization: Master
Memory Size: 512 MB (adjust based on needs)

# Output folder: unity-builds/
Build And Run
```

#### 5.2 Deployment to Cloudflare Pages

```bash
# Copy Unity build to public folder
cp -r unity-builds/Build/* public/unity-builds/

# Deploy with Wrangler
wrangler pages deploy public \
  --project-name blazesportsintel \
  --branch main \
  --commit-dirty=true
```

---

## 📊 Performance Targets

| Metric | Desktop | Mobile |
|--------|---------|--------|
| FPS | 60 | 30-45 |
| Load Time | <5s | <10s |
| Memory | <512MB | <256MB |
| Build Size | <50MB | <30MB compressed |

---

## 🎯 Next Steps

1. **Implement Unity Project** with baseball stadium scene
2. **Create JavaScript Bridge** for real-time data
3. **Build WebGL** with Brotli compression
4. **Deploy to Cloudflare** Pages
5. **Integrate with React** frontend
6. **Add More Sports** (football, basketball, track)

---

**Status:** Documentation Complete
**Ready for Implementation:** ✅
**Estimated Time:** 8-10 hours for full Unity integration