## Module for syncing with Redis database
import redis
import json
import random
import time

REDIS_LOCAL_DATABASE_ADDR = 'localhost'
REDIS_LOCAL_DATABASE_NO = 0
REDIS_LOCAL_DATABASE_PORT = 6379

REDIS_DATABASE_ADDR = 'pub-redis-11281.us-east-1-4.5.ec2.garantiadata.com'
REDIS_DATABASE_NO = 0
REDIS_DATABASE_PORT = 11281
REDIS_DATABASE_PASS = '1233'

CONNECT_TO_LOCAL = True

import random
from syncdb.models import *


def connect_to_redis(override_to_connect_local = None):
    redis_connection = None
    if( (override_to_connect_local == None and CONNECT_TO_LOCAL == True) or override_to_connect_local == True):
        redis_connection = redis.StrictRedis(REDIS_LOCAL_DATABASE_ADDR, REDIS_LOCAL_DATABASE_PORT, REDIS_LOCAL_DATABASE_NO, None, 90, 10, True, decode_responses=True)
    else:
        redis_connection = redis.StrictRedis(REDIS_DATABASE_ADDR, REDIS_DATABASE_PORT, REDIS_DATABASE_NO, REDIS_DATABASE_PASS, 90, 10, True, decode_responses=True)
    return redis_connection


def data_gen(number_of):
    r = connect_to_redis()
    r.nam
    # Fields:
        # Event Name
        # Event Alert Type: { "log", "error", "warning" }
        # Event UID: int
        # Event SID: int
        # Event Decription: str
    dates = []

    for i in range(0,number_of):
        e = Event._debug_gen(number_of)
        r.hmset(e.name, { 'sid': e.sid, 'uid': e.uid, 'desc': e.desc, 'type': e.type, 'origin':e.originid, 'time':e.time })
        dates.append(e.name)
    r.lpush("dates", *dates);    

    return 0

def request_most_recent_data(last_known, max_events):
    r = connect_to_redis()
    #rank = r.zrevrank("dates",last_known)
    rank = None
    hashes_to_fetch = []
    result = [ last_known, recent ]
    recent = [ ]
    if(rank == None):
        #fetch all keys
        hashes_to_fetch = r.lrange('dates',0,max_events)
    elif(rank!= None and rank>0):
        hashes_to_fetch = r.lrange('dates',0,min(max_events,rank-1))
    if( 'event:'+hashes_to_fetch[0] != last_known):
        for name in hashes_to_fetch:
            obj = r.hmget('event:'+name,'uid','sid','type', 'origin')
            recent.append(json.dumps({ 'name': 'event:'+name, 'sid': obj[1], 'uid': obj[0], 'type': obj[2], 'origin':obj[3] }))
        l = len(hashes_to_fetch)
        if(l>0):
            result = [ 'event:'+hashes_to_fetch[0], recent ]  
    return result

def request_event_data(event_hashname):
    r = connect_to_redis()
    data = None
    try:
        data = json.dumps(r.hgetall(event_hashname))
    except:
        pass
    if(data is not None):
        result = [ event_hashname, data ]
    else:
        result = [ event_hashname, "{}" ]
    return result


def gen_load_data():
    r = connect_to_redis()
    la = LoadAverage._debug_gen()

    r.hmset("loadaverage_data", la.__dict__)
    return json.dumps(la.__dict__)


def request_load_data():
    r = connect_to_redis()
    data = None
    try:
        data = json.dumps(r.hgetall("loadaverage_data"))
    except:
        pass
    if(data is not None):
        result = data
    else:
        result = "{}"
    return result