using System;
using System.Collections.Generic;
using UnityEngine;
using System.Linq;

namespace BSI.Unity.Context7
{
    /// <summary>
    /// Context7 Signals System - Custom signals for enhanced performance and context management
    /// Provides global signals that are automatically added to every context object
    /// </summary>
    public static class Context7Signals
    {
        #region Signal Definitions
        public static readonly Signal<string> DocumentationReceived = new Signal<string>();
        public static readonly Signal<string> ErrorOccurred = new Signal<string>();
        public static readonly Signal<bool> ConnectionStatusChanged = new Signal<bool>();
        public static readonly Signal<CacheStats> CacheStatsUpdated = new Signal<CacheStats>();
        public static readonly Signal<SearchQuery> SearchPerformed = new Signal<SearchQuery>();
        public static readonly Signal<LibraryInfo> LibraryChanged = new Signal<LibraryInfo>();
        #endregion

        #region Global Context Signals
        private static readonly Dictionary<string, object> _globalSignals = new Dictionary<string, object>
        {
            { "app_version", Application.version },
            { "unity_version", Application.unityVersion },
            { "platform", Application.platform.ToString() },
            { "target_fps", Application.targetFrameRate },
            { "is_editor", Application.isEditor },
            { "blaze_sports_intel", true },
            { "context7_enabled", true },
            { "timestamp", () => DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ") }
        };

        /// <summary>
        /// Get all global signals for context injection
        /// </summary>
        public static Dictionary<string, object> GetGlobalSignals()
        {
            var signals = new Dictionary<string, object>(_globalSignals);
            
            // Add dynamic values
            signals["timestamp"] = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ");
            signals["memory_usage"] = GC.GetTotalMemory(false);
            signals["fps"] = 1.0f / Time.unscaledDeltaTime;
            
            return signals;
        }

        /// <summary>
        /// Add custom signal to global context
        /// </summary>
        public static void AddGlobalSignal(string key, object value)
        {
            _globalSignals[key] = value;
        }

        /// <summary>
        /// Remove custom signal from global context
        /// </summary>
        public static void RemoveGlobalSignal(string key)
        {
            _globalSignals.Remove(key);
        }
        #endregion

        #region Performance Signals
        private static readonly Dictionary<string, PerformanceMetric> _performanceMetrics = new Dictionary<string, PerformanceMetric>();

        /// <summary>
        /// Record performance metric
        /// </summary>
        public static void RecordMetric(string name, float value, string unit = "")
        {
            if (!_performanceMetrics.ContainsKey(name))
            {
                _performanceMetrics[name] = new PerformanceMetric { Name = name, Unit = unit };
            }
            
            _performanceMetrics[name].AddValue(value);
        }

        /// <summary>
        /// Get performance metrics
        /// </summary>
        public static Dictionary<string, PerformanceMetric> GetPerformanceMetrics()
        {
            return new Dictionary<string, PerformanceMetric>(_performanceMetrics);
        }

        /// <summary>
        /// Clear performance metrics
        /// </summary>
        public static void ClearPerformanceMetrics()
        {
            _performanceMetrics.Clear();
        }
        #endregion

        #region Context Injection
        /// <summary>
        /// Inject context signals into documentation request
        /// </summary>
        public static Dictionary<string, object> InjectContextIntoRequest(string libraryId, string topic, int tokens)
        {
            var context = new Dictionary<string, object>
            {
                { "library_id", libraryId },
                { "topic", topic },
                { "tokens", tokens },
                { "request_id", Guid.NewGuid().ToString() },
                { "request_time", DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ") }
            };

            // Add global signals
            foreach (var signal in GetGlobalSignals())
            {
                context[$"global_{signal.Key}"] = signal.Value;
            }

            // Add performance metrics
            foreach (var metric in GetPerformanceMetrics())
            {
                context[$"perf_{metric.Key}"] = new
                {
                    average = metric.Value.Average,
                    min = metric.Value.Min,
                    max = metric.Value.Max,
                    count = metric.Value.Count,
                    unit = metric.Value.Unit
                };
            }

            return context;
        }
        #endregion
    }

    #region Signal Classes
    /// <summary>
    /// Generic signal class for type-safe event handling
    /// </summary>
    public class Signal<T>
    {
        private event Action<T> _event;

        public void Subscribe(Action<T> handler)
        {
            _event += handler;
        }

        public void Unsubscribe(Action<T> handler)
        {
            _event -= handler;
        }

        public void Invoke(T value)
        {
            _event?.Invoke(value);
        }

        public void Clear()
        {
            _event = null;
        }
    }

    /// <summary>
    /// Performance metric tracking
    /// </summary>
    [System.Serializable]
    public class PerformanceMetric
    {
        public string Name;
        public string Unit;
        private List<float> _values = new List<float>();

        public float Average => _values.Count > 0 ? _values.Average() : 0f;
        public float Min => _values.Count > 0 ? _values.Min() : 0f;
        public float Max => _values.Count > 0 ? _values.Max() : 0f;
        public int Count => _values.Count;

        public void AddValue(float value)
        {
            _values.Add(value);
            
            // Keep only last 100 values to prevent memory issues
            if (_values.Count > 100)
            {
                _values.RemoveAt(0);
            }
        }

        public void Reset()
        {
            _values.Clear();
        }
    }

    /// <summary>
    /// Cache statistics
    /// </summary>
    [System.Serializable]
    public class CacheStats
    {
        public int Size;
        public float HitRate;
        public int Misses;
        public int Hits;
        public float AverageResponseTime;
        public DateTime LastUpdated;
    }

    /// <summary>
    /// Search query information
    /// </summary>
    [System.Serializable]
    public class SearchQuery
    {
        public string Query;
        public string LibraryId;
        public int Tokens;
        public DateTime Timestamp;
        public float ResponseTime;
        public bool Success;
    }

    /// <summary>
    /// Library information
    /// </summary>
    [System.Serializable]
    public class LibraryInfo
    {
        public string Id;
        public string Name;
        public string Description;
        public bool IsAvailable;
        public DateTime LastAccessed;
    }
    #endregion
}