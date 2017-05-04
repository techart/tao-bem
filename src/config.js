class Config {
	/**
	 * разделители
	 * @returns {{elem: string, mods: string, mods_val: string}}
	 */
	static get dividers() {
		return {
			// Разделитель блока и элемента
			elem: '__',

			// Разделитель модификатора
			mods: '--',

			// Разделитель значения модификатора
			mods_val: '_'
		}
	}

	/**
	 * модификаторы
	 * @returns {{hover: string, press: string, focus: string}}
	 */
	static get autoMods() {
		return {
			hover: 'mouseenter mouseleave',
			press: 'mouseup mousedown',
			focus: 'focusin focusout'
		}
	}

	/**
	 * Соответсвие события и модификатора, для авто установки
	 * @returns {{focusin: [string,boolean], focusout: [string,boolean], mouseup: [string,boolean], mousedown: [string,boolean], mouseover: [string,boolean], mouseenter: [string,boolean], mouseleave: [string,boolean]}}
	 */
	static get eventMod() {
		return {
			focusin: ['focus', true],
			focusout: ['focus', false],

			mouseup: ['press', false],
			mousedown: ['press', true],

			mouseover: ['hover', true],
			mouseenter: ['hover', true],
			mouseleave: ['hover', false]
		}
	}

	/**
	 * название аттрибута в котором будет храниться id блока
	 * @param {string} name
	 * @returns {string}
	 */
	static idAttr(name) {
		return 'data-' + name + '-bemId';
	}
}

export default Config;