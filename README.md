# frontend-tao / bem
...

## Установка
Установка пакета, как и любого другого, производится через npm

``` bash
npm install ssh+git://git@gitlab.s.intranet:frontend-tao/bem.git
```

## Состав пакета
Библиотека состоит из следующих компонентов:
* ```BEM.Block```      - абстрактный класс для описания поведения блока
* ```BEM.Collection``` - базовый класс коллекций блоков
* ```BEM.Registry```   - объект-хранилище для определенных bem-js блоков  
* ```BEM.Config```     - экземпляр конфига

## Декларация блока
JS-реализация блока описывает поведение определённого класса элементов веб-интерфейса. В конкретных интерфейсах каждый 
блок может быть представлен несколькими экземплярами. Экземпляр блока реализует функциональность своего класса и имеет 
собственное, независимое состояние. Экземпляры одного блока объединяются в коллекции ```BEM.Collection``` этого блока 

В терминах парадигмы объектно-ориентированного программирования:
* ***блок*** — класс;
* ***экземпляр блока*** — экземпляр класса.

Поведение блока описывается в JavaScript-файле блока (myblock.js).
В соответствии с ООП, вся функциональность блока реализуется модульно в методах класса блока. 
Данный класс должен расширять абстрактный класс ```BEM.Block``` 

Методы блока подразделяются на:
* статические методы и свойства.
* методы и свойства экземпляра блока;

### Cтатические методы и свойства

#### blockName
Свойство должно содержать имя блока.
***Внимание!*** данное свойство должно быть обязательно переопределено.

#### live
Cвойство должно содержать объект со списоком js-событий и их обработчиков, подписка на которые произодет при 
инициализации блока. В качестве обработчика могут выступать:
* ***строка***   - в этом случае при наступлении события будет вызван одноименный метод у экземпляра класса
* ***callback*** - в этом случае при наступлении события будет вызван переданный callback

``` js
//...
static get live()
{
	return {
		'click': 'onClick',
	}
}
```

#### events
Свойство должно содержать объект со списком событий и их обработчиков. Структура возвращаемого объекта должна быть сделующей:
``` js
//...
static get events()
{
	return {
		// список обработчиков при изменении модификаторов блока
		'onMod': {
			// данный callback будет вызван каждый раз когда будет изменен модификатор modName не зависимо от его значения
			'modName': 'onModName',
			
			// если необходима подписка на изменения модификатора с определенным значением
		    'modName2': {
				'value1': 'onModNameValueOne',
				'value2': 'onModNameTwoOne',
		    }
		},
		
		// список обработчиков при изменении модификаторов у эл-ов блока
		'onElemMod': {
			// Ключ - имя эл-та. Значение - структура аналогичная onMod 
			'elemName': {
				'modName': 'onModName'
			}
		}
	}
}
```

#### mods
Свойство должно авто-модификаторы (перечисление через пробел)
Возможные значения
* ***hover***
* ***focus***
* ***press***
При наступлении соответсвующих событий у блока будут автом. изменяться указанные модификаторы

#### attrs
Свойство должно возвращать список аттрибутов которые будут установлены при инициализации блока.
``` js
//...
static get events()
{
	return {
		'attrName': 'attrValue',
	}
}
```

#### forced
Принудительная инициализация всех экземпляров блока на странице.
По умолчанию инициализация экземпляра блока происходит при наступлении внутри него какого либо пользовательского события
(навели мышку, кликнули и т.п). По умолчанию ***false***

#### lazy
Ленивая инициализация.
Св-во может содержать кол-во милисекунд на которое будет отложена инициализация блока.
Например при значении св-ва ***1000*** в месте со свойством ```forced``` в значении ***true*** инициализация блока 
произойдет через секунду после загрузки страницы. По умолчанию ***0***

#### cache
Кешировать все выборки.
Если св-во содержать ```true```, то при доступе к дочерним эл-ам все выборки будут сохранены в кеше.

#### $win, $doc, $body
Содержат ссылку на jQuery объект window, document, document.body соответственно 

#### create([tagName = 'div'])
Создает новый DOM элемент и возвращает экземпляр класса блока для этого эл-та

#### getInstance(DomElement node)
Возвращает экземпляр класса блока

#### makeCollection()
Создает новую коллекцию блоков данного типа. 
Для переопределения базовой коллекции блока нужно переопределить данный метод и в нем вернуть экземпляр своей коллекции коллекции

#### getCollection()
Метод возвращает коллекцию экземпляров блока на странице. 
Данная коллекция будет изменяться по мере инициализации новых блоков или их удалении

#### config()
Возвращает BEM.Config

#### register()
Метод регистрирует данный блок в реестре блоков. 
Должен быть обязательно вызван после определения класса.
``` js

// ...
class MyBlock extends BEM.Block
{
	// ...
}

MyBlock.register();
```
