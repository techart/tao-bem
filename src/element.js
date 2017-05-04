import $ from "jquery";
import Config from "./config";
import Registry from "./registry";
import Utils from "./utils";
import Collection from "./collection";
import EventEmitter from "events";

class Element extends EventEmitter {
	/**
	 * Имя блока
	 * @throws Не указано имя блока
	 */
	static get blockName() {
		throw 'Unknown block name';
	}

	/**
	 * CSS класс блока
	 * @returns {string}
	 */
	static get blockClass() {
		return '.' + this.blockName;
	}

	/**
	 * @returns {jQuery}
	 */
	static get $win() {
		return $(window);
	}

	/**
	 * @returns {jQuery}
	 */
	static get $doc() {
		return $(document);
	}

	/**
	 * @returns {jQuery}
	 */
	static get $body() {
		return this.$doc;
	}

	/**
	 * Список модификаторов через пробел, биндинг событий которых произойдет автоматически
	 * @returns {string}
	 */
	static get mods() {
		return '';
	}

	/**
	 * Список live-событий и их обработчиков
	 */
	static get events() {
		return {}
	}

	/**
	 * Список mods-событий и их обработчики
	 * @returns {{onMod: {*: (function())}, onElemMod: {*: (function())}}}
	 */
	static get modsEvents() {
		return {
			// События при изменении модификатора блока
			onMod: {
				'*': () => {}
			},

			// События при изменении модификатора эл-та
			onElemMod: {
				'*': () => {}
			}
		}
	}

	/**
	 * Список аттриботов которые необходимо установить при инициализации
	 * @returns {{}}
	 */
	static get attrs() {
		return {}
	}

	/**
	 * Инициализация блока при загрузке страницы
	 * @returns {boolean}
	 */
	static get forced() {
		return true;
	}

	/**
	 * Кешировать все выборки
	 * @returns {boolean}
	 */
	static get cache() {
		return false;
	}

	/**
	 *
	 * @returns {Element}
	 * @private
	 */
	static get __abstrctBlockClass() {
		return require('./block').default;
	}

	/**
	 * Отложенная инициализация, если указано - время задержки в мс
	 * @returns {boolean|number}
	 */
	static get lazy() {
		return false;
	}

	/**
	 * Возвращает конфиг
	 * @returns {Config}
	 */
	static config() {
		return Config;
	}

	/**
	 * Регистрирует объект в реестре
	 * @returns {undefined}
	 */
	static register() {
		return Registry.addModule(this.blockName, this);
	}

	/**
	 * @returns {boolean}
	 */
	static initialized() {
		return this.active || this === Element
	}

	/**
	 * Инициализация экземпляра класса класса с подспиской на события
	 * @param {HTMLElement} node
	 * @param {Event} evt
	 * @param {string} name
	 * @returns {Element}
	 */
	static init(node, evt, name) {
		let self = this;

		let rspace = /\s+/g;
		let live = [];
		let live_cb = {};
		let j;

		if (!self.initialized()) {
			self.active = true;

			if (self.mods) {
				$.each(self.mods.split(rspace), (i, mod) => {
					live.push(this.self.config().autoMods[mod] || '');
				});
			}

			// Соберем массив событий, которые нужно делегировать
			$.each(self.events, (name, fn) => {
				name = $.trim(name).toLowerCase().split(rspace);
				j = name.length;
				while (j--) {
					live_cb[name[j]] = fn;
					if ($.inArray(name[j], live) === -1) {
						live.push(name[j]);
					}
				}
			});

			self._live = live_cb;

			if (live.length) {
				$(self.$body).on(live.join(' '), self.blockClass, self._onEvent.bind(self));
			}
		}

		if (node && !Registry.issetInstance(node, name || self.blockName)) {
			let instance = new self(node, void 0, name);
			let type;

			if (evt) {
				type = evt.type;
				instance.onLiveEvent(evt);

				if (type === 'mouseover') {
					evt.type = 'mouseenter';
					instance.onLiveEvent(evt);
				}

				evt.type = type;
			}

			return instance;
		} else if (!node) {
			Registry.initModuleFromDOM(self.blockName, self.$body);
		}
	}

	/**
	 * Создает новый блок-элемент
	 * @param {string} tagName
	 * @returns {Element}
	 */
	static create(tagName = 'div') {
		let node = document.createElement(tagName);
		node.className = this.blockName;

		return this.getInstance(node);
	}

	/**
	 * Возвращает экземпляр класса для ноды
	 * @param {HTMLElement} node
	 * @returns {Element}
	 */
	static getInstance(node) {
		return Registry.getInstance(node, this.blockName);
	}

	/**
	 * Создает коллекцию БЭМ блоков
	 * @returns {Collection}
	 */
	static makeCollection() {
		return Collection.make();
	}

	/**
	 * Возвращает коллекцию объектов
	 * @returns {boolean|Collection}
	 */
	static getCollection() {
		return Registry.getCollection(this.blockName);
	}

	/**
	 *
	 * @param {Event} evt
	 * @returns {undefined}
	 * @private
	 */
	static _onEvent(evt) {
		return Registry.getInstance(evt.currentTarget, this.blockName).onLiveEvent(evt);
	}

	/**
	 * Аналог php static
	 * @returns {constructor}
	 */
	get self() {
		return this.constructor;
	}

	/**
	 * Возвращает ссылку на родительский БЭМ объект
	 * @returns {Element}
	 */
	get parent() {
		if (this._parent) {
			return this._parent;
		}

		let node = this.$el.closest('.' + this.block)[0];
		let _class = this.self.__abstrctBlockClass;

		return this._parent = Registry.getInstance(node, this.block, _class);
	}

	//noinspection JSAnnotator
	/**
	 * Устанавливает ссылку на родительский элемент
	 * @param {Element} parent
	 */
	set parent(parent) {
		if (!(parent instanceof this.self.__abstrctBlockClass)) {
			throw new Exception('Parent must be instanceof BEM.Block');
		}

		this._parent = parent;
	}

	/**
	 * @returns {boolean}
	 */
	get isBlock() {
		return this instanceof this.self.__abstrctBlockClass;
	}

	/**
	 * @returns {boolean}
	 */
	get isElement() {
		return !this.isBlock;
	}

	/**
	 * Конструктор класса
	 * @param {HTMLElement} node
	 * @param parms
	 * @param {string}name
	 */
	constructor(node, parms, name) {
		super();

		node = $(node);
		parms = parms || {};

		this.name = name = name || this.self.blockName;
		this.cache = parms.cache || this.self.cache;
		this.lazy = parms.lazy || this.self.lazy;
		this.role = parms.role || node.attr('role');

		this.$el = $(node);
		this.el = this.$el[0];
		this.id = ++$.guid;

		this._mods = {};
		this._cache = {};
		this._qevents = [];

		this.block = name;
		this.element = '';

		if (this.isElement) {
			let tmp = name.split(this.self.config().dividers.elem)

			this.block = tmp[0];
			this.element = tmp[1];

			this.on('bem:mod', (mod, state) => {
				this.parent.onElemMod(this, mod, state);
			});
		}

		Registry.addInstance(this.el, this);

		let attrs = this.self.attrs;
		attrs['role'] = this.role;
		this.$el.attr(attrs);

		if (this.lazy) {
			setTimeout(() => this.ready(), this.lazy);
		} else {
			this.ready();
		}
	}

	ready() {
		this.ready = () => this;

		this._silent = true;

		this._mods = Utils.parseMods(this.name, this.el.className, this.self.config().dividers);

		$.each(this._mods, (mod, state) => {
			this._emitMod(mod, state);
		});

		this._silent = false;

		this.onInit();
		this.onLiveEvent(true);
		this.mod('js_init', true);
	}

	/**
	 * Удаляет блок
	 * @param {boolean} absolute
	 */
	destroy(absolute = true) {
		this.destroy = () => true;

		// remove event listeners
		this.removeAllListeners();

		// Absolute destroy
		absolute && this.$el.remove();

		// remove from repo
		Registry.removeInstance(this.el, this.name);
	}

	/**
	 * Проверить/Добавить/Удалить модификатор
	 * @param {string} name
	 * @param {boolean} [state]
	 * @returns {*}
	 */
	mod(name, state) {
		name = $.trim(name).split(/\s+/g);

		let el = this.el;
		let i = name.length;
		let mod, currentMod, classMod, className;

		if (state === void 0) {
			return this._mods[name];
		}

		while (i--) {
			mod = name[i];
			currentMod = this._mods[mod];

			if (currentMod === void 0) {
				currentMod = false;
			}

			if (currentMod != state) {
				this._mods[mod] = state;

				if (this._emitMod(mod, state) !== false) {
					classMod = Utils.modClassName(this.name, mod, currentMod);
					className = (' ' + el.className + ' ').replace(' ' + classMod + ' ', ' ');

					this._mods[mod] = state;

					if (state) {
						className += Utils.modClassName(this.name, mod, state) + ' ';
					}

					el.className = $.trim(className);
				} else {
					// revert mod -- WTF????
					this._mods[mod] = currentMod;
				}
			}
		}

		return this;
	}

	/**
	 * Проверить наличие модификатора
	 * @param {string} name
	 * @param {string} [state]
	 * @returns {boolean}
	 */
	hasMod(name, state) {
		const val = this._mods[name];
		return state === void 0 ? !!val : val == state;
	}

	/**
	 * Добавить модификаторы
	 * @param {string} name
	 * @param {string} [state]
	 * @returns {Element}
	 */
	addMod(name, state) {
		return this.mod(name, state ? state : true);
	}

	/**
	 * Удалить модификаторы
	 * @param {string} name
	 * @param {string} [state]
	 * @returns {Element}
	 */
	delMod(name, state) {
		if (state === void 0 || this.hasMod(name, state)) {
			this.mod(name, false);
		}

		return this;
	}

	/**
	 * Дабавить или удлаить модификатор
	 * @param {string} name
	 * @param {string} [state]
	 * @returns {Element}
	 */
	toggleMod(name, state) {
		return this.mod(name, state === void 0 ? !this.hasMod(name) : state);
	}

	/**
	 * @param {string} blockName
	 * @returns {Element}
	 */
	asBlock(blockName) {
		let _class = Registry.getModule(blockName);
		let instance = Registry.getInstance(this.el, _class.blockName, this.self.__abstrctBlockClass);

		if (this.isElement) {
			instance.parent = this.parent;
		}

		return instance;
	}

	/**
	 * Аналог this.$el.find
	 * @param {string} sel
	 * @param {boolean} force
	 * @returns {jQuery}
	 */
	$(sel, force) {
		let ret = this.$el;
		let cache = force ? false : this.cache;

		if (sel !== void 0) {
			if (cache && this._cache[sel] !== void 0) {
				ret = this._cache[sel];
			} else {
				ret = ret.find(this.s(sel));
				if (cache) {
					this._cache[sel] = ret;
				}
			}
		}

		return ret;
	}

	/**
	 * @param {string} sel
	 * @param {string} className
	 * @returns {string}
	 */
	s(sel, className) {
		let result = '';
		sel.split('+').forEach((si) => {
			result += this.si(si, result ? result : className);
		});
		return result;
	}

	/**
	 *
	 * @param {string} sel
	 * @param {string} className
	 * @returns {*}
	 */
	si(sel, className) {
		className = className ? className : '.' + this.name;

		let elDivider = this.self.config().dividers.elem;
		let elDividerEscaped = Utils.regexpEscape(elDivider);
		let modDivider = this.self.config().dividers.mods;
		let modDividerEscaped = Utils.regexpEscape(modDivider);

		if (typeof sel === 'string' && (new RegExp(elDividerEscaped)).test(sel)) {
			sel = sel.replace(new RegExp('\\b' + elDividerEscaped, 'g'), className + elDivider);
		}
		if (typeof sel === 'string' && (new RegExp(modDividerEscaped)).test(sel)) {
			sel = sel.replace(new RegExp(modDividerEscaped, 'g'), className + modDivider);
		}

		return sel;
	}

	/**
	 * Вызывается при инициализации экземпляра
	 */
	onInit() {

	}

	/**
	 * Обработка событий
	 * @param {Event} evt
	 */
	onLiveEvent(evt) {
		if (evt === true) {
			this.onLiveEvent = this._onLiveEvent;

			evt = this._qevents.shift();
			while (evt) {
				this.onLiveEvent(evt);
				evt = this._qevents.shift();
			}
		} else {
			this._qevents.push(evt);
		}
	}

	/**
	 * @param {Event} evt
	 * @returns {undefined|*}
	 * @private
	 */
	_onLiveEvent(evt) {
		let self = this.self;

		let type = evt.type;
		let mod = self.config().eventMod[type];
		let fn = self._live[type];
		let ret;

		// обработка события при смене фокуса на дочерний элемент
		if (type.indexOf('focus') === 0) {
			clearTimeout(this._focusOutId);

			if (type === 'focusin') {
				if (this.focused) {
					return;
				}
				this.focused = true;
			} else if (this.focused) {
				this._focusEvent = evt;
				this._focusOutId = setTimeout(this._onFocusOut, 1);
				return;
			}
		}

		if (fn !== void 0) {
			if (typeof fn === 'string') {
				fn = this[fn];
			}

			ret = fn.call(this, evt);
		}

		// авто установка модификатора по событию
		if (ret !== false
			&& mod !== void 0
			&& ~self.mods.indexOf(mod[0])
		) {
			// Set mod by event type
			this.mod(mod[0], mod[1]);
		}

		return ret;
	}

	/**
	 * @private
	 */
	_onFocusOut() {
		if (!$(document.activeElement).closest(this.el, this.$el)[0]) {
			this.focused = false;
			this.onLiveEvent(this._focusEvent);
		}
	}

	/**
	 * Рассылка событий об изменения модификатора
	 * @param {string} mod
	 * @param {boolean} state
	 * @param {boolean} [inner]
	 * @returns {boolean}
	 * @private
	 */
	_emitMod(mod, state, inner) {
		let onMod = this.self.modsEvents.onMod || {};

		let ret = inner || this._invoke(onMod['*'], mod, state);
		let isStr = typeof state === 'string';
		let fn, fnType, strState;

		if (ret !== false) {
			fn = onMod[mod];

			if (fn === false) {
				ret = false;
			} else if (fn) {
				fnType = typeof fn;

				if (fnType === 'string') {
					ret = this._invoke(fn, state, mod);
				} else if (fnType === 'object') {
					if (fn['*'] !== void 0) {
						ret = this._invoke(fn['*'], state, mod);
					}

					if (ret !== false
						&& fn[strState = (isStr ? state : (state ? 'yes' : 'no'))] !== void 0
					) {
						ret = this._invoke(fn[strState], state, mod);
					}
				} else {
					ret = this._invoke(fn, state, mod);
				}
			}

			if (ret !== false
				&& inner !== true
				&& this._emitMod(mod + this.self.config().dividers.mods_val + (isStr ? state : (state ? 'yes' : 'no')), state, true) === false
			) {
				ret = false;
			}
		}

		if (ret !== false && inner !== true) {
			this.emit('bem:mod', mod, state, this);
		}

		return ret;
	}

	/**
	 *
	 * @param {Element} elem
	 * @param {string} mod
	 * @param {boolean} state
	 * @returns {*}
	 * @private
	 */
	_emitElemMod(elem, mod, state) {
		let onElemMod = this.self.modsEvents.onElemMod || {};
		let ret = this._invoke(onElemMod['*'], elem, mod, state);
		let fn, fnType;

		if (ret !== false) {
			// Получаем элемент
			fn = onElemMod[elem.element];

			if (fn === false) {
				ret = false;
			} else if (fn) {
				fnType = typeof fn;

				if (fnType === 'string') {
					this._invoke(fn, elem, mod, state);
				} else if (fnType === 'object') {
					if (fn['*'] !== void 0) {
						// Установка любого модификатора
						ret = this._invoke(fn['*'], mod, state, elem);
					}

					if (ret !== false && (fn = fn[mod])) {
						if (this._invoke(fn, state, mod, elem) === false) {
							ret = false;
						}
					} else if (fn === false) {
						ret = false;
					}
				} else {
					ret = this._invoke(fn, state, mod, elem);
				}
			}
		}

		if (ret !== false) {
			this.emit('bem:element:mod', elem, mod, state, this);
		}

		return ret;
	}

	/**
	 * Слушаем события на изменения модификатора у элементов
	 * @param {Element} elem
	 * @param {string} mod
	 * @param {boolean} state
	 */
	onElemMod(elem, mod, state) {
		this._emitElemMod(elem, mod, state);
	}


	/**
	 * @callback invokeCallback
	 * @param {*}
	 */
	/**
	 * @param {invokeCallback} fn
	 * @param args
	 * @returns {*}
	 * @private
	 */
	_invoke(fn, ...args) {
		if (fn === false) {
			return false;
		} else if (typeof fn === 'string') {
			fn = this[fn];
		} else if (fn === void 0) {
			return void 0;
		}

		return fn.apply(this, args);
	}
}

export default Element;
