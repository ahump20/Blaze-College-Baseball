using UnityEngine;
using UnityEngine.UI;
using TMPro;
using BSI.Unity.SportsAnalytics;
using BSI.Unity.Context7;
using System.Collections;

namespace BSI.Unity.UI
{
    public class AnalyticsDashboard : MonoBehaviour
    {
        [Header("UI References")]
        public TMP_Text powerScoreText;
        public TMP_Text injuryRiskText;
        public TMP_Text efficiencyText;
        public TMP_Text overallScoreText;
        public TMP_Text trendText;
        public Slider powerSlider;
        public Slider injuryRiskSlider;
        public Slider efficiencySlider;
        public Slider overallSlider;
        public Image trendIndicator;
        public TMP_Text statusText;

        [Header("Configuration")]
        public float updateInterval = 0.5f;
        
        [Header("UI Brand Colors - DO NOT MODIFY WITHOUT DESIGN REVIEW")]
        [SerializeField] private Color improvingColor = new Color(0f, 0.8f, 0f, 1f); // Blaze Green
        [SerializeField] private Color decliningColor = new Color(1f, 0.2f, 0.2f, 1f); // Blaze Red  
        [SerializeField] private Color neutralColor = new Color(1f, 0.8f, 0f, 1f); // Blaze Yellow
        
        [Header("Context7 Integration")]
        [SerializeField] private bool enableDocumentationHelp = true;

        private SportsDataManager dataManager;
        private PerformanceMetrics lastMetrics;
        private float lastUpdateTime;

        void Start()
        {
            dataManager = FindObjectOfType<SportsDataManager>();
            if (dataManager != null)
            {
                dataManager.OnPerformanceUpdate.AddListener(OnPerformanceUpdate);
            }
            
            InvokeRepeating(nameof(UpdateDisplay), 0f, updateInterval);
        }

        void OnPerformanceUpdate(PerformanceMetrics metrics)
        {
            lastMetrics = metrics;
            lastUpdateTime = Time.time;
        }

        void UpdateDisplay()
        {
            if (dataManager == null) return;

            var currentMetrics = dataManager.CurrentPerformanceMetrics;
            if (currentMetrics == null) return;

            // Update score displays
            UpdateScoreDisplay(powerScoreText, powerSlider, currentMetrics.powerGenerationScore, "Power");
            UpdateScoreDisplay(injuryRiskText, injuryRiskSlider, currentMetrics.injuryRiskScore, "Injury Risk");
            UpdateScoreDisplay(efficiencyText, efficiencySlider, currentMetrics.efficiencyScore, "Efficiency");
            UpdateScoreDisplay(overallScoreText, overallSlider, currentMetrics.overallScore, "Overall");

            // Update trend indicator
            UpdateTrendIndicator();

            // Update status
            UpdateStatus();
        }

        void UpdateScoreDisplay(TMP_Text textComponent, Slider slider, float value, string label)
        {
            if (textComponent != null)
            {
                textComponent.text = $"{label}: {value:F2}";
            }

            if (slider != null)
            {
                slider.value = value;
            }
        }

        void UpdateTrendIndicator()
        {
            if (dataManager == null || trendIndicator == null) return;

            float trend = dataManager.GetTrendPerformanceScore();
            
            if (trend > 0.1f)
            {
                trendIndicator.color = improvingColor;
                if (trendText != null)
                    trendText.text = "↗ Improving";
            }
            else if (trend < -0.1f)
            {
                trendIndicator.color = decliningColor;
                if (trendText != null)
                    trendText.text = "↘ Declining";
            }
            else
            {
                trendIndicator.color = neutralColor;
                if (trendText != null)
                    trendText.text = "→ Stable";
            }
        }

        void UpdateStatus()
        {
            if (statusText == null) return;

            if (dataManager == null)
            {
                statusText.text = "No data manager found";
                return;
            }

            if (dataManager.CurrentPerformanceMetrics == null)
            {
                statusText.text = "No data available";
                return;
            }

            float timeSinceUpdate = Time.time - lastUpdateTime;
            if (timeSinceUpdate > 5f)
            {
                statusText.text = "Data stale - check connection";
            }
            else
            {
                statusText.text = "Real-time data active";
            }
        }

        public void ExportData()
        {
            if (dataManager != null)
            {
                string filename = $"analytics_export_{System.DateTime.Now:yyyyMMdd_HHmmss}.csv";
                dataManager.ExportData(filename);
            }
        }

        public void ClearData()
        {
            if (dataManager != null)
            {
                dataManager.ClearAllData();
            }
        }

        public async void ShowDetailedView()
        {
            // This would open a detailed analytics view
            Debug.Log("Opening detailed analytics view...");
            
            // Get Context7 documentation for detailed analytics
            if (enableDocumentationHelp && Context7Service.Instance != null)
            {
                var docs = await Context7Service.Instance.GetSportsAnalyticsDocumentation("detailed-analytics");
                if (docs.success)
                {
                    Debug.Log("📚 Context7 documentation loaded for detailed view");
                }
            }
        }

        void OnDestroy()
        {
            if (dataManager != null)
            {
                dataManager.OnPerformanceUpdate.RemoveListener(OnPerformanceUpdate);
            }
        }
    }
}