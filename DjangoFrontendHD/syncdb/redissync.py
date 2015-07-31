## Module for syncing with Redis database
import redis
import json
import random
import time

REDIS_DATABASE_ADDR = 'pub-redis-11281.us-east-1-4.5.ec2.garantiadata.com'
REDIS_DATABASE_NO = 0
REDIS_DATABASE_PORT = 11281
REDIS_DATABASE_PASS = '1233'



import random
from syncdb.models import *


def connect_to_redis():
    redis_connection = redis.StrictRedis(REDIS_DATABASE_ADDR, REDIS_DATABASE_PORT, REDIS_DATABASE_NO, REDIS_DATABASE_PASS, 90, 10, True, decode_responses=True)
    return redis_connection


def data_gen(number_of):
    r = connect_to_redis()
    # Fields:
        # Event Name
        # Event Alert Type: { "log", "error", "warning" }
        # Event UID: int
        # Event SID: int
        # Event Decription: str
    dates = []

    for i in range(0,number_of):
        event = Event._debug_gen()
        r.hmset(event.name, { 'sid': event.sid, 'uid': event.uid, 'desc': event.desc, 'type': event.type, 'origin':event.originid, 'time':event.time })
        dates += [event.time, event.name]
    r.zadd("dates", *dates);    

    return 0

def request_most_recent_data(last_known, max_events):
    r = connect_to_redis()
    rank = r.zrevrank("dates",last_known)
    hashes_to_fetch = []
    recent = [ ]
    if(rank == None):
        #fetch all keys
        hashes_to_fetch = r.zrange('dates',0,max_events)
    elif(rank!= None and rank>0):
        hashes_to_fetch = r.zrange('dates',0,min(max_events,rank-1))

    for name in hashes_to_fetch:
        obj = r.hmget(name,u'uid',u'sid',u'type', u'origin')
        
        recent.append(json.dumps({
                'name': name,
                'sid': obj.sid,
                'uid': obj.uid,
                'type': obj.type,
                'origin':obj.origin
            }))

    l = len(hashes_to_fetch)
    if(l>0):
        result = [ hashes_to_fetch[l-1], recent ]
    else:
        result = [ last_known, recent ]
    return result

def request_event_data(event_hashname):
    r = connect_to_redis()
    data = None
    try:
        data = json.dumps(r.hgetall(event_hashname))
    except:
        pass
    if(recent == None):
        result = [ event_hashname, data ]
    else:
        result = [ event_hashname, "{}" ]
    
