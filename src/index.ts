import { useState, useEffect } from "react";

const subscribers: Map<Function, Map<number, Function>> = new Map();
let subscriptionIdCounter = 0;

function subscribe(
  method: () => Promise<unknown>,
  callback: () => void
): () => void {
  if (!subscribers.has(method)) {
    subscribers.set(method, new Map());
  }

  const subscriptionId = subscriptionIdCounter++;
  subscribers.get(method)?.set(subscriptionId, callback);

  return () => {
    subscribers.get(method)?.delete(subscriptionId);
  };
}

export function refresh<T extends {}>(
  ...methods: Array<(params: T | never) => Promise<unknown>>
): void {
  for (const method of methods) {
    subscribers.get(method)?.forEach((callback) => {
      callback();
    });
  }
}

type MethodState<R> = R | undefined;

interface UseMethodOpts {
  autoRefreshMs?: number;
  reflectFetching?: true;
}

export function useMethod<R>(
  method: () => Promise<R>,
  params?: never,
  opts?: UseMethodOpts
): MethodState<R>;

export function useMethod<R, T>(
  method: (params: T) => Promise<R>,
  params: T,
  opts?: UseMethodOpts
): MethodState<R>;

export function useMethod<R, T>(
  method: (params?: T) => Promise<R>,
  params: T | undefined,
  opts?: UseMethodOpts
): MethodState<R> {
  const [state, setState] = useState<MethodState<R>>(undefined);
  const [gen, setGen] = useState(0);

  const jsonDep = JSON.stringify(params ?? {});
  useEffect(() => {
    if (opts?.reflectFetching === true) {
      setState(undefined);
    }

    const call = params != null ? method(params) : method();
    call.then((result) => setState(result));
    // eslint-disable-next-line
  }, [jsonDep, method, gen]);

  const autoRefreshMs = opts?.autoRefreshMs;
  useEffect(() => {
    if (autoRefreshMs != null) {
      const handle = setInterval(() => {
        setGen((prev) => prev + 1);
      }, autoRefreshMs);
      return () => clearInterval(handle);
    }
  }, [autoRefreshMs]);

  useEffect(() => {
    return subscribe(method, () => {
      setGen((prev) => prev + 1);
    });
  }, [method]);

  return state;
}
