/* Service worker de notificaciones push (Firebase Cloud Messaging).
   Muestra los avisos de turnos pagados con el panel admin cerrado.
   La config tiene que coincidir con src/utils/adminPush.js */

// Va antes de cargar Firebase para que este handler tenga prioridad
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windows) => {
        const admin = windows.find((w) => w.url.includes("/admin"));
        if (admin) return admin.focus();
        return clients.openWindow("/admin");
      }),
  );
});

importScripts("https://www.gstatic.com/firebasejs/13.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/13.0.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyChBBawM8QrY-iCvbqCb63GAVg2V4BX4E0",
  authDomain: "evelyn-bb2f3.firebaseapp.com",
  projectId: "evelyn-bb2f3",
  storageBucket: "evelyn-bb2f3.firebasestorage.app",
  messagingSenderId: "782059917345",
  appId: "1:782059917345:web:1c5d1ba8e71f9945aa5360",
});

// Con el mensaje en segundo plano, Firebase muestra la notificación solo
firebase.messaging();
