// Internationalisierung (ES/DE).

// Dictionary DE
export const DE = {
  /* ---- general / comun ---- */
  "{n} peticiones del agente esperando tu decisión":
    "{n} Agent wartet auf Entscheidung",
  "OpenCode · permiso pendiente": "OpenCode · warte auf Berechtigung",
  "sin URL": "Keine URL",
  "Errores locales ({n})": "Lokale Fehler ({n})",
  "Prueba: así se verá el aviso de un permiso pendiente.":
    "Test: So sieht eine Warnung aus, wenn auf Berechtigungen gewartet wird.",
  "Cargando…": "Lade…",
  "Copiar": "Copy",
  "Copiado": "Kopieren",
  "No se pudo": "Fehlgeschlagen",
  "ahora": "jetzt",
  "hace {n} min": "vor {n} Minuten",
  "hace {n} h": "vor {n} Stunden",
  "hace {n} d": "vor {n} Tagen",
  "Cerrar": "Schließen",
  "Cerrar aviso": "Verwerfen",
  "Volver": "Zurück",
  "Guardando…": "Speichern…",
  "Creando…": "Erzeuge…",
  "Conectando…": "Verbinde…",
  "Conectar": "Verbinde",
  "Activar": "Einschalten",
  "Desactivar": "Ausgeschalten",
  "Activo": "Ausgeschaltet",
  "Guardar": "Speichern",
  "Limpiar": "Leeren",
  "Probar": "Test",
  "Sí": "Ja",
  "No": "Nein",
  "Sesiones": "Sessions",
  "Sesión": "Session",
  "Chat": "Chat",
  "Permisos": "Berechtigungen",
  "Permiso": "Berechtigung",
  "Ajustes": "Einstellungen",
  "Apariencia": "Erscheinungsbild",
  "Seguridad": "Sicherheit",
  "Notificaciones": "Benachrichtigungen",
  "Diagnóstico": "Diagnose",
  "Conexión": "Verbindung",
  "Acerca de": "Über",

  /* ---- setup ---- */
  "URL del tunnel (la da el QR) o http://127.0.0.1:28894 en el PC":
    "Tunnel URL (von QR) oder http://127.0.0.1:28894 zu PC",
  "Contraseña del servidor o enlace de pairing": "Server Passwort oder Pairing Link",
  "Mostrar u ocultar": "Anzeigen oder verbergen",
  "Servidor": "Server",
  "Acceso": "Zugriff",
  "⚠ Conexión insegura (HTTP): la contraseña viaja por la red sin cifrar. Usa el QR con el tunnel https cuando puedas.":
    "⚠ Unsichere Verbindung (HTTP): das Passwort wird unverschlüsselt über das Netzwerk transportiert. Verwende, wenn möglich, QR mit https Tunnel.",
  "Introduce la contraseña o el enlace de pairing": "Gib Passwort oder Pairing Link ein.",
  "El código de pairing ha caducado o ya se usó (~5 min). Genera otro QR con «node scripts/qr-pairing.mjs» y escanéalo.":
    "Der Pairing Code ist abgelaufen oder wurde bereits verwendet (~5 min). Erzeuge einen neuen QR mit «node scripts/qr-pairing.mjs» und Scanne ihn.",
  "Este servidor no ofrece el proxy /api: desde un origen externo (túnel/LAN) el navegador bloqueará las peticiones. Sirve la app con «npm run preview» (incluye el proxy) o ábrela en localhost.":
    "Dieser Server bietet keine /api Proxy an: der Browser blockiert alle Anfragen von externen Quellen (tunnel/LAN). Veröffentliche die App mit «npm run preview» (inkl. Proxy) oder offne sie mit localhost.",
  "Error de conexión": "Verbindungsfehler",
  "En el PC ejecuta ": "Auf dem Rechner starte ",
  " y escanea el QR. Alternativa manual: ": " und scanne den QR. Manulle Alternative: ",
  " o la contraseña del servidor.": " oder das Server Passwort.",
  "Token detectado · conectando…": "Token erkannt · verbinde…",
  "Código de pairing detectado · emparejando…": "Pairing Code erkannt · verbinde…",

  /* ---- sesiones ---- */
  "Buscar sesión…": "Suche Sitzungen…",
  "Buscar en la conversación…": "Suche in Unterhaltung…",
  "Buscar en la conversación": "Suche in Unterhaltung",
  "Copiar toda la conversación": "Kopiere ganze Unterhaltung",
  "Conversación copiada en Markdown": "Unterhaltung als Markdown kopiert",
  "No hay nada que copiar": "Nichts zu kopieren",
  "No se pudo copiar": "Konnte nichts kopieren",
  "Ordenar": "Sortieren",
  "Filtrar por proyecto": "Filtere nach Projekt",
  "Todos los proyectos": "Alle Projekte",
  "Recientes": "Kürzlich",
  "Antiguas": "Älteste",
  "Nombre": "Name",
  "Permisos pendientes": "Warten auf Berechtigungen",
  "{n} permisos pendientes": "{n} Berechtigungen ausstehend",
  "Carpeta del proyecto (en el PC)": "Projektordner (auf dem Rechner)",
  "C:\\ruta\\del\\proyecto": "C:\\pfad\\zum\\projekt",
  "Crear sesión": "Erstelle Sitzung",
  "Indica la carpeta del proyecto": "Gibt den Projektordner an",
  "Respuesta inesperada al crear la sesión": "Unerwartete Anwort beim Erzeugen der Sitzung",
  "Error creando la sesión": "Fehler beim Erzeugen der Sitzung",
  "Todavía no hay sesiones": "No keine Sitzung",
  "Pulsa + para crear la primera en la carpeta de tu proyecto.":
    "Drücke +, um den ersten in deinem Projektordner zu erzeugen.",
  "Sin resultados": "Keine Ergebnisse",
  "Prueba con otro texto o borra la búsqueda.": "Versuche einen anderen Text oder lösche die Suche.",
  "Credencial caducada: vuelve a emparejar": "Credential abgelaufen: erneut verbinden",
  "Error cargando sesiones": "Fehler beim Laden der Sitzung",

  /* ---- chat ---- */
  "Mensaje…": "Nachricht…",
  "Enviar": "Senden",
  "Detener": "Stoppen",
  "Ir al final": "Gehe zum Ende",
  "Sin conexión con el servidor · reintentando…":
    "Keine Verbindung zum Server - erneut versuchen…",
  "Sin conexión con el servidor · reintentando en {s} s…":
    "Keine Verbindung zum Server - erneut versuchen in {s} s…",
  "Conexión restablecida": "Verbindung wieder hergestellt",
  "escribiendo…": "eingeben…",
  "pensando…": "denken…",
  "pensado": "dachte",
  "Modelo y variante": "Modell und Variant",
  "Adjuntar archivos del PC": "Datei vom Rechner anhängen",
  "Elige los archivos del PC y pulsa Adjuntar":
    "Wähle Dateien vom Rechner und drücke Anhängen",
  "Adjuntar": "Anhängen",
  "No has elegido ningún archivo": "Du hast keine Dateien ausgewählt",
  "Carpeta vacía": "Leerer Ordner",
  "No se pudo abrir la carpeta": "Konnte den Ordner nicht öffnen",
  "⚠ Estás fuera de la carpeta del proyecto: revisa la ruta antes de adjuntar.":
    "⚠ Du befindest dich außerhalb deines Projektordners: prüfe den Pfad, bevor du etwas anhängst.",
  "No se pudo cargar el catálogo": "Konnte den Katalog nicht laden",
  "Buscar modelo o proveedor…": "Suche Modell oder Anbieter…",
  "Cargando modelos…": "Lade Modelle…",
  "por defecto": "Standard",
  "variantes": "Varianten",
  "Modelo:": "Modell:",
  "Modo PLAN (solo lectura)": "PLAN Modus (Lesezugriff)",
  "Modo BUILD (puede editar)": "BUILD Modus (kann bearbeiten)",
  "No se pudo cambiar el modo": "Konnte den Modus nicht ändern",
  "No se pudo cambiar el modelo": "Konnte das Modell nicht ändern",
  "Permiso rechazado": "Genehmigung abgelehnt",
  "Permitido (siempre)": "Erlaubt (immer)",
  "Permitido": "Erlaubt",
  "No se pudo responder": "Konnte nicht antworten",
  "Error cargando mensajes": "Fehler beim Laden der Nachrichten",
  "Quitar": "Entfernen",
  "archivo(s) adjuntado(s)": "Datei(en) angehängt",
  "No se pudo enviar: ": "Konnte nicht senden: ",


  /* ---- permisos ---- */
  "Sin permisos pendientes. Cuando el agente necesite algo delicado (borrar, shell, escritura…), aquí lo decides.":
    "Keine ausstehenden Berechtigungen. Falls der Agent sensitive Aktionen benötigt (löschen, Shell, schreiben), entscheide es hier.",
  "Permitir": "Erlaubt",
  "Siempre": "Immer",
  "Rechazar": "Ablehnen",
  "Permitido esta vez": "Einmal erlaubt",
  "Abrir la sesión →": "Öffne die Sitzung →",
  "Error cargando permisos": "Fehler beim Laden der Berechtigungen",

  /* ---- ajustes: conexion ---- */
  "Alternativa": "Alternative",
  "Modo": "Modus",
  "Versión": "Version",
  "proxy same-origin": "same-origin Proxy",
  "directo (CORS)": "direkt (CORS)",
  "Probar conexión": "Teste Verbindung",
  "Cambiar servidor": "Ändere Server",
  "Usar alternativa": "Verwende Alternative",
  "Usar principal": "Verwende Primary",
  "Probando…": "Teste…",
  "Conexión OK · opencode v{version}": "Verbindung OK · opencode v{version}",
  "Sin conexión": "Keine Verbindung",
  "URL principal intercambiada": "Primäre  URL getauscht",

  /* ---- ajustes: seguridad ---- */
  "⚠ Conexión por HTTP sin cifrar: la contraseña viaja visible por la red. Usa el QR con tunnel https.":
    "⚠ Unverschlüsseltre HTTP Verbindung: das Passwort wird unverschlüsselt über das Netzwerk transportiert. Verwende QR mit einem https Tunnel.",
  "PIN no disponible en este origen: Web Crypto requiere https o localhost (en LAN por http no existe).":
    "PIN nicht verfügbar auf diesem Ursprung: Web Crypto erfordert https odrr localhost (existiert nicht bei reinem http LAN).",
  "🔒 Bloqueo con PIN activo.": "🔒 PIN Sperre is an.",
  "Cerrar por inactividad": "Sperre nach Inaktivität",
  "minuto": "Minute",
  "minutos": "Minuten",
  "Bloquear ahora": "Jetzt sperren",
  "Bloqueado": "Gesperrt",
  "Desactivar PIN": "Turn off PIN",
  "¿Desactivar el PIN de este dispositivo?": "Turn off the PIN on this device?",
  "PIN desactivado": "PIN turned off",
  "PIN activado · se pedirá al abrir la app": "PIN enabled · it will be asked when opening the app",
  "PIN demasiado corto (mínimo 4)": "PIN zu kurz (mindestens 4 Zeichen)",
  "Activar PIN": "Schalte PIN an",
  "Nuevo PIN": "Neuer PIN",
  "4 a 12 caracteres": "4 bis 12 Zeichen",
  "PIN local del móvil (no es el del servidor): se guarda como hash PBKDF2, nunca en claro.":
    "Lokaler Telefon PIN (nicht der Server PIN): gespeichert als PBKDF2 Hash, niemals als Klartext.",
  "Cerrar sesión en este dispositivo": "Von diesem Gerät abmelden",
  "¿Cerrar sesión? Se borrará la contraseña guardada en este dispositivo.":
    "Abmelden? Das auf diesem Gerätr gespeicherte Passwort wird gelöscht.",
  "Sesión cerrada": "Abgemeldet",
  "Inactividad actualizada": "Inaktivität aktualisiert",

  /* ---- ajustes: apariencia ---- */
  "Auto": "Auto",
  "Claro": "Hell",
  "Oscuro": "Dunkel",
  "«Auto» sigue el modo claro/oscuro del sistema.":
    "«Auto» richtet sich nach dem Hell/Dunkel Modus des Systems.",
  "Tema": "Schema",
  "Modo compacto (más mensajes en pantalla)": "Kompakt Modus (mehr Nachrichten auf dem Bildschirm)",
  "Atajos de teclado": "Tastaturkürzel",
  "Solo en ordenador (con teclado).": "Ausschließlich Desktop (mit Tastatur).",
  "Buscar (en sesiones y en el chat)": "Suchen (Sitzungen und Chat)",
  "Enviar el mensaje": "Sende die Nachricht",
  "Salto de línea en el mensaje": "Zeilenumbruch in der Nachricht",
  "Cerrar la búsqueda o el panel abierto": "Schließe die Suche oder öffne das Panel",
  "En macOS, usa Cmd en lugar de Ctrl.": "Verwende auf maOS Cmd anstatt Ctrl.",

  /* ---- push ---- */
  "Notificaciones push (app cerrada)": "Push notifications (app closed)",
  "A diferencia de las de arriba, estas llegan con la app CERRADA. Necesitan el servicio push corriendo en tu PC (server/push-server.mjs) y su URL aquí.":
    "Anders als die darüber, kommen diese mit App CLOSE an. Hierfür muss der Push Service auf dem Rechner laufen (server/push-server.mjs).",
  "URL del servicio push": "Push Service URL",
  "URL del servicio guardada": "Service URL gespeichert",
  "✅ Activas en este dispositivo.": "✅ Gerät freischalten.",
  "Desactivadas en este dispositivo.": "Dieses Gerät deaktivieren.",
  "No se pudo comprobar.": "Konnte nicht prüfen.",
  "Guardar URL": "Speichere URL",s
  "Activar push": "Push aktiviert",
  "Desactivar push": "Push deaktiviert",
  "Enviar prueba": "Sende Test",
  "Push activado en este dispositivo": "Push auf diesem Gerät aktiviert",
  "Push desactivado": "Push deaktiviert",
  "Pon primero la URL del servicio push.": "Setze zuerst Push Service URL.",
  "Permiso de notificaciones denegado": "Freigabe für Benachrichtigungen verweigert.",
  "No se pudo activar": "Konnte nicht aktivieren",
  "Aviso de prueba enviado": "Testnachricht senden",
  "No se pudo enviar": "Konnte nicht senden",
  "El servicio push se arranca con: node server/push-server.mjs (en tu PC, junto a opencode).":
    "Starte den Push Service: node server/push-server.mjs (auf deinem Rechner neben opencode).",
  "⚠ El push necesita HTTPS o localhost. En LAN por HTTP el navegador no lo permite: usa el túnel https (QR).":
    "⚠ Push benötigt HTTPS oder localhost. Der Brwoser erlaubt im LAN keine Kommunikation in HTTP: verwende https Tunnel (QR).",
  "En iPhone/iPad, Apple solo permite push a las webs **instaladas** en la pantalla de inicio. Instálala primero (ver arriba).":
    "Push ist auf iPhone/iPad, Apple nur für **installierte** Web Apps auf dem Home Screen erlaubt. Bitte zuerst installieren (siehe oben).",
  "Este navegador no soporta Web Push.": "Dieser Browser unterstützt kein Web Push.",
  "Idioma": "Sprache",
  "Idioma de la interfaz": "Spracher der Benutzeroberfläche",

  /* ---- ajustes: notificaciones ---- */
  "Este navegador no soporta notificaciones. Usa el badge 🛡 de la lista y el banner del chat, que sí funcionan.":
    "Dieser Browser unterstützt keine Benachitigungen. Verwende den 🛡 Badge in der Liste und im Chat Banner, dieser funktioniert.",
  "⚠ Las notificaciones necesitan HTTPS o localhost. Abre la app con el túnel https (QR) para activarlas.":
    "⚠ Benachrichtigungen benötigen HTTPS oder localhost. Öffne die App über einen https Tunnel (QR), um diese zu aktivieren.",
  "En iPhone/iPad, Apple solo permite notificar a las webs **instaladas**. Instálala y vuelve aquí:":
    "Push ist auf iPhone/iPad, Apple nur für **installierte** Web Apps erlaubt. Bitte zuerst installieren und hierher zurückkommen:",
  "Pulsa **Compartir** (el cuadrado con la flecha) en Safari.":
    "Drücke in Safari **Share** (das Rechteck mit dem Pfeil).",
  "Elige **«Añadir a pantalla de inicio»**.": "Wähle **“Zum HomeScreen Hinzufügen”**.",
  "Abre la app desde el icono nuevo y activa aquí las notificaciones.":
    "Öffne die App über das Neu Icon und aktiviere hier Benachichtigungen.",
  "Aviso: aunque la instales, Apple **no permite** despertar la app en segundo plano, así que el aviso llega solo si acabas de dejar la app (unos segundos). El badge 🛡 y el banner del chat siempre funcionan.":
    "Hinweis: auch wenn installiert, erlaubt Apple das Aufwecken der App im Hintergrund **nicht**, daher erscheinen Aktivitäten erst nach Verlassen der app (nach ein paar Sekunden). Der 🛡 Badge und das Chat Banner funktionieren immer.",
  "Activadas: te avisaré cuando el agente pida un permiso y no estés mirando la app.":
    "Aktiviert: I werde die informieren, wenn der Agent nach Berechtigungen fragt, während du gerade nicht nach der App schaust.",
  "Bloqueadas por el navegador. Actívalas en los ajustes del sitio (icono junto a la URL) y recarga.":
    "Vom Browser blockiert. Aktiviere diese in den Site Einstellungen (Icon neben der URL) und starte erneut.",
  "Desactivadas.": "Deaktiviert.",
  "Activar notificaciones": "Aktiviere Benachichtigungen",
  "Notificaciones activadas": "Notifications enabled",
  "Permiso denegado en el navegador": "Zugriff im Browser verweigert",
  "Permiso no concedido": "Zugriff nicht freigeschltet",
  "Probar notificación": "Test Benachichtigung",
  "No se pudo mostrar la notificación": "Konnte die Benachichtigung nicht anzeigen",
  "Avisos solo en segundo plano y con permiso concedido. Android mantiene la app viva unos 30 s tras ocultarla; pasada esa ventana no puede avisar (sin servidor push).":
  "Zeigt die Benachichtigungen nur im Hintergrund, wenn sie erlaubt wurden. Unter Android bleibt die App ~30 s aktiv, nachdem sie versteckt wurde; danach kann sie keine Benachichtigunge mehr senden (kein Pushserver).",

  /* ---- vista Sistema ---- */
  "Sistema": "System",
  "Servidores MCP": "MCP Server",
  "Proveedores de modelos": "Modell Anbieter",
  "Plugins": "Plugins",
  "Skills": "Skills",
  "Comandos": "Commands",
  "Servidores de lenguaje (LSP)": "Language servers (LSP)",
  "La API HTTP de opencode no expone el estado de los LSP: los gestiona el servidor internamente (según los ficheros de tu proyecto). Aquí no hay nada que configurar.":
    "Die opencode API bietet keine  LSP Status: der Server behandelt diese intern (anhängig von deinen Projketdateien). Hier kann nichts konfiguriert werden.",
  "Estado de los servicios del servidor: MCP, proveedores, plugins, skills y comandos.":
    "Status Server Service: MCP, Provider, Plugins, Skills und Commands.",
  "Ver sistema": "Ansichtssystem",
  "activo": "Active",
  "inactivo": "Inaktive",
  "Conectar": "Verbinden",
  "Desconectar": "Trennen",
  "Conectado": "Verbunden",
  "Desconectado": "Getrennt",
  "No se pudo cambiar el estado": "Konnte den Zustand  nicht ändern",
  "No hay servidores MCP configurados.": "Keine MCP Server konfiguriert.",
  "Sin proveedores.": "Keine Anbieter.",
  "Sin plugins.": "Keine Plugins.",
  "Sin skills.": "Kein Skills.",
  "Sin comandos.": "Keine Commands.",
  "Error cargando MCP": "Fehler beim Laden von MCP",
  "Error cargando proveedores": "Fehler beim Laden der Provider",
  "Error cargando plugins": "Fehler beim Laden der Plugins",
  "Error cargando skills": "Fehler beim Laden der Skills",
  "Error cargando comandos": "Fehler beim Laden der Commands",
  "origen: {tipo}": "Quelle: {tipo}",

  /* ---- ajustes: diagnostico / acerca de ---- */
  "Errores locales ({n})": "Lokale Fehler ({n})",
  "Sin errores registrados.": "Keine Fehler geloggt.",
  "Log de errores limpiado": "Fehler Logs bereinigt",
  "Limpiar log": "Bereinige Logs",
  "Vaciar caché": "Bereinige Cache",
  "Caché vaciada · recargando": "Cache bereinigt · Neustart",
  "No se pudo vaciar la caché": "Konnte den Cache nicht bereinigen",
  "OpenCode Móvil · PWA sin frameworks (Vite + JS vanilla). Cliente de la API HTTP de opencode: sesiones, chat en streaming, permisos y bloqueo con PIN.":
    "OpenCode Móvil · framework-free PWA (Vite + vanilla JS). Client für die opencode HTTP API: Sessions, Streaming chat, Berechtigungen und PIN Sperre.",

  /* ---- bloqueo con PIN ---- */
  "Bloqueado": "Locked",
  "Introduce el PIN del dispositivo": "Geräte PIN eingeben",
  "Desbloquear": "Entsperren",
  "Comprobando…": "Prüfe…",
  "¿Olvidaste el PIN? Borrar datos del dispositivo":
    "Pin vergessen? Lösche Geräteinformationen",
  "Se borraran el PIN y la contraseña guardada en este dispositivo. ¿Continuar?":
    "Der Pin und das gespeicherte Passwort auf diesem Gerät werden gelöscht. Fortsetzen?",
  "Bloqueado por inactividad": "Wegen Inaktivität gesperrt",
  "Bloqueado: la app paso a segundo plano": "Gepserrt: die App läuft im Hintergrund weiter",
  "PIN incorrecto ({n}º intento)": "Falscher PIN ({n}-er Versuch)",
  "Demasiados intentos: espera {s} s": "Zu viele Versuche: warte {s} s",
  "Error comprobando el PIN": "Fehler beim Prüfen der PIN",
  "Error interno comprobando el PIN": "Interner Fehler beim Pürfen der PIN",
  "PIN": "PIN",

  /* ---- aviso iOS ---- */
  "📲 Para instalarla: Compartir → «Añadir a pantalla de inicio». Así funcionan el PIN y las notificaciones.":
    "📲 Zum Installieren: Teilen → “Zum Home Screen hinzufügen”. Damit werden PIN und Benachichtigungen aktiviert.",


};
