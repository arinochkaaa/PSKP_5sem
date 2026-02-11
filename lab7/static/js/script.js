// Функция для переключения между секциями
function showSection(sectionId) {
    console.log('Показываем секцию:', sectionId);
    
    // Скрыть все секции
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Убрать активный класс со всех кнопок
    const buttons = document.querySelectorAll('.navigation button');
    buttons.forEach(button => {
        button.classList.remove('active');
    });
    
    // Показать выбранную секцию
    const activeSection = document.getElementById(sectionId);
    if (activeSection) {
        activeSection.classList.add('active');
        
        // Добавить активный класс к соответствующей кнопке
        const activeButton = Array.from(buttons).find(button => 
            button.textContent === getButtonText(sectionId)
        );
        if (activeButton) {
            activeButton.classList.add('active');
        }
        
        // Прокрутка к началу секции
        setTimeout(() => {
            activeSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }
}

// Вспомогательная функция для получения текста кнопки
function getButtonText(sectionId) {
    const map = {
        'css-section': 'CSS',
        'image-section': 'Изображение',
        'video-section': 'Видео',
        'document-section': 'Документ',
        'json-section': 'JSON',
        'xml-section': 'XML'
    };
    return map[sectionId] || sectionId;
}

// Функция для загрузки JSON
async function loadJSON() {
    const contentElement = document.getElementById('json-content');
    
    // Показываем индикатор загрузки
    contentElement.innerHTML = '<div class="loading-indicator"></div> Загрузка...';
    
    try {
        const response = await fetch('/data/sample.json');
        
        if (!response.ok) {
            throw new Error(`HTTP ошибка! статус: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Форматируем и отображаем JSON
        contentElement.textContent = JSON.stringify(data, null, 2);
        
        // Добавляем подсветку синтаксиса
        highlightJSON(contentElement);
        
    } catch (error) {
        console.error('Ошибка загрузки JSON:', error);
        contentElement.innerHTML = `<div class="error">Ошибка загрузки JSON: ${error.message}</div>`;
    }
}

// Функция для подсветки JSON
function highlightJSON(element) {
    const text = element.textContent;
    
    // Простая подсветка JSON
    let highlighted = text
        .replace(/"([^"]+)":/g, '<span class="json-key">"$1"</span>:')
        .replace(/: "([^"]+)"/g, ': <span class="json-string">"$1"</span>')
        .replace(/: (\d+)/g, ': <span class="json-number">$1</span>')
        .replace(/: (true|false)/g, ': <span class="json-boolean">$1</span>')
        .replace(/: null/g, ': <span class="json-boolean">null</span>');
    
    element.innerHTML = highlighted;
}

// Функция для загрузки XML
async function loadXML() {
    const contentElement = document.getElementById('xml-content');
    
    // Показываем индикатор загрузки
    contentElement.innerHTML = '<div class="loading-indicator"></div> Загрузка...';
    
    try {
        const response = await fetch('/data/sample.xml');
        
        if (!response.ok) {
            throw new Error(`HTTP ошибка! статус: ${response.status}`);
        }
        
        const data = await response.text();
        
        // Отображаем XML
        contentElement.textContent = data;
        
        // Добавляем подсветку синтаксиса
        highlightXML(contentElement);
        
    } catch (error) {
        console.error('Ошибка загрузки XML:', error);
        contentElement.innerHTML = `<div class="error">Ошибка загрузки XML: ${error.message}</div>`;
    }
}

// Функция для подсветки XML
function highlightXML(element) {
    const text = element.textContent;
    
    // Простая подсветка XML
    let highlighted = text
        .replace(/&lt;([^&]+)&gt;/g, '<span class="xml-tag">&lt;$1&gt;</span>')
        .replace(/&lt;\/([^&]+)&gt;/g, '<span class="xml-tag">&lt;/$1&gt;</span>')
        .replace(/(\w+)="([^"]*)"/g, '<span class="xml-attr">$1="<span class="xml-value">$2</span>"</span>')
        .replace(/&lt;!--([^&]+)--&gt;/g, '<span class="xml-comment">&lt;!--$1--&gt;</span>');
    
    element.innerHTML = highlighted;
}

// Функция для очистки контента
function clearContent(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = '';
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('Страница загружена');
    
    // Устанавливаем активную кнопку для первой секции
    const firstButton = document.querySelector('.navigation button');
    if (firstButton) {
        firstButton.classList.add('active');
    }
    
    // Добавляем обработчики для кнопок навигации
    const navButtons = document.querySelectorAll('.navigation button');
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Убираем активный класс со всех кнопок
            navButtons.forEach(btn => btn.classList.remove('active'));
            // Добавляем активный класс к нажатой кнопке
            this.classList.add('active');
        });
    });
    
    // Показываем первую секцию
    showSection('css-section');
});