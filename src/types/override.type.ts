export interface NodeInputOverride {
  nodeId: string;
  inputName: string;
  value: any;
  type: "input";
}

export interface NodeOutputOverride {
  nodeId: string;
  outputName: string;
  value: any;
  type: "output";
}

type NodeOverride = NodeInputOverride | NodeOutputOverride;

// Transform the override types to use edgeName instead of inputName/outputName
type TransformToEdgeName<T> = T extends { inputName: string }
  ? Omit<T, "inputName"> & { edgeName: string }
  : T extends { outputName: string }
    ? Omit<T, "outputName"> & { edgeName: string }
    : T;

export interface GlobalOverrides {
  [nodeId: string]: {
    [edgeName: string]: TransformToEdgeName<NodeOverride>;
  };
}
