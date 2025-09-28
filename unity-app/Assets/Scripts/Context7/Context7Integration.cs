using System;
using System.Net.Http;
using System.Threading.Tasks;
using UnityEngine;
using System.Text;
using Newtonsoft.Json;

namespace BSI.Unity.Context7
{
    public class Context7Integration : MonoBehaviour
    {
        [Header("Context7 Configuration")]
        public string mcpServerUrl = "http://localhost:8080";
        public string apiKey = "ctx7sk-30e11e35-4b11-400c-9674-47d39d05aac5";
        
        private static readonly HttpClient client = new HttpClient();
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
            try
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
                HttpResponseMessage response = await client.PostAsync(url, content);
                response.EnsureSuccessStatusCode();
                
                string responseBody = await response.Content.ReadAsStringAsync();
                Debug.Log($"Context7 Response: {responseBody}");
                
                return responseBody;
            }
            catch (Exception e)
            {
                Debug.LogError($"Error fetching documentation: {e.Message}");
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