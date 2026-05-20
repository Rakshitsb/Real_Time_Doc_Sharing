const toUint8Array = (update) => {
  if (update instanceof Uint8Array) return update;
  if (Buffer.isBuffer(update)) return new Uint8Array(update);
  if (Array.isArray(update)) return Uint8Array.from(update);
  return new Uint8Array(update);
};

const toSerializableUpdate = (update) => Array.from(update);

export { toSerializableUpdate, toUint8Array };
