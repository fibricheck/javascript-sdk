function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function retryUntil<T>(tries = 5, func: { (): Promise<any>; }, condition: { (arg0: any): boolean;}): Promise<T> {
  if (tries === 0) {
    throw Error('timeout');
  }

  const result = await func();
  if (condition(result)) {
    return result;
  }
  await delay(2000);
  return retryUntil(tries - 1, func, condition);
}
