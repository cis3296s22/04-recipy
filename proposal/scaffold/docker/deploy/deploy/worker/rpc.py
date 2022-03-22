import zmq
from protlib import CUShort, CULong, CString, CChar, CStruct

from django.conf import settings

class CRPCMessage(CStruct):
    is_async = CChar()
    action_len = CUShort()
    action = CString(length='action_len')
    body_len = CULong()
    body = CString(length='body_len')

    @classmethod
    def create(cls, message):
        m = cls()
        m.is_async = 1 if message.is_async else 0

class CRPCResponse(CStruct):
    not_found = CChar()
    mismatch_sync = CChar()
    is_void = CChar()
    exit_status = CChar()
    length = CULong()
    body = CString(length="length")
        
class RPCMessage:
    def __init__(self, *args, is_async = True, action = '', body = b''):
        if len(args) == 1: # RPCMessage(b'<binary RPC message here>')
            bs = args[0]
            if type(bs) is not bytes:
                raise TypeError("Expecting bytes, got {}.".format(type(bs)))
            cm = CRPCMessage.parse(bs)
            self.is_async = cm.is_async == 1
            self.action = cm.action.decode('utf-8')
            self.body = cm.body
        else: # RPCMessage(async=True, action='do_something', body=b'123')
            self.is_async = is_async
            self.action = action
            self.body = body

    def __bytes__(self):
        action_bytes = self.action.encode('utf-8')
        c = CRPCMessage()
        c.is_async = 1 if self.is_async else 0
        c.action_len = len(action_bytes)
        c.action = action_bytes
        c.body_len = len(self.body)
        c.body = self.body
        return c.serialize()

class RPCResponse:
    def __init__(self, *args, body=b'', exit_status=0, is_void=False, not_found=False, mismatch_sync=False):
        if len(args) == 1:
            bs = args[0]
            if type(bs) is not bytes:
                raise TypeError("Expecting bytes, got {}.".format(type(bs)))
            cr = CRPCResponse.parse(bs)
            self.body = cr.body
            self.exit_status = cr.exit_status
            self.is_void = cr.is_void == 1
            self.not_found = cr.not_found == 1
            self.mismatch_sync = cr.mismatch_sync == 1
        else:
            self.body = body
            self.exit_status = exit_status
            self.is_void = is_void
            self.not_found = not_found
            self.mismatch_sync = mismatch_sync

    def __bytes__(self):
        r = CRPCResponse()
        r.not_found = 1 if self.not_found else 0
        r.mismatch_sync = 1 if self.mismatch_sync else 0
        r.is_void = 1 if self.is_void else 0
        r.exit_status = self.exit_status
        r.length = len(self.body)
        r.body = self.body
        return r.serialize()

class RPC:
    def __init__(self):
        self.client_port = settings.RPC_CLIENT_PORT # queue listens here
        self.server_port = settings.RPC_SERVER_PORT # queue forwards requests here.
        self.actions = {}
        self.action_props = {}

    def implement(self, action, body, **kwargs):
        self.actions[action] = body
        self.action_props[action] = kwargs

    def queue(self):
        while True:
            context = None
            frontend = None
            backend = None

            try:
                try:
                    context = zmq.Context(1)
                except Exception as e:
                    print('Failed to create context')
                    raise e
                
                try:
                    frontend = context.socket(zmq.XREP)
                    frontend.bind("tcp://127.0.0.1:{}".format(self.client_port))
                except Exception as e:
                    print('Failed to bind frontend to tcp://127.0.0.1:{}'.format(self.client_port))
                    raise e
                
                try:
                    backend = context.socket(zmq.XREQ)
                    backend.bind("tcp://127.0.0.1:{}".format(self.server_port))
                except Exception as e:
                    print('Failed to bind backend to tcp://127.0.0.1:{}'.format(self.server_port))
                    raise e

                try:
                    # This zmq.proxy acts like a queue
                    zmq.proxy(frontend, backend)
                except Exception as e:
                    print('')
                    raise e
            finally:
                if frontend:
                    frontend.close()
                if backend:
                    backend.close()
                context.term()

    def broker(self):
        context = zmq.Context() 

        socket = context.socket(zmq.REP)
        socket.connect('tcp://127.0.0.1:{}'.format(self.server_port))

        while True:
            socket.poll()
            bs = socket.recv()
            msg = RPCMessage(bs)

            if msg.action not in self.actions:
                print("Action not implemented: `{}`".format(msg.action))
                if not msg.is_async:
                    socket.send(bytes(RPCResponse(not_found=True)))
                continue

            callback = self.actions[msg.action]
            props = self.action_props[msg.action]
            is_async = props.get('is_async', True)

            if is_async != msg.is_async:
                print("Async/sync mismatch: `{}` (expected: {}, got: {})".format(msg.action, is_async, msg.is_async))
                if not msg.is_async:
                    socket.send(bytes(RPCResponse(mismatch_sync=True)))
                continue

            res = callback(msg.body)

            if not msg.is_async:
                resp = RPCResponse()
                if res is None:
                    resp.is_void = True
                if type(res) is bytes:
                    resp.body = res
                else:
                    (body, exit_code) = res
                    resp.body = body
                    resp.exit_status = exit_code
                socket.send(bytes(resp))
            else:
                socket.send(b'') # appease ZMQ

    def run(self):
        from threading import Thread
        Thread(target=self.queue).start()
        self.broker()

    def call(self, action, body, is_async=True):
        socket = None
        context = zmq.Context() 
        try:
            socket = context.socket(zmq.REQ)
            socket.connect('tcp://127.0.0.1:{}'.format(self.client_port))
            socket.send(bytes(RPCMessage(action=action, body=body, is_async=is_async)))
    
            if not is_async:
                res = socket.recv()
                res = RPCResponse(res)
                return None if res.is_void else (res.body, res.exit_code)
            return None
        finally:
            if socket:
                socket.close()

# TODO: transforms

# RPC.json = lambda bs: **json.loads(bs)
