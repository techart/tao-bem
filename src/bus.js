import EventEmitter from 'events';

class Bus extends EventEmitter{
	constructor() {
		super();
		this._completedEvents = {};
	}

	/**
	 * Вызвать событие
	 * @param {string} type
	 * @returns {boolean}
	 */
	emit(type) {
		const parentResult = super.emit.apply(this, arguments);
		if (this._completedEvents[type] === void 0) {
			this._completedEvents[type] = new Set();
		}
		this._completedEvents[type].add(arguments);
		return parentResult;
	}


	/**
	 * @callback emitCallback
	 * @param {*}
	 */
	/**
	 * Подписаться на событе
	 * @param {string} type
	 * @param {emitCallback} call
	 * @param {bool} completed Если true, то вызовется и для прошедших событий
	 * @returns {Bus}
	 */
	addListener(type, call, completed = false) {
		super.addListener.call(this, type, call);
		if(completed === true && this._completedEvents[type] !== void 0) {
			this._completedEvents[type].forEach((parms) => {
				this._emitCompleted(call, parms);
			})
		}
		return this;
	}

	_emitCompleted(handler, parms) {
		if (handler === void 0) {
			return false;
		}
		if (typeof handler === 'function') {
			switch (parms.length) {
				// fast cases
				case 1:
					handler.call(this);
					break;
				case 2:
					handler.call(this, parms[1]);
					break;
				case 3:
					handler.call(this, parms[1], parms[2]);
					break;
				// slower
				default:
					const args = Array.prototype.slice.call(parms, 1);
					handler.apply(this, args);
			}
		} else if (typeof handler === 'object' && handler !== null ) {
			const args = Array.prototype.slice.call(parms, 1);
			let listeners = handler.slice();
			const len = listeners.length;
			for (let i = 0; i < len; i++)
				listeners[i].apply(this, args);
		}
	}
}

var bus = new Bus();

export default bus;