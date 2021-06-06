from django.db import models


class VideoStreams(models.Model):
    id = models.IntegerField(primary_key=True)
    frame = models.BinaryField()