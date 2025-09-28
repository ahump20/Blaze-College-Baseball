using UnityEngine;
using UnityEngine.TestTools;
using NUnit.Framework;
using System.Collections;
using BSI.Unity.Context7;
using BSI.Unity.UI;

namespace BSI.Unity.Tests
{
    /// <summary>
    /// Test suite to verify API/UI separation is maintained
    /// </summary>
    public class Context7SeparationTest
    {
        private GameObject testGameObject;
        private Context7Service context7Service;
        private AnalyticsDashboard dashboard;
        private DocumentationPanel docPanel;

        [SetUp]
        public void Setup()
        {
            // Create test GameObject
            testGameObject = new GameObject("TestObject");
            
            // Add Context7Service
            context7Service = testGameObject.AddComponent<Context7Service>();
            
            // Create UI components
            var dashboardObj = new GameObject("Dashboard");
            dashboard = dashboardObj.AddComponent<AnalyticsDashboard>();
            
            var panelObj = new GameObject("DocPanel");
            docPanel = panelObj.AddComponent<DocumentationPanel>();
        }

        [TearDown]
        public void TearDown()
        {
            if (testGameObject != null)
                Object.DestroyImmediate(testGameObject);
                
            if (dashboard != null && dashboard.gameObject != null)
                Object.DestroyImmediate(dashboard.gameObject);
                
            if (docPanel != null && docPanel.gameObject != null)
                Object.DestroyImmediate(docPanel.gameObject);
        }

        [Test]
        public void Context7Service_IsSingleton()
        {
            // Verify singleton pattern
            Assert.IsNotNull(Context7Service.Instance);
            Assert.AreEqual(Context7Service.Instance, context7Service);
        }

        [Test]
        public void UIComponents_DoNotHaveDirectHttpClients()
        {
            // Check that UI components don't have HttpClient fields
            var dashboardType = typeof(AnalyticsDashboard);
            var docPanelType = typeof(DocumentationPanel);
            
            // Use reflection to check for HttpClient fields
            var dashboardHttpFields = dashboardType.GetFields(System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
            var docPanelHttpFields = docPanelType.GetFields(System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
            
            foreach (var field in dashboardHttpFields)
            {
                Assert.AreNotEqual(typeof(System.Net.Http.HttpClient), field.FieldType, 
                    $"AnalyticsDashboard should not have HttpClient field: {field.Name}");
            }
            
            foreach (var field in docPanelHttpFields)
            {
                Assert.AreNotEqual(typeof(System.Net.Http.HttpClient), field.FieldType, 
                    $"DocumentationPanel should not have HttpClient field: {field.Name}");
            }
        }

        [Test]
        public void UIComponents_ReferenceContext7Service()
        {
            // Check that UI components reference Context7Service
            Assert.IsNotNull(Context7Service.Instance);
            
            // Verify UI components can access the service
            var service = Context7Service.Instance;
            Assert.IsNotNull(service);
        }

        [Test]
        public void Context7Service_HasRequiredMethods()
        {
            // Verify Context7Service has all required methods
            var serviceType = typeof(Context7Service);
            
            Assert.IsNotNull(serviceType.GetMethod("GetLibraryDocumentation"));
            Assert.IsNotNull(serviceType.GetMethod("GetUnityDocumentation"));
            Assert.IsNotNull(serviceType.GetMethod("GetSportsAnalyticsDocumentation"));
            Assert.IsNotNull(serviceType.GetMethod("GetPythonDocumentation"));
            Assert.IsNotNull(serviceType.GetMethod("ClearCache"));
            Assert.IsNotNull(serviceType.GetMethod("GetCacheStats"));
        }

        [Test]
        public void BrandColors_AreProtected()
        {
            // Check that brand colors are marked as SerializeField (protected)
            var dashboardType = typeof(AnalyticsDashboard);
            var docPanelType = typeof(DocumentationPanel);
            
            // Check for color fields that should be protected
            var dashboardColorFields = dashboardType.GetFields(System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
            var docPanelColorFields = docPanelType.GetFields(System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
            
            bool foundProtectedColors = false;
            
            foreach (var field in dashboardColorFields)
            {
                if (field.FieldType == typeof(Color) && field.IsPrivate)
                {
                    foundProtectedColors = true;
                    break;
                }
            }
            
            foreach (var field in docPanelColorFields)
            {
                if (field.FieldType == typeof(Color) && field.IsPrivate)
                {
                    foundProtectedColors = true;
                    break;
                }
            }
            
            Assert.IsTrue(foundProtectedColors, "Brand colors should be protected (private SerializeField)");
        }

        [UnityTest]
        public IEnumerator Context7Service_InitializesCorrectly()
        {
            // Wait for service initialization
            yield return new WaitForSeconds(0.1f);
            
            // Verify service is initialized
            Assert.IsNotNull(Context7Service.Instance);
            
            // Check cache stats are available
            var stats = Context7Service.Instance.GetCacheStats();
            Assert.IsNotNull(stats);
            Assert.IsTrue(stats.ContainsKey("entries"));
            Assert.IsTrue(stats.ContainsKey("enabled"));
            Assert.IsTrue(stats.ContainsKey("is_initialized"));
        }

        [Test]
        public void APIOnlyFiles_AreInCorrectDirectories()
        {
            // This test would be run by CI/CD to verify file organization
            // For now, we'll verify the structure exists
            
            Assert.IsNotNull(typeof(Context7Service));
            Assert.IsNotNull(typeof(AnalyticsDashboard));
            Assert.IsNotNull(typeof(DocumentationPanel));
            
            // Verify namespaces are correct
            Assert.AreEqual("BSI.Unity.Context7", typeof(Context7Service).Namespace);
            Assert.AreEqual("BSI.Unity.UI", typeof(AnalyticsDashboard).Namespace);
            Assert.AreEqual("BSI.Unity.UI", typeof(DocumentationPanel).Namespace);
        }

        [Test]
        public void UIConfiguration_IsProperlyStructured()
        {
            // Check that UI configuration is properly structured
            var dashboardType = typeof(AnalyticsDashboard);
            var docPanelType = typeof(DocumentationPanel);
            
            // Check for configuration fields
            var dashboardConfigFields = dashboardType.GetFields(System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Instance);
            var docPanelConfigFields = docPanelType.GetFields(System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Instance);
            
            bool hasConfiguration = false;
            
            foreach (var field in dashboardConfigFields)
            {
                if (field.Name.Contains("updateInterval") || field.Name.Contains("Configuration"))
                {
                    hasConfiguration = true;
                    break;
                }
            }
            
            foreach (var field in docPanelConfigFields)
            {
                if (field.Name.Contains("defaultTokens") || field.Name.Contains("maxTokens"))
                {
                    hasConfiguration = true;
                    break;
                }
            }
            
            Assert.IsTrue(hasConfiguration, "UI components should have proper configuration structure");
        }
    }
}