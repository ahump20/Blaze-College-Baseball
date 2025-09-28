using System;
using System.Threading.Tasks;
using UnityEngine;

namespace BSI.Unity.Context7
{
    /// <summary>
    /// Legacy integration component - now delegates to Context7Service
    /// This class is maintained for backward compatibility
    /// </summary>
    [System.Obsolete("Use Context7Service.Instance directly instead of Context7Integration")]
    public class Context7Integration : MonoBehaviour
    {
        [Header("Context7 Configuration - Use Context7Service instead")]
        [SerializeField] private string mcpServerUrl = "http://localhost:8080";
        [SerializeField] private string apiKey = "ctx7sk-30e11e35-4b11-400c-9674-47d39d05aac5";
        
        private DocumentationManager docManager;

        void Start()
        {
            docManager = GetComponent<DocumentationManager>();
            if (docManager == null)
            {
                docManager = gameObject.AddComponent<DocumentationManager>();
            }
        }

        public async Task<string> GetLibraryDocs(string libraryId, string topic = "", int tokens = 5000)
        {
            Debug.LogWarning("⚠️ Context7Integration is deprecated. Use Context7Service.Instance instead.");
            
            if (Context7Service.Instance != null)
            {
                var response = await Context7Service.Instance.GetLibraryDocumentation(libraryId, topic, tokens);
                return response.success ? response.content : response.error;
            }
            else
            {
                Debug.LogError("❌ Context7Service not found! Please add Context7Service to the scene.");
                return null;
            }
        }

        public async Task<string> GetUnityDocs(string topic = "scripting")
        {
            return await GetLibraryDocs("/unity/unity", topic, 5000);
        }

        public async Task<string> GetSportsAnalyticsDocs(string topic = "biomechanics")
        {
            return await GetLibraryDocs("/sports/analytics", topic, 3000);
        }

        public async Task<string> GetPythonDocs(string topic = "data-science")
        {
            return await GetLibraryDocs("/python/python", topic, 4000);
        }
    }
}