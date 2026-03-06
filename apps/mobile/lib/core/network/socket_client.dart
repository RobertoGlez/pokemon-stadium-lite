import 'package:socket_io_client/socket_io_client.dart' as io;
import 'package:logger/logger.dart';

class SocketClient {
  static final SocketClient _instance = SocketClient._internal();
  factory SocketClient() => _instance;
  SocketClient._internal();

  io.Socket? _socket;
  final _logger = Logger();

  io.Socket? get socket => _socket;
  bool get isConnected => _socket?.connected ?? false;

  void connect(String url) {
    if (_socket != null) {
      _socket!.disconnect();
      _socket!.dispose();
    }

    _logger.i('Connecting to Socket server at: $url');

    _socket = io.io(url, io.OptionBuilder()
      .setTransports(['websocket']) // Use websocket to prevent session sharing between local emulators
      .disableAutoConnect()
      .enableForceNew()
      .build());

    _socket!.connect();

    _socket!.onConnect((_) => _logger.i('Connected to server'));
    _socket!.onDisconnect((_) => _logger.w('Disconnected from server'));
    _socket!.onConnectError((data) => _logger.e('Connect Error: $data'));
    _socket!.onError((data) => _logger.e('Socket Error: $data'));
  }

  void disconnect() {
    _socket?.disconnect();
    _socket = null;
  }

  void emit(String event, [dynamic data]) {
    if (_socket != null && _socket!.connected) {
      _socket!.emit(event, data);
    } else {
      _logger.w('Cannot emit $event: Socket not connected');
    }
  }

  void on(String event, dynamic Function(dynamic) handler) {
    _socket?.on(event, handler);
  }
}
