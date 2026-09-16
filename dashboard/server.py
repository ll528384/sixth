import os
import socket
import http.server

os.chdir(os.path.dirname(os.path.abspath(__file__)))


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()


class DualStackServer(http.server.ThreadingHTTPServer):
    address_family = socket.AF_INET6

    def server_bind(self):
        try:
            self.socket.setsockopt(socket.IPPROTO_IPV6, socket.IPV6_V6ONLY, 0)
        except OSError:
            pass
        return super().server_bind()


def make_server(port, handler):
    try:
        return DualStackServer(('::', port), handler)
    except OSError:
        return http.server.ThreadingHTTPServer(('0.0.0.0', port), handler)


if __name__ == '__main__':
    try:
        srv = make_server(8765, NoCacheHandler)
    except OSError as e:
        print('启动失败(8765 端口可能被占用):', e)
        input('按回车键关闭...')
        raise SystemExit(1)
    print('看板服务运行中: http://127.0.0.1:8765/')
    print('请保持此窗口开启,按 Ctrl+C 或直接关闭窗口即可停止服务。')
    srv.serve_forever()
