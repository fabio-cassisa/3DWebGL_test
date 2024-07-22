import {
    ViewerApp,
    AssetManagerPlugin,
    addBasePlugins,
    VirtualCamerasPlugin,
    MeshBasicMaterial2,
    PlaneGeometry,
    Mesh,
    PerspectiveCamera,
    PopmotionPlugin,
    LinearSRGBColorSpace,
    SRGBColorSpace,
  } from "https://dist.pixotronics.com/webgi/runtime/bundle-0.9.0.mjs";
  
  // Note: There is color difference because of tonemapping, check this: https://threepipe.org/examples/#virtual-camera/
  async function setupViewer() {
    // Initialize the viewer
    const viewer = new ViewerApp({
      canvas: document.getElementById("mcanvas")
    });
  
    // Add all the plugins at once
    await addBasePlugins(viewer);
  
    const popmotion = await viewer.getOrAddPlugin(PopmotionPlugin)
  
    // Load a 3d model.
    await viewer.load( "https://threejs.org/examples/models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf",
      {autoScale: true, autoCenter: true}
    );
  
    // Load an environment map
    await viewer.setEnvironmentMap("https://threejs.org/examples/textures/equirectangular/venice_sunset_1k.hdr"
    );
    
    const plane = new Mesh(
      new PlaneGeometry(5, 5)
      .translate(0, 0, -4),
      new MeshBasicMaterial2({
        color: '#ffffff',
      })
    )
    plane.castShadow = false
    plane.receiveShadow = true
    viewer.scene.modelRoot.add(plane)
  
    const camera = viewer.createCamera(
      new PerspectiveCamera(45, 1, 0.5, 20)
    );
    viewer.scene.modelRoot.add(camera.cameraObject);
    camera.setCameraOptions({ controlsMode: "orbit" });
    camera.position.set(3, 3, 3);
    camera.target.set(0, 0, 0);
    camera.positionUpdated(true);
    camera.userData.autoLookAtTarget = true; 
    camera.setDirty();
  
    const virtualCameras = await viewer.getOrAddPlugin(
      VirtualCamerasPlugin
    );
    const vCam = virtualCameras.addCamera(camera);
    vCam.target.texture.colorSpace = LinearSRGBColorSpace
    plane.material.map = vCam.target.texture
    
    popmotion.animate({
          from: 0,
          to: 1,
          repeat: Infinity,
          duration: 6000,
          onUpdate: (v)=>{
              // Set camera position xz in a circle around the target
              const angle = v * Math.PI * 2 + Math.PI / 2
              const radius = 5
            camera.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius)
              camera.positionUpdated()
              viewer.setDirty() // since camera is not in the scene
          },
      })
    
  }
  
  setupViewer();
  