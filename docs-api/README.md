**uchimata**

***

# uchimata

## Classes

### ChromatinBasicRenderer

Defined in: [renderer/ChromatinBasicRenderer.ts:36](https://github.com/hms-dbmi/uchimata/blob/32453cdd1cb39361e6e69b65ff582866d772ce44/src/renderer/ChromatinBasicRenderer.ts#L36)

A 3D renderer for chromatin structures built on THREE.js with post-processing effects.

Provides high-level methods for visualizing chromatin data with features including:
- Instanced rendering for performance
- Ambient occlusion (SSAO) for depth perception
- Anti-aliasing (SMAA)
- Interactive hover effects
- Orbit camera controls

#### Example

```ts
const renderer = new ChromatinBasicRenderer({ alwaysRedraw: true, hoverEffect: false });
renderer.addSegments(segments);
renderer.startDrawing();
const canvas = renderer.getCanvasElement();
document.body.appendChild(canvas);
```

#### Constructors

##### Constructor

> **new ChromatinBasicRenderer**(`params?`): [`ChromatinBasicRenderer`](#chromatinbasicrenderer)

Defined in: [renderer/ChromatinBasicRenderer.ts:66](https://github.com/hms-dbmi/uchimata/blob/32453cdd1cb39361e6e69b65ff582866d772ce44/src/renderer/ChromatinBasicRenderer.ts#L66)

###### Parameters

###### params?

###### canvas?

`HTMLCanvasElement`

###### alwaysRedraw?

`boolean`

###### hoverEffect?

`boolean`

###### Returns

[`ChromatinBasicRenderer`](#chromatinbasicrenderer)

#### Properties

##### markSegments

> **markSegments**: `DrawableMarkSegment`[] = `[]`

Defined in: [renderer/ChromatinBasicRenderer.ts:37](https://github.com/hms-dbmi/uchimata/blob/32453cdd1cb39361e6e69b65ff582866d772ce44/src/renderer/ChromatinBasicRenderer.ts#L37)

##### objectsToDispose

> **objectsToDispose**: (`BufferGeometry`\<`NormalBufferAttributes`, `BufferGeometryEventMap`\> \| `InstancedMesh`\<`BufferGeometry`\<`NormalBufferAttributes`, `BufferGeometryEventMap`\>, `Material` \| `Material`[], `InstancedMeshEventMap`\> \| `MeshBasicMaterial`)[] = `[]`

Defined in: [renderer/ChromatinBasicRenderer.ts:39](https://github.com/hms-dbmi/uchimata/blob/32453cdd1cb39361e6e69b65ff582866d772ce44/src/renderer/ChromatinBasicRenderer.ts#L39)

##### renderer

> **renderer**: `WebGLRenderer`

Defined in: [renderer/ChromatinBasicRenderer.ts:44](https://github.com/hms-dbmi/uchimata/blob/32453cdd1cb39361e6e69b65ff582866d772ce44/src/renderer/ChromatinBasicRenderer.ts#L44)

##### scene

> **scene**: `Scene`

Defined in: [renderer/ChromatinBasicRenderer.ts:45](https://github.com/hms-dbmi/uchimata/blob/32453cdd1cb39361e6e69b65ff582866d772ce44/src/renderer/ChromatinBasicRenderer.ts#L45)

##### camera

> **camera**: `PerspectiveCamera`

Defined in: [renderer/ChromatinBasicRenderer.ts:46](https://github.com/hms-dbmi/uchimata/blob/32453cdd1cb39361e6e69b65ff582866d772ce44/src/renderer/ChromatinBasicRenderer.ts#L46)

##### controls

> **controls**: `OrbitControls`

Defined in: [renderer/ChromatinBasicRenderer.ts:47](https://github.com/hms-dbmi/uchimata/blob/32453cdd1cb39361e6e69b65ff582866d772ce44/src/renderer/ChromatinBasicRenderer.ts#L47)

##### composer

> **composer**: `EffectComposer`

Defined in: [renderer/ChromatinBasicRenderer.ts:48](https://github.com/hms-dbmi/uchimata/blob/32453cdd1cb39361e6e69b65ff582866d772ce44/src/renderer/ChromatinBasicRenderer.ts#L48)

##### ssaoPasses

> **ssaoPasses**: \[`N8AOPostPass`, `N8AOPostPass`\]

Defined in: [renderer/ChromatinBasicRenderer.ts:49](https://github.com/hms-dbmi/uchimata/blob/32453cdd1cb39361e6e69b65ff582866d772ce44/src/renderer/ChromatinBasicRenderer.ts#L49)

##### meshes

> **meshes**: `InstancedMesh`\<`BufferGeometry`\<`NormalBufferAttributes`, `BufferGeometryEventMap`\>, `Material` \| `Material`[], `InstancedMeshEventMap`\>[] = `[]`

Defined in: [renderer/ChromatinBasicRenderer.ts:50](https://github.com/hms-dbmi/uchimata/blob/32453cdd1cb39361e6e69b65ff582866d772ce44/src/renderer/ChromatinBasicRenderer.ts#L50)

##### redrawRequest

> **redrawRequest**: `number` = `0`

Defined in: [renderer/ChromatinBasicRenderer.ts:53](https://github.com/hms-dbmi/uchimata/blob/32453cdd1cb39361e6e69b65ff582866d772ce44/src/renderer/ChromatinBasicRenderer.ts#L53)

##### updateCallback

> **updateCallback**: (`text`) => `void` \| `undefined`

Defined in: [renderer/ChromatinBasicRenderer.ts:54](https://github.com/hms-dbmi/uchimata/blob/32453cdd1cb39361e6e69b65ff582866d772ce44/src/renderer/ChromatinBasicRenderer.ts#L54)

##### alwaysRedraw

> **alwaysRedraw**: `boolean` = `false`

Defined in: [renderer/ChromatinBasicRenderer.ts:56](https://github.com/hms-dbmi/uchimata/blob/32453cdd1cb39361e6e69b65ff582866d772ce44/src/renderer/ChromatinBasicRenderer.ts#L56)

##### hoverEffect

> **hoverEffect**: `boolean` = `false`

Defined in: [renderer/ChromatinBasicRenderer.ts:57](https://github.com/hms-dbmi/uchimata/blob/32453cdd1cb39361e6e69b65ff582866d772ce44/src/renderer/ChromatinBasicRenderer.ts#L57)

##### debugView

> **debugView**: `boolean` = `false`

Defined in: [renderer/ChromatinBasicRenderer.ts:58](https://github.com/hms-dbmi/uchimata/blob/32453cdd1cb39361e6e69b65ff582866d772ce44/src/renderer/ChromatinBasicRenderer.ts#L58)

##### raycaster

> **raycaster**: `Raycaster`

Defined in: [renderer/ChromatinBasicRenderer.ts:61](https://github.com/hms-dbmi/uchimata/blob/32453cdd1cb39361e6e69b65ff582866d772ce44/src/renderer/ChromatinBasicRenderer.ts#L61)

##### mouse

> **mouse**: `Vector2`

Defined in: [renderer/ChromatinBasicRenderer.ts:62](https://github.com/hms-dbmi/uchimata/blob/32453cdd1cb39361e6e69b65ff582866d772ce44/src/renderer/ChromatinBasicRenderer.ts#L62)

##### hoveredBinId

> **hoveredBinId**: \[`number`, `number`\] \| `undefined` = `undefined`

Defined in: [renderer/ChromatinBasicRenderer.ts:64](https://github.com/hms-dbmi/uchimata/blob/32453cdd1cb39361e6e69b65ff582866d772ce44/src/renderer/ChromatinBasicRenderer.ts#L64)

#### Methods

##### getCanvasElement()

> **getCanvasElement**(): `HTMLCanvasElement`

Defined in: [renderer/ChromatinBasicRenderer.ts:158](https://github.com/hms-dbmi/uchimata/blob/32453cdd1cb39361e6e69b65ff582866d772ce44/src/renderer/ChromatinBasicRenderer.ts#L158)

###### Returns

`HTMLCanvasElement`

##### getHoveredBin()

> **getHoveredBin**(): \[`number`, `number`\] \| `undefined`

Defined in: [renderer/ChromatinBasicRenderer.ts:165](https://github.com/hms-dbmi/uchimata/blob/32453cdd1cb39361e6e69b65ff582866d772ce44/src/renderer/ChromatinBasicRenderer.ts#L165)

Returns a pair [segment id, bin id] to identify hovered bin

###### Returns

\[`number`, `number`\] \| `undefined`

##### addUpdateHUDCallback()

> **addUpdateHUDCallback**(`cb`): `void`

Defined in: [renderer/ChromatinBasicRenderer.ts:169](https://github.com/hms-dbmi/uchimata/blob/32453cdd1cb39361e6e69b65ff582866d772ce44/src/renderer/ChromatinBasicRenderer.ts#L169)

###### Parameters

###### cb

(`text`) => `void`

###### Returns

`void`

##### clearScene()

> **clearScene**(): `void`

Defined in: [renderer/ChromatinBasicRenderer.ts:173](https://github.com/hms-dbmi/uchimata/blob/32453cdd1cb39361e6e69b65ff582866d772ce44/src/renderer/ChromatinBasicRenderer.ts#L173)

###### Returns

`void`

##### addSegments()

> **addSegments**(`newSegments`): `void`

Defined in: [renderer/ChromatinBasicRenderer.ts:189](https://github.com/hms-dbmi/uchimata/blob/32453cdd1cb39361e6e69b65ff582866d772ce44/src/renderer/ChromatinBasicRenderer.ts#L189)

Entrypoint for adding actual data to show

###### Parameters

###### newSegments

`DrawableMarkSegment`[]

###### Returns

`void`

##### buildStructures()

> **buildStructures**(): `void`

Defined in: [renderer/ChromatinBasicRenderer.ts:197](https://github.com/hms-dbmi/uchimata/blob/32453cdd1cb39361e6e69b65ff582866d772ce44/src/renderer/ChromatinBasicRenderer.ts#L197)

Turns all drawable segments into THREE objects to be rendered

###### Returns

`void`

##### setCameraParams()

> **setCameraParams**(`position`, `rotation`): `void`

Defined in: [renderer/ChromatinBasicRenderer.ts:208](https://github.com/hms-dbmi/uchimata/blob/32453cdd1cb39361e6e69b65ff582866d772ce44/src/renderer/ChromatinBasicRenderer.ts#L208)

###### Parameters

###### position

`vec3`

###### rotation

`vec3`

###### Returns

`void`

##### getCameraControls()

> **getCameraControls**(): `OrbitControls`

Defined in: [renderer/ChromatinBasicRenderer.ts:214](https://github.com/hms-dbmi/uchimata/blob/32453cdd1cb39361e6e69b65ff582866d772ce44/src/renderer/ChromatinBasicRenderer.ts#L214)

###### Returns

`OrbitControls`

##### showDebugCube()

> **showDebugCube**(): `void`

Defined in: [renderer/ChromatinBasicRenderer.ts:218](https://github.com/hms-dbmi/uchimata/blob/32453cdd1cb39361e6e69b65ff582866d772ce44/src/renderer/ChromatinBasicRenderer.ts#L218)

###### Returns

`void`

##### updateViewConfig()

> **updateViewConfig**(): `void`

Defined in: [renderer/ChromatinBasicRenderer.ts:232](https://github.com/hms-dbmi/uchimata/blob/32453cdd1cb39361e6e69b65ff582866d772ce44/src/renderer/ChromatinBasicRenderer.ts#L232)

Meant to be called directly from client (eg, Observable notebook) to request redraw

###### Returns

`void`

##### buildPart()

> **buildPart**(`segment`): `void`

Defined in: [renderer/ChromatinBasicRenderer.ts:241](https://github.com/hms-dbmi/uchimata/blob/32453cdd1cb39361e6e69b65ff582866d772ce44/src/renderer/ChromatinBasicRenderer.ts#L241)

Turns a singular segment (ie, position+mark+attributes) into THREEjs objects for rendering

###### Parameters

###### segment

`DrawableMarkSegment`

###### Returns

`void`

##### buildLinks()

> **buildLinks**(`positions`, `markSize`, `tubeScalingFactor`, `color`, `partPosition`): `void`

Defined in: [renderer/ChromatinBasicRenderer.ts:294](https://github.com/hms-dbmi/uchimata/blob/32453cdd1cb39361e6e69b65ff582866d772ce44/src/renderer/ChromatinBasicRenderer.ts#L294)

Utility function for building links between marks (optional)

###### Parameters

###### positions

`vec3`[]

###### markSize

`number` | `number`[]

###### tubeScalingFactor

`number`

###### color

`Color` | `Color`[]

###### partPosition

`vec3`

###### Returns

`void`

##### updateColor()

> **updateColor**(`meshIndex`, `color`): `void`

Defined in: [renderer/ChromatinBasicRenderer.ts:358](https://github.com/hms-dbmi/uchimata/blob/32453cdd1cb39361e6e69b65ff582866d772ce44/src/renderer/ChromatinBasicRenderer.ts#L358)

###### Parameters

###### meshIndex

`number`

###### color

`Color` | `Color`[]

###### Returns

`void`

##### startDrawing()

> **startDrawing**(): `void`

Defined in: [renderer/ChromatinBasicRenderer.ts:376](https://github.com/hms-dbmi/uchimata/blob/32453cdd1cb39361e6e69b65ff582866d772ce44/src/renderer/ChromatinBasicRenderer.ts#L376)

###### Returns

`void`

##### endDrawing()

> **endDrawing**(): `void`

Defined in: [renderer/ChromatinBasicRenderer.ts:380](https://github.com/hms-dbmi/uchimata/blob/32453cdd1cb39361e6e69b65ff582866d772ce44/src/renderer/ChromatinBasicRenderer.ts#L380)

###### Returns

`void`

##### resizeRendererToDisplaySize()

> **resizeRendererToDisplaySize**(`renderer`): `boolean`

Defined in: [renderer/ChromatinBasicRenderer.ts:385](https://github.com/hms-dbmi/uchimata/blob/32453cdd1cb39361e6e69b65ff582866d772ce44/src/renderer/ChromatinBasicRenderer.ts#L385)

###### Parameters

###### renderer

`WebGLRenderer`

###### Returns

`boolean`

##### update()

> **update**(): `void`

Defined in: [renderer/ChromatinBasicRenderer.ts:401](https://github.com/hms-dbmi/uchimata/blob/32453cdd1cb39361e6e69b65ff582866d772ce44/src/renderer/ChromatinBasicRenderer.ts#L401)

###### Returns

`void`

##### render()

> **render**(): `void`

Defined in: [renderer/ChromatinBasicRenderer.ts:445](https://github.com/hms-dbmi/uchimata/blob/32453cdd1cb39361e6e69b65ff582866d772ce44/src/renderer/ChromatinBasicRenderer.ts#L445)

###### Returns

`void`

##### onMouseMove()

> **onMouseMove**(`event`): `void`

Defined in: [renderer/ChromatinBasicRenderer.ts:463](https://github.com/hms-dbmi/uchimata/blob/32453cdd1cb39361e6e69b65ff582866d772ce44/src/renderer/ChromatinBasicRenderer.ts#L463)

###### Parameters

###### event

`MouseEvent`

###### Returns

`void`

## Type Aliases

### ChromatinStructure

> **ChromatinStructure** = `object`

Defined in: [chromatin-types.ts:14](https://github.com/hms-dbmi/uchimata/blob/32453cdd1cb39361e6e69b65ff582866d772ce44/src/chromatin-types.ts#L14)

Represents a 3D chromatin structure with spatial coordinates and optional metadata.

The data table must contain at minimum x, y, z columns for spatial coordinates.
Additional columns (chr, coord, index, etc.) enable filtering and selection operations.

#### Properties

##### data

> **data**: `Table`

Defined in: [chromatin-types.ts:15](https://github.com/hms-dbmi/uchimata/blob/32453cdd1cb39361e6e69b65ff582866d772ce44/src/chromatin-types.ts#L15)

Arrow Table containing at minimum x, y, z coordinate columns

##### name?

> `optional` **name**: `string`

Defined in: [chromatin-types.ts:18](https://github.com/hms-dbmi/uchimata/blob/32453cdd1cb39361e6e69b65ff582866d772ce44/src/chromatin-types.ts#L18)

Optional name identifier for the structure

##### assembly?

> `optional` **assembly**: `string`

Defined in: [chromatin-types.ts:20](https://github.com/hms-dbmi/uchimata/blob/32453cdd1cb39361e6e69b65ff582866d772ce44/src/chromatin-types.ts#L20)

Optional genome assembly identifier (e.g., "hg38", "mm10")

***

### ChromatinScene

> **ChromatinScene** = `object`

Defined in: [chromatin-types.ts:28](https://github.com/hms-dbmi/uchimata/blob/32453cdd1cb39361e6e69b65ff582866d772ce44/src/chromatin-types.ts#L28)

Represents a complete scene containing one or more chromatin structures with their visual configurations.

#### Properties

##### structures

> **structures**: `DisplayableStructure`[]

Defined in: [chromatin-types.ts:29](https://github.com/hms-dbmi/uchimata/blob/32453cdd1cb39361e6e69b65ff582866d772ce44/src/chromatin-types.ts#L29)

Array of displayable structures, each with data and view configuration

## Functions

### initScene()

> **initScene**(): [`ChromatinScene`](#chromatinscene)

Defined in: [chromatin.ts:26](https://github.com/hms-dbmi/uchimata/blob/32453cdd1cb39361e6e69b65ff582866d772ce44/src/chromatin.ts#L26)

Initializes a new empty chromatin scene.

#### Returns

[`ChromatinScene`](#chromatinscene)

A new ChromatinScene object with an empty structures array

#### Example

```ts
const scene = initScene();
```

***

### addStructureToScene()

> **addStructureToScene**(`scene`, `structure`, `viewConfig?`): [`ChromatinScene`](#chromatinscene)

Defined in: [chromatin.ts:43](https://github.com/hms-dbmi/uchimata/blob/32453cdd1cb39361e6e69b65ff582866d772ce44/src/chromatin.ts#L43)

Adds a chromatin structure to the scene with specified view configuration.

#### Parameters

##### scene

[`ChromatinScene`](#chromatinscene)

The chromatin scene to add the structure to

##### structure

[`ChromatinStructure`](#chromatinstructure)

The chromatin structure data to add

##### viewConfig?

`ViewConfig`

Optional visual configuration (scale, color, mark type, etc.). If not provided, defaults to scale: 0.0001 and color: "red"

#### Returns

[`ChromatinScene`](#chromatinscene)

A new ChromatinScene with the structure added

#### Example

```ts
const scene = initScene();
const updatedScene = addStructureToScene(scene, structure, { scale: 0.005, color: "blue" });
```

***

### display()

> **display**(`scene`, `options`, `targetCanvas?`): \[[`ChromatinBasicRenderer`](#chromatinbasicrenderer), `HTMLCanvasElement` \| `HTMLElement`\]

Defined in: [chromatin.ts:87](https://github.com/hms-dbmi/uchimata/blob/32453cdd1cb39361e6e69b65ff582866d772ce44/src/chromatin.ts#L87)

Renders a chromatin scene and returns the renderer and canvas element.

#### Parameters

##### scene

[`ChromatinScene`](#chromatinscene)

The chromatin scene to render

##### options

`DisplayOptions`

Display options including alwaysRedraw, withHUD, and hoverEffect flags

##### targetCanvas?

`HTMLCanvasElement`

Optional canvas element to render into. If not provided, a new canvas will be created

#### Returns

\[[`ChromatinBasicRenderer`](#chromatinbasicrenderer), `HTMLCanvasElement` \| `HTMLElement`\]

A tuple containing the renderer instance and the canvas/container element

#### Example

```ts
const [renderer, canvas] = display(scene, { alwaysRedraw: true, withHUD: false, hoverEffect: false });
document.body.appendChild(canvas);
```

***

### updateScene()

> **updateScene**(`renderer`, `newScene`): `void`

Defined in: [chromatin.ts:139](https://github.com/hms-dbmi/uchimata/blob/32453cdd1cb39361e6e69b65ff582866d772ce44/src/chromatin.ts#L139)

Updates the renderer with a new scene by clearing the existing scene and rebuilding it.

#### Parameters

##### renderer

[`ChromatinBasicRenderer`](#chromatinbasicrenderer)

The renderer instance to update

##### newScene

[`ChromatinScene`](#chromatinscene)

The new scene to render

#### Returns

`void`

#### Example

```ts
updateScene(renderer, newScene);
```

***

### loadFromURL()

> **loadFromURL**(`url`, `options`): `Promise`\<[`ChromatinStructure`](#chromatinstructure) \| `undefined`\>

Defined in: [data-loaders/arrow.ts:20](https://github.com/hms-dbmi/uchimata/blob/32453cdd1cb39361e6e69b65ff582866d772ce44/src/data-loaders/arrow.ts#L20)

Loads a 3D chromatin structure from a URL containing Apache Arrow IPC data.

#### Parameters

##### url

`string`

URL to fetch the Arrow IPC file from

##### options

`LoadOptions`

Loading options for centering and normalization

#### Returns

`Promise`\<[`ChromatinStructure`](#chromatinstructure) \| `undefined`\>

Promise resolving to a ChromatinStructure, or undefined if loading fails

#### Example

```ts
const structure = await loadFromURL("https://example.com/structure.arrow", { center: true, normalize: true });
```

***

### load()

> **load**(`buffer`, `options?`): [`ChromatinStructure`](#chromatinstructure)

Defined in: [data-loaders/arrow.ts:231](https://github.com/hms-dbmi/uchimata/blob/32453cdd1cb39361e6e69b65ff582866d772ce44/src/data-loaders/arrow.ts#L231)

Loads a 3D chromatin structure from an ArrayBuffer containing Apache Arrow IPC data.

Processes the data by:
- Saving original x, y, z coordinates as xRaw, yRaw, zRaw
- Optionally centering coordinates (subtracting mean)
- Optionally normalizing coordinates to a standard scale
- Generating an index column if not present

#### Parameters

##### buffer

`ArrayBuffer`

ArrayBuffer containing Arrow IPC formatted data with at minimum x, y, z columns

##### options?

`LoadOptions`

Optional loading options for centering and normalization (default: { center: true, normalize: true })

#### Returns

[`ChromatinStructure`](#chromatinstructure)

A ChromatinStructure object with processed data

#### Example

```ts
const structure = load(arrayBuffer, { center: true, normalize: true });
```

***

### makeCuttingPlane()

> **makeCuttingPlane**(`model`, `axis`, `cutAt`, `invert`): `Promise`\<`Table`\<`TypeMap`\>\>

Defined in: [selections/selections.ts:18](https://github.com/hms-dbmi/uchimata/blob/32453cdd1cb39361e6e69b65ff582866d772ce44/src/selections/selections.ts#L18)

Filters the chromatin structure using a cutting plane perpendicular to a specified axis.

#### Parameters

##### model

`Table`

The chromatin structure data table to filter

##### axis

The axis perpendicular to the cutting plane ("x", "y", or "z"). Default: "x"

`"x"` | `"y"` | `"z"`

##### cutAt

`number` = `0`

The position along the axis where to place the cutting plane. Default: 0

##### invert

`boolean` = `false`

If false, keeps data where axis < cutAt; if true, keeps data where axis > cutAt. Default: false

#### Returns

`Promise`\<`Table`\<`TypeMap`\>\>

Promise resolving to a filtered Table

#### Example

```ts
const filtered = await makeCuttingPlane(structure.data, "z", 0.5, false);
```

***

### selectChromosome()

> **selectChromosome**(`model`, `chromName`, `column`): `Promise`\<`Table`\<`TypeMap`\>\>

Defined in: [selections/selections.ts:49](https://github.com/hms-dbmi/uchimata/blob/32453cdd1cb39361e6e69b65ff582866d772ce44/src/selections/selections.ts#L49)

Filters the chromatin structure to include only a specific chromosome.

#### Parameters

##### model

`Table`

The chromatin structure data table to filter

##### chromName

`string`

The name of the chromosome to select (e.g., "chr1", "chrX")

##### column

`string` = `"chr"`

The column name containing chromosome identifiers. Default: "chr"

#### Returns

`Promise`\<`Table`\<`TypeMap`\>\>

Promise resolving to a filtered Table containing only the specified chromosome

#### Example

```ts
const chr1 = await selectChromosome(structure.data, "chr1");
```

***

### selectRange()

> **selectRange**(`model`, `chromName`, `start`, `end`, `chromColumn`, `coordinateColumn`): `Promise`\<`Table`\<`TypeMap`\>\>

Defined in: [selections/selections.ts:81](https://github.com/hms-dbmi/uchimata/blob/32453cdd1cb39361e6e69b65ff582866d772ce44/src/selections/selections.ts#L81)

Filters the chromatin structure to a specific genomic range on a chromosome.

#### Parameters

##### model

`Table`

The chromatin structure data table to filter

##### chromName

`string`

The chromosome name (e.g., "chr1", "chrX")

##### start

`number`

The start coordinate of the genomic range (inclusive)

##### end

`number`

The end coordinate of the genomic range (inclusive)

##### chromColumn

`string` = `"chr"`

The column name containing chromosome identifiers. Default: "chr"

##### coordinateColumn

`string` = `"coord"`

The column name containing genomic coordinates. Default: "coord"

#### Returns

`Promise`\<`Table`\<`TypeMap`\>\>

Promise resolving to a filtered Table containing only the specified range

#### Example

```ts
const region = await selectRange(structure.data, "chr1", 1000000, 2000000);
```

***

### sphereSelect()

> **sphereSelect**(`model`, `x`, `y`, `z`, `radius`): `Promise`\<`Table`\<`TypeMap`\>\>

Defined in: [selections/selections.ts:115](https://github.com/hms-dbmi/uchimata/blob/32453cdd1cb39361e6e69b65ff582866d772ce44/src/selections/selections.ts#L115)

Filters the chromatin structure to include only points within a sphere in 3D space.

#### Parameters

##### model

`Table`

The chromatin structure data table to filter

##### x

`number`

X coordinate of the sphere center

##### y

`number`

Y coordinate of the sphere center

##### z

`number`

Z coordinate of the sphere center

##### radius

`number`

Radius of the selection sphere

#### Returns

`Promise`\<`Table`\<`TypeMap`\>\>

Promise resolving to a filtered Table containing only points within the sphere

#### Example

```ts
const selection = await sphereSelect(structure.data, 0, 0, 0, 0.5);
```
