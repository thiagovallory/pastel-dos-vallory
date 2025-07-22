import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import qrcode from 'qrcode-terminal'
import { networkInterfaces } from 'os'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'qr-code-generator',
      configureServer(server) {
        server.httpServer?.once('listening', () => {
          const address = server.httpServer?.address()
          if (address && typeof address === 'object') {
            const localUrl = `http://localhost:${address.port}`
            const networkUrl = `http://${getLocalIP()}:${address.port}`
            
            console.log('\n🔗 QR Code para acesso mobile:')
            console.log(`📱 Local: ${localUrl}`)
            console.log(`🌐 Network: ${networkUrl}`)
            qrcode.generate(networkUrl, { small: true })
          }
        })
      }
    }
  ]
})

function getLocalIP() {
  const interfaces = networkInterfaces()
  for (const name of Object.keys(interfaces)) {
    for (const netInterface of interfaces[name]) {
      if (netInterface.family === 'IPv4' && !netInterface.internal) {
        return netInterface.address
      }
    }
  }
  return 'localhost'
}
