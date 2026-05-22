import type { StandardSchemaV1 } from "@standard-schema/spec";

/**
 * Single payload-validation strategy.
 *
 * Any value passed as a validator argument to {@link Plaza.on} must conform to
 * this shape. In typical usage you construct one via {@link validator}.
 *
 * @typeParam Out - Output type after validation
 *
 * @public
 */
export interface Validator<Out> {
  /**
   * Phantom field that carries the output type. Not populated at runtime.
   *
   * Exists purely for type inference and should not be read.
   *
   * @internal
   */
  readonly _out: Out;

  /** Validation target. Only `"json"` is supported today. */
  readonly target: "json";

  /**
   * Validate the incoming payload and return the validated value.
   *
   * Throws {@link ValidationError} on schema failure.
   *
   * @param input - Incoming payload
   * @throws {@link ValidationError} when validation fails
   */
  validate(input: unknown): Promise<Out>;
}

/**
 * Error thrown when payload validation fails.
 *
 * The `issues` property carries the StandardSchema-formatted details produced
 * by the underlying schema library.
 *
 * @public
 */
export class ValidationError extends Error {
  /** StandardSchema issues produced by the failing schema. */
  readonly issues: readonly StandardSchemaV1.Issue[];

  /**
   * @param issues - Issues returned by the StandardSchema validator
   */
  constructor(issues: readonly StandardSchemaV1.Issue[]) {
    super(
      `Plaza validation failed: ${issues.map((i) => i.message).join("; ")}`,
    );
    this.name = "ValidationError";
    this.issues = issues;
  }
}

/**
 * Build a {@link Validator} from a StandardSchema-compatible schema.
 *
 * Pass the result to {@link Plaza.on}, and inside the handler call
 * `c.valid("json")` to read the validated, type-inferred payload.
 *
 * @typeParam S - StandardSchema-compatible schema type
 * @param schema - Any schema that implements StandardSchema (zod, etc.)
 * @returns A {@link Validator} that validates payloads with the given schema
 *
 * @example
 * ```ts
 * import { validator } from "plaza-ts";
 * import { z } from "zod";
 *
 * plaza.on(
 *   "login",
 *   validator(z.object({ token: z.string() })),
 *   (c) => {
 *     const { token } = c.valid("json"); // inferred as { token: string }
 *   }
 * );
 * ```
 *
 * @public
 */
export function validator<S extends StandardSchemaV1>(
  schema: S,
): Validator<StandardSchemaV1.InferOutput<S>> {
  return {
    _out: undefined as unknown as StandardSchemaV1.InferOutput<S>,
    target: "json",
    async validate(input) {
      const r = await schema["~standard"].validate(input);
      if (r.issues) throw new ValidationError(r.issues);
      return r.value as StandardSchemaV1.InferOutput<S>;
    },
  };
}
