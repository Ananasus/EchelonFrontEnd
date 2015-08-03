"""
Definition of models.
"""
import random
import time
import datetime
from django.db import models
import json
# Create your models here.

#   Get a time at a proportion of a range of two formatted times.
#    start and end should be strings specifying times formated in the
#    given format (strftime-style), giving an interval [start, end].
#    prop specifies how a proportion of the interval to be taken after
#    start.  The returned time will be in the specified format.
def strTimeProp(start, end, format, prop):
   
    ptime = min(start,end) + prop * abs((end - start))

    return ptime


def randomDate(start, end):
    return strTimeProp(start, end, "%Y %m %d %H:%M:%S", round(random.uniform(0, 1),3))



#Event class containing basic events
class Event(models.Model):
    uid = models.BigIntegerField,
    sid = models.BigIntegerField,
    type = models.TextField,
    desc = models.TextField,
    originid = models.BigIntegerField,
    name = models.TextField,
    time = models.BigIntegerField,
    STRING_PREFIX = "event:"
    def __str__(self):
        return "[ Security Event: UID: "+self.uid.__str__()+" SID: "+self.sid.__str__()+" Alert Class: "+self.alert_class+" Description: "+self.description+" ]"
    def __init__(self, uid, sid, name, type, desc, originid, time):
        self.type = type
        self.name = name
        self.uid = uid
        self.desc = desc
        self.sid = sid
        self.time = time
        self.originid = originid
        self.time = time
    def serialize(self):
        return json.dumps(self.__dict__)
    def deserialize(self, data):
        self.__dict__ = json.loads(data)
    #generates random event with data. For debugging only
    @staticmethod
    def _debug_gen(seed):
        uid = random.getrandbits(128).__str__()
        sid = random.getrandbits(128).__str__()
        dt = datetime.datetime.now()
        assert isinstance(dt, datetime.datetime)
        #total seconds
        s = str(random.randint(0,99999999))
        s = s.zfill(8-len(s))
        tm = int((dt-datetime.datetime(1970,1,1)).total_seconds())
        name = Event.STRING_PREFIX+":"+tm.__str__()+"."+s
        originid = random.getrandbits(128).__str__()
        desc = "Just some random text #"+random.randint(0,2*seed) .__str__()
        type = random.choice(["wrn","log","err"])
        

        event = Event(uid, sid, name, type, desc, originid, tm)
        return event



#Load Average Class, containg all the necessary fields for holding system load
class LoadAverage():
    cpload = models.IntegerField,
    memloaded = models.BigIntegerField,
    memtotal = models.BigIntegerField,
    diskloaded = models.BigIntegerField,
    disktotal = models.BigIntegerField
    diskwrite = models.IntegerField,
    diskread = models.IntegerField,
    time = models.TextField,
    connections = models.IntegerField

    def __str__(self):
        return "[ LoadAverage ( "+self.time.__str__()+" ): CPLOAD="+self.cpload.__str__()+", MEMLOAD="+self.memloaded.__str__()+"/"+self.memtotal.__str__()\
            +", DISKLOAD="+self.diskloaded.__str__()+"/"+self.disktotal.__str__()+" ( "+self.diskreadop.__str__()+"% read "+self.diskwriteop.__str__()+"% write"+" )"
    def __init__(self,cpl,meml,memt,diskl,diskt,diskr,diskw,time,connections):
        self.cpload = cpl
        self.memload = meml
        self.memtotal = memt
        self.disktotal = diskt
        self.diskloaded = diskl
        self.diskread = diskr
        self.diskwrite = diskw
        self.time = time
        self.connections = connections


    def serialize(self):
        return json.dumps(self.__dict__)
    def deserialize(self, data):
        self.__dict__ = json.loads(data)
    @staticmethod
    def _debug_gen():
        MAX_MEMORY = 1024*1024*1024*16 # 16 GB
        MAX_DISK = 1024*1024*1024*1024 # 1 TB
        MAX_CONNECTIONS = 1024
        MAX_WRITE = 1024*1024*1024 #1 GB
        MAX_READ = 1024*1024*1024*3 #3 GB

        

        cpload = random.randint(1,100)
        memload = random.randint(1,MAX_MEMORY)
        memtotal = random.randint(memload, MAX_MEMORY)
        diskload = random.randint(1, MAX_DISK)
        disktotal = random.randint(diskload, MAX_DISK)
        diskread = random.randint(1, MAX_READ)
        diskwrite = random.randint(1, MAX_WRITE)
        time = datetime.datetime.now()
        dthandler = lambda obj: (
             obj.isoformat()
             if isinstance(obj, datetime.datetime)
             or isinstance(obj, datetime.date)
             else None)

        time = json.dumps(datetime.datetime.now(), default=dthandler)
        connections = random.randint(1, MAX_CONNECTIONS)    

        load = LoadAverage(cpload,memload,memtotal,diskloaded,disktotal,diskread,diskwrite,time,connections)
        

        return load