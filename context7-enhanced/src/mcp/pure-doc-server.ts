/**
 * Pure documentation MCP server for Blaze Sports Intel
 * Strictly returns official library documentation
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { CacheManager } from '../cache/cache-manager.js';
import { logger } from '../utils/logger.js';

// Tool schemas
const ResolveLibrarySchema = z.object({
  libraryName: z.string().describe('Library name to resolve (e.g., "three.js", "recharts")')
});

const GetLibraryDocsSchema = z.object({
  context7CompatibleLibraryID: z.string().describe('Library ID from resolve-library-id'),
  topic: z.string().describe('Documentation topic to fetch'),
  tokens: z.number().min(500).max(5000).default(3000).describe('Max tokens to return')
});

const SearchDocsSchema = z.object({
  query: z.string().describe('Search query'),
  libraryID: z.string().optional().describe('Optional library ID to scope search')
});

interface DocResponse {
  docs: string;
  metadata: {
    library: string;
    version: string;
    topic: string;
    source: string;
    retrieved: string; // ISO timestamp
    cacheStatus: {
      hit: boolean;
      tier: 'memory' | 'redis' | 'source';
      ageMs: number;
    };
  };
}

export class PureDocServer {
  private server: Server;
  private cache: CacheManager;

  // Version mappings for BSI stack
  private versionMap = {
    'three.js': 'r128',
    'recharts': 'latest',
    'chart.js': '4.4.0',
    'gsap': '3.12.2',
    'aos': '2.3.1',
    'react': '18'
  };

  constructor(cache: CacheManager) {
    this.cache = cache;
    this.server = new Server(
      {
        name: 'context7-docs-bsi',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupTools();
  }

  private setupTools() {
    // Tool: resolve-library-id
    this.server.setRequestHandler(
      'resolve-library-id',
      async (request) => {
        const params = ResolveLibrarySchema.parse(request.params);
        const cacheKey = `resolve:${params.libraryName}`;

        // Try cache first
        const cached = await this.cache.get(cacheKey);
        if (cached) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  libraryID: cached.libraryID,
                  confidence: cached.confidence,
                  alternatives: cached.alternatives,
                  cacheHit: true
                })
              }
            ]
          };
        }

        // Resolve library ID (mock implementation - replace with actual Context7 API)
        const libraryMappings: Record<string, string> = {
          'three.js': '/mrdoob/three.js',
          'three': '/mrdoob/three.js',
          'recharts': '/recharts/recharts',
          'chart.js': '/chartjs/Chart.js',
          'gsap': '/greensock/GSAP',
          'aos': '/michalsnik/aos',
          'cloudflare': '/cloudflare/docs',
          'mediapipe': '/google/mediapipe'
        };

        const normalized = params.libraryName.toLowerCase();
        const libraryID = libraryMappings[normalized] || `/unknown/${normalized}`;

        const result = {
          libraryID,
          confidence: libraryMappings[normalized] ? 1.0 : 0.3,
          alternatives: []
        };

        // Cache for 24 hours (library IDs are stable)
        await this.cache.set(cacheKey, result, { ttl: 86400 });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result)
            }
          ]
        };
      }
    );

    // Tool: get-library-docs
    this.server.setRequestHandler(
      'get-library-docs',
      async (request) => {
        const params = GetLibraryDocsSchema.parse(request.params);
        const cacheKey = `docs:${params.context7CompatibleLibraryID}:${params.topic}:${params.tokens}`;

        const startTime = Date.now();
        let cacheStatus = {
          hit: false,
          tier: 'source' as const,
          ageMs: 0
        };

        // Try memory cache
        const memCached = await this.cache.getFromMemory(cacheKey);
        if (memCached) {
          cacheStatus = { hit: true, tier: 'memory', ageMs: Date.now() - startTime };
          return this.formatDocResponse(memCached, cacheStatus);
        }

        // Try Redis cache
        const redisCached = await this.cache.get(cacheKey);
        if (redisCached) {
          cacheStatus = { hit: true, tier: 'redis', ageMs: Date.now() - startTime };
          return this.formatDocResponse(redisCached, cacheStatus);
        }

        // Fetch from source (mock - replace with actual Context7 API)
        const docs = await this.fetchDocsFromSource(
          params.context7CompatibleLibraryID,
          params.topic,
          params.tokens
        );

        // Cache with version-specific TTL (docs are stable per version)
        await this.cache.set(cacheKey, docs, { ttl: 604800 }); // 7 days

        cacheStatus = { hit: false, tier: 'source', ageMs: Date.now() - startTime };
        return this.formatDocResponse(docs, cacheStatus);
      }
    );

    // Tool: search-docs
    this.server.setRequestHandler(
      'search-docs',
      async (request) => {
        const params = SearchDocsSchema.parse(request.params);
        const cacheKey = `search:${params.query}:${params.libraryID || 'all'}`;

        // Search implementation
        const results = await this.searchDocumentation(params.query, params.libraryID);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(results, null, 2)
            }
          ]
        };
      }
    );
  }

  private async fetchDocsFromSource(
    libraryID: string,
    topic: string,
    tokens: number
  ): Promise<DocResponse> {
    // Mock implementation - replace with actual Context7 API call
    const libraryName = libraryID.split('/').pop() || 'unknown';
    const version = this.versionMap[libraryName] || 'latest';

    // Generate mock documentation based on library and topic
    const docContent = this.generateMockDocs(libraryName, topic, tokens);

    return {
      docs: docContent,
      metadata: {
        library: libraryName,
        version,
        topic,
        source: `https://docs.${libraryName}.org`,
        retrieved: new Date().toISOString(),
        cacheStatus: {
          hit: false,
          tier: 'source',
          ageMs: 0
        }
      }
    };
  }

  private generateMockDocs(library: string, topic: string, maxTokens: number): string {
    // Version-specific mock docs for BSI libraries
    const docs: Record<string, Record<string, string>> = {
      'three.js': {
        'BufferGeometry': `## BufferGeometry (Three.js r128)

An efficient representation of mesh, line, or point geometry.
Includes vertex positions, face indices, normals, colors, UVs, and custom attributes.

### Constructor
\`\`\`javascript
const geometry = new THREE.BufferGeometry();
\`\`\`

### Methods (r128)
- .setAttribute(name, attribute) - Sets an attribute
- .getAttribute(name) - Returns the attribute
- .deleteAttribute(name) - Deletes an attribute
- .computeBoundingBox() - Computes bounding box
- .computeBoundingSphere() - Computes bounding sphere
- .dispose() - Frees GPU resources

### Performance Tips for r128
- Reuse geometries across meshes
- Use .dispose() to free memory
- Prefer BufferGeometry over Geometry (deprecated)`,

        'PointsMaterial': `## PointsMaterial (Three.js r128)

Default material for Points.

### Properties
- .color: Color - Default white
- .map: Texture - Point sprite texture
- .size: Number - Point size in pixels
- .sizeAttenuation: Boolean - Size based on camera depth

### Example (r128)
\`\`\`javascript
const material = new THREE.PointsMaterial({
  color: 0xff0000,
  size: 1,
  sizeAttenuation: false
});
\`\`\``,

        'performance': `## Performance Optimization (Three.js r128)

### Key Strategies
1. **Geometry Reuse**: Share geometries between objects
2. **Instancing**: Use InstancedMesh for repeated objects
3. **LOD**: Implement level-of-detail
4. **Frustum Culling**: Automatic in r128
5. **Texture Atlases**: Reduce texture swaps

### Memory Management
- Call .dispose() on geometries, materials, textures
- Remove from scene before disposing
- Monitor renderer.info for stats`
      },

      'recharts': {
        'ResponsiveContainer': `## ResponsiveContainer

Wrapper component that makes charts responsive to parent container size.

### Props
- width: String|Number - Default: '100%'
- height: String|Number - Default: '100%'
- aspect: Number - Aspect ratio
- minWidth: Number - Minimum width
- minHeight: Number - Minimum height
- debounce: Number - Resize debounce in ms

### Usage
\`\`\`jsx
<ResponsiveContainer width="100%" height={400}>
  <LineChart data={data}>
    {/* chart content */}
  </LineChart>
</ResponsiveContainer>
\`\`\`

### Best Practices
- Always wrap charts in ResponsiveContainer
- Set explicit height (not percentage) for predictable layout
- Use aspect ratio for maintaining proportions`,

        'LineChart': `## LineChart

Renders a line chart.

### Props
- data: Array - Chart data
- width: Number - Chart width (handled by ResponsiveContainer)
- height: Number - Chart height (handled by ResponsiveContainer)
- margin: Object - {top, right, bottom, left}
- syncId: String - Sync tooltips across charts

### Example
\`\`\`jsx
<LineChart data={data} margin={{top: 5, right: 30, left: 20, bottom: 5}}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="name" />
  <YAxis />
  <Tooltip />
  <Legend />
  <Line type="monotone" dataKey="value" stroke="#8884d8" />
</LineChart>
\`\`\``
      },

      'chart.js': {
        'radar': `## Radar Chart (Chart.js 4.4.0)

### Configuration
\`\`\`javascript
const config = {
  type: 'radar',
  data: {
    labels: ['Speed', 'Power', 'Technique', 'Stamina', 'Strategy'],
    datasets: [{
      label: 'Player Stats',
      data: [85, 90, 78, 82, 88],
      borderColor: 'rgb(255, 99, 132)',
      backgroundColor: 'rgba(255, 99, 132, 0.2)'
    }]
  },
  options: {
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: { stepSize: 20 }
      }
    }
  }
};
\`\`\``,

        'line options': `## Line Chart Options (Chart.js 4.4.0)

### Scale Configuration
\`\`\`javascript
options: {
  scales: {
    x: {
      type: 'time',
      time: { unit: 'day' }
    },
    y: {
      beginAtZero: true,
      ticks: { callback: (value) => '$' + value }
    }
  },
  plugins: {
    tooltip: {
      callbacks: {
        label: (context) => context.parsed.y.toFixed(2)
      }
    }
  }
}
\`\`\``
      }
    };

    const libDocs = docs[library] || {};
    const topicDocs = libDocs[topic] || `## ${topic}\n\nDocumentation for ${topic} in ${library}.`;

    // Trim to max tokens (rough estimate: 4 chars per token)
    const maxChars = maxTokens * 4;
    return topicDocs.length > maxChars
      ? topicDocs.substring(0, maxChars) + '\n\n[Truncated to fit token limit]'
      : topicDocs;
  }

  private formatDocResponse(data: DocResponse, cacheStatus: any): any {
    return {
      content: [
        {
          type: 'text',
          text: data.docs
        }
      ],
      metadata: {
        ...data.metadata,
        cacheStatus
      }
    };
  }

  private async searchDocumentation(query: string, libraryID?: string): Promise<any> {
    // Mock search implementation
    const results = {
      query,
      scope: libraryID || 'all',
      results: [
        {
          library: 'three.js',
          topic: 'BufferGeometry',
          relevance: 0.95,
          snippet: 'BufferGeometry is the most efficient way to represent geometry...'
        },
        {
          library: 'recharts',
          topic: 'ResponsiveContainer',
          relevance: 0.88,
          snippet: 'ResponsiveContainer makes charts responsive to their parent...'
        }
      ],
      timestamp: new Date().toISOString()
    };

    return results;
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    logger.info('Pure documentation MCP server started');
  }
}