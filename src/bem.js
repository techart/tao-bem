import Block from "./block";
import Collection from "./collection";
import Registry from "./registry";
import Config from "./config";

class BEM
{
	static get Block()
	{
		return Block;
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