"""
Definition of urls for DjangoFrontendHD.
"""

from datetime import datetime
from django.conf.urls import patterns, url
from django.conf.urls.static import static
from django.conf import settings
from syncdb.forms import BootstrapAuthenticationForm

# Uncomment the next lines to enable the admin:
# from django.conf.urls import include
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    url(r'^$', 'syncdb.views.home', name='home'),
    url(r'^load/$',
        'syncdb.views.load', name='loadaverage'),
    url(r'^login/$',
        'django.contrib.auth.views.login',
        {
            'template_name': 'app/login.html',
            'authentication_form': BootstrapAuthenticationForm,
            'extra_context':
            {
                'title':'Log in',
                'year':datetime.now().year,
            }
        },
        name='login'),
    url(r'^logout$',
        'django.contrib.auth.views.logout',
        {
            'next_page': '/',
        },
        name='logout'),
    url(r'^api/get_recent', 'syncdb.views.get_recent', name='recents'),
    url(r'^api/gen_data', 'syncdb.views.gen_data', name='gendata'),
    url(r'^api/get_load', 'syncdb.views.get_load', name='loadaverage'),
    url(r'^api/get_event', 'syncdb.views.get_event_data', name='eventget'),
    url(r'^api/gen_load', 'syncdb.views.gen_load', name='eventget')
    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    # url(r'^admin/', include(admin.site.urls)),
) + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
