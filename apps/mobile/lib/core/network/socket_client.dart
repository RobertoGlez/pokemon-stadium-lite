import 'package:socket_io_client/socket_io_client.dart' as io;
import 'package:logger/logger.dart';

class SocketClient {
  static final SocketClient _instance = SocketClient._internal();
  factory SocketClient() => _instance;
  SocketClient._internal();

  io.Socket? _socket;
  final _logger = Logger();
  void Function(String message)? _onConnectionError;
  bool _connectionFailureReported = false;

  io.Socket? get socket => _socket;
  bool get isConnected => _socket?.connected ?? false;

  void _emitConnectionFailure(dynamic data) {
    if (_connectionFailureReported) return;
    _connectionFailureReported = true;
    final detail = data?.toString();
    final msg = (detail == null || detail.isEmpty) ? 'connect_error' : detail;
    _onConnectionError?.call(msg);
  }

  void connect(String url, {void Function(String message)? onConnectionError}) {
    if (_socket != null) {
      _socket!.disconnect();
      _socket!.dispose();
    }

    _connectionFailureReported = false;
    _onConnectionError = onConnectionError;

    _logger.i('Connecting to Socket server at: $url');

    _socket = io.io(url, io.OptionBuilder()
      .setTransports(['websocket']) // Force websocket for Cloud Run
      .enableAutoConnect() // Crucial for connection recovery
      .enableForceNew()
      .setExtraHeaders({
        'Connection': 'keep-alive',
        'User-Agent': 'PokemonStadiumMobile/1.0.0 (Mobile; Flutter)'
      })
      .build());

    _socket!.connect();

    _socket!.onConnect((_) {
      _connectionFailureReported = false;
      _logger.i('Connected to server');
    });
    _socket!.onDisconnect((_) => _logger.w('Disconnected from server'));
    _socket!.onConnectError((data) {
      _logger.e('Connect Error: $data');
      _emitConnectionFailure(data);
    });
    _socket!.onError((data) {
      _logger.e('Socket Error: $data');
      if (_socket?.connected != true) {
        _emitConnectionFailure(data);
      }
    });
  }

  void disconnect() {
    _socket?.disconnect();
    _socket = null;
    _onConnectionError = null;
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
