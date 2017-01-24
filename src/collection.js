import $ from "jquery";
import ObjectsCollection from "@webtechart/tao-core/lib/objects/collection";

class Collection extends ObjectsCollection
{
	/**
	 * Установить модификатор всем объектам в коллекции
	 *
	 * @param name
	 * @param state
	 */
	addMod(name, state)
	{
		this.invoke('addMod', name, state);
		return this;
	}

	/**
	 * Удалить модификатор всем объектам в коллекции
	 *
	 * @param name
	 * @param state
	 */
	delMod(name, state)
	{
		this.invoke('delMod', name, state);
		return this;
	}

	/**
	 * Дабавить или удлаить модификатор
	 *
	 * @param name
	 * @param state
	 */
	toggleMod(name, state)
	{
		this.invoke('toggleMod', name, state);
		return this;
	}

	/**
	 * Фильтрует элементы по модификатору
	 *
	 * @param name
	 * @param state
	 * @returns {*}
	 */
	byMod(name, state)
	{
		return this.filter((elem) => elem.hasMod(name, state));
	}

	/**
	 * Возвразает JQuery объект с нодами элементов коллекции
	 */
	get $el()
	{
		let ret = $([]);

		this.forEach((elem) => {
			ret = ret.add(elem.$el)
		});

		return ret;
	}

}

export default Collection;