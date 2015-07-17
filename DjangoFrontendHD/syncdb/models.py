"""
Definition of models.
"""
from django.db import models
import json
# Create your models here.
class Event(models.Model):
    uid = models.BigIntegerField,
    sid = models.BigIntegerField,
    alert_class = models.CharField,
    description = models.TextField,
    def __str__(self):
        return "[ Security Event: UID: "+self.uid.__str__()+" SID: "+self.sid.__str__()+" Alert Class: "+self.alert_class+" Description: "+self.description+" ]"
    def __init__(self, uid, sid, alert_class, description):
        self.alert_class = alert_class
        self.uid = uid
        self.description = description
        self.sid = sid
    def serialize(self):
        return json.dumps(self.__dict__)
    def deserialize(self, data):
        self.__dict__ = json.loads(data)