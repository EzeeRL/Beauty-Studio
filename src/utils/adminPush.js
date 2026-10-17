// Notificaciones push del panel admin (avisos de turnos pagados).
// El navegador obtiene un token de Firebase Cloud Messaging y el back lo
// suscribe al topic "admins". Si cambiás algo de la config, actualizá
// también public/firebase-messaging-sw.js.
import { initializeApp, getApps } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";
import adminApi, { API } from "./adminApi";

const firebaseConfig = {
  apiKey: "AIzaSyChBBawM8QrY-iCvbqCb63GAVg2V4BX4E0",
  authDomain: "evelyn-bb2f3.firebaseapp.com",
  projectId: "evelyn-bb2f3",
  storageBucket: "evelyn-bb2f3.firebasestorage.app",
  messagingSenderId: "782059917345",
  appId: "1:782059917345:web:1c5d1ba8e71f9945aa5360",
};

const VAPID_KEY =
  "BDNwDzMIjvtsOWNfOEiOHDWt2lI-YCRv60JeSltPiItOAvAKUrZbDid5RWZC8QxL66Lw-F7OFgPtLvxFCWlrwI0";

const SW_URL = "/firebase-messaging-sw.js";

const getFirebaseApp = () => getApps()[0] ?? initializeApp(firebaseConfig);

const isIOS = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

const isInstalledApp = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  navigator.standalone === true;

// "ios-install" | "unsupported" | "default" | "denied" | "granted"
export const getPushStatus = async () => {
  // En iPhone las notificaciones solo funcionan con el sitio instalado
  if (isIOS() && !isInstalledApp()) return "ios-install";
  if (
    !("Notification" in window) ||
    !("serviceWorker" in navigator) ||
    !(await isSupported())
  ) {
    return "unsupported";
  }
  return Notification.permission;
};

let listeningForeground = false;

const registerAndSubscribe = async () => {
  const registration = await navigator.serviceWorker.register(SW_URL);
  const messaging = getMessaging(getFirebaseApp());
  const fcmToken = await getToken(messaging, {
    vapidKey: VAPID_KEY,
    serviceWorkerRegistration: registration,
  });

  await adminApi.post(`${API}/notifications/admin/subscribe`, { fcmToken });

  // Con el panel abierto y en primer plano Firebase no muestra nada solo
  if (!listeningForeground) {
    listeningForeground = true;
    onMessage(messaging, ({ notification }) => {
      if (!notification) return;
      registration.showNotification(notification.title, {
        body: notification.body,
        icon: "/logo.png",
      });
    });
  }
};

// Llamar desde un click: en iPhone el permiso solo se puede pedir así
export const enableAdminPush = async () => {
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return permission;
  await registerAndSubscribe();
  return "granted";
};

// Si ya dio permiso, renueva la suscripción en silencio (el token puede rotar)
export const refreshAdminPush = async () => {
  try {
    if ((await getPushStatus()) !== "granted") return;
    await registerAndSubscribe();
  } catch (err) {
    console.error("⚠️ No se pudo renovar la suscripción a notificaciones:", err);
  }
};
