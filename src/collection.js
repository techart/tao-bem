import $ from "jquery";
import ObjectsCollection from "tao-core/objects/collection";

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
	$el()
	{
		let ret = $([]);

		this.forEach((elem) => {
			ret = ret.add(elem.$el)
		});

		return ret;
	}
}

export default Collection;