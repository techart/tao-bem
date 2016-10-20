import Element from './element';
import Collection from "./collection";
import Registry from "./registry";
import $ from "jquery";

class Block extends Element
{

	static get elementsEvents() {
		return {}
	}

	static makeElementCollection(blockName = false)
	{
		if (blockName) {
			return Registry.getModule(blockName).makeCollection();
		}

		return Collection.make();
	}

	static initialized()
	{
		return Element.initialized.apply(this, arguments) || this === Block;
	}

	ready(...args)
	{
		super.ready(...args);
		this.subscribeElementsToEvents();

	}

	subscribeElementsToEvents() {
		$.each(this.self.elementsEvents, (name, cb) => {
			if (name.indexOf('.') == -1) {
				throw "Event name must contain the name of the element";
			}
			let [elementName, eventName] = name.split('.');
			if (typeof cb == 'string') {
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

	_elementClass(name) {
		return this.s(this.elemsSelector(name)).substr(1);
	}

	/**
	 * Возвращает БЭМ элемент блока
	 *
	 * @param name имя элемента
	 * @param blockName
	 * @param mod
	 */
	elem(name, blockName = false, mod = false)
	{
		let node = this.$elem(name, mod)[0];
		if (!node) {
			return null;
		}
		let ret = Registry.getInstance(node, this._elementClass(name), Element);
		return blockName ? ret.asBlock(blockName) : ret;
	}

	/**
	 * Возвращает массив БЭМ элементов блока
	 *
	 * @param name
	 *
	 * @param blockName
	 * @param mod
	 * @return Collection
	 */
	elems(name, blockName = false, mod=false)
	{
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
	 * @returns {jQuery}
	 */
	$elem(name, mod=false)
	{
		return this.$elems(name, mod).first();
	}

	/**
	 * Возвращает список эл-ов блока
	 *
	 * @param name
	 * @param mod
	 * @returns {jQuery}
	 */
	$elems(name, mod=false)
	{
		return this.$(this.elemsSelector(name, mod));
	}

	/**
	 * Формирует селектор для поиска элемента
	 * @param name
	 * @param mod
	 * @returns {*}
	 */
	elemsSelector(name, mod=false)
	{
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