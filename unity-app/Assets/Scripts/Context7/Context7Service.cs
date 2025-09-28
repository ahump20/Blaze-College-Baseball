using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using UnityEngine;
using System.Text;
using Newtonsoft.Json;
using System.Collections;

namespace BSI.Unity.Context7
{
    /// <summary>
    /// Singleton service that handles ALL Context7 API interactions.
    /// This is the ONLY class that should make direct API calls to Context7.
    /// UI components should never bypass this service.
    /// </summary>
    public class Context7Service : MonoBehaviour
    {
        public static Context7Service Instance { get; private set; }

        [Header("Context7 Configuration")]
        [SerializeField] private string mcpServerUrl = "http://localhost:8080";
        [SerializeField] private string apiKey = "ctx7sk-30e11e35-4b11-400c-9674-47d39d05aac5";
        [SerializeField] private int maxTokens = 5000;
        [SerializeField] private bool enableCaching = true;
        [SerializeField] private int cacheTimeoutSeconds = 300; // 5 minutes

        private HttpClient httpClient;
        private Dictionary<string, CacheEntry> cache = new Dictionary<string, CacheEntry>();
        private bool isInitialized = false;

        [System.Serializable]
        private class CacheEntry
        {
            public string data;
            public DateTime timestamp;
            public int ttlSeconds;
        }

        [System.Serializable]
        public class Context7Request
        {
            public string context7CompatibleLibraryID;
            public string topic;
            public int tokens;
        }

        [System.Serializable]
        public class Context7Response
        {
            public string content;
            public bool success;
            public string error;
        }

        void Awake()
        {
            // Enforce singleton pattern
            if (Instance == null)
            {
                Instance = this;
                DontDestroyOnLoad(gameObject);
                InitializeService();
            }
            else
            {
                Destroy(gameObject);
            }
        }

        private void InitializeService()
        {
            httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {apiKey}");
            httpClient.DefaultRequestHeaders.Add("User-Agent", "BSI-Unity-Context7/1.0");
            
            // Test connection on startup
            StartCoroutine(TestConnectionAsync());
        }

        private IEnumerator TestConnectionAsync()
        {
            var task = TestConnection();
            yield return new WaitUntil(() => task.IsCompleted);
            
            if (task.Result)
            {
                Debug.Log("✅ Context7 Service initialized successfully");
                isInitialized = true;
            }
            else
            {
                Debug.LogWarning("⚠️ Context7 Service connection failed - using fallback mode");
                isInitialized = false;
            }
        }

        private async Task<bool> TestConnection()
        {
            try
            {
                var response = await httpClient.GetAsync($"{mcpServerUrl}/health", HttpCompletionOption.ResponseHeadersRead);
                return response.IsSuccessStatusCode;
            }
            catch (Exception e)
            {
                Debug.LogError($"Context7 connection test failed: {e.Message}");
                return false;
            }
        }

        /// <summary>
        /// Main method for fetching library documentation.
        /// All UI components should use this method exclusively.
        /// </summary>
        public async Task<Context7Response> GetLibraryDocumentation(string libraryId, string topic = "", int tokens = -1)
        {
            if (string.IsNullOrEmpty(libraryId))
            {
                return new Context7Response { success = false, error = "Library ID cannot be empty" };
            }

            // Use default tokens if not specified
            if (tokens <= 0) tokens = maxTokens;

            // Check cache first
            string cacheKey = $"{libraryId}:{topic}:{tokens}";
            if (enableCaching && cache.ContainsKey(cacheKey))
            {
                var cachedEntry = cache[cacheKey];
                if (DateTime.Now.Subtract(cachedEntry.timestamp).TotalSeconds < cachedEntry.ttlSeconds)
                {
                    Debug.Log($"📚 Cache hit for {libraryId}");
                    return new Context7Response { content = cachedEntry.data, success = true };
                }
                else
                {
                    cache.Remove(cacheKey); // Remove expired entry
                }
            }

            // Make API call
            try
            {
                var request = new Context7Request
                {
                    context7CompatibleLibraryID = libraryId,
                    topic = topic,
                    tokens = tokens
                };

                string json = JsonConvert.SerializeObject(request);
                var content = new StringContent(json, Encoding.UTF8, "application/json");
                
                string url = $"{mcpServerUrl}/get-library-docs";
                HttpResponseMessage response = await httpClient.PostAsync(url, content);
                response.EnsureSuccessStatusCode();
                
                string responseBody = await response.Content.ReadAsStringAsync();
                Debug.Log($"📖 Context7 API response received for {libraryId}");

                // Cache the result
                if (enableCaching)
                {
                    cache[cacheKey] = new CacheEntry
                    {
                        data = responseBody,
                        timestamp = DateTime.Now,
                        ttlSeconds = cacheTimeoutSeconds
                    };
                }

                return new Context7Response { content = responseBody, success = true };
            }
            catch (Exception e)
            {
                Debug.LogError($"❌ Context7 API error for {libraryId}: {e.Message}");
                return new Context7Response { success = false, error = e.Message };
            }
        }

        /// <summary>
        /// Convenience method for Unity documentation
        /// </summary>
        public async Task<Context7Response> GetUnityDocumentation(string topic = "scripting")
        {
            return await GetLibraryDocumentation("/unity/unity", topic, 5000);
        }

        /// <summary>
        /// Convenience method for sports analytics documentation
        /// </summary>
        public async Task<Context7Response> GetSportsAnalyticsDocumentation(string topic = "biomechanics")
        {
            return await GetLibraryDocumentation("/sports/analytics", topic, 3000);
        }

        /// <summary>
        /// Convenience method for Python documentation
        /// </summary>
        public async Task<Context7Response> GetPythonDocumentation(string topic = "data-science")
        {
            return await GetLibraryDocumentation("/python/python", topic, 4000);
        }

        /// <summary>
        /// Clear the cache (useful for testing or when data is stale)
        /// </summary>
        public void ClearCache()
        {
            cache.Clear();
            Debug.Log("🗑️ Context7 cache cleared");
        }

        /// <summary>
        /// Get cache statistics for monitoring
        /// </summary>
        public Dictionary<string, object> GetCacheStats()
        {
            return new Dictionary<string, object>
            {
                ["entries"] = cache.Count,
                ["enabled"] = enableCaching,
                ["timeout_seconds"] = cacheTimeoutSeconds,
                ["is_initialized"] = isInitialized
            };
        }

        /// <summary>
        /// Update configuration (useful for runtime adjustments)
        /// </summary>
        public void UpdateConfiguration(string newServerUrl = null, string newApiKey = null, int newMaxTokens = -1)
        {
            if (!string.IsNullOrEmpty(newServerUrl))
                mcpServerUrl = newServerUrl;
            
            if (!string.IsNullOrEmpty(newApiKey))
            {
                apiKey = newApiKey;
                httpClient.DefaultRequestHeaders.Remove("Authorization");
                httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {apiKey}");
            }
            
            if (newMaxTokens > 0)
                maxTokens = newMaxTokens;
        }

        void OnDestroy()
        {
            httpClient?.Dispose();
        }
    }
}