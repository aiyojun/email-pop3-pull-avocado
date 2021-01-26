#!/bin/python3

import os
import sys
import json
import time
import poplib
from email.message import Message
from email.parser import Parser
from email.header import decode_header
from email.utils import parseaddr


def decode_str(s):
    value, charset = decode_header(s)[0]
    if charset:
        value = value.decode(charset)
    return value


def guess_charset(msg):
    charset = msg.get_charset()
    if charset is None:
        content_type = msg.get('Content-Type', '').lower()
        pos = content_type.find('charset=')
        if pos >= 0:
            charset = content_type[pos + 8:].strip()
    return charset


def parse(_message: Message):
    charset = guess_charset(_message)
    return _message.get_payload(decode=True).decode(charset)


def parse_sender(sender_str: str):
    senders = sender_str.split(" ")
    if len(senders) == 0:
        return ""
    ps = []
    for sender in senders:
        sender = sender.replace(" ", "")
        sender = sender.replace('"', "")
        sender = sender.replace('<', "")
        sender = sender.replace('>', "")
        if '@' in sender:
            ps.append(sender.split('@')[0])
    ps = list(set(ps))
    return ps[0]


def parse_date(_date: str):
    formatter = '%a, %d %b %Y %H:%M:%S %z'
    return int(time.mktime(time.strptime(_date, formatter)) * 1000)


def to_json(_uuid, _message: Message):
    _from = parse_sender(_message.get("From", ''))
    integration = {
        "uuid": _uuid,
        "date": parse_date(_message.get('Date')),
        "from": _from,
#         "from": _from if len(_from) < 12 else _from[0:12],
        "to": _message.get("To", ''),
        "subject": decode_str(_message.get("Subject", "")),
    }
    if _message.is_multipart():
        many = _message.get_payload()
        for idx, __message in enumerate(many):
            typ = __message.get_content_type()
            if typ == 'text/plain':
                integration['plain'] = parse(__message)
            elif typ == 'text/html':
                integration['html'] = parse(__message)
            else:
                pass
                # integration['attachment'] = parse(__message)
    else:
        pass
    return integration
    # return json.dumps(integration, ensure_ascii=False)


if __name__ == '__main__':
    try:
        if len(sys.argv) == 1:
            email = "daijun@jabqus.com"
            password = "suzhou12345"
            pop3_server = "172.16.1.233"
            email_n = 20
        else:
            email = str(sys.argv[1])  # "daijun@jabqus.com"
            password = str(sys.argv[2])  # "suzhou12345"
            pop3_server = str(sys.argv[3])  # "172.16.1.233"
            email_n = int(sys.argv[4])  # 20

        server = poplib.POP3(pop3_server)
        server.user(email)
        server.pass_(password)
        (email_number, space) = server.stat()
        resp, mails, octets = server.list()
        read_n = email_n
        resp = []
        if len(mails) < read_n:
            read_n = len(mails)
        for i in range(0, read_n):
            index = len(mails) - i
            _, lines, _ = server.retr(index)
            lines = [str(line, encoding='utf8') for line in lines]
            lines = '\r\n'.join(lines)
            # print(lines)
            # exit(-1)
            message = Parser().parsestr(lines)
            resp.append(to_json(index, message))
            pass
        server.quit()
        resp = json.dumps({'time': int(time.time() * 1000), "emails": resp}, ensure_ascii=False)
        if sys.platform == 'linux':
            print(json.dumps({'time': int(time.time() * 1000), "emails": resp}, ensure_ascii=False))
    except Exception as e:
        resp = json.dumps({"err": str(e)})
        if sys.platform == 'linux':
            print(json.dumps({"err": str(e)}))
    if sys.platform == 'win32':
        with open('pipe', mode='w+', encoding='utf8') as fp:
            fp.write(resp)
