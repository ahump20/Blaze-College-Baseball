/**
 * 🔥 Blaze Postprocessing Effects
 *
 * Advanced postprocessing pipeline with:
 * - Unreal Bloom (selective on burnt orange elements)
 * - Depth of Field (bokeh effect)
 * - Chromatic Aberration
 * - Film Grain + Vignette
 * - Color Grading
 *
 * Requires Three.js and postprocessing library
 *
 * @version 1.0.0
 * @author Austin Humphrey - Blaze Sports Intel
 */

class BlazePostprocessing {
    constructor(scene, camera, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;

        this.effects = {
            bloom: null,
            dof: null,
            chromaticAberration: null,
            filmGrain: null,
            vignette: null,
            colorGrading: null
        };

        this.composer = null;
        this.initialized = false;
    }

    async init() {
        try {
            // Check if postprocessing library is available
            if (typeof EffectComposer === 'undefined') {
                console.warn('Postprocessing library not loaded, using basic renderer');
                return false;
            }

            await this.createEffects();
            this.initialized = true;
            console.log('🔥 Postprocessing pipeline initialized');
            return true;
        } catch (error) {
            console.error('Postprocessing initialization failed:', error);
            return false;
        }
    }

    async createEffects() {
        // Create EffectComposer
        this.composer = new EffectComposer(this.renderer);

        // Render pass (base scene)
        const renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);

        // 1. Bloom Effect (Unreal Bloom with selective glow)
        await this.createBloomEffect();

        // 2. Depth of Field
        await this.createDOFEffect();

        // 3. Chromatic Aberration
        await this.createChromaticAberration();

        // 4. Film Grain
        await this.createFilmGrain();

        // 5. Vignette
        await this.createVignette();

        // 6. Color Grading (Burnt Orange Tint)
        await this.createColorGrading();

        // Combine all effects into one pass
        const effectPass = new EffectPass(
            this.camera,
            this.effects.bloom,
            this.effects.dof,
            this.effects.chromaticAberration,
            this.effects.filmGrain,
            this.effects.vignette,
            this.effects.colorGrading
        );

        effectPass.renderToScreen = true;
        this.composer.addPass(effectPass);
    }

    async createBloomEffect() {
        // Unreal Bloom with burnt orange enhancement
        const bloomEffect = new BloomEffect({
            intensity: 1.2,
            luminanceThreshold: 0.4,
            luminanceSmoothing: 0.7,
            height: 512,
            kernelSize: KernelSize.LARGE,
            blendFunction: BlendFunction.SCREEN
        });

        // Selective bloom on burnt orange colors
        const bloomLayer = new THREE.Layers();
        bloomLayer.set(1); // Layer 1 for bloomable objects

        this.effects.bloom = bloomEffect;
    }

    async createDOFEffect() {
        // Depth of Field with bokeh effect
        const dofEffect = new DepthOfFieldEffect(this.camera, {
            focusDistance: 0.5,
            focalLength: 0.1,
            bokehScale: 3.0,
            height: 480
        });

        // Animate focus based on scroll position
        dofEffect.circleOfConfusionMaterial.defines.PENTAGON = '';

        this.effects.dof = dofEffect;
    }

    async createChromaticAberration() {
        // RGB split for premium feel
        const chromaticAberrationEffect = new ChromaticAberrationEffect({
            offset: new THREE.Vector2(0.0015, 0.0015),
            radialModulation: true,
            modulationOffset: 0.5
        });

        this.effects.chromaticAberration = chromaticAberrationEffect;
    }

    async createFilmGrain() {
        // Add subtle film grain texture
        const filmGrainEffect = new NoiseEffect({
            premultiply: true,
            blendFunction: BlendFunction.OVERLAY
        });

        filmGrainEffect.blendMode.opacity.value = 0.15;

        this.effects.filmGrain = filmGrainEffect;
    }

    async createVignette() {
        // Darkens edges for cinematic feel
        const vignetteEffect = new VignetteEffect({
            offset: 0.35,
            darkness: 0.5
        });

        this.effects.vignette = vignetteEffect;
    }

    async createColorGrading() {
        // Burnt orange color tint
        const colorGradingEffect = new ColorGradingEffect({
            blendFunction: BlendFunction.NORMAL,
            saturation: 0.15,
            exposure: 0.1
        });

        // Add burnt orange tint
        const lut = this.generateBurntOrangeLUT();
        colorGradingEffect.setLUT(lut);

        this.effects.colorGrading = colorGradingEffect;
    }

    generateBurntOrangeLUT() {
        // Generate Look-Up Table for burnt orange color grading
        const size = 16;
        const data = new Uint8Array(size * size * size * 4);

        for (let b = 0; b < size; b++) {
            for (let g = 0; g < size; g++) {
                for (let r = 0; r < size; r++) {
                    const index = (b * size * size + g * size + r) * 4;

                    // Original color
                    let red = r / (size - 1);
                    let green = g / (size - 1);
                    let blue = b / (size - 1);

                    // Apply burnt orange tint
                    red = Math.min(1, red * 1.1 + 0.05); // Boost red
                    green = Math.min(1, green * 0.95 + 0.02); // Slightly reduce green
                    blue = Math.min(1, blue * 0.85); // Reduce blue

                    // Enhance contrast
                    red = (red - 0.5) * 1.1 + 0.5;
                    green = (green - 0.5) * 1.1 + 0.5;
                    blue = (blue - 0.5) * 1.1 + 0.5;

                    data[index] = Math.round(red * 255);
                    data[index + 1] = Math.round(green * 255);
                    data[index + 2] = Math.round(blue * 255);
                    data[index + 3] = 255;
                }
            }
        }

        const texture = new THREE.DataTexture3D(data, size, size, size);
        texture.format = THREE.RGBAFormat;
        texture.type = THREE.UnsignedByteType;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.wrapR = THREE.ClampToEdgeWrapping;
        texture.needsUpdate = true;

        return texture;
    }

    // Animation controls
    animateBloom(intensity, threshold) {
        if (!this.effects.bloom) return;

        // Smooth transition
        const currentIntensity = this.effects.bloom.intensity;
        const currentThreshold = this.effects.bloom.luminanceThreshold;

        this.effects.bloom.intensity = THREE.MathUtils.lerp(currentIntensity, intensity, 0.1);
        this.effects.bloom.luminanceThreshold = THREE.MathUtils.lerp(currentThreshold, threshold, 0.1);
    }

    animateFocus(distance, smoothing = 0.1) {
        if (!this.effects.dof) return;

        const currentFocus = this.effects.dof.target.x;
        this.effects.dof.target.x = THREE.MathUtils.lerp(currentFocus, distance, smoothing);
    }

    setChromaticAberrationStrength(strength) {
        if (!this.effects.chromaticAberration) return;

        this.effects.chromaticAberration.offset.set(strength, strength);
    }

    setFilmGrainIntensity(intensity) {
        if (!this.effects.filmGrain) return;

        this.effects.filmGrain.blendMode.opacity.value = intensity;
    }

    setVignetteDarkness(darkness) {
        if (!this.effects.vignette) return;

        this.effects.vignette.uniforms.get('darkness').value = darkness;
    }

    // Scroll-driven effects
    updateOnScroll(scrollProgress) {
        // scrollProgress: 0-1 based on page scroll

        // Animate bloom (stronger at top, softer as you scroll)
        const bloomIntensity = 1.5 - scrollProgress * 0.5;
        const bloomThreshold = 0.3 + scrollProgress * 0.3;
        this.animateBloom(bloomIntensity, bloomThreshold);

        // Animate focus (DOF changes with scroll)
        const focusDistance = 0.3 + scrollProgress * 0.4;
        this.animateFocus(focusDistance);

        // Chromatic aberration on hero section
        if (scrollProgress < 0.1) {
            this.setChromaticAberrationStrength(0.002);
        } else {
            this.setChromaticAberrationStrength(0.0005);
        }
    }

    // Hover-driven effects for cards
    onCardHover(isHovered) {
        if (isHovered) {
            // Intensify bloom on hover
            this.animateBloom(2.0, 0.2);
        } else {
            // Return to normal
            this.animateBloom(1.2, 0.4);
        }
    }

    // Render
    render(deltaTime) {
        if (this.initialized && this.composer) {
            this.composer.render(deltaTime);
        } else {
            this.renderer.render(this.scene, this.camera);
        }
    }

    // Handle resize
    setSize(width, height) {
        if (this.composer) {
            this.composer.setSize(width, height);
        }
    }

    // Enable/disable specific effects
    toggleEffect(effectName, enabled) {
        if (this.effects[effectName]) {
            this.effects[effectName].enabled = enabled;
        }
    }

    // Cleanup
    destroy() {
        if (this.composer) {
            this.composer.dispose();
        }

        Object.values(this.effects).forEach(effect => {
            if (effect && effect.dispose) {
                effect.dispose();
            }
        });
    }
}

// Lightweight fallback if postprocessing library not available
class BlazePostprocessingFallback {
    constructor(scene, camera, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        console.log('🔥 Using basic renderer (postprocessing not available)');
    }

    async init() {
        return true;
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    setSize(width, height) {
        // Handled by renderer
    }

    updateOnScroll() {}
    onCardHover() {}
    animateBloom() {}
    animateFocus() {}
    setChromaticAberrationStrength() {}
    toggleEffect() {}
    destroy() {}
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BlazePostprocessing, BlazePostprocessingFallback };
} else {
    window.BlazePostprocessing = BlazePostprocessing;
    window.BlazePostprocessingFallback = BlazePostprocessingFallback;
}
