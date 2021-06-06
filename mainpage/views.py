from django.shortcuts import render
from django.http.response import StreamingHttpResponse, HttpResponseServerError
from .camera import WebCam
from django.views.decorators import gzip
from django.http import JsonResponse
from django.utils.crypto import get_random_string

test_list = []

def gen(camera):
    while True:
        frame = camera.get_frame()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n\r\n')


@gzip.gzip_page
def webcam_feed(request):
    try:
        return StreamingHttpResponse(gen(WebCam()),
                                 content_type='multipart/x-mixed-replace; boundary=frame')
    except HttpResponseServerError as e:
        print('failed')


def main_view(request, *args, **kwargs):
    context = {}
    if request.method == 'GET':
        web_id = 'adad'
        return render(request, 'mainpage.html', context)


def set_key(request):
    key = get_random_string(length=16)
    test_list.append(key)
    data = {
        'status': 'ok',
        'key': key
    }
    return JsonResponse(data)


def get_status(request):
    data = {
        "id": test_list[0]
    }
    return JsonResponse(data)
