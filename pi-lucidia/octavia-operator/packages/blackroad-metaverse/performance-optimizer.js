/**
 * BlackRoad Metaverse - Performance Optimizer
 * LOD, object pooling, optimization strategies
 */

class PerformanceOptimizer {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.objectPools = {};
        this.lodLevels = new Map();
        this.performanceMode = 'balanced'; // 'low', 'balanced', 'high'
        
        // Performance metrics
        this.metrics = {
            fps: 60,
            drawCalls: 0,
            triangles: 0,
            memory: 0
        };
        
        this.fpsHistory = [];
        this.lastFrameTime = performance.now();
    }
    
    /**
     * Initialize performance monitoring
     */
    init() {
        this.detectPerformanceMode();
        this.setupFPSMonitoring();
        console.log(`⚡ Performance mode: ${this.performanceMode}`);
    }
    
    /**
     * Auto-detect appropriate performance mode
     */
    detectPerformanceMode() {
        const isMobile = /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent);
        const memory = navigator.deviceMemory || 4;
        const cores = navigator.hardwareConcurrency || 2;
        
        if (isMobile || memory < 4 || cores < 4) {
            this.performanceMode = 'low';
        } else if (memory >= 8 && cores >= 8) {
            this.performanceMode = 'high';
        } else {
            this.performanceMode = 'balanced';
        }
        
        this.applyPerformanceSettings();
    }
    
    /**
     * Apply settings based on performance mode
     */
    applyPerformanceSettings() {
        const settings = {
            low: {
                shadowMapSize: 512,
                maxLights: 2,
                maxParticles: 500,
                renderDistance: 100,
                antialiasing: false
            },
            balanced: {
                shadowMapSize: 1024,
                maxLights: 4,
                maxParticles: 1000,
                renderDistance: 200,
                antialiasing: true
            },
            high: {
                shadowMapSize: 2048,
                maxLights: 8,
                maxParticles: 2000,
                renderDistance: 300,
                antialiasing: true
            }
        };
        
        this.settings = settings[this.performanceMode];
        console.log('⚡ Performance settings:', this.settings);
    }
    
    /**
     * Setup FPS monitoring
     */
    setupFPSMonitoring() {
        setInterval(() => {
            const now = performance.now();
            const delta = now - this.lastFrameTime;
            this.lastFrameTime = now;
            
            const fps = Math.round(1000 / delta);
            this.fpsHistory.push(fps);
            
            if (this.fpsHistory.length > 60) {
                this.fpsHistory.shift();
            }
            
            this.metrics.fps = Math.round(
                this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length
            );
            
            // Auto-adjust if FPS drops
            if (this.metrics.fps < 30 && this.performanceMode !== 'low') {
                console.warn('⚠️ Low FPS detected, reducing quality');
                this.degradeQuality();
            }
        }, 1000);
    }
    
    /**
     * Create object pool for reusable objects
     */
    createPool(name, factory, initialSize = 10) {
        if (!this.objectPools[name]) {
            this.objectPools[name] = {
                available: [],
                inUse: [],
                factory: factory
            };
            
            // Pre-create objects
            for (let i = 0; i < initialSize; i++) {
                const obj = factory();
                obj.visible = false;
                this.objectPools[name].available.push(obj);
                this.scene.add(obj);
            }
        }
    }
    
    /**
     * Get object from pool
     */
    getFromPool(poolName) {
        const pool = this.objectPools[poolName];
        if (!pool) return null;
        
        let obj;
        if (pool.available.length > 0) {
            obj = pool.available.pop();
        } else {
            obj = pool.factory();
            this.scene.add(obj);
        }
        
        obj.visible = true;
        pool.inUse.push(obj);
        return obj;
    }
    
    /**
     * Return object to pool
     */
    returnToPool(poolName, obj) {
        const pool = this.objectPools[poolName];
        if (!pool) return;
        
        const index = pool.inUse.indexOf(obj);
        if (index > -1) {
            pool.inUse.splice(index, 1);
            obj.visible = false;
            pool.available.push(obj);
        }
    }
    
    /**
     * Setup LOD (Level of Detail) for object
     */
    setupLOD(object, lodDistances = [50, 100, 200]) {
        const lodGroup = {
            object: object,
            distances: lodDistances,
            levels: []
        };
        
        // Store original geometry
        lodGroup.levels.push({
            distance: 0,
            geometry: object.geometry.clone(),
            quality: 'high'
        });
        
        // Create simplified versions
        lodGroup.levels.push({
            distance: lodDistances[0],
            geometry: this.simplifyGeometry(object.geometry, 0.5),
            quality: 'medium'
        });
        
        lodGroup.levels.push({
            distance: lodDistances[1],
            geometry: this.simplifyGeometry(object.geometry, 0.25),
            quality: 'low'
        });
        
        this.lodLevels.set(object.uuid, lodGroup);
    }
    
    /**
     * Update LOD based on camera distance
     */
    updateLOD() {
        this.lodLevels.forEach((lodGroup, uuid) => {
            const distance = this.camera.position.distanceTo(lodGroup.object.position);
            
            let selectedLevel = lodGroup.levels[0];
            for (let i = lodGroup.levels.length - 1; i >= 0; i--) {
                if (distance >= lodGroup.levels[i].distance) {
                    selectedLevel = lodGroup.levels[i];
                    break;
                }
            }
            
            if (lodGroup.object.geometry !== selectedLevel.geometry) {
                lodGroup.object.geometry = selectedLevel.geometry;
            }
        });
    }
    
    /**
     * Simplify geometry (basic implementation)
     */
    simplifyGeometry(geometry, ratio) {
        // Clone and reduce vertices
        const simplified = geometry.clone();
        // In production, use proper decimation algorithm
        return simplified;
    }
    
    /**
     * Frustum culling - hide objects outside view
     */
    updateFrustumCulling() {
        const frustum = new THREE.Frustum();
        const matrix = new THREE.Matrix4().multiplyMatrices(
            this.camera.projectionMatrix,
            this.camera.matrixWorldInverse
        );
        frustum.setFromProjectionMatrix(matrix);
        
        this.scene.traverse((object) => {
            if (object.isMesh) {
                object.visible = frustum.intersectsObject(object);
            }
        });
    }
    
    /**
     * Degrade quality when FPS drops
     */
    degradeQuality() {
        if (this.performanceMode === 'high') {
            this.performanceMode = 'balanced';
        } else if (this.performanceMode === 'balanced') {
            this.performanceMode = 'low';
        }
        
        this.applyPerformanceSettings();
    }
    
    /**
     * Get current performance metrics
     */
    getMetrics() {
        if (this.scene.info) {
            this.metrics.drawCalls = this.scene.info.render.calls;
            this.metrics.triangles = this.scene.info.render.triangles;
        }
        
        if (performance.memory) {
            this.metrics.memory = Math.round(performance.memory.usedJSHeapSize / 1048576);
        }
        
        return this.metrics;
    }
    
    /**
     * Update optimization systems
     */
    update() {
        this.updateLOD();
        // Frustum culling is expensive, run less frequently
        if (Math.random() < 0.1) {
            this.updateFrustumCulling();
        }
    }
}
