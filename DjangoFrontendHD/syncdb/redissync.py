## Module for syncing with Redis database
import redis
import json
import random
import time

def strTimeProp(start:float, end:float, format:str, prop:float):
    """Get a time at a proportion of a range of two formatted times.

    start and end should be strings specifying times formated in the
    given format (strftime-style), giving an interval [start, end].
    prop specifies how a proportion of the interval to be taken after
    start.  The returned time will be in the specified format.
    """


    ptime = min(start,end) + prop * abs((end - start))

    return ptime


def randomDate(start, end):
    return strTimeProp(start, end, "%Y %m %d %H:%M:%S", round(random.uniform(0, 1),3))

import random
from syncdb.models import Event


def connect_to_redis():
    password = '1233'
    port = 11281 
    db_no = 0
    redis_connection = redis.StrictRedis('pub-redis-11281.us-east-1-4.5.ec2.garantiadata.com', port, db_no, password, 90, 10, True, decode_responses=True)
    return redis_connection


def data_gen(number_of:int,str_prefix:str):
    r = connect_to_redis()
    # Fields:
        # Event Name
        # Event Alert Type: { "log", "error", "warning" }
        # Event UID: int
        # Event SID: int
        # Event Decription: str
    dates = []

    for i in range(0,number_of):
        uid = random.getrandbits(128).__str__()
        name = str_prefix+random.randint(0,1000000).__str__()
        r.hmset(name, { 'sid': random.getrandbits(128).__str__(), 'uid': uid, 'desc': "Just some random text #"+random.randint(0,2*number_of) .__str__(), 'type':random.choice(["wrn","log","err"]) })
        dates += [randomDate(time.time()-5, time.time()+5), name]
    r.zadd("dates", *dates);    
    #if(result == number_of):
    #    print('OK. SET IS FROM')
    #else:
    #    print('FAIL. SET IS FROM')
    #    print(result)
    #    return 1
    #return 0
    return 0

def request_most_recent_data(last_known):
    r = connect_to_redis()
    rank = r.zrevrank("dates",last_known)
    hashes_to_fetch = []
    recent = [ ]
    if(rank == None):
        #fetch all keys
        hashes_to_fetch = r.zrange('dates',0,-1)
    elif(rank!= None and rank>0):
        hashes_to_fetch = r.zrevrange('dates',0,rank-1)

    for name in hashes_to_fetch:
        recent.append(json.dumps(r.hgetall(name)))

    l = len(hashes_to_fetch)
    if(l>0):
        result = [ hashes_to_fetch[l-1], recent ]
    else:
        result = [ last_known, recent ]
    return result
    #scan_result = r.scan(0, "events_recent*", 100)
    #if(len(scan_result[1])>0):
    #    result = scan_result[1]
    #    result.sort(reverse=True)
    #    position = -1
    #    recent_keys = []
    #    recent = []
    #    try:
    #        position = result.index(last_known)
    #    except:
    #        pass
    #    if(position==-1):
    #        recent_keys = result
    #    else:
    #        recent_keys = result[0:position]
    #    for key in recent_keys:
    #        recent += r.lrange(key, 0, -1)
    #    result = [ ]
    #    if(len(recent_keys)>0):
    #        result = [ recent_keys[0] , recent ]
    #    else:
    #        result = [ last_known , recent ]
    #return result




def request_data():
    r = connect_to_redis()
    #parse arguments

    
    result = r.get("ololo")
    if(result == True):
        print('OK. SET IS FROM')
    else:
        print('ConnectionError set failed')
        return 1
    return 0