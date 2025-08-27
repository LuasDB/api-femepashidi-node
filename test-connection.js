import net from 'net'
import config from './config';
const HOST = config.hostEmailSupport; // cámbialo al servidor que uses
const PORT = config.portEmailSupport; // prueba con 465 y 25 también

const client = net.createConnection({ host: HOST, port: PORT }, () => {
  console.log(`✅ Conexión establecida con ${HOST}:${PORT}`);
  client.end();
});

client.on("error", (err) => {
  console.error(`❌ Error de conexión con ${HOST}:${PORT} ->`, err.message);
});
