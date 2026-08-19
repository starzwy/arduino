class ServoController {
    constructor() {
        this.port = null;
        this.reader = null;
        this.writer = null;
        this.isConnected = false;
        this.servo1Angle = 90;
        this.servo2Angle = 90;
        
        // Elementos da UI
        this.status = document.getElementById('status');
        this.connectBtn = document.getElementById('connectBtn');
        this.servo1Slider = document.getElementById('servo1Slider');
        this.servo2Slider = document.getElementById('servo2Slider');
        this.angle1Label = document.getElementById('angle1Label');
        this.angle2Label = document.getElementById('angle2Label');
        this.servo1Pos = document.getElementById('servo1Pos');
        this.servo2Pos = document.getElementById('servo2Pos');
        this.led1 = document.getElementById('led1');
        this.led2 = document.getElementById('led2');
        this.lastAction = document.getElementById('lastAction');
        
        this.initEventListeners();
        this.checkWebSerial();
    }
    
    checkWebSerial() {
        if (!('serial' in navigator)) {
            this.updateStatus('Navegador não suporta Web Serial', false);
            this.connectBtn.disabled = true;
        }
    }
    
    initEventListeners() {
        this.connectBtn.addEventListener('click', () => this.toggleConnection());
        
        this.servo1Slider.addEventListener('input', (e) => {
            const angle = parseInt(e.target.value);
            this.angle1Label.textContent = angle;
            this.updateServoPosition(1, angle);
        });
        
        this.servo2Slider.addEventListener('input', (e) => {
            const angle = parseInt(e.target.value);
            this.angle2Label.textContent = angle;
            this.updateServoPosition(2, angle);
        });
        
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const servo = parseInt(e.target.dataset.servo);
                const angle = parseInt(e.target.dataset.angle);
                this.setPresetAngle(servo, angle);
            });
        });
    }
    
    async toggleConnection() {
        if (this.isConnected) {
            await this.disconnect();
        } else {
            await this.connect();
        }
    }
    
    async connect() {
        try {
            this.port = await navigator.serial.requestPort();
            await this.port.open({ baudRate: 9600 });
            
            const textEncoder = new TextEncoderStream();
            const writableStreamClosed = textEncoder.readable.pipeTo(this.port.writable);
            this.writer = textEncoder.writable.getWriter();
            
            this.isConnected = true;
            this.updateStatus('Conectado', true);
            this.connectBtn.textContent = 'Desconectar';
            this.connectBtn.className = 'disconnected';
            
            this.updateServoPosition(1, this.servo1Angle);
            this.updateServoPosition(2, this.servo2Angle);
            
        } catch (error) {
            console.error('Erro ao conectar:', error);
            this.updateStatus('Erro ao conectar', false);
        }
    }
    
    async disconnect() {
        try {
            if (this.writer) {
                await this.writer.close();
            }
            if (this.port) {
                await this.port.close();
            }
            this.isConnected = false;
            this.updateStatus('Desconectado', false);
            this.connectBtn.textContent = 'Conectar';
            this.connectBtn.className = '';
            
            // Desliga LEDs
            this.setLED(1, false);
            this.setLED(2, false);
            
        } catch (error) {
            console.error('Erro ao desconectar:', error);
        }
    }
    
    async updateServoPosition(servo, angle) {
        if (servo === 1) {
            this.servo1Angle = angle;
            this.servo1Pos.textContent = angle;
            this.servo1Slider.value = angle;
            this.angle1Label.textContent = angle;
        } else {
            this.servo2Angle = angle;
            this.servo2Pos.textContent = angle;
            this.servo2Slider.value = angle;
            this.angle2Label.textContent = angle;
        }
        
        // Liga o LED correspondente
        this.setLED(servo, true);
        this.updateLastAction(`Servo ${servo} movido para ${angle}°`);
        
        // Envia comando para o Arduino
        if (this.isConnected && this.writer) {
            try {
                const command = `${servo},${angle}\n`;
                await this.writer.write(command);
                console.log(`Comando enviado: ${command}`);
                
                // Desliga LED após 500ms
                setTimeout(() => {
                    this.setLED(servo, false);
                }, 500);
                
            } catch (error) {
                console.error('Erro ao enviar comando:', error);
            }
        }
    }
    
    setPresetAngle(servo, angle) {
        if (servo === 1) {
            this.servo1Slider.value = angle;
            this.angle1Label.textContent = angle;
            this.updateServoPosition(1, angle);
        } else {
            this.servo2Slider.value = angle;
            this.angle2Label.textContent = angle;
            this.updateServoPosition(2, angle);
        }
    }
    
    setLED(servo, on) {
        const ledElement = servo === 1 ? this.led1 : this.led2;
        if (on) {
            ledElement.classList.add('on');
        } else {
            ledElement.classList.remove('on');
        }
    }
    
    updateStatus(message, connected) {
        this.status.textContent = message;
        if (connected) {
            this.status.className = 'connected';
        } else {
            this.status.className = 'disconnected';
        }
    }
    
    updateLastAction(action) {
        this.lastAction.textContent = action;
    }
}

// Inicializa o controlador quando a página carrega
document.addEventListener('DOMContentLoaded', () => {
    const controller = new ServoController();
});