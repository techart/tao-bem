class Config
{
	// разделители
	static get dividers()
	{
		return {
			// Разделитель блока и элемента
			elem: '__',

			// Разделитель модификатора
			mods: '--',

			// Разделитель значения модификатора
			mods_val: '_'
		}
	}

	// модификаторы
	static get autoMods()
	{
		return {
			hover: 'mouseenter mouseleave',
			press: 'mouseup mousedown',
			focus: 'focusin focusout'
		}
	}

	// Соответсвие события и модификатора, для авто установки
	static get eventMod()
	{
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

	// название аттрибута в котором будет храниться id блока
	static idAttr(name)
	{
		return 'data-'+ name + '-bemId';
	}
}

export default Config;