from django.utils.cache import add_never_cache_headers,patch_vary_headers

class DisableAuthenticatedCachingMiddleware(object):
    def process_response(self, request, response):
        if hasattr(request, 'user') and request.user.is_authenticated():
            add_never_cache_headers(response)
        else:
        	patch_vary_headers(response, ['Cookie'])
        return response