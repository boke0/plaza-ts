type Mw<C> = (c: C, next: () => Promise<void>) => unknown;
type Final<C> = (c: C) => unknown;

export function compose<C>(
  middlewares: readonly Mw<C>[],
  final: Final<C>,
): (c: C) => Promise<void> {
  return async (c: C) => {
    let lastIndex = -1;
    const dispatch = async (i: number): Promise<void> => {
      if (i <= lastIndex) {
        throw new Error(
          "Plaza: next() called multiple times in the same middleware",
        );
      }
      lastIndex = i;
      if (i === middlewares.length) {
        await final(c);
        return;
      }
      const mw = middlewares[i];
      if (!mw) return;
      await mw(c, () => dispatch(i + 1));
    };
    await dispatch(0);
  };
}
