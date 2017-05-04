import Config from "./config";
import Registry from "./registry";
import Block from "./block";
import Element from "./element";
import Collection from "./collection";
import Bus from "./bus";

class BEM {
	/**
	 * @static
	 * @returns {Block}
	 * @constructor
	 */
	static get Block() {
		return Block;
	}

	/**
	 * @static
	 * @returns {Element}
	 * @constructor
	 */
	static get Element() {
		return Element;
	}

	/**
	 * @static
	 * @returns {Collection}
	 * @constructor
	 */
	static get Collection() {
		return Collection;
	}

	/**
	 * @static
	 * @returns {Registry}
	 * @constructor
	 */
	static get Registry() {
		return Registry;
	}

	/**
	 * @static
	 * @returns {Config}
	 * @constructor
	 */
	static get Config() {
		return Config;
	}

	/**
	 * @static
	 * @returns {Bus}
	 * @constructor
	 */
	static get Bus() {
		return Bus;
	}
}

export default BEM;