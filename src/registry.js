import $ from "jquery";
import Utils from "./utils";
import Config from "./config";

class Registry
{
	constructor()
	{
		this._classes = {};
		this._instances = {};
		this._instance_collections = {};

		this._init();
	}

	/**
	 * Регистрация модуля БЭМ
	 *
	 * @param string name
	 * @param Element instance
	 */
	addModule(name, contructor)
	{
		this._classes[name] = contructor;
		this._instance_collections[name] = contructor.makeCollection();

		// ожидаем добавление новых блоков на страницу для их инициализации
		$(document).on('click leftclick mouseover mousedown focusin change', contructor.blockClass, this._lazy_cb);

		// если добавление модуля произошло после загрузки документа
		// и модуль должен немедленно инициализировать все свои инстансы
		if (document.readyState == 'complete'
		    && contructor.forced
		) {
			this.initModuleFromDOM(name);
		}
	}

	/**
	 * Возвращает модуль зарегистрированный ранее
	 * @param name
	 * @returns {*}
	 */
	getModule(name)
	{
		if (typeof name == 'object') {
			name = name.blockName;
		}

		if (this.issetModule(name)) {
			return this._classes[name];
		}

		return null;
	}

	/**
	 * Проверяет были зарегистрирован модуль
	 * @param name
	 * @returns {boolean}
	 */
	issetModule(name)
	{
		return this._classes[name] !== window.undef;
	}

	/**
	 * Производит инициализацию модуля с поиском нод в DOM'е
	 *
	 * @param name
	 * @param $root
	 * @param forced
	 * @returns {boolean}
	 */
	initModuleFromDOM(name, $root = $(document))
	{
		if (!this.issetModule(name)) {
			return false;
		}

		let _class = this.getModule(name);
		let sel    = _class.blockClass;
		let $items = $root.find(sel).add($root.filter(sel));
		let i = $items.length;

		while(i--) {
			this.initModuleFromNode($items[i], name);
		}

		return true;
	}

	/**
	 * Инициализация модуля для конкретного узла DOM'a
	 *
	 * @param node
	 * @param name
	 * @param evt
	 */
	initModuleFromNode(node, name, evt)
	{
		if (!this.issetModule(name)) {
			return false;
		} else if (this.issetInstance(node, name)) {
			return this.getInstance(node, name);
		}

		let _class   = this.getModule(name);
		let instance = _class.init(node, evt);

		return instance;
	}

	/**
	 * Добавляет экземпляр БЭМ класса в реестр
	 *
	 * @param node
	 * @param instance
	 */
	addInstance(node, instance)
	{
		node.setAttribute(Config.idAttr(instance.name), instance.id);

		this._instances[instance.id] = instance;

		if (this._instance_collections[instance.name]) {
			this._instance_collections[instance.name].push(instance);
		}

		return instance;
	}

	/**
	 * Проверяет был ли инициализирован экземпляр БЭМ класса
	 *
	 * @param node
	 * @param name
	 */
	issetInstance(node, name)
	{
		let id = node.getAttribute(Config.idAttr(name));
		return this._instances[id] !== window.undef;
	}

	/**
	 * Удаляет экземпляр из реестра
	 *
	 * @param node
	 * @param name
	 */
	removeInstance(node, name)
	{
		if (!this.issetInstance(node, name)) {
			return true;
		}

		let instance = this.getInstance(node, name);
		let index =  this.getCollection(name)
						? this.getCollection(name).findIndex((elem) => elem === instance) || false
						: false;

		delete this._instances[instance.id];

		if (index !== false) {
			this._instance_collections[name].splice(index, 1);
		}

		node.removeAttribute(Config.idAttr(instance.name));

		return true;
	}

	/**
	 * Возвращает экземпляр БЭМ класса из реестра
	 *
	 * @param node
	 * @param name
	 */
	getInstance(node, name, _class)
	{
		let id = node.getAttribute(Config.idAttr(name));
		let	instance  = this._instances[id];

		if (instance === window.undef) {
			instance = this.initModuleFromNode(node, name);

			if (instance === false && _class) {
				instance = _class.init(node, window.undef, name);
			}
		}

		return instance;
	}

	/**
	 * Возвращает коллекцию БЭМ объектов
	 *
	 * @param name
	 */
	getCollection(name)
	{
		if (this._instance_collections[name] === window.undef) {
			return false;
		}

		return this._instance_collections[name];
	}

	/**
	 * Подписываемся на события инициализации
	 * @private
	 */
	_init()
	{
		// инициализация эл-ов при загрузке страницы
		$(document).ready(setTimeout(() => {
			this._forcedLoad($(document));
		}, 0));

		// ленивая инициализация
		this._lazy_cb = this._lazyLoad.bind(this);
	}

	/**
	 * Инициализация блоков при загруке страницы
	 *
	 * @param $root
	 * @private
	 */
	_forcedLoad($root)
	{
		$.each(this._classes, (name) => {
			if (this.getModule(name).forced) {
				this.initModuleFromDOM(name, $root);
			}
		});
	}

	/**
	 * Ленивая инициализация блока
	 *
	 * @param evt
	 * @private
	 */
	_lazyLoad(evt)
	{
		let node = evt.currentTarget;
		let names = Utils.parseBlockNames(node.className);
		let i;

		for (i = names.length; i--;) {
			if (node.hasAttribute(Config.idAttr(names[i]))) {
				continue;
			}

			this.initModuleFromNode(node, names[i], evt);
		}
	}
}

let reg = new Registry();

export default reg;