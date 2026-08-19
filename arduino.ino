#include <Servo.h>

// Definição dos pinos
const int SERVO1_PIN = 9;
const int SERVO2_PIN = 10;
const int LED1_PIN = +

// Cria objetos Servo
Servo servo1;
Servo servo2;

// Posições atuais
int currentPos1 = 90;
int currentPos2 = 90;

// Variáveis para controle de LED
unsigned long led1Timer = 0;
unsigned long led2Timer = 0;
bool led1State = false;
bool led2State = false;
const unsigned long LED_DURATION = 500; // LED permanece aceso por 500ms

void setup() {
  Serial.begin(9600);
  
  // Inicializa servos
  servo1.attach(SERVO1_PIN);
  servo2.attach(SERVO2_PIN);
  
  // Define posições iniciais
  servo1.write(currentPos1);
  servo2.write(currentPos2);
  
  // Configura LEDs
  pinMode(LED1_PIN, OUTPUT);
  pinMode(LED2_PIN, OUTPUT);
  
  // Desliga LEDs inicialmente
  digitalWrite(LED1_PIN, LOW);
  digitalWrite(LED2_PIN, LOW);
  
  Serial.println("Servo Controller Ready");
}

void loop() {
  // Verifica se há dados disponíveis no Serial
  if (Serial.available() > 0) {
    String command = Serial.readStringUntil('\n');
    command.trim();
    
    if (command.length() > 0) {
      processCommand(command);
    }
  }
  
  // Controla temporizadores dos LEDs
  updateLEDs();
}

void processCommand(String command) {
  // Formato esperado: "servo,angulo"
  // Exemplo: "1,45" ou "2,135"
  
  int commaIndex = command.indexOf(',');
  if (commaIndex == -1) {
    Serial.println("Comando inválido");
    return;
  }
  
  int servo = command.substring(0, commaIndex).toInt();
  int angle = command.substring(commaIndex + 1).toInt();
  
  // Valida ângulo
  if (angle < 0) angle = 0;
  if (angle > 180) angle = 180;
  
  // Executa o comando
  if (servo == 1) {
    servo1.write(angle);
    currentPos1 = angle;
    // Acende LED
    digitalWrite(LED1_PIN, HIGH);
    led1State = true;
    led1Timer = millis();
    Serial.print("Servo1 movido para ");
    Serial.println(angle);
  } else if (servo == 2) {
    servo2.write(angle);
    currentPos2 = angle;
    // Acende LED
    digitalWrite(LED2_PIN, HIGH);
    led2State = true;
    led2Timer = millis();
    Serial.print("Servo2 movido para ");
    Serial.println(angle);
  } else {
    Serial.println("Servo inválido");
  }
}

void updateLEDs() {
  unsigned long currentTime = millis();
  
  // Verifica LED1
  if (led1State && (currentTime - led1Timer >= LED_DURATION)) {
    digitalWrite(LED1_PIN, LOW);
    led1State = false;
  }
  
  // Verifica LED2
  if (led2State && (currentTime - led2Timer >= LED_DURATION)) {
    digitalWrite(LED2_PIN, LOW);
    led2State = false;
  }
}

// Funções auxiliares para debug
void printStatus() {
  Serial.print("Servo1: ");
  Serial.print(currentPos1);
  Serial.print("° | Servo2: ");
  Serial.print(currentPos2);
  Serial.println("°");
}