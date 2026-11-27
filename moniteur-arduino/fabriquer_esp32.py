"""Fabrique moniteur_esp32_wifi.ino : programme ESP32 qui contient la page index.html.
À relancer après chaque modification de index.html :  python3 fabriquer_esp32.py"""
from pathlib import Path

ici = Path(__file__).parent
page = (ici / "index.html").read_text(encoding="utf-8")
avant = "const ESP32=false;"
assert page.count(avant) == 1, "marqueur ESP32 introuvable dans index.html"
page = page.replace(avant, "const ESP32=true;")
assert ")=====" not in page

programme = r'''/* Moniteur Arduino : version ESP32 Wi-Fi (fonctionne sur tous les téléphones, iPhone compris)
   L'ESP32 crée son propre réseau Wi-Fi et contient la page du moniteur.
     1. IDE Arduino : installer les cartes « esp32 by Espressif » (gestionnaire de cartes), choisir « ESP32 Dev Module ».
     2. Téléverser ce programme.
     3. Sur le téléphone : se connecter au Wi-Fi NOM_WIFI (mot de passe MOT_DE_PASSE), puis ouvrir http://192.168.4.1
   Si plusieurs groupes travaillent dans la même salle, donner un nom différent à chaque ESP32.

   Capteurs : GPIO 34, 35 et 32 (entrées de l'ADC1 : l'ADC2 ne fonctionne pas quand le Wi-Fi est actif), alimentés en 3,3 V.
   Valeurs brutes de 0 à 4095 pour 0 à 3,3 V.
   Les mesures partent aussi par le câble USB (115200 bauds) : la page en ligne marche aussi en USB avec ce programme.

   Fichier fabriqué par fabriquer_esp32.py à partir de index.html : ne pas modifier la page ici.
*/
#include <WiFi.h>
#include <WebServer.h>

const char* NOM_WIFI     = "Moniteur-ESP32";  // ex. "Moniteur-ESP32-G3" pour le groupe 3
const char* MOT_DE_PASSE = "A_REMPLACER";     // mets ton propre mot de passe (8 caractères au moins) avant de téléverser, sans le publier

const int PIN_TEMP = 34;
const int PIN_POT  = 35;
const int PIN_LUM  = 32;

// Une ligne de mesures, valeurs séparées par des points-virgules (nom facultatif devant chaque valeur)
String mesures() {
  return "Temp:" + String(analogRead(PIN_TEMP)) +
         ";Pot:" + String(analogRead(PIN_POT)) +
         ";Lum:" + String(analogRead(PIN_LUM));
}

extern const char PAGE[];  // la page du moniteur, en fin de fichier
WebServer serveur(80);
unsigned long dernierEnvoi = 0;

void setup() {
  Serial.begin(115200);
  WiFi.softAP(NOM_WIFI, MOT_DE_PASSE);

  serveur.on("/", []() {
    serveur.send_P(200, "text/html; charset=utf-8", PAGE);
  });
  serveur.on("/mesures", []() {
    serveur.sendHeader("Cache-Control", "no-store");
    serveur.send(200, "text/plain; charset=utf-8", mesures());
  });
  serveur.onNotFound([]() {
    serveur.sendHeader("Location", "/");
    serveur.send(302, "text/plain", "");
  });
  serveur.begin();

  Serial.print("Reseau Wi-Fi ");
  Serial.print(NOM_WIFI);
  Serial.print(" page http://");
  Serial.println(WiFi.softAPIP());
}

void loop() {
  serveur.handleClient();

  // mêmes mesures sur le câble USB, 5 fois par seconde
  if (millis() - dernierEnvoi >= 200) {
    dernierEnvoi = millis();
    Serial.println(mesures());
  }
}

// ---------------------------------------------------------------------------
// Page du moniteur (copie de index.html)
const char PAGE[] PROGMEM = R"=====(''' + page + r''')=====";
'''
(ici / "moniteur_esp32_wifi.ino").write_text(programme, encoding="utf-8")
print("moniteur_esp32_wifi.ino :", len(page.encode()), "octets de page")
