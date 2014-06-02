export function constantly(x) {
  return ()=>x;
}


export function domStream(name) {
  let docStream = $(document).asEventStream(name);
  return target => target ? $(target).asEventStream(name) : docStream;
}
