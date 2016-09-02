import Element from './element';
import Collection from "./collection";
import Registry from "./registry";

class Block extends Element
{
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

	/**
	 * Возвращает БЭМ элемент блока
	 *
	 * @param name имя элемента
	 */
	elem(name, blockName = false)
	{
		let s = this.s('__'+ name);
		let node = this.$elem(name)[0];
		let ret = Registry.getInstance(node, s.substr(1), Element);

		return blockName ? ret.asBlock(blockName) : ret;
	}

	/**
	 * Возвращает массив БЭМ элементов блока
	 *
	 * @param name
	 *
	 * @return Collection
	 */
	elems(name, blockName = false)
	{
		let s = this.s('__'+ name);
		let $items = this.$elems(name);
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
	$elem(name)
	{
		return this.$elems(name).first();
	}

	/**
	 * Возвращает список эл-ов блока
	 *
	 * @param name
	 * @returns {jQuery}
	 */
	$elems(name)
	{
		return this.$('__'+ name);
	}
}

export default Block;