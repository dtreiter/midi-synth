export interface EventPayload<T> {
  detail: T;
}

export class EventBus {
  private readonly bus = document.createElement('input');

  emit(name: string, payload: {}) {
    const event = new CustomEvent(name, {detail: payload});
    this.bus.dispatchEvent(event);
  }

  // TODO Don't use `any`
  listen(name: string, listener: (arg0: any) => void) {
    this.bus.addEventListener(name, listener);
  }

  unlisten(name: string, listener: () => void) {
    this.bus.removeEventListener(name, listener);
  }
}
