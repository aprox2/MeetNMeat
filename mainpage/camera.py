import cv2
import os
import urllib.request
import numpy as np
from django.conf import settings


class WebCam(object):

    def __init__(self):
        self.video = cv2.VideoCapture(0)

    def __del__(self):
        self.video.release()

    def get_frame(self):
        success, image = self.video.read()
        frame_flip = cv2.flip(image, 1)
        ret, jpeg = cv2.imencode('.jpg', frame_flip)
        return jpeg.tobytes()


class GetFeed(object):

    def __init__(self, frame):
        self.bytes = frame

    def __del__(self):
        self.bytes = None

    def update(self, frame):
        self.bytes = frame