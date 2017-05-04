import Element from './element';
import Collection from "./collection";
import Registry from "./registry";
import $ from "jquery";

class Block extends Element {

	/**
	 * @returns {{}}
	 */
	static get elementsEvents() {
		return {}
	}

	/**
	 * @param {string|boolean} [blockName = false]
	 * @returns {Element}
	 */
	static makeElementCollection(blockName = false) {
		if (blockName) {
			return Registry.getModule(blockName).makeCollection();
		}

		return Collection.make();
	}

	/**
	 * @returns {Element|boolean}
	 */
	static initialized() {
		return Element.initialized.apply(this, arguments) || this === Block;
	}

	/**
	 * @param args
	 */
	ready(...args) {
		super.ready(...args);
		this.subscribeElementsToEvents();

	}

	subscribeElementsToEvents() {
		$.each(this.self.elementsEvents, (name, cb) => {
			if (name.indexOf('.') === -1) {
				throw "Event name must contain the name of the element";
			}
			let [elementName, eventName] = name.split('.');
			if (typeof cb === 'string') {
				cb = this[cb];
			}
			let collection = this.elems(elementName);
			let bindElementToCallback = (...args) => {
				let element = Registry.getInstance(args[0].currentTarget, this._elementClass(elementName), Element);
				cb.call(this, element, collection, ...args);
			};
			collection.$el.on(eventName, bindElementToCallback);
		});
	}

	/**
	 * @param {string} name
	 * @returns {string}
	 * @private
	 */
	_elementClass(name) {
		return this.s(this.elemsSelector(name)).substr(1);
	}

	/**
	 * Возвращает БЭМ элемент блока
	 * @param name
	 * @param {string|boolean} [blockName = false]
	 * @param {string|boolean} [mod = false]
	 * @returns {*}
	 */
	elem(name, blockName = false, mod = false) {
		let node = this.$elem(name, mod)[0];
		if (!node) {
			return null;
		}
		let ret = Registry.getInstance(node, this._elementClass(name), Element);
		return blockName ? ret.asBlock(blockName) : ret;
	}

	/**
	 * Возвращает массив БЭМ элементов блока
	 * @param {string}name
	 * @param {string|boolean} [blockName = false]
	 * @param {string|boolean} [mod = false]
	 * @returns {Collection}
	 */
	elems(name, blockName = false, mod = false) {
		let s = this.s(this.elemsSelector(name));
		let $items = this.$elems(name, mod);
		let ret = this.self.makeElementCollection(blockName);

		$items.toArray().forEach((node) => {
			let instance = Registry.getInstance(node, s.substr(1), Element);
			ret.push(blockName ? instance.asBlock(blockName) : instance);
		});

		return ret;
	}

	/**
	 * Возвращает элемента блока
	 * @param {string} name
	 * @param {string|boolean} [mod = false]
	 * @returns {jQuery}
	 */
	$elem(name, mod = false) {
		return this.$elems(name, mod).first();
	}

	/**
	 * Возвращает список эл-ов блока
	 * @param {string} name
	 * @param {string|boolean} [mod = false]
	 * @returns {jQuery}
	 */
	$elems(name, mod = false) {
		return this.$(this.elemsSelector(name, mod));
	}

	/**
	 * Формирует селектор для поиска элемента
	 * @param {string} name
	 * @param {string|boolean} [mod = false]
	 * @returns {string}
	 */
	elemsSelector(name, mod = false) {
		let elDivider = this.self.config().dividers.elem;
		let sel = elDivider + name;
		if (mod) {
			let modDivider = this.self.config().dividers.mods;
			sel += '+' + modDivider + mod;
		}
		return sel;
	}
}

export default Block;