using System.Collections.Generic;
using UnityEngine;
using System.Linq;

namespace BSI.Unity.SportsAnalytics
{
    public class BiomechanicsVisualizer : MonoBehaviour
    {
        [Header("Visualization Settings")]
        public GameObject jointPrefab;
        public GameObject bonePrefab;
        public Material jointMaterial;
        public Material boneMaterial;
        public Color normalColor = Color.green;
        public Color warningColor = Color.yellow;
        public Color dangerColor = Color.red;

        [Header("Data Source")]
        public string apiEndpoint = "http://localhost:8000/api/pose-data";

        private Dictionary<string, GameObject> joints = new Dictionary<string, GameObject>();
        private Dictionary<string, LineRenderer> bones = new Dictionary<string, LineRenderer>();
        private BiomechanicsData currentData;

        void Start()
        {
            InitializeVisualization();
            InvokeRepeating(nameof(UpdateBiomechanicsData), 0f, 0.1f); // Update 10 times per second
        }

        void InitializeVisualization()
        {
            // Create joint objects for key biomechanical points
            string[] jointNames = {
                "head", "neck", "left_shoulder", "right_shoulder",
                "left_elbow", "right_elbow", "left_wrist", "right_wrist",
                "spine", "left_hip", "right_hip", "left_knee", "right_knee",
                "left_ankle", "right_ankle"
            };

            foreach (string jointName in jointNames)
            {
                GameObject joint = Instantiate(jointPrefab, transform);
                joint.name = jointName;
                joints[jointName] = joint;
            }

            // Create bone connections
            CreateBoneConnections();
        }

        void CreateBoneConnections()
        {
            var boneConnections = new Dictionary<string, (string, string)>
            {
                {"spine_head", ("spine", "head")},
                {"spine_neck", ("spine", "neck")},
                {"neck_left_shoulder", ("neck", "left_shoulder")},
                {"neck_right_shoulder", ("neck", "right_shoulder")},
                {"left_shoulder_elbow", ("left_shoulder", "left_elbow")},
                {"right_shoulder_elbow", ("right_shoulder", "right_elbow")},
                {"left_elbow_wrist", ("left_elbow", "left_wrist")},
                {"right_elbow_wrist", ("right_elbow", "right_wrist")},
                {"spine_left_hip", ("spine", "left_hip")},
                {"spine_right_hip", ("spine", "right_hip")},
                {"left_hip_knee", ("left_hip", "left_knee")},
                {"right_hip_knee", ("right_hip", "right_knee")},
                {"left_knee_ankle", ("left_knee", "left_ankle")},
                {"right_knee_ankle", ("right_knee", "right_ankle")}
            };

            foreach (var bone in boneConnections)
            {
                GameObject boneObj = new GameObject($"Bone_{bone.Key}");
                boneObj.transform.SetParent(transform);
                
                LineRenderer lineRenderer = boneObj.AddComponent<LineRenderer>();
                lineRenderer.material = boneMaterial;
                lineRenderer.startWidth = 0.02f;
                lineRenderer.endWidth = 0.02f;
                lineRenderer.positionCount = 2;
                lineRenderer.useWorldSpace = false;
                
                bones[bone.Key] = lineRenderer;
            }
        }

        async void UpdateBiomechanicsData()
        {
            try
            {
                // In a real implementation, this would fetch data from the API
                // For now, we'll simulate data
                currentData = GenerateSimulatedData();
                UpdateVisualization();
            }
            catch (System.Exception e)
            {
                Debug.LogError($"Failed to update biomechanics data: {e.Message}");
            }
        }

        BiomechanicsData GenerateSimulatedData()
        {
            // Simulate biomechanical data
            var data = new BiomechanicsData();
            data.joints = new Dictionary<string, Vector3>();
            data.angles = new Dictionary<string, float>();
            data.velocities = new Dictionary<string, float>();

            // Simulate joint positions
            foreach (var joint in joints.Keys)
            {
                data.joints[joint] = new Vector3(
                    Random.Range(-1f, 1f),
                    Random.Range(0f, 2f),
                    Random.Range(-1f, 1f)
                );
            }

            // Simulate angles and velocities
            data.angles["hip_shoulder_separation"] = Random.Range(0f, 45f);
            data.angles["elbow_valgus"] = Random.Range(0f, 15f);
            data.velocities["pelvis_rotation"] = Random.Range(0f, 100f);

            return data;
        }

        void UpdateVisualization()
        {
            if (currentData == null) return;

            // Update joint positions
            foreach (var joint in currentData.joints)
            {
                if (joints.ContainsKey(joint.Key))
                {
                    joints[joint.Key].transform.localPosition = joint.Value;
                }
            }

            // Update bone connections
            foreach (var bone in bones)
            {
                string[] jointNames = bone.Key.Split('_');
                if (jointNames.Length >= 2)
                {
                    string joint1 = string.Join("_", jointNames.Take(jointNames.Length - 1));
                    string joint2 = jointNames.Last();

                    if (currentData.joints.ContainsKey(joint1) && currentData.joints.ContainsKey(joint2))
                    {
                        Vector3 pos1 = currentData.joints[joint1];
                        Vector3 pos2 = currentData.joints[joint2];
                        
                        bone.Value.SetPosition(0, pos1);
                        bone.Value.SetPosition(1, pos2);
                    }
                }
            }

            // Update colors based on biomechanical analysis
            UpdateJointColors();
        }

        void UpdateJointColors()
        {
            if (currentData == null) return;

            foreach (var joint in joints)
            {
                Renderer renderer = joint.Value.GetComponent<Renderer>();
                if (renderer != null)
                {
                    // Simple color coding based on position
                    float height = joint.Value.transform.position.y;
                    if (height > 1.5f)
                        renderer.material.color = normalColor;
                    else if (height > 1f)
                        renderer.material.color = warningColor;
                    else
                        renderer.material.color = dangerColor;
                }
            }
        }
    }

    [System.Serializable]
    public class BiomechanicsData
    {
        public Dictionary<string, Vector3> joints;
        public Dictionary<string, float> angles;
        public Dictionary<string, float> velocities;
        public float timestamp;
    }
}