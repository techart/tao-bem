import $ from "jquery";
import Utils from "./utils";
import Config from "./config";

class Registry {
	constructor() {
		this._classes = {};
		this._instances = {};
		this._instance_collections = {};

		this._init();

		$(() => {
			this._initOnMutation();
		});
	}

	/**
	 * Подписываемся на события инициализации
	 * @private
	 */
	_init() {
		// инициализация эл-ов при загрузке страницы
		$(document).ready(() => setTimeout(() => {
			this._forcedLoad($(document));
		}, 0));

		// ленивая инициализация
		this._lazy_cb = this._lazyLoad.bind(this);
	}

	/**
	 * @private
	 */
	_initOnMutation() {
		if (MutationObserver) {
			const observer = new MutationObserver((mutations) => {
				mutations.forEach((mutation) => {
					if (mutation.target) {
						this._forcedLoad($(mutation.target));
					}
				});
			});
			const config = {attributes: false, subtree: true, childList: true, characterData: false};
			observer.observe(document, config);

		}
	}

	/**
	 * Инициализация блоков при загруке страницы
	 * @param {jQuery} $root
	 * @private
	 */
	_forcedLoad($root) {
		$.each(this._classes, (name) => {
			if (this.getModule(name).forced) {
				this.initModuleFromDOM(name, $root);
			}
		});
	}

	/**
	 * Производит инициализацию модуля с поиском нод в DOM'е
	 * @param {string} name
	 * @param {jQuery} $root
	 * @returns {boolean}
	 */
	initModuleFromDOM(name, $root = $(document)) {
		if (!this.issetModule(name)) {
			return false;
		}

		let _class = this.getModule(name);
		let sel = _class.blockClass;
		let $items = $root.find(sel).add($root.filter(sel));
		let i = $items.length;

		while (i--) {
			this.initModuleFromNode($items[i], name);
		}

		return true;
	}

	/**
	 * Инициализация модуля для конкретного узла DOM'a
	 * @param {Element} node
	 * @param {string} name
	 * @param {Event} [event]
	 * @returns {Element}
	 */
	initModuleFromNode(node, name, event) {
		if (!this.issetModule(name)) {
			return false;
		} else if (this.issetInstance(node, name)) {
			return this.getInstance(node, name);
		}

		let _class = this.getModule(name);
		return _class.init(node, event);
	}

	/**
	 * Проверяет были зарегистрирован модуль
	 * @param {string} name
	 * @returns {boolean}
	 */
	issetModule(name) {
		return this._classes[name] !== void 0;
	}

	/**
	 * Возвращает модуль зарегистрированный ранее
	 * @param {string} name
	 * @returns {?Element}
	 */
	getModule(name) {
		if (typeof name === 'object') {
			name = name.blockName;
		}

		if (this.issetModule(name)) {
			return this._classes[name];
		}

		return null;
	}

	/**
	 * Регистрация модуля БЭМ
	 * @param {string} name
	 * @param {Element} contructor
	 */
	addModule(name, contructor) {
		this._classes[name] = contructor;
		this._instance_collections[name] = contructor.makeCollection();

		// ожидаем добавление новых блоков на страницу для их инициализации
		// TODO: возможно это лишнее
		$(document).on('click leftclick mouseover mousedown focusin change', contructor.blockClass, this._lazy_cb);


		// если добавление модуля произошло после загрузки документа и модуль должен немедленно инициализировать все свои инстансы
		if (document.readyState === 'complete' && contructor.forced) {
			this.initModuleFromDOM(name);
		}
	}

	/**
	 * Проверяет был ли инициализирован экземпляр БЭМ класса
	 * @param {HTMLElement} node
	 * @param {string} name
	 * @returns {boolean}
	 */
	issetInstance(node, name) {
		let id = node.getAttribute(Config.idAttr(name));
		return this._instances[id] !== void 0;
	}

	/**
	 * Возвращает экземпляр БЭМ класса из реестра
	 * @param {HTMLElement} node
	 * @param {string} name
	 * @param {Element} [_class]
	 * @returns {Element}
	 */
	getInstance(node, name, _class) {
		let id = node.getAttribute(Config.idAttr(name));
		let instance = this._instances[id];

		if (instance === void 0) {
			instance = this.initModuleFromNode(node, name);

			if (instance === false && _class) {
				instance = _class.init(node, void 0, name);
			}
		}

		return instance;
	}

	/**
	 * Добавляет экземпляр БЭМ класса в реестр
	 * @param {HTMLElement} node
	 * @param {Element} instance
	 * @returns {Element}
	 */
	addInstance(node, instance) {
		node.setAttribute(Config.idAttr(instance.name), instance.id);

		this._instances[instance.id] = instance;

		if (this._instance_collections[instance.name]) {
			this._instance_collections[instance.name].push(instance);
		}

		return instance;
	}

	/**
	 * Удаляет экземпляр из реестра
	 * @param {HTMLElement} node
	 * @param {string} name
	 * @returns {boolean}
	 */
	removeInstance(node, name) {
		if (!this.issetInstance(node, name)) {
			return true;
		}

		let instance = this.getInstance(node, name);
		let index = this.getCollection(name)
			? this.getCollection(name).findIndex((elem) => elem === instance)
			: false;
		index = (index === -1) ? false : index;

		delete this._instances[instance.id];

		if (index !== false) {
			this._instance_collections[name].splice(index, 1);
		}

		node.removeAttribute(Config.idAttr(instance.name));

		return true;
	}

	/**
	 * @callback invokeBlockInNodeCallable
	 * @param {*}
	 */
	/**
	 * @param {jQuery} $node
	 * @param {invokeBlockInNodeCallable} method
	 * @param {Array} args
	 * @returns {boolean}
	 */
	invokeBlockInNode($node, method, args = []) {
		let elementProcessed = false;
		this.getInstances($node).forEach((block) => {
			if (block[method]) {
				block[method](...args);
				elementProcessed = true;
			}
		});
		return elementProcessed;
	}

	/**
	 * @param {jQuery} $node
	 * @returns {Array}
	 */
	getInstances($node) {
		let result = [];
		if (!$node.attr('class')) {
			return result;
		}
		$node.attr('class').split(' ').forEach((name) => {
			let block = this.getInstance($node.get(0), name);
			if (block) {
				result.push(block);
			}
		});
		return result;
	}

	/**
	 * Возвращает коллекцию БЭМ объектов
	 * @param {string} name
	 * @returns {boolean|Collection}
	 */
	getCollection(name) {
		if (this._instance_collections[name] === void 0) {
			return false;
		}

		return this._instance_collections[name];
	}

	/**
	 * Ленивая инициализация блока
	 * @param {event} event
	 * @private
	 */
	_lazyLoad(event) {
		let node = event.currentTarget;
		if (!node.className) {
			return;
		}
		let names = Utils.parseBlockNames(node.className);
		let i;

		for (i = names.length; i--;) {
			if (node.hasAttribute(Config.idAttr(names[i]))) {
				continue;
			}

			this.initModuleFromNode(node, names[i], event);
		}
	}
}

let reg = new Registry();

export default reg;