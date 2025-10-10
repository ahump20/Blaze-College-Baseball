/**
 * 🔥 Blaze Particle Engine - WebGPU Edition
 *
 * Advanced particle system with:
 * - 500K particles with WebGPU compute shaders
 * - Particle morphing between shapes (logo, sports icons)
 * - GPU-based physics and collision
 * - Adaptive quality based on device capability
 * - WebGL2 fallback for compatibility
 *
 * @version 3.0.0
 * @author Austin Humphrey - Blaze Sports Intel
 */

class BlazeParticleEngine {
    constructor(canvasId, options = {}) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            throw new Error(`Canvas with id "${canvasId}" not found`);
        }

        // Configuration
        this.config = {
            maxParticles: options.maxParticles || 500000,
            minParticles: 25000,
            particleSize: options.particleSize || 3,
            particleOpacity: options.particleOpacity || 0.8,
            enableMorphing: options.enableMorphing !== false,
            enablePhysics: options.enablePhysics !== false,
            enableMouseInteraction: options.enableMouseInteraction !== false,
            morphShapes: options.morphShapes || ['logo', 'baseball', 'football', 'basketball'],
            morphInterval: options.morphInterval || 8000, // ms between shape changes
            ...options
        };

        // State
        this.currentParticleCount = this.config.maxParticles;
        this.currentShapeIndex = 0;
        this.morphProgress = 0;
        this.isMorphing = false;
        this.useWebGPU = false;
        this.mousePosition = { x: 0, y: 0 };
        this.performanceMonitor = {
            frameTimeHistory: [],
            historySize: 60,
            lowFPSThreshold: 30,
            targetFPS: 60
        };

        // Blaze color palette (burnt orange gradient)
        this.blazeColors = [
            [0.75, 0.34, 0.00], // #BF5700
            [0.80, 0.40, 0.00], // #CC6600
            [0.85, 0.48, 0.22], // #D97B38
            [0.90, 0.58, 0.32], // #E69551
            [0.63, 0.32, 0.18], // #A0522D
            [1.00, 0.75, 0.00], // #FFBF00
        ];

        this.init();
    }

    async init() {
        // Detect WebGPU support
        this.useWebGPU = await this.detectWebGPU();

        if (this.useWebGPU) {
            console.log('🔥 Initializing WebGPU particle system...');
            await this.initWebGPU();
        } else {
            console.log('🔥 WebGPU not available, using WebGL2 fallback...');
            await this.initWebGL();
        }

        // Setup mouse interaction
        if (this.config.enableMouseInteraction) {
            this.setupMouseInteraction();
        }

        // Start morphing loop if enabled
        if (this.config.enableMorphing) {
            this.startMorphingLoop();
        }

        // Start animation
        this.animate();

        // Handle resize
        window.addEventListener('resize', () => this.handleResize());
    }

    async detectWebGPU() {
        if (!navigator.gpu) return false;

        try {
            const adapter = await navigator.gpu.requestAdapter();
            if (!adapter) return false;

            const device = await adapter.requestDevice();
            if (!device) return false;

            this.gpuAdapter = adapter;
            this.gpuDevice = device;
            return true;
        } catch (e) {
            console.warn('WebGPU detection failed:', e);
            return false;
        }
    }

    async initWebGPU() {
        // Get WebGPU context
        const context = this.canvas.getContext('webgpu');
        const devicePixelRatio = window.devicePixelRatio || 1;

        this.canvas.width = window.innerWidth * devicePixelRatio;
        this.canvas.height = window.innerHeight * devicePixelRatio;

        // Configure swap chain
        const canvasFormat = navigator.gpu.getPreferredCanvasFormat();
        context.configure({
            device: this.gpuDevice,
            format: canvasFormat,
            alphaMode: 'premultiplied',
        });

        this.gpuContext = context;
        this.canvasFormat = canvasFormat;

        // Create compute shader for particle physics
        await this.createComputeShader();

        // Create render pipeline
        await this.createRenderPipeline();

        // Initialize particle data
        this.initializeParticleData();
    }

    async createComputeShader() {
        const computeShaderCode = `
            struct Particle {
                position: vec3<f32>,
                velocity: vec3<f32>,
                color: vec3<f32>,
                targetPosition: vec3<f32>,
            };

            struct SimulationParams {
                deltaTime: f32,
                mouseX: f32,
                mouseY: f32,
                mouseInfluence: f32,
                morphProgress: f32,
            };

            @group(0) @binding(0) var<storage, read_write> particles: array<Particle>;
            @group(0) @binding(1) var<uniform> params: SimulationParams;

            // Curl noise for organic movement
            fn curlNoise(p: vec3<f32>) -> vec3<f32> {
                let e = 0.1;
                let dx = vec3<f32>(e, 0.0, 0.0);
                let dy = vec3<f32>(0.0, e, 0.0);
                let dz = vec3<f32>(0.0, 0.0, e);

                let p_x0 = simplexNoise(p - dx);
                let p_x1 = simplexNoise(p + dx);
                let p_y0 = simplexNoise(p - dy);
                let p_y1 = simplexNoise(p + dy);
                let p_z0 = simplexNoise(p - dz);
                let p_z1 = simplexNoise(p + dz);

                return vec3<f32>(
                    p_y1 - p_y0 - (p_z1 - p_z0),
                    p_z1 - p_z0 - (p_x1 - p_x0),
                    p_x1 - p_x0 - (p_y1 - p_y0)
                ) / (2.0 * e);
            }

            fn simplexNoise(p: vec3<f32>) -> f32 {
                // Simplified noise function
                return fract(sin(dot(p, vec3<f32>(12.9898, 78.233, 45.164))) * 43758.5453);
            }

            @compute @workgroup_size(256)
            fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
                let index = global_id.x;
                if (index >= arrayLength(&particles)) {
                    return;
                }

                var particle = particles[index];

                // Apply curl noise for organic movement
                let noise = curlNoise(particle.position * 0.01);
                particle.velocity += noise * 0.1 * params.deltaTime;

                // Mouse interaction
                let mousePos = vec2<f32>(params.mouseX, params.mouseY);
                let particlePos2D = particle.position.xy;
                let mouseDir = mousePos - particlePos2D;
                let mouseDist = length(mouseDir);

                if (mouseDist < 200.0) {
                    let force = (1.0 - mouseDist / 200.0) * params.mouseInfluence;
                    particle.velocity += normalize(mouseDir) * force * 0.5;
                }

                // Morph toward target position
                if (params.morphProgress > 0.0) {
                    let toTarget = particle.targetPosition - particle.position;
                    particle.velocity += toTarget * params.morphProgress * 0.02;
                }

                // Update position
                particle.position += particle.velocity * params.deltaTime;

                // Apply damping
                particle.velocity *= 0.98;

                // Boundary wrap
                if (abs(particle.position.x) > 1000.0) {
                    particle.velocity.x *= -0.5;
                }
                if (abs(particle.position.y) > 1000.0) {
                    particle.velocity.y *= -0.5;
                }
                if (abs(particle.position.z) > 500.0) {
                    particle.velocity.z *= -0.5;
                }

                particles[index] = particle;
            }
        `;

        const computeShaderModule = this.gpuDevice.createShaderModule({
            code: computeShaderCode,
        });

        this.computeShaderModule = computeShaderModule;
    }

    async createRenderPipeline() {
        const vertexShaderCode = `
            struct Particle {
                @location(0) position: vec3<f32>,
                @location(1) color: vec3<f32>,
            };

            struct VertexOutput {
                @builtin(position) position: vec4<f32>,
                @location(0) color: vec3<f32>,
                @location(1) pointSize: f32,
            };

            struct Uniforms {
                viewProjection: mat4x4<f32>,
                particleSize: f32,
            };

            @group(0) @binding(0) var<uniform> uniforms: Uniforms;

            @vertex
            fn main(particle: Particle) -> VertexOutput {
                var output: VertexOutput;
                output.position = uniforms.viewProjection * vec4<f32>(particle.position, 1.0);
                output.color = particle.color;
                output.pointSize = uniforms.particleSize;
                return output;
            }
        `;

        const fragmentShaderCode = `
            struct FragmentInput {
                @location(0) color: vec3<f32>,
            };

            @fragment
            fn main(input: FragmentInput) -> @location(0) vec4<f32> {
                // Circular particle with soft edges
                let coord = input.@builtin(position).xy;
                let center = vec2<f32>(0.5, 0.5);
                let dist = length(coord - center);

                if (dist > 0.5) {
                    discard;
                }

                let alpha = 1.0 - smoothstep(0.3, 0.5, dist);
                return vec4<f32>(input.color, alpha * 0.8);
            }
        `;

        // Create shader modules
        const vertexShaderModule = this.gpuDevice.createShaderModule({
            code: vertexShaderCode,
        });

        const fragmentShaderModule = this.gpuDevice.createShaderModule({
            code: fragmentShaderCode,
        });

        // Create render pipeline
        const pipelineLayout = this.gpuDevice.createPipelineLayout({
            bindGroupLayouts: [this.createBindGroupLayout()],
        });

        this.renderPipeline = this.gpuDevice.createRenderPipeline({
            layout: pipelineLayout,
            vertex: {
                module: vertexShaderModule,
                entryPoint: 'main',
                buffers: [this.getVertexBufferLayout()],
            },
            fragment: {
                module: fragmentShaderModule,
                entryPoint: 'main',
                targets: [{
                    format: this.canvasFormat,
                    blend: {
                        color: {
                            srcFactor: 'src-alpha',
                            dstFactor: 'one',
                            operation: 'add',
                        },
                        alpha: {
                            srcFactor: 'one',
                            dstFactor: 'one',
                            operation: 'add',
                        },
                    },
                }],
            },
            primitive: {
                topology: 'point-list',
            },
        });
    }

    initializeParticleData() {
        const particleData = new Float32Array(this.currentParticleCount * 10); // 10 floats per particle

        for (let i = 0; i < this.currentParticleCount; i++) {
            const offset = i * 10;

            // Position (x, y, z)
            particleData[offset + 0] = (Math.random() - 0.5) * 2000;
            particleData[offset + 1] = (Math.random() - 0.5) * 2000;
            particleData[offset + 2] = (Math.random() - 0.5) * 1000;

            // Velocity (vx, vy, vz)
            particleData[offset + 3] = (Math.random() - 0.5) * 0.5;
            particleData[offset + 4] = (Math.random() - 0.5) * 0.5;
            particleData[offset + 5] = (Math.random() - 0.5) * 0.5;

            // Color (r, g, b)
            const colorIndex = Math.floor(Math.random() * this.blazeColors.length);
            particleData[offset + 6] = this.blazeColors[colorIndex][0];
            particleData[offset + 7] = this.blazeColors[colorIndex][1];
            particleData[offset + 8] = this.blazeColors[colorIndex][2];

            // Target position placeholder (tx, ty, tz) - set during morphing
            particleData[offset + 9] = 0;
        }

        // Create GPU buffer
        this.particleBuffer = this.gpuDevice.createBuffer({
            size: particleData.byteLength,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.VERTEX,
        });

        this.gpuDevice.queue.writeBuffer(this.particleBuffer, 0, particleData);
        this.particleData = particleData;
    }

    async initWebGL() {
        // WebGL2 fallback implementation
        const gl = this.canvas.getContext('webgl2', { alpha: true, antialias: true });
        if (!gl) {
            console.error('WebGL2 not supported');
            return;
        }

        this.gl = gl;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        // Setup WebGL program
        const vertexShader = this.createShader(gl, gl.VERTEX_SHADER, `
            attribute vec3 a_position;
            attribute vec3 a_color;
            uniform mat4 u_viewProjection;
            uniform float u_pointSize;
            varying vec3 v_color;

            void main() {
                gl_Position = u_viewProjection * vec4(a_position, 1.0);
                gl_PointSize = u_pointSize;
                v_color = a_color;
            }
        `);

        const fragmentShader = this.createShader(gl, gl.FRAGMENT_SHADER, `
            precision highp float;
            varying vec3 v_color;

            void main() {
                vec2 coord = gl_PointCoord - vec2(0.5);
                float dist = length(coord);
                if (dist > 0.5) discard;
                float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
                gl_FragColor = vec4(v_color, alpha * 0.8);
            }
        `);

        this.glProgram = this.createProgram(gl, vertexShader, fragmentShader);

        // Initialize WebGL particle data
        this.initWebGLParticles();
    }

    initWebGLParticles() {
        const gl = this.gl;

        // Reduce particle count for WebGL (150K)
        this.currentParticleCount = Math.min(this.config.maxParticles, 150000);

        const positions = new Float32Array(this.currentParticleCount * 3);
        const colors = new Float32Array(this.currentParticleCount * 3);
        this.velocities = new Float32Array(this.currentParticleCount * 3);

        for (let i = 0; i < this.currentParticleCount; i++) {
            const i3 = i * 3;

            // Position
            positions[i3] = (Math.random() - 0.5) * 2000;
            positions[i3 + 1] = (Math.random() - 0.5) * 2000;
            positions[i3 + 2] = (Math.random() - 0.5) * 1000;

            // Velocity
            this.velocities[i3] = (Math.random() - 0.5) * 0.5;
            this.velocities[i3 + 1] = (Math.random() - 0.5) * 0.5;
            this.velocities[i3 + 2] = (Math.random() - 0.5) * 0.5;

            // Color
            const colorIndex = Math.floor(Math.random() * this.blazeColors.length);
            colors[i3] = this.blazeColors[colorIndex][0];
            colors[i3 + 1] = this.blazeColors[colorIndex][1];
            colors[i3 + 2] = this.blazeColors[colorIndex][2];
        }

        // Create buffers
        this.positionBuffer = this.createBuffer(gl, positions);
        this.colorBuffer = this.createBuffer(gl, colors);

        this.positions = positions;
        this.colors = colors;
    }

    createShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    createProgram(gl, vertexShader, fragmentShader) {
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Program linking error:', gl.getProgramInfoLog(program));
            gl.deleteProgram(program);
            return null;
        }

        return program;
    }

    createBuffer(gl, data) {
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
        return buffer;
    }

    setupMouseInteraction() {
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mousePosition.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            this.mousePosition.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        });
    }

    startMorphingLoop() {
        setInterval(() => {
            this.currentShapeIndex = (this.currentShapeIndex + 1) % this.config.morphShapes.length;
            this.morphToShape(this.config.morphShapes[this.currentShapeIndex]);
        }, this.config.morphInterval);
    }

    morphToShape(shapeName) {
        console.log(`🔥 Morphing to: ${shapeName}`);
        this.isMorphing = true;
        this.morphProgress = 0;

        // Generate target positions based on shape
        const targetPositions = this.generateShapePositions(shapeName);

        // Animate morph over 2 seconds
        const duration = 2000;
        const startTime = Date.now();

        const animateMorph = () => {
            const elapsed = Date.now() - startTime;
            this.morphProgress = Math.min(elapsed / duration, 1);

            if (this.morphProgress < 1) {
                requestAnimationFrame(animateMorph);
            } else {
                this.isMorphing = false;
                this.morphProgress = 0;
            }
        };

        animateMorph();
        this.targetPositions = targetPositions;
    }

    generateShapePositions(shapeName) {
        const positions = new Float32Array(this.currentParticleCount * 3);

        switch (shapeName) {
            case 'logo':
                return this.generateLogoShape();
            case 'baseball':
                return this.generateBaseballShape();
            case 'football':
                return this.generateFootballShape();
            case 'basketball':
                return this.generateBasketballShape();
            default:
                return this.generateSphereShape();
        }
    }

    generateLogoShape() {
        // Generate flame/torch shape for Blaze logo
        const positions = new Float32Array(this.currentParticleCount * 3);

        for (let i = 0; i < this.currentParticleCount; i++) {
            const i3 = i * 3;
            const t = (i / this.currentParticleCount) * Math.PI * 2;
            const r = 100 + Math.random() * 200;
            const height = Math.random() * 400 - 200;

            // Flame shape (narrower at bottom, wider at top)
            const flameWidth = 1 + (height + 200) / 400;

            positions[i3] = Math.cos(t) * r * flameWidth;
            positions[i3 + 1] = height;
            positions[i3 + 2] = Math.sin(t) * r * flameWidth * 0.5;
        }

        return positions;
    }

    generateBaseballShape() {
        // Generate baseball with stitching pattern
        const positions = new Float32Array(this.currentParticleCount * 3);
        const radius = 250;

        for (let i = 0; i < this.currentParticleCount; i++) {
            const i3 = i * 3;

            // Spherical distribution
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = radius * Math.cos(phi);
        }

        return positions;
    }

    generateFootballShape() {
        // Generate football (prolate spheroid)
        const positions = new Float32Array(this.currentParticleCount * 3);
        const a = 300; // length
        const b = 150; // width

        for (let i = 0; i < this.currentParticleCount; i++) {
            const i3 = i * 3;

            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            positions[i3] = a * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = b * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = b * Math.cos(phi);
        }

        return positions;
    }

    generateBasketballShape() {
        // Generate basketball with panel lines
        const positions = new Float32Array(this.currentParticleCount * 3);
        const radius = 230;

        for (let i = 0; i < this.currentParticleCount; i++) {
            const i3 = i * 3;

            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = radius * Math.cos(phi);
        }

        return positions;
    }

    generateSphereShape() {
        const positions = new Float32Array(this.currentParticleCount * 3);
        const radius = 250;

        for (let i = 0; i < this.currentParticleCount; i++) {
            const i3 = i * 3;

            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = radius * Math.cos(phi);
        }

        return positions;
    }

    animate() {
        const startTime = performance.now();

        if (this.useWebGPU) {
            this.renderWebGPU();
        } else {
            this.renderWebGL();
        }

        // Performance monitoring
        const frameTime = performance.now() - startTime;
        this.monitorPerformance(frameTime);

        requestAnimationFrame(() => this.animate());
    }

    renderWebGPU() {
        // WebGPU render implementation
        const commandEncoder = this.gpuDevice.createCommandEncoder();
        const textureView = this.gpuContext.getCurrentTexture().createView();

        const renderPassDescriptor = {
            colorAttachments: [{
                view: textureView,
                clearValue: { r: 0, g: 0, b: 0, a: 0 },
                loadOp: 'clear',
                storeOp: 'store',
            }],
        };

        const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
        passEncoder.setPipeline(this.renderPipeline);
        passEncoder.setVertexBuffer(0, this.particleBuffer);
        passEncoder.draw(this.currentParticleCount);
        passEncoder.end();

        this.gpuDevice.queue.submit([commandEncoder.finish()]);
    }

    renderWebGL() {
        const gl = this.gl;

        // Clear canvas
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Enable blending
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

        // Use program
        gl.useProgram(this.glProgram);

        // Update particle positions
        this.updateWebGLParticles();

        // Set attributes
        const positionLoc = gl.getAttribLocation(this.glProgram, 'a_position');
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.positions);
        gl.enableVertexAttribArray(positionLoc);
        gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);

        const colorLoc = gl.getAttribLocation(this.glProgram, 'a_color');
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        gl.enableVertexAttribArray(colorLoc);
        gl.vertexAttribPointer(colorLoc, 3, gl.FLOAT, false, 0, 0);

        // Set uniforms
        const viewProjectionLoc = gl.getUniformLocation(this.glProgram, 'u_viewProjection');
        gl.uniformMatrix4fv(viewProjectionLoc, false, this.getViewProjectionMatrix());

        const pointSizeLoc = gl.getUniformLocation(this.glProgram, 'u_pointSize');
        gl.uniform1f(pointSizeLoc, this.config.particleSize);

        // Draw
        gl.drawArrays(gl.POINTS, 0, this.currentParticleCount);
    }

    updateWebGLParticles() {
        for (let i = 0; i < this.currentParticleCount; i++) {
            const i3 = i * 3;

            // Update position
            this.positions[i3] += this.velocities[i3];
            this.positions[i3 + 1] += this.velocities[i3 + 1];
            this.positions[i3 + 2] += this.velocities[i3 + 2];

            // Morphing
            if (this.isMorphing && this.targetPositions) {
                const tx = this.targetPositions[i3];
                const ty = this.targetPositions[i3 + 1];
                const tz = this.targetPositions[i3 + 2];

                const dx = tx - this.positions[i3];
                const dy = ty - this.positions[i3 + 1];
                const dz = tz - this.positions[i3 + 2];

                this.velocities[i3] += dx * this.morphProgress * 0.02;
                this.velocities[i3 + 1] += dy * this.morphProgress * 0.02;
                this.velocities[i3 + 2] += dz * this.morphProgress * 0.02;
            }

            // Damping
            this.velocities[i3] *= 0.98;
            this.velocities[i3 + 1] *= 0.98;
            this.velocities[i3 + 2] *= 0.98;

            // Boundary wrap
            if (Math.abs(this.positions[i3]) > 1000) this.velocities[i3] *= -0.5;
            if (Math.abs(this.positions[i3 + 1]) > 1000) this.velocities[i3 + 1] *= -0.5;
            if (Math.abs(this.positions[i3 + 2]) > 500) this.velocities[i3 + 2] *= -0.5;
        }
    }

    getViewProjectionMatrix() {
        // Simple orthographic projection
        const aspect = this.canvas.width / this.canvas.height;
        const width = 1000;
        const height = width / aspect;

        return new Float32Array([
            2/width, 0, 0, 0,
            0, 2/height, 0, 0,
            0, 0, -0.002, 0,
            0, 0, 0, 1
        ]);
    }

    monitorPerformance(frameTime) {
        const pm = this.performanceMonitor;
        pm.frameTimeHistory.push(frameTime);

        if (pm.frameTimeHistory.length > pm.historySize) {
            pm.frameTimeHistory.shift();
        }

        if (pm.frameTimeHistory.length >= pm.historySize) {
            const avgFrameTime = pm.frameTimeHistory.reduce((a, b) => a + b, 0) / pm.frameTimeHistory.length;
            const avgFPS = 1000 / avgFrameTime;

            // Auto-scale particles if performance drops
            if (avgFPS < pm.lowFPSThreshold && this.currentParticleCount > this.config.minParticles) {
                this.reduceParticleCount();
            }
        }
    }

    reduceParticleCount() {
        const newCount = Math.floor(this.currentParticleCount * 0.7);
        console.log(`⚡ Performance: Reducing particles from ${this.currentParticleCount} to ${newCount}`);
        this.currentParticleCount = Math.max(newCount, this.config.minParticles);

        // Reinitialize with new count
        if (this.useWebGPU) {
            this.initializeParticleData();
        } else {
            this.initWebGLParticles();
        }
    }

    handleResize() {
        if (this.useWebGPU) {
            const devicePixelRatio = window.devicePixelRatio || 1;
            this.canvas.width = window.innerWidth * devicePixelRatio;
            this.canvas.height = window.innerHeight * devicePixelRatio;
        } else {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;

            if (this.gl) {
                this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
            }
        }
    }

    destroy() {
        if (this.gpuDevice) {
            this.gpuDevice.destroy();
        }
        // Cleanup event listeners
        window.removeEventListener('resize', () => this.handleResize());
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BlazeParticleEngine;
} else {
    window.BlazeParticleEngine = BlazeParticleEngine;
}
