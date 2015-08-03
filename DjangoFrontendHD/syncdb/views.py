"""
Definition of views.
"""
import django.middleware.csrf
from django.shortcuts import render
from django.http import HttpRequest
from django.template import RequestContext
import json
from django.http import HttpResponse
from datetime import datetime
from django.views.decorators.csrf import ensure_csrf_cookie

@ensure_csrf_cookie
def home(request):
    """Renders the home page."""
    assert isinstance(request, HttpRequest)
    return render(
        request,
        'app/index.html',
        context_instance = RequestContext(request,
        {
            'title':'Home Page',
            'year':datetime.now().year,
        })
    )
@ensure_csrf_cookie
def contact(request):
    """Renders the contact page."""
    assert isinstance(request, HttpRequest)
    return render(
        request,
        'app/contact.html',
        context_instance = RequestContext(request,
        {
            'title':'Contact',
            'message':'Your contact page.',
            'year':datetime.now().year,
        })
    )
@ensure_csrf_cookie
def load(request):
    """Renders the about page."""
    assert isinstance(request, HttpRequest)
    return render(
        request,
        'app/load.html',
        context_instance = RequestContext(request,
        {
            'title':'System LA (Average Load)',
            'message':'On this page you can see the average load of the system'
            
        })
    )
def get_recent(request):
    if request.is_ajax:
        # do your stuff here
        
        import syncdb.redissync
        from django.template.context_processors import csrf
        request_body = ''
        request_id = ""
        request_max = 100
        try:
            request_body = json.loads(request.body.decode())
            request_id = request_body['last_known_id']
            request_max = int(request_body['max_events'])
        except:
            pass
        print('REQUEST IN THE END: '+request_body.__str__())
        request_data = syncdb.redissync.request_most_recent_data(request_id, request_max)
        response = { 
            "last_known_id": request_data[0], 
            "data": request_data[1]
        }
                 
        return HttpResponse(json.dumps(response), status=200, content_type="application/json")
    else:
        return HttpResponse(status=400)


def gen_data(request):
    if request.is_ajax:
    # do your stuff here
        
        import syncdb.redissync
        from django.template.context_processors import csrf
        request_body = ''
        try:
            request_body = json.loads(request.body.decode())
            request_body = int(request_body['gen_count'])
        except:
            request_body = 0
        print('REQUEST IN THE END: '+request_body.__str__())
        request_data = syncdb.redissync.data_gen(request_body)
        response = { 
            "code":request_data
        }
                 
        return HttpResponse(json.dumps(response), status=200, content_type="application/json")
    else:
        return HttpResponse(status=400)


def gen_load(request):
    if request.is_ajax:
        # do your stuff here
        
        import syncdb.redissync
        from django.template.context_processors import csrf
        response = syncdb.redissync.gen_load_data()

        return HttpResponse(json.dumps(response), status=200, content_type="application/json")
    else:
        return HttpResponse(status=400)


def get_load(request):
    if request.is_ajax:
        # do your stuff here
        
        import syncdb.redissync
        from django.template.context_processors import csrf
        request_data = syncdb.redissync.request_most_recent_data(request_body)
        import syncdb.redissync
        response = syncdb.redissync.request_load_data()
        return HttpResponse(json.dumps(response), status=200, content_type="application/json")
    else:
        return HttpResponse(status=400)

def get_event_data(request):
    if request.is_ajax:
        import syncdb.redissync
        from django.template.context_processors import csrf
        request_body = ''
        try:
            request_body = json.loads(request.body.decode())
            request_body = request_body['event_hashname']
        except:
            request_body = '__none__'
        print('REQUEST IN THE END: '+request_body.__str__())
        request_data = syncdb.redissync.request_event_data(request_body)
        response = { 
            "id": request_data[0], 
            "data": request_data[1]
        }
                 
        return HttpResponse(json.dumps(response), status=200, content_type="application/json")
    else:
        return HttpResponse(status=400)