using System;
using System.Collections;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using UnityEngine;
using System.Text;
using Newtonsoft.Json;
using System.Threading;

namespace BSI.Unity.Context7
{
    /// <summary>
    /// Enhanced Context7 Service - Singleton pattern for API management
    /// Handles all HTTP/MCP calls to Context7 with caching, error handling, and performance optimization
    /// </summary>
    public class Context7Service : MonoBehaviour
    {
        #region Singleton Pattern
        private static Context7Service _instance;
        public static Context7Service Instance
        {
            get
            {
                if (_instance == null)
                {
                    _instance = FindObjectOfType<Context7Service>();
                    if (_instance == null)
                    {
                        GameObject go = new GameObject("Context7Service");
                        _instance = go.AddComponent<Context7Service>();
                        DontDestroyOnLoad(go);
                    }
                }
                return _instance;
            }
        }
        #endregion

        #region Configuration
        [Header("Context7 Configuration")]
        [SerializeField] private string mcpServerUrl = "http://localhost:8080";
        [SerializeField] private string apiKey = "ctx7sk-30e11e35-4b11-400c-9674-47d39d05aac5";
        [SerializeField] private int maxTokenLimit = 10000;
        [SerializeField] private float requestTimeout = 30f;
        [SerializeField] private bool enableCaching = true;
        [SerializeField] private int cacheSize = 100;
        [SerializeField] private float cacheExpirationTime = 300f; // 5 minutes

        [Header("Performance Settings")]
        [SerializeField] private int maxConcurrentRequests = 5;
        [SerializeField] private float retryDelay = 1f;
        [SerializeField] private int maxRetries = 3;
        #endregion

        #region Private Fields
        private HttpClient _httpClient;
        private Dictionary<string, CacheEntry> _cache;
        private Queue<string> _requestQueue;
        private int _activeRequests = 0;
        private bool _isInitialized = false;
        private CancellationTokenSource _cancellationTokenSource;
        #endregion

        #region Events
        public static event Action<string> OnDocumentationReceived;
        public static event Action<string> OnErrorOccurred;
        public static event Action<bool> OnConnectionStatusChanged;
        #endregion

        #region Unity Lifecycle
        void Awake()
        {
            if (_instance == null)
            {
                _instance = this;
                DontDestroyOnLoad(gameObject);
                InitializeService();
            }
            else if (_instance != this)
            {
                Destroy(gameObject);
            }
        }

        void Start()
        {
            if (!_isInitialized)
            {
                InitializeService();
            }
        }

        void OnDestroy()
        {
            _cancellationTokenSource?.Cancel();
            _httpClient?.Dispose();
        }
        #endregion

        #region Initialization
        private void InitializeService()
        {
            if (_isInitialized) return;

            _httpClient = new HttpClient();
            _httpClient.Timeout = TimeSpan.FromSeconds(requestTimeout);
            _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {apiKey}");
            _httpClient.DefaultRequestHeaders.Add("User-Agent", "BlazeSportsIntel-Unity/1.0");

            _cache = new Dictionary<string, CacheEntry>();
            _requestQueue = new Queue<string>();
            _cancellationTokenSource = new CancellationTokenSource();

            _isInitialized = true;
            Debug.Log("[Context7Service] Service initialized successfully");

            // Test connection on startup
            _ = TestConnectionAsync();
        }
        #endregion

        #region Public API Methods
        /// <summary>
        /// Get library documentation with caching and error handling
        /// </summary>
        public async Task<string> GetLibraryDocsAsync(string libraryId, string topic = "", int tokens = 5000)
        {
            if (!_isInitialized)
            {
                Debug.LogError("[Context7Service] Service not initialized");
                return null;
            }

            if (tokens > maxTokenLimit)
            {
                Debug.LogWarning($"[Context7Service] Token limit exceeded. Clamping to {maxTokenLimit}");
                tokens = maxTokenLimit;
            }

            string cacheKey = GenerateCacheKey(libraryId, topic, tokens);
            
            // Check cache first
            if (enableCaching && _cache.TryGetValue(cacheKey, out CacheEntry cachedEntry))
            {
                if (Time.time - cachedEntry.Timestamp < cacheExpirationTime)
                {
                    Debug.Log($"[Context7Service] Cache hit for {libraryId}");
                    return cachedEntry.Data;
                }
                else
                {
                    _cache.Remove(cacheKey);
                }
            }

            // Wait for available request slot
            await WaitForAvailableSlot();

            try
            {
                _activeRequests++;
                var result = await FetchDocumentationInternal(libraryId, topic, tokens);
                
                // Cache the result
                if (enableCaching && !string.IsNullOrEmpty(result))
                {
                    CacheResult(cacheKey, result);
                }

                OnDocumentationReceived?.Invoke(result);
                return result;
            }
            catch (Exception e)
            {
                Debug.LogError($"[Context7Service] Error fetching documentation: {e.Message}");
                OnErrorOccurred?.Invoke(e.Message);
                return null;
            }
            finally
            {
                _activeRequests--;
            }
        }

        /// <summary>
        /// Get Unity-specific documentation
        /// </summary>
        public async Task<string> GetUnityDocsAsync(string topic = "scripting")
        {
            return await GetLibraryDocsAsync("/unity/unity", topic, 5000);
        }

        /// <summary>
        /// Get sports analytics documentation
        /// </summary>
        public async Task<string> GetSportsAnalyticsDocsAsync(string topic = "biomechanics")
        {
            return await GetLibraryDocsAsync("/sports/analytics", topic, 3000);
        }

        /// <summary>
        /// Get Python documentation
        /// </summary>
        public async Task<string> GetPythonDocsAsync(string topic = "data-science")
        {
            return await GetLibraryDocsAsync("/python/python", topic, 4000);
        }

        /// <summary>
        /// Search documentation across multiple libraries
        /// </summary>
        public async Task<Dictionary<string, string>> SearchMultipleLibrariesAsync(string topic, string[] libraryIds = null)
        {
            if (libraryIds == null)
            {
                libraryIds = new[] { "/unity/unity", "/sports/analytics", "/python/python" };
            }

            var results = new Dictionary<string, string>();
            var tasks = new List<Task<string>>();

            foreach (var libraryId in libraryIds)
            {
                tasks.Add(GetLibraryDocsAsync(libraryId, topic, 2000));
            }

            var responses = await Task.WhenAll(tasks);
            
            for (int i = 0; i < libraryIds.Length; i++)
            {
                if (!string.IsNullOrEmpty(responses[i]))
                {
                    results[libraryId[i]] = responses[i];
                }
            }

            return results;
        }
        #endregion

        #region Private Methods
        private async Task<string> FetchDocumentationInternal(string libraryId, string topic, int tokens)
        {
            var requestData = new
            {
                context7CompatibleLibraryID = libraryId,
                topic = topic,
                tokens = tokens
            };

            string json = JsonConvert.SerializeObject(requestData);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            
            string url = $"{mcpServerUrl}/get-library-docs";
            
            for (int attempt = 0; attempt < maxRetries; attempt++)
            {
                try
                {
                    var response = await _httpClient.PostAsync(url, content, _cancellationTokenSource.Token);
                    
                    if (response.IsSuccessStatusCode)
                    {
                        string responseBody = await response.Content.ReadAsStringAsync();
                        Debug.Log($"[Context7Service] Successfully fetched docs for {libraryId}");
                        return responseBody;
                    }
                    else
                    {
                        Debug.LogWarning($"[Context7Service] Request failed with status {response.StatusCode}, attempt {attempt + 1}");
                    }
                }
                catch (HttpRequestException e)
                {
                    Debug.LogWarning($"[Context7Service] HTTP error on attempt {attempt + 1}: {e.Message}");
                }
                catch (TaskCanceledException)
                {
                    Debug.LogWarning($"[Context7Service] Request timeout on attempt {attempt + 1}");
                }

                if (attempt < maxRetries - 1)
                {
                    await Task.Delay((int)(retryDelay * 1000 * (attempt + 1)));
                }
            }

            throw new Exception($"Failed to fetch documentation after {maxRetries} attempts");
        }

        private async Task WaitForAvailableSlot()
        {
            while (_activeRequests >= maxConcurrentRequests)
            {
                await Task.Delay(100);
            }
        }

        private string GenerateCacheKey(string libraryId, string topic, int tokens)
        {
            return $"{libraryId}:{topic}:{tokens}";
        }

        private void CacheResult(string key, string data)
        {
            if (_cache.Count >= cacheSize)
            {
                // Remove oldest entry
                var oldestKey = "";
                var oldestTime = float.MaxValue;
                
                foreach (var kvp in _cache)
                {
                    if (kvp.Value.Timestamp < oldestTime)
                    {
                        oldestTime = kvp.Value.Timestamp;
                        oldestKey = kvp.Key;
                    }
                }
                
                if (!string.IsNullOrEmpty(oldestKey))
                {
                    _cache.Remove(oldestKey);
                }
            }

            _cache[key] = new CacheEntry
            {
                Data = data,
                Timestamp = Time.time
            };
        }

        private async Task TestConnectionAsync()
        {
            try
            {
                var response = await _httpClient.GetAsync($"{mcpServerUrl}/health", _cancellationTokenSource.Token);
                bool isConnected = response.IsSuccessStatusCode;
                
                OnConnectionStatusChanged?.Invoke(isConnected);
                
                if (isConnected)
                {
                    Debug.Log("[Context7Service] Successfully connected to Context7 MCP Server");
                }
                else
                {
                    Debug.LogWarning("[Context7Service] Failed to connect to Context7 MCP Server");
                }
            }
            catch (Exception e)
            {
                Debug.LogError($"[Context7Service] Connection test failed: {e.Message}");
                OnConnectionStatusChanged?.Invoke(false);
            }
        }
        #endregion

        #region Cache Management
        public void ClearCache()
        {
            _cache.Clear();
            Debug.Log("[Context7Service] Cache cleared");
        }

        public int GetCacheSize()
        {
            return _cache.Count;
        }

        public float GetCacheHitRate()
        {
            // This would need to be tracked separately in a real implementation
            return 0.85f; // Placeholder
        }
        #endregion

        #region Health Check
        public bool IsConnected()
        {
            return _isInitialized && _httpClient != null;
        }

        public int GetActiveRequestCount()
        {
            return _activeRequests;
        }

        public int GetQueueSize()
        {
            return _requestQueue.Count;
        }
        #endregion
    }

    #region Helper Classes
    [System.Serializable]
    public class CacheEntry
    {
        public string Data;
        public float Timestamp;
    }
    #endregion
}