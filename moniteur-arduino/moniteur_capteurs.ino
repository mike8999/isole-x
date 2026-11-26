/* Moniteur Arduino : programme d'exemple
   Page : https://mike8999.github.io/isole-x/moniteur-arduino/

   Envoie trois mesures par ligne, séparées par des points-virgules :
     Temp:123;Pot:456;Lum:789
   Le nom devant chaque valeur est facultatif ("123;456;789" fonctionne aussi).
   Dans la page, choisir 9600 bauds (même valeur que Serial.begin).

   Branchements proposés (Arduino Uno) :
     A0 : capteur de température LM35 (choisir « LM35 → °C » dans la page)
     A1 : potentiomètre (curseur au milieu, extrémités au 5 V et au GND)
     A2 : photorésistance en pont diviseur avec une résistance de 10 kΩ
*/

const unsigned long PERIODE = 200;  // temps entre deux envois en ms (5 mesures par seconde)

void setup() {
  Serial.begin(9600);
}

void loop() {
  int temp = analogRead(A0);  // 0 à 1023
  int pot  = analogRead(A1);
  int lum  = analogRead(A2);

  Serial.print("Temp:");  Serial.print(temp);
  Serial.print(";Pot:");  Serial.print(pot);
  Serial.print(";Lum:");  Serial.println(lum);  // println termine la ligne

  delay(PERIODE);
}
