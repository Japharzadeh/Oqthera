# Character asset package

This folder is the integration point for the custom Oqthera character art package.

- `manifest.json` defines stable IDs and expected GLB paths.
- Models must be authored for the `oqthera-humanoid-v1` skeleton contract documented in `docs/character-art-direction.md`.
- Do not commit empty GLB files or placeholder models under these paths.
- Until the real assets are exported and installed, the browser uses the procedural preview already present in the creator.
- Outfit assets must be rig-compatible; hair and accessories must have documented attachment transforms.

## Export checklist

1. Export GLB 2.0 with applied transforms and meter-scale dimensions.
2. Confirm Y-up and the documented forward direction.
3. Validate material slots and texture color spaces.
4. Confirm the skeleton name and required bone names.
5. Test the asset with a neutral A-pose and at least idle, walk, crouch poses.
6. Add the exported asset path to `manifest.json` and verify browser loading before enabling it by default.


## Temporary CC0 preview models

The creator preview now attempts to load these externally hosted GLB assets:

- Male: [Daniel — adult male in a field jacket](https://www.innerscene.com/tools/library/3d-parts/daniel-3d-person-standing-casual-f788af5a), CC0, 26.3 MB. Source download endpoint: `https://www.innerscene.com/api/library/daniel-3d-person-standing-casual-f788af5a/download`.
- Female: [Jordan — adult female athlete](https://www.innerscene.com/tools/library/3d-parts/jordan-3d-person-athlete-a0770454), CC0, 15.4 MB. Source download endpoint: `https://www.innerscene.com/api/library/jordan-3d-person-athlete-a0770454/download`.

Both are described by Innerscene as public-domain CC0 assets and permit commercial use, modification, and redistribution. These are static posed meshes, not rigged modular player assets; their source files are hosted by Innerscene and availability/CORS may change. Until project-local copies and a compatible rigged outfit/hair set are added, non-gender customization options still apply to the built-in fallback preview rather than modifying the imported meshes. The female asset is sportswear and the male asset is casual clothing, so they are visual placeholders rather than final survivor outfits.
