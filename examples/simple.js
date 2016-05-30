import $ from "jquery";
import BEM from "tao-bem";

class TestBlock extends BEM
{
	static get blockName()
	{
		return 'b-test';
	}

	static get events()
	{
		return {
			onMod: {
				active: {
					yes: 'onActive',
					no: 'onInactive',
				}
			}
		}
	}

	static get live()
	{
		return {
			'click': 'toggle'
		}
	}

	onInit()
	{
		this.addMod('active', true);
	}

	toggle()
	{
		this.toggleMod('active');
	}

	onActive()
	{
		this.$el.css('opacity', .5);
	}

	onInactive()
	{
		this.$el.css('opacity', 1);
	}
}

TestBlock.register();

export default TestBlock;