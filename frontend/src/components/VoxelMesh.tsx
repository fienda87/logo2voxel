import { useRef, useMemo } from "react"
import * as THREE from "three"
import { useVoxelStore } from "../store/voxelStore"
import { buildVoxelGeometry, buildPedestalGeometry } from "../utils/buildVoxelGeometry"

const MAT_PROPS: Record<string, { roughness: number; emissive: number }> = {
  matte: { roughness: 0.8, emissive: 0x111111 },
  glossy: { roughness: 0.15, emissive: 0x000000 },
  wireframe: { roughness: 0.5, emissive: 0x222222 },
}

export function VoxelMesh() {
  const meshRef = useRef<THREE.Mesh>(null)
  const pedestalRef = useRef<THREE.Mesh>(null)

  const store = useVoxelStore()
  const flatArray = store.voxelData ? store.voxelData[String(store.selectedResolution)] : null

  const materialProps = MAT_PROPS[store.materialStyle] || MAT_PROPS.matte

  const geometry = useMemo(() => {
    if (!flatArray || flatArray.length === 0) return null
    return buildVoxelGeometry(
      flatArray,
      store.selectedResolution,
      store.voxelGap,
      store.invertHeight,
      store.heightMultiplier,
      store.colorMode,
      store.customColor,
      store.gradientTop,
      store.gradientBottom,
    )
  }, [
    flatArray,
    store.selectedResolution,
    store.voxelGap,
    store.invertHeight,
    store.heightMultiplier,
    store.colorMode,
    store.customColor,
    store.gradientTop,
    store.gradientBottom,
  ])

  const textFlatArray = store.textVoxelData
  const textMode = store.textVoxelMode
  const showLogo = textMode === "logo" || textMode === "both"
  const showText = textMode === "text" || textMode === "both"

  const textGeometry = useMemo(() => {
    if (!textFlatArray || textFlatArray.length === 0) return null
    return buildVoxelGeometry(
      textFlatArray,
      48,
      store.voxelGap,
      false,
      store.heightMultiplier,
      store.colorMode,
      store.customColor,
      store.gradientTop,
      store.gradientBottom,
    )
  }, [textFlatArray, store.voxelGap, store.heightMultiplier, store.colorMode, store.customColor, store.gradientTop, store.gradientBottom])

  const pedestalGeo = useMemo(() => {
    if (!store.showPedestal || !flatArray || flatArray.length === 0) return null
    const res = store.selectedResolution
    return buildPedestalGeometry(res * 0.9, res * 0.9, 0.25)
  }, [store.showPedestal, store.selectedResolution, flatArray])

  const mat = useMemo(() => {
    const isWire = store.materialStyle === "wireframe"
    const isSolid = store.colorMode === "solid"
    const isGlossy = store.materialStyle === "glossy"

    if (isGlossy) {
      const m = new THREE.MeshPhysicalMaterial({
        vertexColors: !isSolid,
        flatShading: true,
        roughness: 0.18,
        metalness: 0.1,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        envMapIntensity: 1.0,
      })
      if (isSolid) {
        m.color = new THREE.Color(store.customColor)
        m.emissive = new THREE.Color(store.customColor).multiplyScalar(0.05)
      }
      return m
    }

    const m = new THREE.MeshStandardMaterial({
      vertexColors: !isSolid,
      flatShading: true,
      wireframe: isWire,
      roughness: materialProps.roughness,
      metalness: 0.1,
      emissive: isSolid ? new THREE.Color(store.customColor).multiplyScalar(0.2) : materialProps.emissive,
    })
    if (isSolid) m.color = new THREE.Color(store.customColor)
    return m
  }, [store.colorMode, store.customColor, store.materialStyle, materialProps])

  if (!geometry) return null

  return (
    <group>
      {showLogo && geometry && (
        <mesh ref={meshRef} geometry={geometry}>
          <primitive object={mat} />
        </mesh>
      )}

      {showText && textGeometry && (
        <group position={[store.textOffsetX, store.textOffsetY, store.textOffsetZ]}>
          <mesh geometry={textGeometry}>
            <primitive object={mat} />
          </mesh>
        </group>
      )}

      {pedestalGeo && (
        <mesh ref={pedestalRef} geometry={pedestalGeo} position={[0, -0.125 * store.heightMultiplier, 0]}>
          <primitive object={new THREE.MeshStandardMaterial({ color: "#1e293b", roughness: 0.7, metalness: 0.1 })} />
        </mesh>
      )}
    </group>
  )
}


