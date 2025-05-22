class HanziApp {
    constructor() {
        this.data = [];
        this.initializeElements();
        this.bindEvents();
        this.loadCSVData();
    }

    initializeElements() {
        // Elementos del DOM
        this.searchInput = document.getElementById('searchInput');
        this.searchBtn = document.getElementById('searchBtn');
        this.errorMessage = document.getElementById('errorMessage');
        this.welcomeMessage = document.getElementById('welcomeMessage');
        this.hanziCard = document.getElementById('hanziCard');
        
        // Elementos de la tarjeta
        this.hanziSimplified = document.getElementById('hanziSimplified');
        this.hanziTraditional = document.getElementById('hanziTraditional');
        this.pinyin = document.getElementById('pinyin');
        this.meaning = document.getElementById('meaning');
        this.mnemonicSimplified = document.getElementById('mnemonicSimplified');
        this.mnemonicTraditional = document.getElementById('mnemonicTraditional');
        this.hskLevel = document.getElementById('hskLevel');
    }

    bindEvents() {
        // Evento de búsqueda con botón
        this.searchBtn.addEventListener('click', () => this.performSearch());
        
        // Evento de búsqueda con Enter
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch();
            }
        });

        // Limpiar mensaje de error al escribir
        this.searchInput.addEventListener('input', () => {
            this.hideErrorMessage();
        });

        // Prevenir envío del formulario
        this.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
            }
        });
    }

    async loadCSVData() {
        try {
            // Intentar cargar el archivo CSV
            const response = await fetch('hanzi_para_no_olvidar.csv');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const csvText = await response.text();
            
            // Parsear CSV con Papa Parse
            Papa.parse(csvText, {
                header: true,
                skipEmptyLines: true,
                dynamicTyping: false,
                delimiter: ',',
                complete: (results) => {
                    if (results.errors.length > 0) {
                        console.warn('Errores al parsear CSV:', results.errors);
                    }
                    
                    // Procesar y limpiar los datos
                    this.data = results.data.map(row => {
                        const cleanRow = {};
                        
                        // Limpiar headers y valores
                        Object.keys(row).forEach(key => {
                            const cleanKey = key.trim().toLowerCase();
                            const value = row[key] ? row[key].toString().trim() : '';
                            
                            // Mapear nombres de columnas esperados
                            const keyMap = {
                                'hanzi_simplified': 'hanzi_simplified',
                                'hanzi_traditional': 'hanzi_traditional',
                                'pinyin': 'pinyin',
                                'meaning': 'meaning',
                                'mnemonic_simplified': 'mnemonic_simplified',
                                'mnemonic_traditional': 'mnemonic_traditional',
                                'hsk': 'hsk'
                            };
                            
                            if (keyMap[cleanKey]) {
                                cleanRow[keyMap[cleanKey]] = value;
                            }
                        });
                        
                        return cleanRow;
                    });
                    
                    console.log(`Datos cargados: ${this.data.length} registros`);
                    
                    // Mostrar algunos datos para debug
                    if (this.data.length > 0) {
                        console.log('Primer registro:', this.data[0]);
                        console.log('Columnas disponibles:', Object.keys(this.data[0]));
                    }
                },
                error: (error) => {
                    console.error('Error al parsear CSV:', error);
                    this.showErrorMessage('Error al cargar los datos del archivo CSV');
                }
            });
            
        } catch (error) {
            console.error('Error al cargar CSV:', error);
            this.showErrorMessage('No se pudo cargar el archivo CSV. Asegúrate de que esté en la raíz del proyecto.');
        }
    }

    performSearch() {
        const searchTerm = this.searchInput.value.trim();
        
        if (!searchTerm) {
            this.showErrorMessage('Por favor ingresa un carácter chino para buscar');
            return;
        }

        if (this.data.length === 0) {
            this.showErrorMessage('Los datos aún no se han cargado. Intenta nuevamente en unos segundos.');
            return;
        }

        // Buscar el carácter en los datos
        const result = this.findHanzi(searchTerm);
        
        if (result) {
            this.displayHanziCard(result);
            this.hideErrorMessage();
        } else {
            this.showErrorMessage('Carácter no encontrado. Intenta nuevamente con otro carácter chino simplificado.');
            this.hideHanziCard();
        }
    }

    findHanzi(searchTerm) {
        // Buscar por hanzi_simplified
        return this.data.find(item => 
            item.hanzi_simplified && item.hanzi_simplified.trim() === searchTerm.trim()
        );
    }

    displayHanziCard(hanziData) {
        // Ocultar mensaje de bienvenida
        this.welcomeMessage.style.display = 'none';
        
        // Llenar los campos de la tarjeta
        this.updateField(this.hanziSimplified, hanziData.hanzi_simplified);
        this.updateField(this.hanziTraditional, hanziData.hanzi_traditional);
        this.updateField(this.pinyin, hanziData.pinyin);
        this.updateField(this.meaning, hanziData.meaning);
        this.updateField(this.mnemonicSimplified, hanziData.mnemonic_simplified);
        this.updateField(this.mnemonicTraditional, hanziData.mnemonic_traditional);
        
        // Actualizar nivel HSK
        if (hanziData.hsk && hanziData.hsk.trim()) {
            this.hskLevel.textContent = hanziData.hsk.trim();
        } else {
            this.hskLevel.textContent = 'N/A';
        }
        
        // Mostrar la tarjeta con animación
        this.showHanziCard();
    }

    updateField(element, value) {
        if (element) {
            element.textContent = value && value.trim() ? value.trim() : '';
        }
    }

    showHanziCard() {
        this.hanziCard.classList.remove('hidden');
        
        // Agregar animación
        setTimeout(() => {
            this.hanziCard.style.transform = 'scale(1)';
            this.hanziCard.style.opacity = '1';
        }, 10);
    }

    hideHanziCard() {
        this.hanziCard.classList.add('hidden');
        this.welcomeMessage.style.display = 'block';
    }

    showErrorMessage(message) {
        this.errorMessage.textContent = message;
        this.errorMessage.classList.add('show');
        
        // Ocultar automáticamente después de 5 segundos
        setTimeout(() => {
            this.hideErrorMessage();
        }, 5000);
    }

    hideErrorMessage() {
        this.errorMessage.classList.remove('show');
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new HanziApp();
});

// Manejar errores globales
window.addEventListener('error', (e) => {
    console.error('Error global:', e.error);
});

// Manejar errores de promesas no capturadas
window.addEventListener('unhandledrejection', (e) => {
    console.error('Promesa rechazada no manejada:', e.reason);
});
