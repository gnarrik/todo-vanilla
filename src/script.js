class Todo {
  selectors = {
    root: '[data-js-todo]',
    newTaskForm: '[data-js-todo-new-task-form]',
    newTaskInput: '[data-js-todo-new-task-input]',
    searchTaskForm: '[data-js-todo-search-task-form]',
    searchTaskInput: '[data-js-todo-search-task-input]',
    totalTasks: '[data-js-todo-total-tasks]',
    deleteAllButton: '[data-js-todo-delete-all-button]',
    list: '[data-js-todo-list]',
    item: '[data-js-todo-item]',
    itemCheckbox: '[data-js-todo-item-checkbox]',
    itemLabel: '[data-js-todo-item-label]',
    itemDeleteButton: '[data-js-todo-item-delete-button]',
    emptyMessage: '[data-js-todo-empty-message]',
  }

  stateClasses = {
    isVisible: 'is-visible',
    isDisappearing: 'is-disappearing',
  }

  localStorageKey = 'todo-items'

  constructor() {
    this.rootElement = document.querySelector(this.selectors.root)
    this.newTaskFormElement = this.rootElement.querySelector(this.selectors.newTaskForm)
    this.newTaskInputElement = this.rootElement.querySelector(this.selectors.newTaskInput)
    this.searchTaskFormElement = this.rootElement.querySelector(this.selectors.searchTaskForm)
    this.searchTaskInputElement = this.rootElement.querySelector(this.selectors.searchTaskInput)
    this.totalTasksElement = this.rootElement.querySelector(this.selectors.totalTasks)
    this.deleteAllButtonElement = this.rootElement.querySelector(this.selectors.deleteAllButton)
    this.listElement = this.rootElement.querySelector(this.selectors.list)
    this.emptyMessageElement = this.rootElement.querySelector(this.selectors.emptyMessage)

    // Данная переменная хранит состояние to do
    // items - задачи
    // filteredItems - отфильтрованные задачи
    // searchQuery - ключ, по которому фильтруются задачи
    this.state = {
      items: this.getItemsFromLocalStorage(),
      filteredItems: null,
      searchQuery: '',
    }
    this.render()
    this.bindEvents()

  }

  // Метод для получения списка задач из localStorage
  getItemsFromLocalStorage() {
    // Получаем список задач в виде строки
    const rawData = localStorage.getItem(this.localStorageKey)

    // Если строки нет, то в items запишется пустой массив
    if (!rawData) {
      return []
    }

    try {
      // Пробуем распарсить строку в JSON формат.
      // Данные представляют собой объекты с ключами id, title, isChecked
      // Эти объекты сгруппированы в массив
      const parsedData = JSON.parse(rawData)

      // Если данные хранятся в виде массива, возвращаем прочитанное, иначе - пустой массив
      return Array.isArray(parsedData) ? parsedData : []
    } catch {

      //Если что-то идет не так выдаем ошибку и возвращаем пустой массив
      console.error('Todo items parse error')
      return []
    }
  }

  // Метод для сохранения задач в localStorage
  saveItemsToLocalStorage() {
    // ключ - 'todo-items'
    // значение - строка из state.items
    // при начальной загрузке страницы берется из localStorage
    // в дальнейшем при обновлении state.items будет вызываться эта функция для сохранения обновленного списка задач
    localStorage.setItem(
      this.localStorageKey,
      JSON.stringify(this.state.items)
    )
  }

  // Метод для рендера задач
  render() {
    // Обращаемся к свойству 'text-content' элемента, отвечающего за отображение числа всех задач
    // и записываем в него значение длины массива state.items
    this.totalTasksElement.textContent = this.state.items.length

    // Переключаем класс 'is-visible' кнопки 'Delete All' в зависимости от наличия задач
    // Если задач нет (this.state.items.length = 0), то класс 'is-visible' не применяется
    // Если задачи есть (this.state.items.length > 0) то добавляется класс 'is-visible'
    this.deleteAllButtonElement.classList.toggle(
      this.stateClasses.isVisible,
      this.state.items.length > 0
    )

    // вспомогательная переменная для рендера,
    // в которой хранятся либо отфильтрованный список задач, либо неотфильтрованный
    const items = this.state.filteredItems ?? this.state.items

    this.listElement.innerHTML = items.map(({ id, title, isChecked }) => `
      <li class="todo__item todo-item" data-js-todo-item>
        <input
          class="todo-item__checkbox"
          id="${id}"
          type="checkbox"
          ${isChecked ? 'checked' : ''}
          data-js-todo-item-checkbox
        />
        <label
          class="todo-item__label"
          for="${id}"
          data-js-todo-item-label
        >
          ${title}
        </label>
        <button
          class="todo-item__delete-button"
          data-js-todo-item-delete-button
          aria-label="Delete"
          title="Delete"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 5L5 15M5 5L15 15" stroke="#757575" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </li>
    `).join('')

    // Здесь написана логика, которая будет определять содержимое 'empty-message'
    // Опциональная цепочка (?.) нужна поскольку this.state.filteredItems может принимать значение null
    // Если не использовать, то появляется ошибка Uncaught TypeError: Cannot read properties of null (reading 'length')
    const isEmptyFilteredItems = this.state.filteredItems?.length === 0
    // Здесь опциональная цепочка не нужна, поскольку this.state.items всегда равен массиву
    const isEmptyItems = this.state.items.length === 0

    // Если не найдены отфильтрованные задачи, то возвращаем 'Tasks not found'
    // Иначе смотрим есть ли задачи: если нет, возвращаем 'There are no tasks yet', иначе - пустую строку (задачи есть)
    this.emptyMessageElement.textContent =
      isEmptyFilteredItems ? 'Tasks not found'
        : isEmptyItems ? 'There are no tasks yet'
          : ''
  }

  // Метод добавления задачи
  addItem(title) {
    // В state.items пушим новую задачу
    // эту функцию вызывает метод onNewTaskFormSubmit
    this.state.items.push({
      id: crypto?.randomUUID() ?? Date.now().toString(),
      title,
      isChecked: false,
    })
    this.saveItemsToLocalStorage()
    this.render()
  }

  // Метод удаления задачи
  deleteItem(id) {
    // state.items присваиваем отфильтрованный список задач
    // этот метод вызывает onClick
    this.state.items = this.state.items.filter((item) => item.id !== id)
    this.saveItemsToLocalStorage()
    this.render()
  }

  // Метод изменения состояния задачи (вызывается onChange при клике на чекбокс)
  toggleCheckedState(id) {
    // при нажатии на чекбокс изменяем состояние задачи с помощью !item.isChecked
    this.state.items = this.state.items.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          isChecked: !item.isChecked,
        }
      }

      return item
    })
    this.saveItemsToLocalStorage()
    this.render()
  }

  // Метод фильтрации задач
  filter() {
    // В state.searchQuery записывается вводимое значение из поля searchTaskInputElement
    const queryFormatted = this.state.searchQuery.toLowerCase()

    // Затем по значению свойства title проверяем на совпадение state.searchQuery c каждым из title списка задач
    this.state.filteredItems = this.state.items.filter(({ title }) => {
      const titleFormatted = title.toLowerCase()

      return titleFormatted.includes(queryFormatted)
    })

    this.render()
  }

  // Метод сброса фильтрации задач
  resetFilter() {
    // Просто приводим state.filteredItems и state.searchQuery в начальное состояние
    this.state.filteredItems = null
    this.state.searchQuery = ''
    this.render()
  }

  // Метод обрабатывающий отправку формы для добавления списка задач
  onNewTaskFormSubmit = (event) => {
    // Отменяем дефолтное поведение браузера
    event.preventDefault()

    // newTodoItemTitle присваиваем введенное в newTaskInputElement значение
    const newTodoItemTitle = this.newTaskInputElement.value

    // если поле не пустое вызываем addItem, сбрасываем фильтр, очищаем поле и вновь фокусируемся на нем
    if (newTodoItemTitle.trim().length > 0) {
      this.addItem(newTodoItemTitle)
      this.resetFilter()
      this.newTaskInputElement.value = ''
      this.newTaskInputElement.focus()
    }
  }

  // Метод обрабатывающий отправку формы searchTaskForm
  onSearchTaskFormSubmit = (event) => {
    // делаем для того, чтобы браузер при поиске нужной пользователь задачи,
    // нажимая клавишу 'Enter', не отправлял форму и не перезагружал страницу
    event.preventDefault()
  }

  // Метод для обработки введенного в searchTaskInput значения
  onSearchTaskInputChange = ({target}) => {
    // Получаем event.target.value и записываем его в переменную value без лишних пробелов
    const value = target.value.trim()

    // Если поле не пустое, то state.searchQuery = value и вызываем метод this.filter()
    // Если поле пустое, то сбрасываем фильтр
    if (value.length > 0) {
      this.state.searchQuery = value
      this.filter()
    } else {
      this.resetFilter()
    }
  }

  // Метод для удаления всех задач
  onDeleteAllButtonClick = () => {
    // Просим подтвердить пользователя, что он хочет удалить задачи
    const isConfirmed = confirm('Are you sure you want to delete all?')
    // Если 'да', то значение state.items заменяем на пустой массив
    if (isConfirmed) {
      this.state.items = []
      this.saveItemsToLocalStorage()
      this.render()
    }
  }

  // Метод обработки клика на кнопку itemDeleteButton
  onClick = ({ target }) => {
    // Если target === itemDeleteButton, то
    // Ищем ближайшего родителя с селектором selectors.item
    // Ищем элемент по селектору itemCheckBox (поскольку в нем находится id нужной задачи)
    // Добавляем класс 'is-disappearing'
    // спустя 400мс вызываем метод deleteItem() с переданным id задачи
    if (target.matches(this.selectors.itemDeleteButton)) {
      const itemElement = target.closest(this.selectors.item)
      const itemCheckboxElement = itemElement.querySelector(this.selectors.itemCheckbox)

      itemElement.classList.add(this.stateClasses.isDisappearing)

      setTimeout(() => {
        this.deleteItem(itemCheckboxElement.id)
      }, 400)
    }
  }

  // Метод обрабатывающий клик на чекбокс
  onChange = ({ target }) => {
    if (target.matches(this.selectors.itemCheckbox)) {
      this.toggleCheckedState(target.id)
    }
  }

  // Метод привязывающий обработчики событий
  bindEvents() {
    this.newTaskFormElement.addEventListener('submit', this.onNewTaskFormSubmit)
    this.searchTaskFormElement.addEventListener('submit', this.onSearchTaskFormSubmit)
    this.searchTaskInputElement.addEventListener('input', this.onSearchTaskInputChange)
    this.deleteAllButtonElement.addEventListener('click', this.onDeleteAllButtonClick)
    this.listElement.addEventListener('click', this.onClick)
    this.listElement.addEventListener('change', this.onChange)
  }
}

new Todo()

// Почему id задачи добавляется в <input>, а не в <li>
