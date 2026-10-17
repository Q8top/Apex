
import http.server, socketserver, json
class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith('/api/'):
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(b'{"ok":true,"user":{"id":1,"username":"dev"}}')
            return
        super().do_GET()
    def do_POST(self):
        if self.path.startswith('/api/'):
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(b'{"ok":true}')
            return
        super().do_POST()
print('=========================================')
print('服务器启动成功！')
print('请在手机浏览器输入：http://127.0.0.1:8081')
print('=========================================')
with socketserver.TCPServer(("", 8081), Handler) as httpd:
    httpd.serve_forever()
