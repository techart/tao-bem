import Config from "./config";
import Registry from "./registry";
import Block from "./block";
import Element from "./element";
import Collection from "./collection";

// устраняем цикличную зависимость
//Element.__abstractBlockClass = Block;

class BEM
{
	static get Block()
	{
		return Block;
	}

	static get Element()
	{
		return Element;
	}

	static get Collection()
	{
		return Collection;
	}

	static get Registry()
	{
		return Registry;
	}

	static get Config()
	{
		return Config;
	}
}

export default BEM;