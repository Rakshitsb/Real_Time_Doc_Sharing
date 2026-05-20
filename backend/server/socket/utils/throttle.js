const throttle = (callback, wait = 100) => {
  let lastRun = 0;
  let timeoutId;
  let pendingArgs;

  const run = () => {
    lastRun = Date.now();
    timeoutId = undefined;
    callback(...pendingArgs);
    pendingArgs = undefined;
  };

  const throttled = (...args) => {
    pendingArgs = args;
    const remaining = wait - (Date.now() - lastRun);

    if (remaining <= 0 || !lastRun) {
      if (timeoutId) clearTimeout(timeoutId);
      run();
      return;
    }

    if (!timeoutId) {
      timeoutId = setTimeout(run, remaining);
    }
  };

  throttled.cancel = () => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = undefined;
    pendingArgs = undefined;
  };

  return throttled;
};

export default throttle;
