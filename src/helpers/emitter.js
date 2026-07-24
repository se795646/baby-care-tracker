class SimpleEmitter {
    constructor() {
        this._handlers = {};
    }
    on(event, handler) {
        (this._handlers[event] ||= []).push(handler);
    }
    off(event, handler) {
        const list = this._handlers[event];
        if (list) this._handlers[event] = list.filter((h) => h !== handler);
    }
    emit(event, ...args) {
        (this._handlers[event] || []).forEach((h) => h(...args));
    }
}

const emitter = new SimpleEmitter();

export default emitter;
