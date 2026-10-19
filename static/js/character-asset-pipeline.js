import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';
import { clone as cloneSkeleton } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/utils/SkeletonUtils.js';

const MANIFEST_URL = '/static/characters/manifest.json';
const cache = new Map();
const loader = new GLTFLoader();
let manifestPromise;

async function getManifest() {
  if (!manifestPromise) {
    manifestPromise = fetch(MANIFEST_URL, { cache: 'no-cache' }).then((response) => {
      if (!response.ok) throw new Error(`Character manifest request failed: ${response.status}`);
      return response.json();
    }).catch((error) => {
      manifestPromise = null;
      throw error;
    });
  }
  return manifestPromise;
}

function loadGltf(url) {
  if (cache.has(url)) return cache.get(url).then((gltf) => gltf);
  const pending = new Promise((resolve, reject) => {
    loader.load(url, resolve, undefined, reject);
  });
  cache.set(url, pending);
  pending.catch(() => cache.delete(url));
  return pending;
}

function cloneGltfScene(scene) {
  return cloneSkeleton(scene);
}

export async function getCharacterAssetManifest() {
  return getManifest();
}

export async function loadCharacterBase({ gender = 'male' } = {}) {
  const manifest = await getManifest();
  const preset = manifest.characterPresets?.[gender] ?? manifest.characterPresets?.male;
  if (!preset?.base) throw new Error(`No base character asset configured for gender: ${gender}`);
  const gltf = await loadGltf(preset.base);
  return { scene: cloneGltfScene(gltf.scene), animations: gltf.animations ?? [], assetUrl: preset.base, preset };
}

export async function loadCharacterPart(url) {
  if (!url) return null;
  const gltf = await loadGltf(url);
  return { scene: cloneGltfScene(gltf.scene), animations: gltf.animations ?? [], assetUrl: url };
}

export async function resolveCharacterAssets({ gender = 'male', hairStyle = 'medium-messy', outfit = 'station-utility', accessories = [] } = {}) {
  const manifest = await getManifest();
  const preset = manifest.characterPresets?.[gender] ?? manifest.characterPresets?.male;
  const hairUrl = preset?.hair?.[hairStyle] ?? manifest.characterPresets?.androgynous?.hair?.[hairStyle] ?? null;
  const outfitConfig = manifest.outfits?.[outfit] ?? manifest.outfits?.['station-utility'];
  return {
    baseUrl: preset.base,
    hairUrl,
    outfitUrl: outfitConfig?.asset ?? null,
    outfitConfig,
    accessoryUrls: accessories.map((id) => manifest.accessories?.[id]).filter(Boolean),
    rigContract: manifest.rigContract
  };
}

