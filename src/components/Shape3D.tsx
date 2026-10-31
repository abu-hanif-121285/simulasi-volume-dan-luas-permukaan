import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { ShapeKind } from "../lib/shapes";
import { FACE_COLORS } from "../lib/shapes";

type V3 = [number, number, number];

export type Shape3DProps = {
  kind: ShapeKind;
  dims: Record<string, number>;
  colors?: string[];
  fill?: number;
  highlightLayer?: number | null;
  explode?: number;
  autoRotate?: boolean;
  showRusuk?: boolean;
  showTitik?: boolean;
  ghost?: boolean;
  ground?: boolean;
  interactive?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

type World = {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  raf: number;
  ground?: THREE.Object3D;
};

type Model = {
  group: THREE.Group;
  size: number;
  faces: { obj: THREE.Object3D; normal: THREE.Vector3 }[];
  instances?: { mesh: THREE.InstancedMesh; nx: number; ny: number; nz: number };
  slabs?: { mesh: THREE.Mesh; layer: number }[];
  dispose: () => void;
};

const MAX_INSTANCES = 1400;

function polyGeom(verts: V3[]) {
  const pos: number[] = [];
  for (let i = 1; i < verts.length - 1; i++) {
    pos.push(...verts[0], ...verts[i], ...verts[i + 1]);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  return g;
}

function normalOf(verts: V3[], center: THREE.Vector3): THREE.Vector3 {
  const a = new THREE.Vector3(...verts[0]);
  const b = new THREE.Vector3(...verts[1]);
  const c = new THREE.Vector3(...verts[2]);
  const n = new THREE.Vector3().subVectors(b, a).cross(new THREE.Vector3().subVectors(c, a)).normalize();
  const mid = new THREE.Vector3();
  verts.forEach((v) => mid.add(new THREE.Vector3(...v)));
  mid.divideScalar(verts.length);
  if (n.dot(mid.sub(center)) < 0) n.negate();
  return n;
}

function faceDefs(kind: ShapeKind, d: Record<string, number>): V3[][] {
  if (kind === "kubus") {
    const h = d.s / 2;
    return [
      [[-h, h, h], [h, h, h], [h, h, -h], [-h, h, -h]],
      [[-h, -h, -h], [h, -h, -h], [h, -h, h], [-h, -h, h]],
      [[-h, -h, h], [h, -h, h], [h, h, h], [-h, h, h]],
      [[h, -h, -h], [-h, -h, -h], [-h, h, -h], [h, h, -h]],
      [[h, -h, h], [h, -h, -h], [h, h, -h], [h, h, h]],
      [[-h, -h, -h], [-h, -h, h], [-h, h, h], [-h, h, -h]],
    ];
  }
  if (kind === "balok") {
    const hx = d.p / 2, hy = d.t / 2, hz = d.l / 2;
    return [
      [[-hx, hy, hz], [hx, hy, hz], [hx, hy, -hz], [-hx, hy, -hz]],
      [[-hx, -hy, -hz], [hx, -hy, -hz], [hx, -hy, hz], [-hx, -hy, hz]],
      [[-hx, -hy, hz], [hx, -hy, hz], [hx, hy, hz], [-hx, hy, hz]],
      [[hx, -hy, -hz], [-hx, -hy, -hz], [-hx, hy, -hz], [hx, hy, -hz]],
      [[hx, -hy, hz], [hx, -hy, -hz], [hx, hy, -hz], [hx, hy, hz]],
      [[-hx, -hy, -hz], [-hx, -hy, hz], [-hx, hy, hz], [-hx, hy, -hz]],
    ];
  }
  if (kind === "prisma") {
    const a = d.a, ts = d.ts, t = d.t, hy = t / 2, ax = a / 2;
    return [
      [[-ax, -hy, 0], [ax, -hy, 0], [0, -hy, ts]],
      [[0, hy, ts], [ax, hy, 0], [-ax, hy, 0]],
      [[-ax, -hy, 0], [ax, -hy, 0], [ax, hy, 0], [-ax, hy, 0]],
      [[ax, -hy, 0], [0, -hy, ts], [0, hy, ts], [ax, hy, 0]],
      [[0, -hy, ts], [-ax, -hy, 0], [-ax, hy, 0], [0, hy, ts]],
    ];
  }
  // limas segiempat beraturan
  const a = d.a, t = d.t, h = a / 2;
  return [
    [[-h, 0, -h], [h, 0, -h], [h, 0, h], [-h, 0, h]],
    [[-h, 0, h], [h, 0, h], [0, t, 0]],
    [[h, 0, h], [h, 0, -h], [0, t, 0]],
    [[h, 0, -h], [-h, 0, -h], [0, t, 0]],
    [[-h, 0, -h], [-h, 0, h], [0, t, 0]],
  ];
}

function buildModel(props: Shape3DProps, palette: string[]): Model {
  const { kind, dims, showRusuk = true, showTitik = false, ghost = false } = props;
  const group = new THREE.Group();
  const content = new THREE.Group();
  group.add(content);
  const disposables: { dispose: () => void }[] = [];
  const faceEntries: { obj: THREE.Object3D; normal: THREE.Vector3 }[] = [];
  const allVerts: V3[] = [];

  if (kind === "kerucut") {
    const r = dims.r, t = dims.t;
    const baseGeom = new THREE.CircleGeometry(r, 64);
    const baseMat = new THREE.MeshStandardMaterial({
      color: palette[5] ?? palette[0], roughness: 0.5, metalness: 0.05,
      side: THREE.DoubleSide, transparent: true, opacity: ghost ? 0.32 : 1,
    });
    const base = new THREE.Mesh(baseGeom, baseMat);
    base.rotation.x = -Math.PI / 2;
    content.add(base);
    disposables.push(baseGeom, baseMat);
    faceEntries.push({ obj: base, normal: new THREE.Vector3(0, -1, 0) });

    const latGeom = new THREE.ConeGeometry(r, t, 64, 1, true);
    const latMat = new THREE.MeshStandardMaterial({
      color: palette[0], roughness: 0.42, metalness: 0.08,
      side: THREE.DoubleSide, transparent: true, opacity: ghost ? 0.32 : 0.96,
    });
    const lat = new THREE.Mesh(latGeom, latMat);
    lat.position.y = t / 2;
    content.add(lat);
    disposables.push(latGeom, latMat);
    faceEntries.push({ obj: lat, normal: new THREE.Vector3(0, 1, 0) });

    if (showRusuk) {
      const ringGeom = new THREE.TorusGeometry(r, Math.max(r, t) * 0.012, 8, 80);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x0a2b34 });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.rotation.x = Math.PI / 2;
      base.add(ring);
      disposables.push(ringGeom, ringMat);
      const apexGeom = new THREE.SphereGeometry(Math.max(r, t) * 0.045, 12, 12);
      const apexMat = new THREE.MeshBasicMaterial({ color: 0x0a2b34 });
      const apex = new THREE.Mesh(apexGeom, apexMat);
      apex.position.set(0, t, 0);
      content.add(apex);
      disposables.push(apexGeom, apexMat);
    }
  } else {
    const defs = faceDefs(kind, dims);
    const center = new THREE.Vector3();
    defs.forEach((verts) => verts.forEach((v) => { center.add(new THREE.Vector3(...v)); allVerts.push(v); }));
    center.divideScalar(Math.max(1, allVerts.length));

    defs.forEach((verts, i) => {
      const geom = polyGeom(verts);
      const mat = new THREE.MeshStandardMaterial({
        color: palette[i % palette.length],
        roughness: 0.48,
        metalness: 0.06,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: ghost ? 0.3 : 0.97,
      });
      const mesh = new THREE.Mesh(geom, mat);
      content.add(mesh);
      disposables.push(geom, mat);
      faceEntries.push({ obj: mesh, normal: normalOf(verts, center) });

      if (showRusuk) {
        const pts = verts.map((v) => new THREE.Vector3(...v));
        const lineGeom = new THREE.BufferGeometry().setFromPoints(pts);
        const lineMat = new THREE.LineBasicMaterial({ color: 0x08303a, transparent: true, opacity: 0.75 });
        const line = new THREE.LineLoop(lineGeom, lineMat);
        mesh.add(line);
        disposables.push(lineGeom, lineMat);
      }
    });

    if (showTitik) {
      const seen = new Set<string>();
      const rad = Math.max(...Object.values(dims)) * 0.045;
      const sph = new THREE.SphereGeometry(rad, 12, 12);
      const mtl = new THREE.MeshBasicMaterial({ color: 0x0a2b34 });
      disposables.push(sph, mtl);
      allVerts.forEach((v) => {
        const k = v.map((n) => n.toFixed(3)).join("|");
        if (seen.has(k)) return;
        seen.add(k);
        const m = new THREE.Mesh(sph, mtl);
        m.position.set(...v);
        content.add(m);
      });
    }
  }

  // ---- kubus satuan / lapisan untuk kubus & balok ----
  let instances: Model["instances"];
  let slabs: Model["slabs"];
  if (kind === "kubus" || kind === "balok") {
    const nx = kind === "kubus" ? dims.s : dims.p;
    const ny = kind === "kubus" ? dims.s : dims.t;
    const nz = kind === "kubus" ? dims.s : dims.l;
    const total = nx * ny * nz;
    const ox = kind === "kubus" ? nx / 2 : dims.p / 2;
    const oy = ny / 2;
    const oz = kind === "kubus" ? nz / 2 : dims.l / 2;

    if (total <= MAX_INSTANCES) {
      const g = new THREE.BoxGeometry(0.9, 0.9, 0.9);
      const m = new THREE.MeshStandardMaterial({ roughness: 0.45, metalness: 0.05 });
      const mesh = new THREE.InstancedMesh(g, m, total);
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      const c1 = new THREE.Color("#FFC24B");
      const c2 = new THREE.Color("#21C3A4");
      const dummy = new THREE.Object3D();
      let idx = 0;
      for (let y = 0; y < ny; y++)
        for (let x = 0; x < nx; x++)
          for (let z = 0; z < nz; z++) {
            dummy.position.set(x + 0.5 - ox, y + 0.5 - oy, z + 0.5 - oz);
            dummy.updateMatrix();
            mesh.setMatrixAt(idx, dummy.matrix);
            mesh.setColorAt(idx, (x + y + z) % 2 === 0 ? c1 : c2);
            idx++;
          }
      mesh.count = total;
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      content.add(mesh);
      disposables.push(g, m);
      instances = { mesh, nx, ny, nz };
    } else {
      const list: { mesh: THREE.Mesh; layer: number }[] = [];
      for (let y = 0; y < ny; y++) {
        const g = new THREE.BoxGeometry(nx * 0.98, 0.94, nz * 0.98);
        const m = new THREE.MeshStandardMaterial({
          color: y % 2 === 0 ? "#FFC24B" : "#21C3A4", roughness: 0.5, transparent: true, opacity: 0.85,
        });
        const mesh = new THREE.Mesh(g, m);
        mesh.position.set(0, y + 0.5 - oy, 0);
        content.add(mesh);
        disposables.push(g, m);
        list.push({ mesh, layer: y });
      }
      slabs = list;
    }
  }

  // ---- normalisasi ukuran & posisi ----
  const box = new THREE.Box3().setFromObject(content);
  const size = new THREE.Vector3();
  box.getSize(size);
  const ctr = new THREE.Vector3();
  box.getCenter(ctr);
  content.position.sub(ctr);
  const maxDim = Math.max(size.x, size.y, size.z, 0.001);
  group.scale.setScalar(4.4 / maxDim);

  // sembunyikan kubus satuan di awal
  if (instances) {
    const zero = new THREE.Matrix4().makeScale(0, 0, 0);
    for (let i = 0; i < instances.mesh.count; i++) instances.mesh.setMatrixAt(i, zero);
    instances.mesh.instanceMatrix.needsUpdate = true;
    instances.mesh.visible = false;
  }
  if (slabs) slabs.forEach((s) => (s.mesh.visible = false));

  return {
    group,
    size: maxDim,
    faces: faceEntries,
    instances,
    slabs,
    dispose: () => {
      disposables.forEach((x) => x.dispose());
      group.traverse(() => undefined);
    },
  };
}

export function applyFill(model: Model | null, fill: number, highlightLayer: number | null) {
  if (!model) return;
  const { instances, slabs } = model;
  if (instances) {
    const { mesh, nx, ny, nz } = instances;
    const total = nx * ny * nz;
    const shown = Math.max(0, Math.min(total, Math.round(fill * total)));
    mesh.visible = shown > 0;
    const dummy = new THREE.Object3D();
    const zero = new THREE.Matrix4().makeScale(0, 0, 0);
    const perLayer = nx * nz;
    for (let i = 0; i < total; i++) {
      const layer = Math.floor(i / perLayer);
      const show = highlightLayer != null ? layer === highlightLayer && layer < shown / perLayer + 1 : i < shown;
      if (!show) {
        mesh.setMatrixAt(i, zero);
        continue;
      }
      const withinLayer = i % perLayer;
      const x = Math.floor(withinLayer / nz);
      const z = withinLayer % nz;
      dummy.position.set(x + 0.5 - nx / 2, layer + 0.5 - ny / 2, z + 0.5 - nz / 2);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }
  if (slabs) {
    const shownLayers = Math.round(fill * slabs.length);
    slabs.forEach((s) => {
      const on = highlightLayer != null ? s.layer === highlightLayer && highlightLayer < shownLayers : s.layer < shownLayers;
      s.mesh.visible = on;
    });
  }
}

export function applyExplode(model: Model | null, amount: number) {
  if (!model) return;
  const jarak = amount * model.size * 0.42;
  model.faces.forEach(({ obj, normal }) => {
    obj.position.copy(normal.clone().multiplyScalar(jarak));
  });
}

export default function Shape3D(props: Shape3DProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const worldRef = useRef<World | null>(null);
  const modelRef = useRef<Model | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  // init renderer sekali
  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      el.innerHTML =
        '<div style="display:flex;height:100%;align-items:center;justify-content:center;color:#0c586a;font-family:sans-serif;padding:12px;text-align:center">Browser ini belum mendukung tampilan 3D. Materi tetap bisa dibaca di bagian bawah ya!</div>';
      return;
    }
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 200);
    camera.position.set(6.4, 4.6, 7.6);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.touchAction = "none";

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.09;
    controls.enablePan = false;
    controls.minDistance = 4.5;
    controls.maxDistance = 20;
    controls.autoRotateSpeed = 1.6;

    scene.add(new THREE.HemisphereLight(0xffffff, 0x2b6d7c, 1.15));
    const d1 = new THREE.DirectionalLight(0xffffff, 1.35);
    d1.position.set(6, 9, 7);
    scene.add(d1);
    const d2 = new THREE.DirectionalLight(0xbfe9f2, 0.55);
    d2.position.set(-7, -4, -5);
    scene.add(d2);

    const grid = new THREE.GridHelper(16, 16, 0x7fd2de, 0xb9e6ed);
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.4;
    grid.position.y = -2.6;
    scene.add(grid);

    const world: World = { renderer, scene, camera, controls, raf: 0, ground: grid };
    worldRef.current = world;

    // Jeda proses render saat kanvas tidak terlihat agar perangkat tidak berat.
    const lihat = { aktif: true };
    const ioVis = "IntersectionObserver" in window
      ? new IntersectionObserver((es) => { lihat.aktif = es.some((e) => e.isIntersecting); }, { threshold: 0.01 })
      : null;
    ioVis?.observe(el);

    const resize = () => {
      const w = el.clientWidth || 1;
      const h = el.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    const loop = () => {
      world.raf = requestAnimationFrame(loop);
      controls.update();
      if (lihat.aktif) renderer.render(scene, camera);
    };
    loop();

    return () => {
      cancelAnimationFrame(world.raf);
      ro.disconnect();
      ioVis?.disconnect();
      controls.dispose();
      modelRef.current?.dispose();
      modelRef.current = null;
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
      });
      try { renderer.forceContextLoss(); } catch { /* konteks sudah lepas */ }
      renderer.dispose();
      if (renderer.domElement.parentNode === el) el.removeChild(renderer.domElement);
      worldRef.current = null;
    };
  }, []);

  // bangun ulang model
  const dimsKey = JSON.stringify(props.dims);
  const palette = props.colors ?? FACE_COLORS;
  const paletteKey = palette.join(",");
  useEffect(() => {
    const world = worldRef.current;
    if (!world) return;
    modelRef.current?.dispose();
    if (modelRef.current) world.scene.remove(modelRef.current.group);
    const model = buildModel({ ...propsRef.current, dims: JSON.parse(dimsKey) }, palette);
    world.scene.add(model.group);
    modelRef.current = model;
    applyFill(model, propsRef.current.fill ?? 0, propsRef.current.highlightLayer ?? null);
    applyExplode(model, propsRef.current.explode ?? 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.kind, dimsKey, paletteKey, props.showRusuk, props.showTitik, props.ghost]);

  useEffect(() => {
    applyFill(modelRef.current, props.fill ?? 0, props.highlightLayer ?? null);
  }, [props.fill, props.highlightLayer, dimsKey]);

  useEffect(() => {
    applyExplode(modelRef.current, props.explode ?? 0);
  }, [props.explode]);

  useEffect(() => {
    const w = worldRef.current;
    if (!w) return;
    w.controls.autoRotate = !!props.autoRotate;
    w.controls.enabled = props.interactive !== false;
    if (w.ground) w.ground.visible = props.ground !== false;
  }, [props.autoRotate, props.interactive, props.ground]);

  return <div ref={mountRef} className={props.className} style={props.style} aria-label={`Model 3D ${props.kind}`} role="img" />;
}
