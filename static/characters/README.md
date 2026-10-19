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
