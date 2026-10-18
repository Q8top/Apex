
import http.server, socketserver
class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self): super().do_GET()
    def do_POST(self):
        self.send_response(200); self.send_header('Content-Type', 'application/json'); self.end_headers(); self.wfile.write(b'{"success":true}')
print('✅ 终极完美版启动！请在手机打开：http://127.0.0.1:8104/login.html')
socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("", 8104), Handler) as httpd: httpd.serve_forever()
