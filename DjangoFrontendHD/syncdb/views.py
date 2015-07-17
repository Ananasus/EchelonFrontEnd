"""
Definition of views.
"""
import django.middleware.csrf
from django.shortcuts import render
from django.http import HttpRequest
from django.template import RequestContext
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
def about(request):
    """Renders the about page."""
    assert isinstance(request, HttpRequest)
    return render(
        request,
        'app/about.html',
        context_instance = RequestContext(request,
        {
            'title':'About',
            'message':'Your application description page.',
            'year':datetime.now().year,
        })
    )
def get_recent(request):
    if request.is_ajax:
        # do your stuff here
        import syncdb.redissync
        from django.template.context_processors import csrf
        request_data = syncdb.redissync.request_most_recent_data(0)
        return HttpResponse(request_data, status=200, content_type="application/json")
    else:
        return HttpResponse(status=400)