// TODO: rename into NodeInputFailStrategy.
export enum FailMode {
  /** Fail unless at least one input is present. */
  ANY = "any",

  /** Fail unless at least one input is present. */
  ALL = "all",

  /** Never fail. */
  NEVER = "never",
}

export enum NodeFailStrategy {
  NONE = "none",
  FAIL_AGENT = "failAgent",
}

export enum AgentFailStrategy {
  /** Node errors never cause an agent to fail. */
  NEVER = "never",

  /** Agent fails if any node fails. */
  NODE_ANY = "nodeAny",

  /** Agent fails if any node that is connected to the agent output fails, or is cancelled because of an error in one of the previous nodes. */
  OUTPUT_ANY = "outputAny",

  /** Agent fails if all nodes connected to agent outputs fail, or are cancelled because of errors in previous nodes. */
  OUTPUT_ALL = "outputAll",
}
