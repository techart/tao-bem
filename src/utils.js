import Config from "./config";

class Utils {

	/**
	 * Парсит имена блоков из имени класса
	 * @param {string} className
	 * @param {{elem: string, mods: string, mods_val: string}} dividers
	 * @returns {*|{bool, needsContext}|Array|{index: number, input: string}}
	 */
	static parseBlockNames(className, dividers) {
		dividers = dividers || Config.dividers;

		let split = dividers.elem;
		let pcre = new RegExp('\\b([a-z\\d-]+(?:' + split + '[a-z\\d-]+)*)\\b', 'ig');

		return className.match(pcre);
	}

	/**
	 * Парсит названия модификаторов из имени класса
	 * @param {string} blockName
	 * @param {string} className
	 * @param {{elem: string, mods: string, mods_val: string}} dividers
	 * @returns {{}}
	 */
	static parseMods(blockName, className, dividers) {
		dividers = dividers || Config.dividers;

		let split = dividers.mods;
		let vSplit = dividers.mods_val;
		let ret = {}, match;
		let pcre = new RegExp(''
			+ '\\b'
			+ blockName
			+ split
			+ '([a-zA-Z0-9-]+)(' + vSplit + '[a-zA-Z0-9-]+)?\\b'
			, 'g');

		while ((match = pcre.exec(className))) {
			ret[match[1]] = match[2] ? match[2].substr(1) : true;
		}

		return ret;
	}

	/**
	 * @param {string} blockName
	 * @param {string} mod
	 * @param {string|boolean} state
	 * @param {{elem: string, mods: string, mods_val: string}} dividers
	 * @returns {string}
	 */
	static modClassName(blockName, mod, state, dividers) {
		dividers = dividers || Config.dividers;

		return blockName
			+ dividers.mods
			+ mod
			+ (state && typeof state === 'string' ? dividers.mods_val + state : '')
	}

	/**
	 * @param {string} value
	 * @returns {XML|void|string|*}
	 */
	static regexpEscape(value) {
		return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
	}
}

export default Utils;