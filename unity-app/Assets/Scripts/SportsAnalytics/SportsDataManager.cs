using System;
using System.Collections.Generic;
using UnityEngine;
using System.Collections;

namespace BSI.Unity.SportsAnalytics
{
    public class SportsDataManager : MonoBehaviour
    {
        [Header("Data Storage")]
        public int maxDataPoints = 1000;
        public float dataRetentionTime = 300f; // 5 minutes

        [Header("Events")]
        public UnityEngine.Events.UnityEvent<PerformanceMetrics> OnPerformanceUpdate;
        public UnityEngine.Events.UnityEvent<BiomechanicalFeatures> OnBiomechUpdate;
        public UnityEngine.Events.UnityEvent<string> OnDataError;

        private Queue<PoseData> poseDataHistory = new Queue<PoseData>();
        private Queue<BiomechanicalFeatures> biomechHistory = new Queue<BiomechanicalFeatures>();
        private Queue<PerformanceMetrics> performanceHistory = new Queue<PerformanceMetrics>();
        
        private PoseData currentPoseData;
        private BiomechanicalFeatures currentBiomechFeatures;
        private PerformanceMetrics currentPerformanceMetrics;

        // Real-time data properties
        public PoseData CurrentPoseData => currentPoseData;
        public BiomechanicalFeatures CurrentBiomechFeatures => currentBiomechFeatures;
        public PerformanceMetrics CurrentPerformanceMetrics => currentPerformanceMetrics;

        // Historical data properties
        public Queue<PoseData> PoseDataHistory => new Queue<PoseData>(poseDataHistory);
        public Queue<BiomechanicalFeatures> BiomechHistory => new Queue<BiomechanicalFeatures>(biomechHistory);
        public Queue<PerformanceMetrics> PerformanceHistory => new Queue<PerformanceMetrics>(performanceHistory);

        void Start()
        {
            StartCoroutine(CleanupOldData());
        }

        public void UpdateData(PoseData poseData, BiomechanicalFeatures biomechFeatures, PerformanceMetrics performanceMetrics)
        {
            // Update current data
            currentPoseData = poseData;
            currentBiomechFeatures = biomechFeatures;
            currentPerformanceMetrics = performanceMetrics;

            // Add to history
            AddToHistory(poseData, biomechFeatures, performanceMetrics);

            // Trigger events
            OnPerformanceUpdate?.Invoke(performanceMetrics);
            OnBiomechUpdate?.Invoke(biomechFeatures);
        }

        void AddToHistory(PoseData poseData, BiomechanicalFeatures biomechFeatures, PerformanceMetrics performanceMetrics)
        {
            // Add pose data
            if (poseData != null)
            {
                poseDataHistory.Enqueue(poseData);
                if (poseDataHistory.Count > maxDataPoints)
                    poseDataHistory.Dequeue();
            }

            // Add biomechanical features
            if (biomechFeatures != null)
            {
                biomechHistory.Enqueue(biomechFeatures);
                if (biomechHistory.Count > maxDataPoints)
                    biomechHistory.Dequeue();
            }

            // Add performance metrics
            if (performanceMetrics != null)
            {
                performanceHistory.Enqueue(performanceMetrics);
                if (performanceHistory.Count > maxDataPoints)
                    performanceHistory.Dequeue();
            }
        }

        IEnumerator CleanupOldData()
        {
            while (true)
            {
                yield return new WaitForSeconds(60f); // Cleanup every minute
                
                float currentTime = Time.time;
                CleanupQueue(poseDataHistory, currentTime);
                CleanupQueue(biomechHistory, currentTime);
                CleanupQueue(performanceHistory, currentTime);
            }
        }

        void CleanupQueue<T>(Queue<T> queue, float currentTime) where T : class
        {
            // This is a simplified cleanup - in a real implementation,
            // you'd need to add timestamps to your data structures
            while (queue.Count > maxDataPoints)
            {
                queue.Dequeue();
            }
        }

        public float GetAveragePerformanceScore(int lastNPoints = 10)
        {
            if (performanceHistory.Count == 0) return 0f;

            float sum = 0f;
            int count = Mathf.Min(lastNPoints, performanceHistory.Count);
            var array = performanceHistory.ToArray();
            
            for (int i = array.Length - count; i < array.Length; i++)
            {
                if (array[i] != null)
                    sum += array[i].overallScore;
            }

            return sum / count;
        }

        public float GetTrendPerformanceScore()
        {
            if (performanceHistory.Count < 2) return 0f;

            var array = performanceHistory.ToArray();
            int recentCount = Mathf.Min(5, array.Length);
            int olderCount = Mathf.Min(5, array.Length - recentCount);

            float recentAvg = 0f;
            float olderAvg = 0f;

            // Calculate recent average
            for (int i = array.Length - recentCount; i < array.Length; i++)
            {
                if (array[i] != null)
                    recentAvg += array[i].overallScore;
            }
            recentAvg /= recentCount;

            // Calculate older average
            for (int i = array.Length - recentCount - olderCount; i < array.Length - recentCount; i++)
            {
                if (array[i] != null)
                    olderAvg += array[i].overallScore;
            }
            olderAvg /= olderCount;

            return recentAvg - olderAvg; // Positive = improving, Negative = declining
        }

        public BiomechanicalFeatures GetAverageBiomechFeatures(int lastNPoints = 10)
        {
            if (biomechHistory.Count == 0) return new BiomechanicalFeatures();

            var features = new BiomechanicalFeatures();
            int count = Mathf.Min(lastNPoints, biomechHistory.Count);
            var array = biomechHistory.ToArray();

            for (int i = array.Length - count; i < array.Length; i++)
            {
                if (array[i] != null)
                {
                    features.hipShoulderSeparation += array[i].hipShoulderSeparation;
                    features.elbowValgusAngle += array[i].elbowValgusAngle;
                    features.pelvisRotationVelocity += array[i].pelvisRotationVelocity;
                    features.trunkAngularMomentum += array[i].trunkAngularMomentum;
                    features.groundContactTime += array[i].groundContactTime;
                }
            }

            features.hipShoulderSeparation /= count;
            features.elbowValgusAngle /= count;
            features.pelvisRotationVelocity /= count;
            features.trunkAngularMomentum /= count;
            features.groundContactTime /= count;

            return features;
        }

        public void ClearAllData()
        {
            poseDataHistory.Clear();
            biomechHistory.Clear();
            performanceHistory.Clear();
            
            currentPoseData = null;
            currentBiomechFeatures = null;
            currentPerformanceMetrics = null;
        }

        public void ExportData(string filename)
        {
            // In a real implementation, this would export to CSV or JSON
            Debug.Log($"Exporting {poseDataHistory.Count} pose data points to {filename}");
        }
    }
}