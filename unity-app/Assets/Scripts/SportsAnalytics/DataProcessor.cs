using System;
using System.Collections.Generic;
using UnityEngine;
using System.Net.Http;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace BSI.Unity.SportsAnalytics
{
    public class DataProcessor : MonoBehaviour
    {
        [Header("API Configuration")]
        public string baseUrl = "http://localhost:8000";
        public string apiKey = "";
        
        [Header("Processing Settings")]
        public float processingInterval = 0.1f;
        public bool enableRealTimeProcessing = true;

        private HttpClient httpClient;
        private SportsDataManager dataManager;

        void Start()
        {
            httpClient = new HttpClient();
            dataManager = GetComponent<SportsDataManager>();
            
            if (enableRealTimeProcessing)
            {
                InvokeRepeating(nameof(ProcessData), 0f, processingInterval);
            }
        }

        async void ProcessData()
        {
            try
            {
                // Fetch pose data from BSI API
                var poseData = await FetchPoseData();
                if (poseData != null)
                {
                    // Process biomechanical features
                    var biomechFeatures = ProcessBiomechanicalFeatures(poseData);
                    
                    // Calculate performance metrics
                    var performanceMetrics = CalculatePerformanceMetrics(biomechFeatures);
                    
                    // Update data manager
                    if (dataManager != null)
                    {
                        dataManager.UpdateData(poseData, biomechFeatures, performanceMetrics);
                    }
                }
            }
            catch (Exception e)
            {
                Debug.LogError($"Data processing error: {e.Message}");
            }
        }

        async Task<PoseData> FetchPoseData()
        {
            try
            {
                string url = $"{baseUrl}/api/pose-data";
                HttpResponseMessage response = await httpClient.GetAsync(url);
                
                if (response.IsSuccessStatusCode)
                {
                    string json = await response.Content.ReadAsStringAsync();
                    return JsonConvert.DeserializeObject<PoseData>(json);
                }
            }
            catch (Exception e)
            {
                Debug.LogWarning($"Failed to fetch pose data: {e.Message}");
            }
            
            return null;
        }

        BiomechanicalFeatures ProcessBiomechanicalFeatures(PoseData poseData)
        {
            var features = new BiomechanicalFeatures();
            
            // Calculate hip-shoulder separation
            features.hipShoulderSeparation = CalculateHipShoulderSeparation(poseData);
            
            // Calculate elbow valgus angle
            features.elbowValgusAngle = CalculateElbowValgusAngle(poseData);
            
            // Calculate pelvis rotation velocity
            features.pelvisRotationVelocity = CalculatePelvisRotationVelocity(poseData);
            
            // Calculate trunk angular momentum
            features.trunkAngularMomentum = CalculateTrunkAngularMomentum(poseData);
            
            // Calculate ground contact time
            features.groundContactTime = CalculateGroundContactTime(poseData);
            
            return features;
        }

        float CalculateHipShoulderSeparation(PoseData poseData)
        {
            if (poseData.joints.ContainsKey("left_hip") && poseData.joints.ContainsKey("left_shoulder"))
            {
                Vector3 hipPos = poseData.joints["left_hip"];
                Vector3 shoulderPos = poseData.joints["left_shoulder"];
                
                Vector3 hipToShoulder = shoulderPos - hipPos;
                Vector3 forward = Vector3.forward;
                
                return Vector3.Angle(hipToShoulder, forward);
            }
            return 0f;
        }

        float CalculateElbowValgusAngle(PoseData poseData)
        {
            if (poseData.joints.ContainsKey("left_shoulder") && 
                poseData.joints.ContainsKey("left_elbow") && 
                poseData.joints.ContainsKey("left_wrist"))
            {
                Vector3 shoulder = poseData.joints["left_shoulder"];
                Vector3 elbow = poseData.joints["left_elbow"];
                Vector3 wrist = poseData.joints["left_wrist"];
                
                Vector3 upperArm = elbow - shoulder;
                Vector3 forearm = wrist - elbow;
                
                return Vector3.Angle(upperArm, forearm);
            }
            return 0f;
        }

        float CalculatePelvisRotationVelocity(PoseData poseData)
        {
            // Simplified calculation - in real implementation, this would use previous frames
            return UnityEngine.Random.Range(0f, 100f);
        }

        float CalculateTrunkAngularMomentum(PoseData poseData)
        {
            // Simplified calculation
            return UnityEngine.Random.Range(0f, 50f);
        }

        float CalculateGroundContactTime(PoseData poseData)
        {
            // Simplified calculation
            return UnityEngine.Random.Range(0.1f, 0.3f);
        }

        PerformanceMetrics CalculatePerformanceMetrics(BiomechanicalFeatures features)
        {
            var metrics = new PerformanceMetrics();
            
            // Calculate power generation score
            metrics.powerGenerationScore = CalculatePowerScore(features);
            
            // Calculate injury risk score
            metrics.injuryRiskScore = CalculateInjuryRisk(features);
            
            // Calculate efficiency score
            metrics.efficiencyScore = CalculateEfficiency(features);
            
            // Calculate overall performance score
            metrics.overallScore = (metrics.powerGenerationScore + 
                                  metrics.efficiencyScore - 
                                  metrics.injuryRiskScore) / 3f;
            
            return metrics;
        }

        float CalculatePowerScore(BiomechanicalFeatures features)
        {
            // Higher hip-shoulder separation and pelvis rotation = more power
            float powerScore = (features.hipShoulderSeparation / 45f) * 0.4f +
                             (features.pelvisRotationVelocity / 100f) * 0.6f;
            return Mathf.Clamp01(powerScore);
        }

        float CalculateInjuryRisk(BiomechanicalFeatures features)
        {
            // Higher elbow valgus angle = higher injury risk
            float injuryRisk = features.elbowValgusAngle / 15f;
            return Mathf.Clamp01(injuryRisk);
        }

        float CalculateEfficiency(BiomechanicalFeatures features)
        {
            // Optimal ground contact time and trunk momentum = efficiency
            float contactEfficiency = 1f - Mathf.Abs(features.groundContactTime - 0.2f) / 0.2f;
            float momentumEfficiency = features.trunkAngularMomentum / 50f;
            
            return Mathf.Clamp01((contactEfficiency + momentumEfficiency) / 2f);
        }

        void OnDestroy()
        {
            httpClient?.Dispose();
        }
    }

    [System.Serializable]
    public class PoseData
    {
        public Dictionary<string, Vector3> joints;
        public float timestamp;
        public string athleteId;
    }

    [System.Serializable]
    public class BiomechanicalFeatures
    {
        public float hipShoulderSeparation;
        public float elbowValgusAngle;
        public float pelvisRotationVelocity;
        public float trunkAngularMomentum;
        public float groundContactTime;
    }

    [System.Serializable]
    public class PerformanceMetrics
    {
        public float powerGenerationScore;
        public float injuryRiskScore;
        public float efficiencyScore;
        public float overallScore;
    }
}