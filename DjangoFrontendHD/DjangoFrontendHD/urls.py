"""
Definition of urls for DjangoFrontendHD.
"""

from datetime import datetime
from django.conf.urls import patterns, url
from syncdb.forms import BootstrapAuthenticationForm

# Uncomment the next lines to enable the admin:
# from django.conf.urls import include
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    url(r'^$', 'syncdb.views.home', name='home'),
    url(r'^contact$', 'syncdb.views.contact', name='contact'),
    url(r'^about', 'syncdb.views.about', name='about'),
    url(r'^login/$',
        'django.contrib.auth.views.login',
        {
            'template_name': 'syncdb/login.html',
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
    url(r'^api/gen_data', 'syncdb.views.gen_data', name='gen'),
    url(r'^api/get_load', 'syncdb.views.get_load', name='loadaverage')
    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    # url(r'^admin/', include(admin.site.urls)),
)
