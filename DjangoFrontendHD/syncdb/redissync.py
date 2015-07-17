## Module for syncing with Redis database
import redis
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
    name = str_prefix+random.randint(0,1000000).__str__()
    array = []
    for i in range(0,number_of):
        array.append(Event(random.getrandbits(128),random.getrandbits(128),'a',"Just some random text #"+random.randint(0,2*number_of).__str__()).serialize())
    result = r.rpush(name, *array)
    if(result == number_of):
        print('OK. SET IS FROM')
    else:
        print('FAIL. SET IS FROM')
        print(result)
        return 1
    return 0


def request_most_recent_data(last_known):
    r = connect_to_redis()
    scan_result = r.scan(0, "events_recent*", 100)
    if(len(scan_result[1])>0):
        result = scan_result[1]
        result.sort(reverse=True)
        position = -1
        recent_keys = []
        recent = []
        try:
            position = result.index(last_known)
        except:
            pass
        if(position==-1):
            recent_keys = result
        else:
            recent_keys = result[0:position]
        for key in recent_keys:
            recent += r.lrange(key, 0, -1)
        result = [ ]
        if(len(recent_keys)>0):
            result = [ recent_keys[0] , recent ]
        else:
            result = [ last_known , recent ]
    return result




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