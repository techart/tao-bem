import $ from "jquery";
import Config from "./config";
import Registry from "./registry";
import Utils from "./utils";
import Collection from "./collection";
import EventEmitter from "events";

class Element extends EventEmitter
{
	/**
	 * Имя блока
	 */
	static get blockName()
	{
		throw 'Unknown block name';
	}

	/**
	 * CSS класс блока
	 */
	static get blockClass()
	{
		return '.'+ this.blockName;
	}

	static get $win()
	{
		return $(window);
	}

	static get $doc()
	{
		return $(document);
	}

	static get $body()
	{
		return this.$doc;
	}

	/**
	 * Список модификаторов через пробел,
	 * биндинг событий которых произойдет автоматически
	 */
	static get mods()
	{
		return '';
	}

	/**
	 * Список live-событий и их обработчиков
	 */
	static get live()
	{
		return {}
	}

	/**
	 * Список mods-событий и их обработчико
	 */
	static get events()
	{
		return {
			// События при изменении модификатора блока
			onMod: {
				'*': () => {}
			},

			// События при изменении модификатора эл-та
			'onElemMod': {
				'*': () => {}
			}
		}
	}

	/**
	 * Список аттриботов которые необходимо установить при инициализации
	 */
	static get attrs()
	{
		return {}
	}

	/**
	 * Инициализация блока при загрузке страницы
	 */
	static get forced()
	{
		return false;
	}

	/**
	 * Кешировать все выборки
	 */
	static get cache()
	{
		return false;
	}

	static get __abstrctBlockClass()
	{
		return require('./block').default;
	}

	/**
	 * Отложенная инициализация, если указано - время задержки в мс
	 */
	static get lazy()
	{
		return false;
	}

	/**
	 * Возвращает конфиг
	 */
	static config()
	{
		return Config;
	}

	/**
	 * Регистрирует объект в реестре
	 */
	static register()
	{
		return Registry.addModule(this.blockName, this);
	}

	static initialized()
	{
		return this.active || this === Element
	}

	/**
	 * Инициализация экземпляра класса класса с подспиской на события
	 *
	 * @param node
	 * @param evt
	 * @param name
	 * @returns {Block}
	 */
	static init(node, evt, name)
	{
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
			$.each(self.live, (name, fn) => {
				name = $.trim(name).toLowerCase().split(rspace);
				j = name.length;
				while (j--) {
					live_cb[name[j]] = fn;
					if ($.inArray(name[j], live) == -1) {
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
			let instance = new self(node, window.undef, name);
			let type;

			if (evt) {
				type = evt.type;
				instance.onLiveEvent(evt);

				if (type == 'mouseover') {
					evt.type = 'mouseenter';
					instance.onLiveEvent(evt);
				}

				evt.type = type;
			}

			return	instance;
		} else if (!node) {
			Registry.initModuleFromDOM(self.blockName, self.$body);
		}
	}

	/**
	 * Создает новый блок-элемент
	 *
	 * @param tagName
	 */
	static create(tagName = 'div')
	{
		let node = document.createElement(tagName);
		node.className = this.blockName;

		return this.getInstance(node);
	}

	/**
	 * Возвращает экземпляр класса для ноды
	 *
	 * @param node
	 * @returns {*}
	 */
	static getInstance(node)
	{
		return Registry.getInstance(node, this.blockName);
	}

	/**
	 * Создает коллекцию БЭМ блоков
	 */
	static makeCollection()
	{
		return Collection.make();
	}

	/**
	 * Возвращает коллекцию объектов
	 */
	static getCollection()
	{
		return Registry.getCollection(this.blockName);
	}

	static _onEvent(evt)
	{
		return Registry.getInstance(evt.currentTarget, this.blockName).onLiveEvent(evt);
	}

	/**
	 * Аналог php static
	 */
	get self()
	{
		return this.constructor;
	}

	/**
	 * Возвращает ссылку на родительский БЭМ объект
	 */
	get parent()
	{
		if (this._parent) {
			return this._parent;
		}

		let node = this.$el.closest('.' + this.block)[0];
		let _class = this.self.__abstrctBlockClass;

		return this._parent = Registry.getInstance(node, this.block, _class);
	}

	/**
	 * Устанавливает ссылку на родительский элемент
	 * @param parent
	 */
	set parent(parent)
	{
		if (!(parent instanceof this.self.__abstrctBlockClass)) {
			throw new Exception('Parent must be instanceof BEM.Block');
		}

		this._parent = parent;
	}

	get isBlock()
	{
		return this instanceof this.self.__abstrctBlockClass;
	}

	get isElement()
	{
		return !this.isBlock;
	}

	/**
	 * Конструктор класса
	 *
	 * @param node
	 * @param parms
	 */
	constructor(node, parms, name)
	{
		super();

		node  = $(node);
		parms = parms || ((node.attr('onclick') || $.noop)() || {});

		this.name  = name = name || this.self.blockName;
		this.cache = parms.cache || this.self.cache;
		this.lazy  = parms.lazy  || this.self.lazy;
		this.role  = parms.role  || node.attr('role');

		this.$el = $(node).removeAttr('onclick');
		this.el  = this.$el[0];
		this.id  = ++$.guid;

		this._mods    = {};
		this._cache   = {};
		this._qevents = [];

		this.block   = name;
		this.element = '';

		if (this.isElement) {
			let tmp = name.split(this.self.config().dividers.elem)

			this.block   = tmp[0];
			this.element = tmp[1];

			this.on('bem:mod', (mod, state) => {
				this.parent.onElemMod(this, mod, state);
			});
		}

		Registry.addInstance(this.el, this);

		let  attrs = this.self.attrs;
		attrs['role'] = this.role;
		this.$el.attr(attrs);

		if (this.lazy) {
			setTimeout(() => this.ready(), this.lazy);
		} else {
			this.ready();
		}
	}

	ready()
	{
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
	 */
	destroy(absolute = true)
	{
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
	 *
	 * @public
	 * @param	{String}	name
	 * @param	{Boolean}	[state]
	 * @return	{*}
	 */
	mod(name, state)
	{
		name = $.trim(name).split(/\s+/g);

		let el = this.el;
		let i = name.length;
		let mod, currentMod, classMod, className;

		if (state === window.undef) {
			return	this._mods[name];
		}

		while(i--) {
			mod	= name[i];
			currentMod = this._mods[mod];

			if (currentMod === window.undef) {
				currentMod = false;
			}

			if (currentMod != state) {
				this._mods[mod] = state;

				if (this._emitMod(mod, state) !== false) {
					classMod  = Utils.modClassName(this.name, mod, currentMod);
					className = (' '+ el.className +' ').replace(' '+ classMod +' ', ' ');

					this._mods[mod]	= state;

					if (state) {
						className += Utils.modClassName(this.name, mod, state) + ' ';
					}

					el.className = $.trim(className);
				} else {
					// revert mod -- WTF????
					this._mods[mod]	= currentMod;
				}
			}
		}

		return	this;
	}

	/**
	 * Проверить наличие модификатора
	 *
	 * @public
	 * @param {String} name
	 * @param {String} [state]
	 * @return {Boolean}
	 */
	hasMod(name, state)
	{
		var val = this._mods[name];
		return	state === window.undef ? !!val : val == state;
	}

	/**
	 * Добавить модификаторы
	 *
	 * @public
	 * @param {String} name
	 * @param {String} [state]
	 * @return {Element}
	 */
	addMod(name, state)
	{
		return	this.mod(name, state ? state : true);
	}

	/**
	 * Удалить модификаторы
	 *
	 * @public
	 * @param {String} name
	 * @param {String} [state]
	 * @return {Element}
	 */
	delMod(name, state)
	{
		if (state === window.undef || this.hasMod(name, state)) {
			this.mod(name, false);
		}

		return	this;
	}

	/**
	 * Дабавить или удлаить модификатор
	 *
	 * @public
	 * @param {String} name
	 * @param {Boolean} [state]
	 * @return {Element}
	 */
	toggleMod(name, state)
	{
		return	this.mod(name, state === window.undef ? !this.hasMod(name) : state);
	}

	asBlock(blockName)
	{
		let _class = Registry.getModule(blockName);
		let instance = Registry.getInstance(this.el, _class.blockName, this.self.__abstrctBlockClass);

		if (this.isElement) {
			instance.parent = this.parent;
		}

		return instance;
	}

	/**
	 * Аналог this.$el.find
	 *
	 * @param sel
	 * @param force
	 * @returns {*|jQuery}
	 */
	$(sel, force)
	{
		let ret = this.$el;
		let cache = force ? false : this.cache;

		if( sel !== window.undef ){
			if ( cache && this._cache[sel] !== window.undef) {
				ret	= this._cache[sel];
			} else {
				ret	= ret.find(this.s(sel));
				if( cache ){
					this._cache[sel] = ret;
				}
			}
		}

		return	ret;
	}

	s(sel, className)
	{
		if( typeof sel == 'string' && (new RegExp(this.self.config().dividers.elem)).test(sel) ){
			sel = sel.replace(new RegExp('\\b'+ this.self.config().dividers.elem, 'g'), (className ? '' : '.') + this.name + '__');
		}

		return	sel;
	}

	/**
	 * Вызывается при инициализации экземпляра
	 */
	onInit()
	{

	}

	/**
	 * Обработка событий
	 * @param evt
	 */
	onLiveEvent(evt)
	{
		if (evt === true) {
			this.onLiveEvent = this._onLiveEvent;

			evt = this._qevents.shift();
			while(evt) {
				this.onLiveEvent(evt);
				evt = this._qevents.shift();
			}
		} else {
			this._qevents.push(evt);
		}
	}

	_onLiveEvent(evt)
	{
		let self = this.self;

		let type = evt.type;
		let mod = self.config().eventMod[type];
		let fn = self._live[type];
		let ret;

		// обработка события при смене фокуса на дочерний элемент
		if (type.indexOf('focus') === 0) {
			clearTimeout(this._focusOutId);

			if (type == 'focusin') {
				if (this.focused) {
					return;
				}
				this.focused = true;
			} else if (this.focused){
				this._focusEvent = evt;
				this._focusOutId = setTimeout(this._onFocusOut, 1);
				return;
			}
		}

		if (fn !== window.undef) {
			if (typeof fn == 'string') {
				fn = this[fn];
			}

			ret = fn.call(this, evt);
		}

		// авто установка модификатора по событию
		if (ret !== false
			&& mod !== window.undef
			&& ~self.mods.indexOf(mod[0])
		) {
			// Set mod by event type
			this.mod(mod[0], mod[1]);
		}

		return ret;
	}

	_onFocusOut()
	{
		if (!$(document.activeElement).closest(this.el, this.$el)[0]) {
			this.focused = false;
			this.onLiveEvent(this._focusEvent);
		}
	}

	/**
	 * Рассылка событий об изменения модификатора
	 *
	 * @private
	 * @param	{String}	mod
	 * @param	{Boolean}	state
	 * @param	{Boolean}	[inner]
	 * @return	{Boolean}
	 */
	_emitMod(mod, state, inner)
	{
		let onMod = this.self.events.onMod || {};

		let ret   = inner || this._invoke(onMod['*'], mod, state);
		let isStr = typeof state === 'string';
		let fn, fnType, strState;

		if (ret !== false) {
			fn = onMod[mod];

			if (fn === false) {
				ret	= false;
			} else if (fn) {
				fnType = typeof fn;

				if (fnType === 'string') {
					ret = this._invoke(fn, state, mod);
				} else if (fnType === 'object') {
					if (fn['*'] !== window.undef) {
						ret = this._invoke(fn['*'], state, mod);
					}

					if (ret !== false
						&& fn[strState = (isStr ? state : (state ? 'yes' : 'no'))] !== window.undef
					) {
						ret = this._invoke(fn[strState], state, mod);
					}
				} else {
					ret	= this._invoke(fn, state, mod);
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

		return	ret;
	}

	_emitElemMod(elem, mod, state)
	{
		let onElemMod = this.self.events.onElemMod || {};
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
					if (fn['*'] !== window.undef) {
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
					ret	= this._invoke(fn, state, mod, elem);
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
	 *
	 * @param  {Event} evt
	 * @param  {Object}  mod
	 * @private
	 */
	onElemMod(elem, mod, state)
	{
		this._emitElemMod(elem, mod, state);
	}

	_invoke(fn, ...args)
	{
		if (fn === false) {
			return false;
		} else if (typeof fn === 'string') {
			fn = this[fn];
		} else if (fn === window.undef) {
			return window.undef;
		}

		return fn.apply(this, args);
	}
}

export default Element;