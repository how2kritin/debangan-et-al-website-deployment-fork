import socket


def is_connected():
    try:
        # connect to the host -- tells us if the host is actually
        # reachable
        socket.create_connection(("1.1.1.1", 53))
        print("Connected to Internet")
        return True
    except OSError:
        pass
    print("Not Connected to Internet")
    return False

is_connected()