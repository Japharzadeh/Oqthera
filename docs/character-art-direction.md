# Oqthera Character Art & Technical Specification

Version: 1.0  
Target: LAST STATION: EARTH, browser-based 3D character creator  
Implementation branch: `feature/game-backend`

## 1. Visual target

Characters should read as grounded, cinematic survival-game protagonists, not stylized primitives. The target is realistic real-time rendering at medium desktop settings, with a scalable fallback for integrated GPUs and mobile devices. Do not label the current procedural preview as production-quality realism.

### Art direction
- Narrative: post-collapse Earth, year 2089; resource scarcity, field repairs, exposure, dust, and practical equipment.
- Silhouette: believable human proportions; distinct but natural masculine, feminine, and androgynous body proportions; no exaggerated superhero anatomy.
- Materials: physically based rendering (base color, normal, roughness, ambient occlusion; metallic where applicable). Skin should use subtle roughness variation and, where supported, subsurface scattering. Avoid uniformly glossy skin and flat single-color surfaces.
- Lighting: soft key, restrained fill, cool rim; neutral inspection light option so skin and fabric colors remain readable.
- Palette: charcoal, weathered olive, muted sand, cold slate, faded navy, rust-orange emergency accents, and signal teal.
- Surface storytelling: seams, reinforced elbows/knees, stitching, patches, abrasion, dust masks and repair details. Wear must be texture-driven, not random floating marks.

## 2. Character asset deliverables

### Human base models
Create separate male and female production meshes, plus a proportion-neutral option where practical. Each base should include:
- Clean quad-dominant topology around eyes, mouth, shoulders, elbows, hips, knees and fingers.
- UVs with consistent texel density; facial UVs should support close-up inspection.
- PBR texture set: base color, normal, roughness, ambient occlusion; optional packed ORM and skin subsurface profile.
- Facial features sculpted into the mesh, with eyelids, lips, nostrils and ears that hold up in close shots.
- LOD0 close-up target: approximately 45k–90k triangles for the body/head combined, excluding hair and outfit; lower LODs created for gameplay.
- Realistic hands and feet; no disconnected spheres/cylinders used as visible anatomy.

### Hair
Hair must be visibly different between masculine and feminine style families while remaining selectable across gender presentations. Use groomed hair cards or authored hair meshes with alpha/strand textures and physically plausible silhouette. Avoid clusters of spheres.
Initial style library:
- Masculine: short crop, textured crop, swept-back, curly short, shaved, medium messy.
- Feminine: bob, shoulder-length, tied-back, long layered, braided, short textured.
- Shared: shaved, short curly, windswept, tied-back.
Each hairstyle is a separate asset with a compatible head fit, material, and documented clipping exceptions.

### Modular wardrobe
Initial selectable outfits:
1. Station Utility — base survival uniform with repaired seams and reinforced panels.
2. Tactical Field Jacket — layered jacket, webbing, cargo trousers and gloves.
3. Desert Survival — breathable sand-colored layers, neck protection and dust scarf.
4. Research Uniform — lighter technical clothing, instrument harness and ID panel.
5. Stealth Layers — low-reflectance fabric, minimal hard surfaces.
6. Insulated Expedition — padded layers and cold-weather gloves.
7. Medical / Rescue — field jacket with utility pouch and high-visibility but weathered markers.

Each outfit needs a body-compatible fit, independent material slots, believable thickness at hems/collars, and separate optional accessories. Color selection must recolor material slots without changing the selected garment geometry. Outfit meshes must not intersect the body at normal idle poses.

### Accessories and wear
Optional modular items: respirator, comms headset, goggles/visor, backpack, gloves, utility belt, shoulder radio, holster-like utility pouch (non-weapon emphasis), patches, scars, tattoos and dirt overlays. Attachments use named sockets; skin details use decals or texture layers.

## 3. Rig and animation contract

- One humanoid skeleton naming convention shared by the base body, compatible clothing, and hair/accessories where skinned.
- Required joints: root, pelvis, spine chain, neck, head, clavicles, upper/lower arms, hands, finger chains, upper/lower legs, feet and toes.
- Export as glTF 2.0 / GLB, meters as units, Y-up in glTF, forward-facing convention documented and consistent.
- Rest pose: A-pose; transforms applied; no negative scale; skin weights normalized; maximum four influences per vertex for broad compatibility.
- Face: blend shapes/morph targets for blink, jaw open, smile/frown, brow raise and phoneme-ready mouth shapes where feasible.
- Animation validation: idle, walk, run, crouch, turn, reach, and equipment interaction. Test elbows, shoulders, hips and knees for deformation.
- Wardrobe should share the compatible armature. Do not simply position a separate skinned garment beside the base model; it must be skinned to the same skeleton or explicitly retargeted.

## 4. Browser asset and performance contract

- Format: GLB / glTF 2.0, loaded with Three.js GLTFLoader.
- Use a manifest to map gender/body preset, hair style, outfit, and optional accessories to versioned assets.
- Use KTX2/Basis texture compression and meshopt compression when the build pipeline supports them; retain a non-compressed development path.
- Suggested budgets: body + selected outfit 12–20 MB compressed, hair 2–5 MB, optional accessories 1–4 MB. Keep a lower-detail fallback for constrained devices.
- Load only selected assets, cache successful loads, dispose replaced GPU resources safely, and display a recoverable fallback if an asset is missing.
- Never silently claim realism while the renderer is using the procedural fallback.
- Store the player's choices as a versioned JSON profile; store asset IDs rather than absolute URLs or full mesh data.

## 5. Required asset package layout

```text
static/characters/
  manifest.json
  README.md
  male/
    base.glb
  female/
    base.glb
  hair/
    male/
    female/
    shared/
  outfits/
    station-utility/
    tactical-field/
    desert-survival/
    research-uniform/
    stealth-layers/
    insulated-expedition/
    medical-rescue/
  accessories/
  textures/
```

The directories above describe the target package. Empty or missing asset files are expected until the custom meshes are authored and exported. Do not create placeholder binary files.

## 6. Acceptance checklist

- [ ] Male and female base models have visibly distinct, anatomically plausible proportions.
- [ ] Close-up facial inspection shows sculpted facial anatomy and authored textures, not primitive approximations.
- [ ] Hair style changes swap a real hair asset; female presets do not reuse a male-only silhouette by default.
- [ ] Outfit selection swaps actual garment geometry, not just the base color.
- [ ] Color controls affect the intended material slots only.
- [ ] Character rotates and zooms smoothly; camera reset works.
- [ ] Saved profiles survive refresh and unknown asset IDs degrade safely.
- [ ] Idle/walk/crouch pose tests show no major skinning failures or wardrobe clipping.
- [ ] No unlicensed third-party asset is included in the repository.
- [ ] Desktop and mobile fallback behavior is tested before release.

## 7. Current status

The existing preview is procedural Three.js geometry and is useful only as an interaction prototype. The repository now defines an asset contract and integration path for authored GLB characters. Production realism requires creating and adding the actual custom meshes, UVs, PBR textures, hair assets, clothing, and rigged exports; documentation and loader code cannot substitute for those art assets.
