import Config from "./config";

class Utils
{
	/**
	 * Парсит имена блоков из имени класса
	 */
	static parseBlockNames(className, dividers)
	{
		dividers = dividers || Config.dividers;

		let split = dividers.elem;
		let pcre = new RegExp('\\b([a-z\\d-]+(?:'+ split +'[a-z\\d-]+)*)\\b', 'ig');

		return className.match(pcre);
	}

	/**
	 * Парсит названия модификаторов из имени класса
	 */
	static parseMods(blockName, className, dividers)
	{
		dividers = dividers || Config.dividers;

		let split  = dividers.mods;
		let vSplit = dividers.mods_val;
		let ret = {}, match;
		let pcre = new RegExp(''
			+ '\\b'
			+ blockName
			+ split
			+'([a-zA-Z0-9-]+)('+ vSplit +'[a-zA-Z0-9-]+)?\\b'
			, 'g');

		while ((match = pcre.exec(className))) {
			ret[match[1]] = match[2] ? match[2].substr(1) : true;
		}

		return	ret;
	}

	static modClassName(blockName, mod, state, dividers)
	{
		dividers = dividers || Config.dividers

		return blockName
				+ dividers.mods
				+ mod
				+ (state && typeof state === 'string' ? dividers.mods_val + state: '')
	}
}

export default Utils;