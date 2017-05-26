# TAO.BEM
tao-bem - базовая ООП библиотека, соответвующая [методологии БЭМ](https://ru.bem.info/methodology/quick-start/). Представляет собой описание блоков в виде js-классов и инкапсуляции необходимого состояния в объектах этих классов. 

БЭМ (Блок, Элемент, Модификатор) - опенсорс-технология разработки сайтов, реализующая принцип разделения интерфейса на независимые блоки с возможностью многкратного их использования.

Выделение абстракций - Блоков, Элементов и Модификаторов позволяет легко обрабатывать события, добавлять модификаторы и выполнять множество других опрераций над блоком и его элементами.


## Установка
Для установки пакета применяем команду yarn.

``` bash
yarn add @webtechart/tao-bem
```

## Подключение и использование

Для описания минимального рабочего блока необхоидимо создать отдельный класс, описывающий этот блок и наследуемый от базового класса `TAO.BEM`. В этом классе *обязательно* переопределить статический геттер `blockName()`, который должен возвращать css-класс данного блока.

Далее необходимо провести инициализацию созданного класса в системе tao-bem, вызвав в нем статический метод `register()`.

``` js
import BEM from 'tao-bem'

class News extends BEM.Block {
    static get blockName() {
        return 'b-news';
    }
}

News.register()
```

В примере выше мы создали и зарегистрировали самый простой блок. Правда, абсолютно бесполезный. Попробуем добавить немного логики в наш блок. Это может быть реализация метода onInit, подписка на события и реализация их обработчиков, добавление различных кастомных методов.

Ниже приведен пример расширения реализации класса блока.

```js
import BEM from 'tao-bem'

class News extends BEM.Block {
    static get blockName() {
        return 'b-news';
    }

    onInit() {
        this.debug = 'is_init';
        console.log('Instance of News initialized!');
    }

    static get events() {
        return {
            click: function(event) {
                this.makeSomeNoise();
                event.stopPropagation();
            },
            mouseout: 'makeSomeNoise'
        };
    }

    static get modsEvents() {
        return {
            onMod: {
                'test-mod': function(modValue, modName) {
                    this.makeSomeNoise(modValue);
                }
            },
            onElemMod: {
                'button' : {
                    'disabled': function (modValue, modName) {
                        this.makeSomeNoise();
                    }
                }
            }
        };
    }

    static get elementsEvents() {
        return {
            'button.click': function(element, allElements, event) {
                window.location.reload();
            }
        };
    }

    makeSomeNoise(noiseLevel = 0) {
        alert('Noise!' + (noiseLevel ? ' Going to noise level ' + noiseLevel : ''));
    }
}

News.register();
```

Переопределив метод `onInit()`, мы получим возможность произвести необходимую подготовку в тот момент, когда TAO.BEM обнаруживает в DOM-дереве элемент блока и обрабатывает связанные с ним скрипты. Пока для примера оставим простое сообщение в консоли.

Переопределив статический геттер `events()`, мы подписываемся на события вызываемые на блоке. В данном случае мы вызываем метод `makeSomeNoise` при клике по блоку и выводе курсора с блока.

Переопределив статический геттер `modsEvents()`, мы добавили обработчик на изменение модификатора `test-mod` самого блока и изменении модификатора `disabled` у элемента `button` этого блока (т.е. на переключение класс `b-news__button--disabled` у элемента с классом `b-news__button`).

Переопределив статический геттер `elementsEvents()`, мы добавили обработчик на клик по элементу `button` (класс `b-news__button`).

### Инициализация блоков

При подключении TAO.BEM скрипт обходит имеющееся DOM-дерево, отыскивает DOM-элементы с классами зарегистрированных блоков (тех, чьи блоки возвращают из статического геттера `blockName`), и для каждого создаются экземпляры соотвествующих классов BEM-блоков.

Также скрипт подписывается на изменения DOM-дерева, и при последующих добавлениях новых DOM-элементов для них также при необходимости будут созданы экземпляры BEM-блоков.

При необходимости стартовая автоматическая инициализация блоков может быть заменена "ленивой" инициализацией при первом появлении блока на экране. Для этого нужно переопределить статический геттер `forced()` у класса блока и вернуть `false`.

### Организация структуры блоков

После инициализации ссылки на все созданные блоки попадают в Регистр. Если есть ссылка на DOM-элемент, который представляет  блок, то из Регистра можно получить соответствующий ему BEM-объект с помощью метода `getInstance($node, name)`.

```js
import BEM from 'tao-bem';

let $node = $('.b-news');
let News = BEM.Registry.getInstance($node, 'b-news');
News.makeSomeNoise();
```

Для удобства манипулирования наборами блоков введено поятие Коллеций.

Коллеция - это специальный объект, который позволяет хранить несколько блоков и выполнять над ними групповые операции.

Объект коллекции наследует коллекцию из TAO.Core, поэтому в нём доступны все методы родителя. Помимо этого существуют несколько специфичных методов, которые позволяют изменять модификаторы всем элементам коллекции (`addMod(name, state)`, `delMod(name, state)`, `toggleMod(name, state)`) и метод `byMod(name, state)` для фильтрации элементов коллекции по значению модификатора.

Для получения коллекции блоков необходимо воспользоваться Регистром - методом `getCollection(name)`. Или воспользоваться статическим методом `getCollection()` класса требуемого блока.

```js

import BEM from 'tao-bem';

// ниже два примера идентичного кода
let collection = BEM.Registry.getCollection('b-news');
collection.first().makeSomeNoise();

let sameCollection = News.getCollection();
sameCollection.first().makeSomeNoise();
```

У каждого блока с помощью метода `elems(name)` можно получить коллекцию его элементов, и первый из элементов с помощью метода `elem(name)`.

```js
import BEM from 'tao-bem';

let $node = $('.b-news');
let newsBlock = BEM.Registry.getInstance($node, 'b-news');
let buttons = newsBlock.elems();
let firstButton = newsBlock.elem();

buttons.delMod('disabled');
firstButton.addMod('disabled');
```

Для блоков есть возможность переопределения класса коллекции, чтобы расширить его дополнительными методами. Для этого нужно переопределить статический метод `makeCollection()` класса блока. Из него вернуть новый объект коллекции, который будет использоваться для хранения блоков.

### Обработка событий блока

Во время жизни блока, скорее всего, ему придётся как-то взаимодействовать с окружающим его кодом и реагировать на действия пользователей. Такие взаимодействия удобно организовывать в виде событий. Для обработки событий блока в tao-bem существует несколько статических геттеров:

#### `events()`

Используется для подписки на события самого блока. Этот метод должен вернуть хэш-таблицу (обычный объект JS), ключами которой являются имена событий, на которые мы хотим подписатсья, а значениями - обработчики. В качестве обработчика может выступать как привычная всем анонимная функция (можно использовать и стрелочные функции, но в них будет потерян контекст `this`, а значит  придётся явно получать объект блока, на котором произошло событие), так и строка, содержащая имя метода класса блока.

#### `modsEvents()`

Используется для подписки на события изменений значений модификаторов блока. Удаление модификатора обрабатывается как событие изменения значения модификатора на `false`, а добавление модификатора без значения обрабатывается как событие изменения значения модификатора на `true`.

В обработчик будет передано новое значение - модификатор и имя модификатора. Текущим контекстом будет класс блока.

Важно понимать, что обработка событий будет происходить только при изменении модификаторов через api TAO.BEM, т.е. вызовами методов `addMod`, `delMod`, `toggleMod` и `mod`. Также обработчик однократно сработает при инициализации блока для всех модификаторов, которые присутствуют на DOM-элементе.

Вернув из обработчика `false`, можно отменить изменение модификатора (однако обработчик вызванный на событии при инициализации блока не сможет таким образом "сбросить" модификаторы).

Помимо общих обработчиков на изменение модификаторов возможно подписываться на присвоение некоторым модификаторам определённых значений. В этом случае обработчик будет срабатывать только если модификатор получает подходящее значение. Ниже приведён пример.

```js
import BEM from 'tao-bem'

class News extends BEM.Block {
    static get blockName() {
        return 'b-news';
    }

    static get modsEvents() {
        return {
            onMod: {
                'some-mod': {
                    'some': function(modValue, modName) {
                        this.makeSomeNoise(modValue);
                    },
                    'someOther': function(modValue, modName) {
                        this.makeSomeNoise(modValue);
                    }
                }
            }
        };
    }

    makeSomeNoise(noiseLevel = 0) {
        alert('Noise!' + (noiseLevel ? ' Going to noise level ' + noiseLevel : ''));
    }
}

News.register()
```

Также можно навешивать обработчики на изменение модификаторов элементов блока. Работает это аналогично добавлению обаботчиков на изменение модиикаторов блока, только ключом будет не `onMod`, а `onElemMod`. Ниже пример.

```js
import BEM from 'tao-bem'

class News extends BEM.Block {
    static get blockName() {
        return 'b-news';
    }

    static get modsEvents() {
        return {
            onElemMod: {
                'button': {
                    'disabled': function(modValue, modName) {
                        this.makeSomeNoise(modValue);
                    },
                }
            }
        };
    }

    makeSomeNoise(noiseLevel = 0) {
        alert('Noise!' + (noiseLevel ? ' Going to noise level ' + noiseLevel : ''));
    }
}

News.register()
```

#### Автомодификаторы

Для блока можно включить автоматическое переключение определённых модификаторов при наступлении определённых событий блока. На текущий момент поддерживаются следующие события:

* `hover` - наведение курсора мыши
* `press` - клик
* `focus` - получение фокуса

Для включения автомодификаторов нужно переопределить статический геттер `mods()` и вернуть из него строку, содержащую список необходимых модификаторов, разделённых пробелом.

```js
import BEM from 'tao-bem'

class News extends BEM.Block {
    static get blockName() {
        return 'b-news';
    }

    static get mods() {
        return 'hover press';
    }
}

News.register();
```

## Взаимодействие между блоками

Как описывалось выше все блоки можно получить через регистр коллекций: `BEM.Registry.getCollection('b-news')`. Но тут есть небольшая тонкость.

Так как инициализация блоков происходит последовательно, то нет гарантиии, что в момент инициализации конкретного блока уже будут иметься в коллекции экземпляры других блоков. Поэтому внутри метода `onInit` не стоит надеяться найти `BEM.Registкy` коллекцию других блоков. Для решения данной проблемы существует 2 способа:

1) Получить нужный блок через промис.
2) Производить инициализацию только после создания экземпляров всех связанных блоков.

Оба способа работают только для единичных экземляров (появления первого инстанса), если требуется ожидать все экземляры блока, то придется придумывать что-то своё.

### Получение блока через промис

Данный вариант подходит если нужно получить связанный блок однакратно для выполнения каких-то операций, никак не влияющих на поведение текущего блока.

Получить промис можно через регистр: `BEM.Registry.waitBlock('block_name')`, аргументом метода является строка с именем блока. Метод возвращает промис, который пока не поддерживает ошибок (будет ждать бесконечно), а в момент появления требуемого блока в регистре вызовет резолв промиса с параметром, являющимся объектом-экземляром данного блока. Пример:
```js
BEM.Registry.waitBlock('b-gallery').then(gallery => gallery.goto(0));
```

Ждем пока будет инициализирован блок `b-gallery`, после чего на нем вызываем метод `goto`

### Ожидание связанных блоков

Тут все сложнее:
* Для начала нужно указать классы всех связанных блоков через статический геттер `relatedBlocks`.
* Внутри метода `onInit` произвести инициализацию только логики, не относящейся к связанным блокам. А остальную инициализацию проводить в методе `onRelatedBlocksInit`, который будет вызван только полсле того, как будут инициализированы все связанные блоки (или не будет вызван, если не будет нужных блоков - будьте осторожны с опечатками в именах).
* После вызова `onRelatedBlocksInit`, как минимум, по одному экземляру для каждого из зависимых блоков будет находиться в регистре блоков. Но для упрощения доступа можно воспользоваться свойством `relatedBlocks` текущего блока, который содержит `Set` для первых найденных инстанцев для кадого из зависимых блоков.

Пример:

```js
import BEM from 'tao-bem'

class Gallery extends BEM.Block {
    static get blockName() {
        return 'b-gallery';
    }

    static get relatedBlocks() {
        return ['b-gallery-controls', 'b-page'];
    }

    onRelatedBlocksInit() {
        this.relatedBlocks.get('b-page').initSlider();
        this.relatedBlocks.get('b-gallery-controls').setSlider(this);
    }
}
```