export interface EventPayload<T> extends CustomEvent<T> {
  detail: T;
}

export class EventBus {
  private readonly bus = document.createElement('input');

  emit(name: string, payload: {}) {
    const event = new CustomEvent(name, {detail: payload});
    this.bus.dispatchEvent(event);
  }

  listen(name: string, listener: (eventPayload: EventPayload<any>) => void) {
    this.bus.addEventListener(name, listener as EventListener);
  }

  unlisten(name: string, listener: (eventPayload: EventPayload<any>) => void) {
    this.bus.removeEventListener(name, listener as EventListener);
  }
}
