/* Moniteur Arduino : version Bluetooth (Arduino Uno + module HC-05 ou HC-06)
   Page : https://mike8999.github.io/isole-x/moniteur-arduino/  (Chrome à jour sur Android, ou Chrome/Edge sur ordinateur)

   Câblage du module :
     VCC -> 5 V        GND -> GND
     TXD -> D10 de l'Arduino
     RXD <- D11 de l'Arduino PAR UN PONT DIVISEUR (1 kOhm en série, 2 kOhm vers GND) : le module accepte 3,3 V, pas 5 V

   1. Téléverser ce programme (débrancher le fil RXD/TXD n'est pas nécessaire : le module est sur D10/D11, pas sur D0/D1).
   2. Associer le module dans les réglages Bluetooth du téléphone (code 1234 ou 0000).
   3. Dans la page : vitesse 9600, « Connecter l'Arduino », choisir HC-05 / HC-06.

   Les mesures partent aussi par le câble USB : la page marche aussi en USB avec ce programme.
*/
#include <SoftwareSerial.h>

SoftwareSerial bluetooth(10, 11);  // RX de l'Arduino (D10), TX de l'Arduino (D11)

const unsigned long PERIODE = 200;  // temps entre deux envois en ms (5 mesures par seconde)

void setup() {
  Serial.begin(9600);
  bluetooth.begin(9600);  // vitesse d'usine des modules HC-05 et HC-06
}

void loop() {
  int temp = analogRead(A0);  // ex. LM35 : choisir « LM35 → °C » dans la page
  int pot  = analogRead(A1);  // ex. potentiomètre
  int lum  = analogRead(A2);  // ex. photorésistance en pont diviseur

  String ligne = "Temp:" + String(temp) + ";Pot:" + String(pot) + ";Lum:" + String(lum);
  Serial.println(ligne);
  bluetooth.println(ligne);

  delay(PERIODE);
}
