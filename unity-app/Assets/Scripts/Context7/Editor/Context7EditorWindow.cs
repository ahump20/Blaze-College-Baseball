using UnityEngine;
using UnityEditor;
using System.Collections.Generic;
using System.Threading.Tasks;
using BSI.Unity.Context7;
using System.Linq;

namespace BSI.Unity.Context7.Editor
{
    /// <summary>
    /// Context7 Editor Window - Provides contextual documentation access in Unity Editor
    /// Implements Unity's Contextual Tooling framework for enhanced developer experience
    /// </summary>
    public class Context7EditorWindow : EditorWindow
    {
        #region Constants
        private const string WINDOW_TITLE = "Context7 Documentation";
        private const string SEARCH_PLACEHOLDER = "Search documentation...";
        private const int MAX_SEARCH_HISTORY = 20;
        private const float SEARCH_DELAY = 0.3f;
        #endregion

        #region Private Fields
        private string _searchQuery = "";
        private string _lastSearchQuery = "";
        private string _currentDocumentation = "";
        private Vector2 _scrollPosition;
        private Vector2 _historyScrollPosition;
        private List<string> _searchHistory = new List<string>();
        private List<string> _filteredHistory = new List<string>();
        private bool _isSearching = false;
        private bool _showHistory = false;
        private bool _showSettings = false;
        private float _lastSearchTime = 0f;
        private string _selectedLibrary = "Unity Engine";
        private Dictionary<string, string> _libraryMappings = new Dictionary<string, string>
        {
            { "Unity Engine", "/unity/unity" },
            { "Sports Analytics", "/sports/analytics" },
            { "Python Data Science", "/python/python" },
            { "Machine Learning", "/ml/machine-learning" },
            { "Computer Vision", "/cv/computer-vision" }
        };
        #endregion

        #region Editor Window
        [MenuItem("Blaze Sports Intel/Context7 Documentation")]
        public static void ShowWindow()
        {
            var window = GetWindow<Context7EditorWindow>(WINDOW_TITLE);
            window.minSize = new Vector2(400, 300);
            window.Show();
        }

        void OnEnable()
        {
            LoadSearchHistory();
            EditorApplication.update += OnEditorUpdate;
        }

        void OnDisable()
        {
            EditorApplication.update -= OnEditorUpdate;
            SaveSearchHistory();
        }

        void OnGUI()
        {
            DrawHeader();
            DrawSearchSection();
            DrawDocumentationSection();
            DrawHistorySection();
            DrawSettingsSection();
        }
        #endregion

        #region GUI Drawing Methods
        private void DrawHeader()
        {
            EditorGUILayout.BeginHorizontal(EditorStyles.toolbar);
            
            GUILayout.Label("🔥 Blaze Sports Intel - Context7", EditorStyles.boldLabel);
            GUILayout.FlexibleSpace();
            
            if (GUILayout.Button("Settings", EditorStyles.toolbarButton))
            {
                _showSettings = !_showSettings;
            }
            
            if (GUILayout.Button("History", EditorStyles.toolbarButton))
            {
                _showHistory = !_showHistory;
            }
            
            EditorGUILayout.EndHorizontal();
        }

        private void DrawSearchSection()
        {
            EditorGUILayout.BeginVertical("box");
            
            // Library Selection
            EditorGUILayout.BeginHorizontal();
            GUILayout.Label("Library:", GUILayout.Width(60));
            int selectedIndex = _libraryMappings.Keys.ToList().IndexOf(_selectedLibrary);
            selectedIndex = EditorGUILayout.Popup(selectedIndex, _libraryMappings.Keys.ToArray());
            _selectedLibrary = _libraryMappings.Keys.ToList()[selectedIndex];
            EditorGUILayout.EndHorizontal();
            
            // Search Field
            EditorGUILayout.BeginHorizontal();
            GUI.SetNextControlName("SearchField");
            _searchQuery = EditorGUILayout.TextField(_searchQuery, EditorStyles.toolbarSearchField);
            
            if (GUILayout.Button("Search", EditorStyles.toolbarButton, GUILayout.Width(60)))
            {
                PerformSearch();
            }
            
            if (GUILayout.Button("Clear", EditorStyles.toolbarButton, GUILayout.Width(50)))
            {
                ClearSearch();
            }
            
            EditorGUILayout.EndHorizontal();
            
            // Search Status
            if (_isSearching)
            {
                EditorGUILayout.HelpBox("Searching...", MessageType.Info);
            }
            
            EditorGUILayout.EndVertical();
        }

        private void DrawDocumentationSection()
        {
            EditorGUILayout.BeginVertical("box");
            GUILayout.Label("Documentation", EditorStyles.boldLabel);
            
            _scrollPosition = EditorGUILayout.BeginScrollView(_scrollPosition, GUILayout.Height(300));
            
            if (string.IsNullOrEmpty(_currentDocumentation))
            {
                EditorGUILayout.HelpBox("Enter a search query to find documentation", MessageType.Info);
            }
            else
            {
                // Format and display documentation
                var style = new GUIStyle(EditorStyles.label)
                {
                    wordWrap = true,
                    richText = true
                };
                
                EditorGUILayout.LabelField(_currentDocumentation, style);
            }
            
            EditorGUILayout.EndScrollView();
            EditorGUILayout.EndVertical();
        }

        private void DrawHistorySection()
        {
            if (!_showHistory) return;
            
            EditorGUILayout.BeginVertical("box");
            GUILayout.Label("Search History", EditorStyles.boldLabel);
            
            _historyScrollPosition = EditorGUILayout.BeginScrollView(_historyScrollPosition, GUILayout.Height(150));
            
            for (int i = _searchHistory.Count - 1; i >= 0; i--)
            {
                EditorGUILayout.BeginHorizontal();
                
                if (GUILayout.Button(_searchHistory[i], EditorStyles.label))
                {
                    _searchQuery = _searchHistory[i];
                    PerformSearch();
                }
                
                if (GUILayout.Button("×", GUILayout.Width(20)))
                {
                    _searchHistory.RemoveAt(i);
                }
                
                EditorGUILayout.EndHorizontal();
            }
            
            EditorGUILayout.EndScrollView();
            
            if (GUILayout.Button("Clear History"))
            {
                _searchHistory.Clear();
            }
            
            EditorGUILayout.EndVertical();
        }

        private void DrawSettingsSection()
        {
            if (!_showSettings) return;
            
            EditorGUILayout.BeginVertical("box");
            GUILayout.Label("Settings", EditorStyles.boldLabel);
            
            // API Configuration
            EditorGUILayout.LabelField("API Configuration", EditorStyles.boldLabel);
            var service = Context7Service.Instance;
            if (service != null)
            {
                EditorGUILayout.LabelField("Status:", service.IsConnected() ? "Connected" : "Disconnected");
                EditorGUILayout.LabelField("Cache Size:", service.GetCacheSize().ToString());
                EditorGUILayout.LabelField("Active Requests:", service.GetActiveRequestCount().ToString());
                
                if (GUILayout.Button("Clear Cache"))
                {
                    service.ClearCache();
                }
            }
            
            EditorGUILayout.Space();
            
            // Search Configuration
            EditorGUILayout.LabelField("Search Configuration", EditorStyles.boldLabel);
            EditorGUILayout.LabelField("Max History Items:", MAX_SEARCH_HISTORY.ToString());
            EditorGUILayout.LabelField("Search Delay:", $"{SEARCH_DELAY}s");
            
            EditorGUILayout.EndVertical();
        }
        #endregion

        #region Search Logic
        private void OnEditorUpdate()
        {
            // Auto-search with delay
            if (!string.IsNullOrEmpty(_searchQuery) && _searchQuery != _lastSearchQuery)
            {
                if (Time.realtimeSinceStartup - _lastSearchTime > SEARCH_DELAY)
                {
                    _lastSearchQuery = _searchQuery;
                    _lastSearchTime = Time.realtimeSinceStartup;
                    PerformSearch();
                }
            }
        }

        private async void PerformSearch()
        {
            if (string.IsNullOrEmpty(_searchQuery) || _isSearching) return;
            
            _isSearching = true;
            Repaint();
            
            try
            {
                var service = Context7Service.Instance;
                if (service == null)
                {
                    _currentDocumentation = "Context7Service not available. Please ensure the service is running.";
                    return;
                }
                
                string libraryId = _libraryMappings[_selectedLibrary];
                string result = await service.GetLibraryDocsAsync(libraryId, _searchQuery, 5000);
                
                if (!string.IsNullOrEmpty(result))
                {
                    _currentDocumentation = FormatDocumentation(result);
                    AddToSearchHistory(_searchQuery);
                }
                else
                {
                    _currentDocumentation = "No documentation found for the given query.";
                }
            }
            catch (System.Exception e)
            {
                _currentDocumentation = $"Error: {e.Message}";
                Debug.LogError($"[Context7EditorWindow] Search failed: {e.Message}");
            }
            finally
            {
                _isSearching = false;
                Repaint();
            }
        }

        private void ClearSearch()
        {
            _searchQuery = "";
            _currentDocumentation = "";
            _lastSearchQuery = "";
        }

        private string FormatDocumentation(string rawDocumentation)
        {
            // Basic formatting for better readability
            var formatted = rawDocumentation
                .Replace("\\n", "\n")
                .Replace("\\t", "\t")
                .Replace("```", "\n```\n")
                .Replace("**", "<b>")
                .Replace("**", "</b>")
                .Replace("*", "<i>")
                .Replace("*", "</i>");
            
            return formatted;
        }
        #endregion

        #region History Management
        private void AddToSearchHistory(string query)
        {
            if (string.IsNullOrEmpty(query)) return;
            
            // Remove if already exists
            _searchHistory.Remove(query);
            
            // Add to beginning
            _searchHistory.Insert(0, query);
            
            // Limit history size
            if (_searchHistory.Count > MAX_SEARCH_HISTORY)
            {
                _searchHistory.RemoveAt(_searchHistory.Count - 1);
            }
        }

        private void LoadSearchHistory()
        {
            _searchHistory = EditorPrefs.GetString("Context7_SearchHistory", "").Split('\n')
                .Where(s => !string.IsNullOrEmpty(s))
                .ToList();
        }

        private void SaveSearchHistory()
        {
            EditorPrefs.SetString("Context7_SearchHistory", string.Join("\n", _searchHistory));
        }
        #endregion
    }
}