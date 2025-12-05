import type { Table } from "@uwdata/flechette";
import type { vec3 } from "gl-matrix";

/**
 * Represents a 3D chromatin structure with spatial coordinates and optional metadata.
 *
 * The data table must contain at minimum x, y, z columns for spatial coordinates.
 * Additional columns (chr, coord, index, etc.) enable filtering and selection operations.
 *
 * @property data - Arrow Table containing at minimum x, y, z coordinate columns
 * @property name - Optional name identifier for the structure
 * @property assembly - Optional genome assembly identifier (e.g., "hg38", "mm10")
 */
export type ChromatinStructure = {
  data: Table;

  /* Metadata */
  name?: string;
  /* Identifying organism and genome assembly */
  assembly?: string;
};

/**
 * Represents a complete scene containing one or more chromatin structures with their visual configurations.
 *
 * @property structures - Array of displayable structures, each with data and view configuration
 */
export type ChromatinScene = {
  structures: DisplayableStructure[];
};

export type DisplayableStructure = {
  structure: ChromatinStructure;
  viewConfig: ViewConfig;
};

export type AssociatedValues = {
  values?: number[] | string[];
  field?: string; //~ used to specify the field in the Table that contains the values
  min?: number;
  max?: number;
};

export type AssociatedValuesColor = AssociatedValues & {
  /** Either a colorscale name (e.g., "viridis") or an array of categorical colors (e.g., ["#123456", "#abcdef", ...]) */
  colorScale: string | string[];
};

export type AssociatedValuesScale = AssociatedValues & {
  scaleMin: number;
  scaleMax: number;
};

export type ViewConfig = {
  scale?: number | AssociatedValuesScale;
  color?: string | AssociatedValuesColor;
  mark?: MarkTypes;
  links?: boolean;
  linksScale?: number;
  position?: vec3;
};

export type MarkTypes = "sphere" | "box" | "octahedron";

export type TrackViewConfig = {
  mark: MarkTypes;
  links: boolean;
  color?: string;
};
